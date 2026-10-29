import React, { useState, useRef, useEffect } from "react";
import { Loader2, ArrowPathIcon } from "./AuthIcons";

interface OtpVerificationProps {
  email: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  isLoading: boolean;
  error?: string | null;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({
  email,
  onVerify,
  onResend,
  isLoading,
  error,
}) => {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState<number>(60);
  const [isResending, setIsResending] = useState<boolean>(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Temporizador de 60 segundos para reenvío
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Enfocar automáticamente el primer input al montar
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Permitir solo un dígito numérico
    const cleanVal = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);

    // Auto-focus a la siguiente casilla si se ingresó un dígito
    if (cleanVal && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Si se completaron los 6 dígitos, disparar verificación
    if (cleanVal && index === 5 && newDigits.every((d) => d !== "")) {
      onVerify(newDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || "";
    }
    setDigits(newDigits);

    const focusIndex = Math.min(pastedData.length, 5);
    inputsRef.current[focusIndex]?.focus();

    if (pastedData.length === 6) {
      onVerify(pastedData);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      await onResend();
      setCooldown(60);
      setDigits(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#16201C]">
          Verifica tu correo
        </h2>
        <p className="mt-1.5 text-sm text-[#6B7A72]">
          Ingresa el código de 6 dígitos enviado a{" "}
          <span className="font-semibold text-[#16201C]">{email}</span>
        </p>
      </div>

      {/* Casillas de 6 dígitos */}
      <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="Código de verificación de 6 dígitos">
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
            onPaste={handlePaste}
            disabled={isLoading}
            aria-label={`Dígito ${index + 1}`}
            className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-lg border border-[#E5DFD3] bg-white text-[#16201C] focus:border-[#0F6D5F] focus:ring-2 focus:ring-[#0F6D5F]/20 focus:outline-none transition-all disabled:opacity-50"
          />
        ))}
      </div>

      {/* Mensaje de error accesible */}
      {error && (
        <div role="alert" className="text-sm font-medium text-red-600 bg-red-50 py-2 px-3 rounded-md w-full border border-red-200">
          {error}
        </div>
      )}

      {/* Botón de reenvío con cooldown */}
      <div className="text-sm text-[#6B7A72]">
        ¿No recibiste el código?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending || isLoading}
          className="font-semibold text-[#0F6D5F] hover:text-[#0c574c] disabled:text-[#6B7A72]/60 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1 focus:outline-none focus-visible:underline"
        >
          {isResending ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Reenviando...
            </>
          ) : cooldown > 0 ? (
            `Reenviar en ${cooldown}s`
          ) : (
            <>
              <ArrowPathIcon className="w-3.5 h-3.5" />
              Reenviar código
            </>
          )}
        </button>
      </div>
    </div>
  );
};
