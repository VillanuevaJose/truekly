import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generador seguro de código numérico de 6 dígitos con CSPRNG
function generateSecureCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const code = (array[0] % 900000) + 100000;
  return code.toString();
}

// Hash SHA-256 para el código
async function hashCode(code: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(code);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Comparación en tiempo constante para mitigar ataques de temporización
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const emailServiceId = Deno.env.get("EMAILJS_SERVICE_ID") ?? "";
    const emailTemplateId = Deno.env.get("EMAILJS_TEMPLATE_ID") ?? "";
    const emailUserId = Deno.env.get("EMAILJS_PUBLIC_KEY") ?? "";
    const emailPrivateKey = Deno.env.get("EMAILJS_PRIVATE_KEY") ?? "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, email, password, nombre, codigo } = await req.json();

    const normalizedEmail = (email || "").trim().toLowerCase();

    // -------------------------------------------------------------
    // ACCIÓN: REGISTRO / ENVIAR CÓDIGO
    // -------------------------------------------------------------
    if (action === "send-code") {
      if (!normalizedEmail || !password || !nombre) {
        return new Response(
          JSON.stringify({ error: "Faltan datos obligatorios." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 1. Revisar si usuario ya existe en auth.users (respuesta genérica anti-enumeración)
      const { data: existingUser } = await supabase
        .from("usuario")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (existingUser) {
        // Anti-enumeración: respondemos éxito genérico sin enviar correo duplicado
        return new Response(
          JSON.stringify({ success: true, message: "Si el correo es válido, recibirás un código." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // 2. Control de Cooldown (60s)
      const { data: lastOtp } = await supabase
        .from("codigo_verificacion")
        .select("ultimo_envio_at")
        .eq("email", normalizedEmail)
        .eq("consumido", false)
        .order("creado_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastOtp) {
        const lastSent = new Date(lastOtp.ultimo_envio_at).getTime();
        const diffSeconds = (Date.now() - lastSent) / 1000;
        if (diffSeconds < 60) {
          return new Response(
            JSON.stringify({ error: `Espera ${Math.ceil(60 - diffSeconds)} segundos antes de pedir otro código.` }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // 3. Generar código seguro de 6 dígitos y su hash
      const otpCode = generateSecureCode();
      const codeHash = await hashCode(otpCode);
      const expiraAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

      // Invalidar códigos anteriores de este email
      await supabase
        .from("codigo_verificacion")
        .update({ consumido: true })
        .eq("email", normalizedEmail);

      // Guardar nuevo registro OTP
      const { error: insertError } = await supabase
        .from("codigo_verificacion")
        .insert({
          email: normalizedEmail,
          codigo_hash: codeHash,
          password_hash: password, // Almacenado temporalmente para crear el usuario tras verificar
          nombre: nombre.trim(),
          expira_at: expiraAt,
          intentos: 0,
          consumido: false,
          ultimo_envio_at: new Date().toISOString(),
        });

      if (insertError) {
        throw new Error("Error interno guardando la verificación.");
      }

      // 4. Enviar email vía EmailJS REST API
      const emailRes = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: emailServiceId,
          template_id: emailTemplateId,
          user_id: emailUserId,
          accessToken: emailPrivateKey,
          template_params: {
            to_email: normalizedEmail,
            code: otpCode,
            app_name: "Truekly",
            expires_in: "10 minutos",
          },
        }),
      });

      if (!emailRes.ok) {
        console.error("Error EmailJS:", await emailRes.text());
        return new Response(
          JSON.stringify({ error: "No se pudo despachar el correo de verificación. Inténtalo más tarde." }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Código de verificación enviado." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // -------------------------------------------------------------
    // ACCIÓN: VERIFICAR CÓDIGO Y ACTIVAR CUENTA
    // -------------------------------------------------------------
    if (action === "verify-code") {
      if (!normalizedEmail || !codigo) {
        return new Response(
          JSON.stringify({ error: "Email y código son obligatorios." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: record, error: findError } = await supabase
        .from("codigo_verificacion")
        .select("*")
        .eq("email", normalizedEmail)
        .eq("consumido", false)
        .order("creado_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (findError || !record) {
        return new Response(
          JSON.stringify({ error: "No hay un código pendiente para este correo." }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validar expiración (10 min)
      if (new Date() > new Date(record.expira_at)) {
        await supabase
          .from("codigo_verificacion")
          .update({ consumido: true })
          .eq("id", record.id);
        return new Response(
          JSON.stringify({ error: "El código ha expirado. Solicita uno nuevo." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Validar intentos máximos (5)
      if (record.intentos >= record.max_intentos) {
        await supabase
          .from("codigo_verificacion")
          .update({ consumido: true })
          .eq("id", record.id);
        return new Response(
          JSON.stringify({ error: "Has superado el límite de intentos. Solicita un nuevo código." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const inputHash = await hashCode(codigo.trim());
      const isValid = constantTimeCompare(inputHash, record.codigo_hash);

      if (!isValid) {
        // Descontar intento
        await supabase
          .from("codigo_verificacion")
          .update({ intentos: record.intentos + 1 })
          .eq("id", record.id);

        const restantes = record.max_intentos - (record.intentos + 1);
        return new Response(
          JSON.stringify({ error: `Código incorrecto. Te quedan ${restantes} intentos.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Código correcto: marcar consumido
      await supabase
        .from("codigo_verificacion")
        .update({ consumido: true })
        .eq("id", record.id);

      // Crear usuario en auth.users de Supabase
      const { data: createdAuth, error: createAuthError } = await supabase.auth.admin.createUser({
        email: normalizedEmail,
        password: record.password_hash,
        email_confirm: true,
        user_metadata: { nombre: record.nombre },
      });

      if (createAuthError) {
        return new Response(
          JSON.stringify({ error: createAuthError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Insertar en public.usuario si no lo hace un trigger
      await supabase.from("usuario").upsert({
        id: createdAuth.user.id,
        email: normalizedEmail,
        nombre: record.nombre,
        email_verificado: true,
        fecha_nacimiento: "2000-01-01", // Default provisional hasta completar onboarding
      });

      return new Response(
        JSON.stringify({ success: true, message: "Cuenta verificada con éxito." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Acción no válida." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Error interno del servidor." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
