import type { IncomingMessage, ServerResponse } from "node:http";

// 1. Rate limit por IP: máx 3 consultas por minuto
const ipRateLimitMap = new Map<string, { count: number; expiresAt: number }>();

function checkIpRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRateLimitMap.get(ip);

  if (!entry || now > entry.expiresAt) {
    ipRateLimitMap.set(ip, { count: 1, expiresAt: now + 60 * 1000 });
    return true;
  }

  if (entry.count >= 3) {
    return false;
  }

  entry.count += 1;
  return true;
}

// 2. Tope global diario: máx 20 consultas en 24 horas
let globalDay = new Date().toISOString().slice(0, 10);
let globalDailyCount = 0;
const MAX_GLOBAL_DAILY = 20;

function checkGlobalDailyLimit(): boolean {
  const currentDay = new Date().toISOString().slice(0, 10);
  if (currentDay !== globalDay) {
    globalDay = currentDay;
    globalDailyCount = 0;
  }

  if (globalDailyCount >= MAX_GLOBAL_DAILY) {
    return false;
  }

  globalDailyCount += 1;
  return true;
}

export type DniErrorCode =
  | "sin_token"
  | "no_autorizado"
  | "no_encontrado"
  | "limite_excedido"
  | "error_proveedor"
  | "red";

// Helper para leer body JSON en IncomingMessage
function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      // Seguridad: limitar tamaño del body a 10KB
      if (body.length > 10240) {
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", (err) => reject(err));
  });
}

