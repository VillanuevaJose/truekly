import { useState, useRef, useEffect } from "react";
import { Loader2, RefreshCw, Mail, AlertCircle } from "lucide-react";

interface OtpStepProps {
  email: string;
  onVerify: (code: string) => Promise<void> | void;
  onResend: () => Promise<void> | void;
  isLoading: boolean;
  isSendingEmail?: boolean;
  error?: string | null;
  onRetrySend?: () => Promise<void> | void;
  canVerify?: boolean;
}

export function OtpStep({
  email,
  onVerify,
  onResend,
  isLoading,
  isSendingEmail = false,
  error,
  onRetrySend,
  canVerify = true,
}: OtpStepProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState<number>(29); // 29s de cuenta regresiva
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = clean;
    setDigits(nextDigits);

    if (clean && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    if (clean && index === 5 && nextDigits.every((d) => d !== "") && canVerify) {
      onVerify(nextDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const nextDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      nextDigits[i] = pasted[i] || "";
    }
    setDigits(nextDigits);

    const nextFocus = Math.min(pasted.length, 5);
    inputsRef.current[nextFocus]?.focus();

    if (pasted.length === 6 && canVerify) {
      onVerify(pasted);
    }
  };

  const handleResendClick = async () => {
    if (cooldown > 0 || isLoading || isSendingEmail) return;
    setResendStatus(null);
    setDigits(["", "", "", "", "", ""]);
    try {
      await onResend();
      setCooldown(29);
      setResendStatus("Código reenviado.");
      inputsRef.current[0]?.focus();
    } catch {
      // El error principal se propaga en props.error
    }
  };

  const isComplete = digits.every((d) => d !== "");
  const isBusy = isLoading || isSendingEmail;

  return (
    <div className="space-y-3.5">
      {/* Cabecera contextual */}
      <div className="rounded-2xl border border-jade-100 bg-jade-50/60 p-3 flex items-start gap-2.5">
        <div className="h-8 w-8 rounded-xl bg-jade-500 text-white flex items-center justify-center shrink-0">
          <Mail className="h-4 w-4" />
        </div>
        <div className="text-xs">
          <p className="font-semibold text-ink">Verifica tu correo electrónico</p>
          <p className="text-ink-soft mt-0.5">
            Hemos enviado un código de 6 dígitos a{" "}
            <span className="font-bold text-ink break-all">{email}</span>.
          </p>
          <p className="text-sage-500 mt-0.5 text-[11px]">Validez de 10 minutos.</p>
          <p className="text-sage-500 mt-1 text-[11px] italic">
            Si no ves el correo, revisa tu carpeta de spam.
          </p>
        </div>
      </div>

      {/* Inputs OTP de 6 casillas individuales */}
      <div>
        <label className="block text-xs font-semibold text-ink-soft text-center mb-2">
          Ingresa el código de 6 dígitos
        </label>
        <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={isBusy}
              className="h-11 w-10 sm:h-12 sm:w-11 text-center text-lg font-bold font-display rounded-xl border border-line bg-white text-ink outline-none transition-all focus:border-jade-500 focus:ring-2 focus:ring-jade-500/20 disabled:bg-paper"
              aria-label={`Dígito ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Mensajes de error y reenvío con opción de reintentar */}
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-red-200 bg-red-50 p-2.5 flex items-start justify-between gap-2 text-xs text-red-700"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <p className="font-semibold">{error}</p>
            </div>
          </div>
          {onRetrySend && (
            <button
              type="button"
              onClick={onRetrySend}
              className="font-semibold text-red-800 hover:underline shrink-0 text-[11px] ml-1"
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      {resendStatus && (
        <p className="text-xs text-center font-semibold text-jade-700">
          {resendStatus}
        </p>
      )}

      {/* Botón Verificar código */}
      <button
        type="button"
        onClick={() => onVerify(digits.join(""))}
        disabled={!isComplete || isBusy || !canVerify}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-jade-600 to-jade-500 text-sm font-medium text-white shadow-xs hover:from-jade-700 hover:to-jade-600 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 focus-visible:outline-offset-2"
      >
        {isSendingEmail ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Enviando código...</span>
          </>
        ) : isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verificando...</span>
          </>
        ) : !canVerify ? (
          <span>Límite de intentos alcanzado</span>
        ) : (
          "Verificar código"
        )}
      </button>

      {/* Reenviar código con cuenta regresiva de 29s */}
      <div className="text-center pt-1">
        <button
          type="button"
          onClick={handleResendClick}
          disabled={cooldown > 0 || isBusy}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-jade-600 hover:text-jade-700 disabled:text-sage-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-jade-500 rounded p-1"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isBusy ? "animate-spin" : ""}`} />
          {cooldown > 0 ? (
            <span>Reenviar código en {cooldown}s</span>
          ) : (
            <span>Reenviar código</span>
          )}
        </button>
      </div>
    </div>
  );
}
