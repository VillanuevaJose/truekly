import React, { useState } from "react";
import { OtpVerification } from "./OtpVerification";
import { sendRegistrationOtp, verifyOtp, loginWithEmail } from "../../lib/auth";
import { X, Loader2 } from "./AuthIcons";

export type AuthMode = "login" | "register" | "verify";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = "login",
  onSuccess,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [terminosAceptados, setTerminosAceptados] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!terminosAceptados) {
      setError("Debes aceptar los Términos de Servicio y la Política de Privacidad.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setIsLoading(true);
    try {
      await sendRegistrationOtp({
        nombre,
        email,
        password,
        terminosAceptados,
        versionTerminos: "2026.1",
      });
      setMode("verify");
      setSuccessMsg("Código enviado exitosamente a tu correo.");
    } catch (err: any) {
      setError(err.message || "Error al iniciar el registro.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await loginWithEmail(email, password);
      if (res.requiresVerification) {
        setMode("verify");
        setError("Tu cuenta no está verificada. Te enviamos un código.");
        return;
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    setError(null);
    setIsLoading(true);

    try {
      await verifyOtp({ email, codigo: code });
      setSuccessMsg("¡Cuenta verificada! Iniciando sesión...");
      setTimeout(async () => {
        try {
          await loginWithEmail(email, password);
        } catch {
          // Si el password no estaba en memoria, se le pide loguear
        }
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Código inválido o expirado.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    try {
      await sendRegistrationOtp({
        nombre: nombre || "Usuario",
        email,
        password,
        terminosAceptados: true,
      });
      setSuccessMsg("Nuevo código enviado a tu correo.");
    } catch (err: any) {
      setError(err.message || "Error al reenviar el código.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-[#F7F8F6] rounded-2xl border border-[#E5DFD3] shadow-2xl p-6 sm:p-8">
        {/* Botón cerrar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana"
          className="absolute top-4 right-4 p-2 text-[#6B7A72] hover:text-[#16201C] rounded-lg hover:bg-black/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6D5F]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* MODO: VERIFICACIÓN OTP */}
        {mode === "verify" ? (
          <div className="pt-2">
            <OtpVerification
              email={email}
              onVerify={handleVerifyOtp}
              onResend={handleResendOtp}
              isLoading={isLoading}
              error={error}
            />
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-xs text-[#6B7A72] hover:text-[#16201C] underline"
              >
                Volver a corregir correo
              </button>
            </div>
          </div>
        ) : (
          /* MODO: LOGIN O REGISTRO */
          <div>
            <div className="text-center mb-6">
              <h2 id="auth-modal-title" className="text-2xl font-bold tracking-tight text-[#16201C]">
                {mode === "login" ? "Iniciar Sesión" : "Crear una Cuenta"}
              </h2>
              <p className="mt-1 text-sm text-[#6B7A72]">
                {mode === "login"
                  ? "Accede a tus trueques y conversaciones."
                  : "Únete a la red de trueques más confiable del Perú."}
              </p>
            </div>

            {/* Pestañas de alternancia */}
            <div className="flex border-b border-[#E5DFD3] mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={`flex-1 py-2 text-sm font-semibold border-b-2 transition-colors ${
                  mode === "login"
                    ? "border-[#0F6D5F] text-[#0F6D5F]"
                    : "border-transparent text-[#6B7A72] hover:text-[#16201C]"
                }`}
              >
                Ingresar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className={`flex-1 py-2 text-sm font-semibold border-b-2 transition-colors ${
                  mode === "register"
                    ? "border-[#0F6D5F] text-[#0F6D5F]"
                    : "border-transparent text-[#6B7A72] hover:text-[#16201C]"
                }`}
              >
                Registrarse
              </button>
            </div>

            {error && (
              <div role="alert" className="mb-4 text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {successMsg && (
              <div role="status" className="mb-4 text-xs font-medium text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-200">
                {successMsg}
              </div>
            )}

            <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-[#16201C] mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5DFD3] bg-white text-sm text-[#16201C] focus:border-[#0F6D5F] focus:ring-2 focus:ring-[#0F6D5F]/20 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#16201C] mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5DFD3] bg-white text-sm text-[#16201C] focus:border-[#0F6D5F] focus:ring-2 focus:ring-[#0F6D5F]/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#16201C] mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E5DFD3] bg-white text-sm text-[#16201C] focus:border-[#0F6D5F] focus:ring-2 focus:ring-[#0F6D5F]/20 focus:outline-none"
                />
              </div>

              {/* Checkbox Legal: Obligatorio desmarcado por defecto */}
              {mode === "register" && (
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    id="terminos"
                    type="checkbox"
                    checked={terminosAceptados}
                    onChange={(e) => setTerminosAceptados(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#E5DFD3] text-[#0F6D5F] focus:ring-[#0F6D5F]"
                  />
                  <label htmlFor="terminos" className="text-xs text-[#6B7A72] leading-tight select-none">
                    He leído y acepto los{" "}
                    <a href="#terminos" className="text-[#0F6D5F] underline font-medium">
                      Términos de Servicio
                    </a>{" "}
                    y la{" "}
                    <a href="#privacidad" className="text-[#0F6D5F] underline font-medium">
                      Política de Privacidad
                    </a>{" "}
                    (Ley N° 29733).
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-lg bg-[#0F6D5F] px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#0c574c] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : mode === "login" ? (
                  "Iniciar Sesión"
                ) : (
                  "Crear Cuenta y Verificar"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
