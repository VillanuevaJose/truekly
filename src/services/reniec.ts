/**
 * Servicio de Consulta RENIEC
 * Consulta de datos de identidad por DNI peruano (8 dígitos numéricos).
 * Realiza la petición a través de /api/dni con códigos de error específicos.
 */

export interface ReniecConsultaInput {
  dni: string;
}

export interface ReniecPersona {
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
}

export type ReniecErrorCode =
  | "sin_token"
  | "no_autorizado"
  | "no_encontrado"
  | "limite_excedido"
  | "error_proveedor"
  | "red";

export interface ReniecConsultaResponse {
  success: boolean;
  data?: ReniecPersona;
  message?: string;
  code?: ReniecErrorCode;
}

export async function consultarDni(input: ReniecConsultaInput): Promise<ReniecConsultaResponse> {
  const cleanDni = input.dni.trim();

  // Validación previa de formato: exactamente 8 dígitos numéricos
  if (!/^\d{8}$/.test(cleanDni)) {
    return {
      success: false,
      code: "no_encontrado",
      message: "El DNI debe contener exactamente 8 dígitos numéricos.",
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("/api/dni", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "x-truekly-client": "web",
      },
      body: JSON.stringify({ dni: cleanDni }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await res.json().catch(() => null);

    if (res.ok && (data?.nombres || data?.nombreCompleto)) {
      return {
        success: true,
        data: {
          dni: cleanDni,
          nombres: data.nombres || "",
          apellidoPaterno: data.apellidoPaterno || "",
          apellidoMaterno: data.apellidoMaterno || "",
          nombreCompleto: data.nombreCompleto || `${data.nombres || ""} ${data.apellidoPaterno || ""} ${data.apellidoMaterno || ""}`.trim(),
        },
      };
    }

    // Errores con códigos tipados devueltos por /api/dni
    const code: ReniecErrorCode = data?.code || (res.status === 429 ? "limite_excedido" : res.status === 401 || res.status === 403 ? "no_autorizado" : "error_proveedor");

    let message = data?.error;
    if (!message) {
      if (code === "sin_token") {
        message = "Falta configurar DECOLECTA_API_TOKEN en el archivo .env o en el servidor.";
      } else if (code === "no_autorizado") {
        message = "El token de Decolecta no es válido o ha expirado. Revisa tu cuenta en decolecta.com.";
      } else if (code === "limite_excedido") {
        message = "Se alcanzó el límite de consultas del plan de Decolecta (100 consultas/mes).";
      } else if (code === "no_encontrado") {
        message = "No se encontró el DNI en el padrón de RENIEC. Puedes ingresar tu nombre manualmente.";
      } else {
        message = "No fue posible consultar el servicio de RENIEC en este momento.";
      }
    }

    return {
      success: false,
      code,
      message,
    };
  } catch {
    return {
      success: false,
      code: "red",
      message: "Error de red o tiempo de espera agotado al conectar con /api/dni. Verifica que el servidor esté activo.",
    };
  }
}
