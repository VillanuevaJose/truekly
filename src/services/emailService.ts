import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export interface EnviarCodigoResult {
  success: boolean;
  error?: string;
}

/**
 * Genera un código de verificación aleatorio de 6 dígitos
 * utilizando la API nativa de Web Cryptography (crypto.getRandomValues).
 */
export function generarCodigo6Digitos(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  // Garantiza un rango uniforme entre 100000 y 999999 (exactamente 6 dígitos)
  const code = 100000 + (array[0] % 900000);
  return code.toString();
}

/**
 * Envía el código de verificación al correo del usuario vía EmailJS.
 * Parámetros exactos de plantilla: to_email, to_name, codigo.
 */
export async function enviarCodigoVerificacion(
  email: string,
  nombre: string,
  codigo: string
): Promise<EnviarCodigoResult> {
  const serviceId = SERVICE_ID;
  const templateId = TEMPLATE_ID;
  const publicKey = PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.error("Faltan las credenciales de EmailJS en las variables de entorno.");
    return {
      success: false,
      error: "El servicio de correo no está configurado. Revisa las variables de entorno.",
    };
  }

  try {
    const templateParams = {
      to_email: email.trim(),
      to_name: nombre.trim() || "Usuario",
      codigo: codigo.trim(),
    };

    const res = await emailjs.send(serviceId, templateId, templateParams, publicKey);

    if (res.status === 200) {
      return { success: true };
    }

    return {
      success: false,
      error: `Error al enviar correo (código ${res.status}).`,
    };
  } catch (err: any) {
    const errorMsg =
      err?.text || err?.message || "No se pudo enviar el correo de verificación. Inténtalo nuevamente.";
    return {
      success: false,
      error: errorMsg,
    };
  }
}
