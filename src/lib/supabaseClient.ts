import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan las variables de entorno de Supabase: VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY."
  );
}

// Cliente oficial de Supabase con permisos anónimos (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Convierte una imagen en formato base64 Data URL a un objeto Blob para subir a Supabase Storage.
 */
export function base64ToBlob(base64DataUrl: string): Blob {
  const parts = base64DataUrl.split(",");
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mimeType });
}

/**
 * Verifica si un DNI ya se encuentra registrado en el sistema.
 * Prioriza la función RPC segura con SECURITY DEFINER para evitar exposición indebida.
 */
export async function checkDniRegistrado(dni: string): Promise<boolean> {
  const cleanDni = dni.trim();
  if (cleanDni.length !== 8) return false;

  try {
    const { data, error } = await supabase.rpc("check_dni_registrado", { p_dni: cleanDni });
    if (!error && typeof data === "boolean") {
      return data;
    }
  } catch {
    // Continuar al fallback
  }

  // Fallback de consulta directa
  const { data: userRow } = await supabase
    .from("profiles")
    .select("id")
    .eq("dni", cleanDni)
    .maybeSingle();

  return !!userRow;
}

/**
 * Verifica la disponibilidad de un nombre de usuario en la plataforma.
 */
export async function checkUsernameDisponible(username: string): Promise<boolean> {
  const clean = username.trim().toLowerCase();
  if (!clean || clean.length < 3 || clean.length > 30) return false;

  try {
    const { data, error } = await supabase.rpc("check_username_disponible", { p_username: clean });
    if (!error && typeof data === "boolean") {
      return data;
    }
  } catch {
    // Continuar al fallback
  }

  // Fallback directo a select
  const { data: userRow } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", clean)
    .maybeSingle();

  return !userRow;
}
