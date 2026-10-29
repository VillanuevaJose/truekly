import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../components/auth/AuthLayout";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabaseClient";
import { Eye, EyeOff, Loader2, AlertCircle, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError("Por favor ingresa tu correo y contraseña.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (signInError) {
        if (signInError.message.toLowerCase().includes("invalid login credentials")) {
          throw new Error("Correo o contraseña incorrectos. Revisa tus datos e intenta nuevamente.");
        }
        if (signInError.message.toLowerCase().includes("email not confirmed")) {
          navigate(`/registro?step=4&email=${encodeURIComponent(cleanEmail)}`);
          return;
        }
        throw new Error(signInError.message || "Error al iniciar sesión.");
      }

      if (data.user) {
        // Cargar perfil completo desde la tabla profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profile) {
          login({
            id: profile.id,
            nombre: profile.nombre_reniec || `${profile.primer_nombre} ${profile.apellido_paterno}`.trim(),
            primerNombre: profile.primer_nombre,
            segundoNombre: profile.segundo_nombre || undefined,
            apellidoPaterno: profile.apellido_paterno,
            apellidoMaterno: profile.apellido_materno || undefined,
            username: profile.username,
            email: profile.email || cleanEmail,
            fotoPerfil: profile.avatar_url || null,
            verificado: profile.identidad_verificada,
          });
        } else {
          // Fallback a metadata si el perfil no estuviera sincronizado aún
          const meta = data.user.user_metadata;
          login({
            id: data.user.id,
            nombre: meta?.nombre_reniec || meta?.nombre || `${meta?.primer_nombre || ""} ${meta?.apellido_paterno || ""}`.trim() || cleanEmail.split("@")[0],
            primerNombre: meta?.primer_nombre,
            apellidoPaterno: meta?.apellido_paterno,
            username: meta?.username,
            email: data.user.email || cleanEmail,
            fotoPerfil: meta?.avatar_url || null,
            verificado: true,
          });
        }
      }

      window.location.hash = "#feed";
      navigate("/#feed");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError("Ingresa tu correo electrónico en el campo superior para solicitar el restablecimiento.");
      return;
    }

    setIsLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/#recuperar`,
      });
      if (resetError) throw resetError;
      alert(`Hemos enviado un enlace de recuperación a ${cleanEmail}. Revisa tu bandeja de entrada.`);
    } catch (err: any) {
      setError(err.message || "No se pudo enviar el correo de recuperación.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Bienvenido de vuelta"
      subtitle="Inicia sesión con tu cuenta para continuar con tus trueques."
    >
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        {/* Mensaje de error con accesibilidad aria-live */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <span className="flex-1 leading-relaxed">{error}</span>
          </div>
        )}

        {/* Campo Correo con icono a la izquierda */}
        <div>
          <label htmlFor="login-email" className="block text-[11px] font-medium text-ink mb-1">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sage-400" aria-hidden="true" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder="Ingrese su correo electrónico"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-line bg-white text-sm text-ink placeholder:text-sage-400 outline-none transition-all duration-200 focus:border-jade-500 focus:ring-2 focus:ring-jade-500/20 disabled:bg-paper"
              required
            />
          </div>
        </div>

        {/* Campo Contraseña con icono a la izquierda y toggle a la derecha */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="login-password" className="block text-[11px] font-medium text-ink">
              Contraseña
            </label>
            <a
              href="#recuperar"
              onClick={handleForgotPassword}
              className="text-[11px] font-medium text-jade-600 hover:text-jade-700 transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 rounded-xs"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-sage-400" aria-hidden="true" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              placeholder="Ingrese su contraseña"
              className="w-full h-11 pl-10 pr-11 rounded-xl border border-line bg-white text-sm text-ink placeholder:text-sage-400 outline-none transition-all duration-200 focus:border-jade-500 focus:ring-2 focus:ring-jade-500/20 disabled:bg-paper"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-sage-400 hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 rounded-md"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Botón Ingresar con degradado sutil, elevación suave y spinner */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 mt-1 rounded-xl bg-gradient-to-r from-jade-600 to-jade-500 text-sm font-medium text-white shadow-xs hover:from-jade-700 hover:to-jade-600 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 focus-visible:outline-offset-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Iniciando sesión...</span>
            </>
          ) : (
            "Ingresar"
          )}
        </button>

        {/* Separador "o" */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 font-mono text-[11px] uppercase tracking-wider text-sage-500">
              o
            </span>
          </div>
        </div>

        {/* Bloque secundario de enlace más visible */}
        <div className="rounded-2xl border border-ink/[0.06] bg-paper/60 p-4 text-center text-xs text-ink/70">
          ¿Aún no tienes cuenta?{" "}
          <Link
            to="/registro"
            className="font-semibold text-jade-600 hover:text-jade-700 hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 rounded-xs"
          >
            Regístrate gratis
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}