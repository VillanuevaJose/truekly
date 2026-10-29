# ESTADO — Truekly MVP · 2026-10-29
- Eliminado concepto excluyente de 'trueque vecinal' en UI, mocks e i18n; alcance redefinido a personas de la misma ciudad o interurbano.
- Supabase conectado de extremo a extremo: tabla profiles, vista segura, buckets privados y RLS.
- Registro completo en Supabase Auth con subida de selfie y DNI tras verificación EmailJS.
- Sesión reactiva vía getSession y onAuthStateChange en AuthContext con caché anti-parpadeo.
- Inicio de sesión con signInWithPassword, mensajes en español y recuperación de contraseña conectada.
- Header del feed autenticado sincronizado con profiles (avatar, iniciales y menú de cuenta).
- Flujo de registro en 4 pasos completado: DNI (RENIEC), Selfie, Foto DNI (ID-1) y OTP.
- Frontend verificado y compilando sin errores (TypeScript + Vite build ok).
