import { supabase } from "./supabase";

export interface RegisterPayload {
  dni?: string;
  primerNombre?: string;
  segundoNombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  nombreMostrar?: string;
  nombreUsuario?: string;
  nombre: string;
  email: string;
  password: string;
  terminosAceptados: boolean;
  versionTerminos?: string;
}

export interface VerifyOtpPayload {
  email: string;
  codigo: string;
}

// Verificar disponibilidad de DNI
export async function checkDniRegistrado(dni: string): Promise<boolean> {
  const cleanDni = dni.trim();
  if (cleanDni.length !== 8) return false;

  // 1. Intentar mediante RPC con SECURITY DEFINER (para evitar exponer DNI por RLS)
  const { data, error } = await supabase.rpc("check_dni_registrado", { p_dni: cleanDni });
  if (!error && typeof data === "boolean") {
    return data;
  }

  // 2. Fallback de consulta directa
  const { data: userRow } = await supabase
    .from("usuario")
    .select("id")
    .eq("dni", cleanDni)
    .maybeSingle();

  return !!userRow;
}

// Verificar disponibilidad de nombre de usuario (nickname)
export async function checkUsernameDisponible(username: string): Promise<boolean> {
  const clean = username.trim().toLowerCase();
  if (!clean || clean.length < 4 || clean.length > 20) return false;

  // 1. Intentar vía función RPC segura si existe
  const { data, error } = await supabase.rpc("check_username_disponible", { p_username: clean });
  if (!error && typeof data === "boolean") {
    return data;
  }

  // 2. Fallback directo a select en usuario
  const { data: userRow } = await supabase
    .from("usuario")
    .select("id")
    .eq("nombre_usuario", clean)
    .maybeSingle();

  return !userRow; // true si está disponible (no existe usuario con ese nombre)
}

// 1. Registro inicial y envío de OTP (Supabase Auth nativo)
export async function sendRegistrationOtp(payload: RegisterPayload) {
  if (!payload.terminosAceptados) {
    throw new Error("Debes aceptar los Términos y la Política de Privacidad.");
  }

  // Validación de DNI único previa
  if (payload.dni) {
    const yaRegistrado = await checkDniRegistrado(payload.dni);
    if (yaRegistrado) {
      throw new Error("Este DNI ya está registrado.");
    }
  }

  // Validación de Username único previo
  if (payload.nombreUsuario) {
    const disponible = await checkUsernameDisponible(payload.nombreUsuario);
    if (!disponible) {
      throw new Error("El nombre de usuario ya está en uso.");
    }
  }

  const cleanEmail = payload.email.trim().toLowerCase();
  const metadata = {
    nombre: payload.nombre,
    dni: payload.dni,
    primer_nombre: payload.primerNombre,
    segundo_nombre: payload.segundoNombre || "",
    nombres: [payload.primerNombre, payload.segundoNombre].filter(Boolean).join(" ").trim(),
    apellido_paterno: payload.apellidoPaterno,
    apellido_materno: payload.apellidoMaterno,
    nombre_mostrar: payload.nombreMostrar || `${payload.primerNombre} ${payload.apellidoPaterno}`.trim(),
    nombre_usuario: payload.nombreUsuario || "",
  };

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password: payload.password,
    options: {
      data: metadata,
    },
  });

  if (error) {
    if (
      error.message.toLowerCase().includes("already registered") ||
      error.message.toLowerCase().includes("user already exists")
    ) {
      throw new Error("Este correo ya está registrado. Inicia sesión con tus credenciales.");
    }
    throw new Error(error.message || "Error al registrar la cuenta.");
  }

  return {
    user: data.user,
    session: data.session,
    requiresVerification: !data.session,
  };
}

// 2. Verificación de código de 6 dígitos con Supabase Auth nativo
export async function verifyOtp(payload: VerifyOtpPayload) {
  const cleanEmail = payload.email.trim().toLowerCase();
  const { data, error } = await supabase.auth.verifyOtp({
    email: cleanEmail,
    token: payload.codigo.trim(),
    type: "signup",
  });

  if (error) {
    throw new Error(error.message || "Código incorrecto o expirado.");
  }

  return data;
}

// Reenviar código de confirmación
export async function resendRegistrationOtp(email: string) {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email.trim().toLowerCase(),
  });

  if (error) {
    throw new Error(error.message || "Error al reenviar el código.");
  }
}

// 3. Inicio de sesión estándar con Supabase Auth
export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    // Manejo de cuenta no verificada
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { requiresVerification: true, email: email.trim().toLowerCase() };
    }
    throw new Error("Credenciales inválidas. Revisa tu correo y contraseña.");
  }

  return { session: data.session, user: data.user, requiresVerification: false };
}

// 4. Cerrar sesión
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// 5. Obtener usuario autenticado actual
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