/**
 * Handler compatible con Vercel Serverless Functions y con el middleware dev de Vite
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // Headers de seguridad y no almacenamiento en caché
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Método requerido: POST
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ code: "error_proveedor", error: "Método no permitido. Usa POST." }));
    return;
  }

  // Validación de seguridad de origen:
  // Rechazar si Sec-Fetch-Site existe y no es same-origin
  const secFetchSite = req.headers["sec-fetch-site"];
  if (secFetchSite && secFetchSite !== "same-origin") {
    res.statusCode = 403;
    res.end(JSON.stringify({
      code: "no_autorizado",
      error: "Acceso denegado: origen no autorizado."
    }));
    return;
  }

  // Exigir header x-truekly-client: web
  const clientHeader = req.headers["x-truekly-client"];
  if (clientHeader !== "web") {
    res.statusCode = 403;
    res.end(JSON.stringify({
      code: "no_autorizado",
      error: "Acceso denegado: cliente no identificado."
    }));
    return;
  }

  // Obtener IP del cliente (respetando proxies como Vercel)
  const forwarded = req.headers["x-forwarded-for"];
  const clientIp = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.socket.remoteAddress || "local";

  // Rate limit por IP (3 consultas/minuto)
  if (!checkIpRateLimit(clientIp)) {
    res.statusCode = 429;
    res.end(JSON.stringify({
      code: "limite_excedido",
      error: "Demasiadas consultas desde tu conexión (máx 3/min). Espera un momento antes de reintentar."
    }));
    return;
  }

  // Tope global diario (20 consultas/día)
  if (!checkGlobalDailyLimit()) {
    res.statusCode = 429;
    res.end(JSON.stringify({
      code: "limite_excedido",
      error: "Límite diario de consultas alcanzado. Por favor escribe tu nombre manualmente."
    }));
    return;
  }

  // Parsear body JSON { dni }
  let body: any = {};
  try {
    body = await parseJsonBody(req);
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({
      code: "error_proveedor",
      error: "Cuerpo de solicitud inválido. Envía JSON con { dni }."
    }));
    return;
  }

  const dni = typeof body.dni === "string" ? body.dni.trim() : "";

  // Validación estricta de 8 dígitos numéricos
  if (!/^\d{8}$/.test(dni)) {
    res.statusCode = 400;
    res.end(JSON.stringify({
      code: "no_encontrado",
      error: "El DNI debe contener exactamente 8 dígitos numéricos."
    }));
    return;
  }

  // Token desde process.env
  const token = (process.env.DECOLECTA_API_TOKEN || "").trim();

  if (!token) {
    res.statusCode = 503;
    res.end(JSON.stringify({
      code: "sin_token",
      error: "No se encontró el token de Decolecta (DECOLECTA_API_TOKEN). Revisa tu archivo .env o variables de entorno.",
      fallback: true
    }));
    return;
  }

  try {
    const decolectaUrl = `https://api.decolecta.com/v1/reniec/dni?numero=${dni}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000); // 7s timeout

    const decolectaRes = await fetch(decolectaUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // 1. No autorizado (token erróneo o vencido)
    if (decolectaRes.status === 401 || decolectaRes.status === 403) {
      res.statusCode = decolectaRes.status;
      res.end(JSON.stringify({
        code: "no_autorizado",
        error: "Token de Decolecta no autorizado o inválido (401/403). Verifica tu token en decolecta.com.",
      }));
      return;
    }

    // 2. DNI no encontrado o parámetro inválido
    if (decolectaRes.status === 404 || decolectaRes.status === 422) {
      res.statusCode = 404;
      res.end(JSON.stringify({
        code: "no_encontrado",
        error: "DNI no encontrado en el padrón de RENIEC.",
      }));
      return;
    }

    // 3. Límite del plan mensual de Decolecta alcanzado
    if (decolectaRes.status === 429) {
      res.statusCode = 429;
      res.end(JSON.stringify({
        code: "limite_excedido",
        error: "Límite de consultas del plan en Decolecta alcanzado (429).",
      }));
      return;
    }

    // 4. Otros errores HTTP del proveedor
    if (!decolectaRes.ok) {
      res.statusCode = decolectaRes.status;
      res.end(JSON.stringify({
        code: "error_proveedor",
        error: `El servicio de Decolecta respondió con error ${decolectaRes.status}.`,
      }));
      return;
    }

    const json = await decolectaRes.json();
    const data = (json && typeof json === "object" && json.data && typeof json.data === "object") ? json.data : (json || {});

    // Mapeo robusto de campos según Decolecta (first_name, first_last_name, second_last_name, etc.)
    let nombres = (data.nombres || data.first_name || "").trim();
    let apellidoPaterno = (data.apellidoPaterno || data.apellido_paterno || data.first_last_name || data.paterno || "").trim();
    let apellidoMaterno = (data.apellidoMaterno || data.apellido_materno || data.second_last_name || data.materno || "").trim();

    // Si solo viene nombre_completo / nombreCompleto, separamos de forma razonable
    if (!nombres && (data.nombreCompleto || data.nombre_completo)) {
      const full = String(data.nombreCompleto || data.nombre_completo).trim();
      const parts = full.split(/\s+/).filter(Boolean);
      if (parts.length === 1) {
        nombres = parts[0];
      } else if (parts.length === 2) {
        nombres = parts[0];
        apellidoPaterno = parts[1];
      } else if (parts.length === 3) {
        nombres = parts[0];
        apellidoPaterno = parts[1];
        apellidoMaterno = parts[2];
      } else if (parts.length >= 4) {
        // En padrones peruanos los dos últimos suelen ser paterno y materno
        apellidoMaterno = parts[parts.length - 1];
        apellidoPaterno = parts[parts.length - 2];
        nombres = parts.slice(0, parts.length - 2).join(" ");
      }
    }

    const nombreCompleto = [nombres, apellidoPaterno, apellidoMaterno].filter(Boolean).join(" ");

    if (!nombreCompleto && !nombres) {
      res.statusCode = 404;
      res.end(JSON.stringify({
        code: "no_encontrado",
        error: "DNI consultado pero no devolvió nombres asociados en el padrón.",
      }));
      return;
    }

    // Devolver nombres y apellidos separados sin guardar nada
    res.statusCode = 200;
    res.end(JSON.stringify({
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      nombreCompleto,
    }));
  } catch (err: any) {
    if (err.name === "AbortError") {
      res.statusCode = 504;
      res.end(JSON.stringify({
        code: "red",
        error: "Tiempo de espera agotado al conectar con Decolecta.",
      }));
      return;
    }

    res.statusCode = 500;
    res.end(JSON.stringify({
      code: "red",
      error: "Error de conexión de red al consultar el servicio de RENIEC.",
    }));
  }
}
