import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

interface SelfieStepProps {
  onCapture: (photoBase64: string) => void;
  savedPhoto: string | null;
  onClear: () => void;
}

export function SelfieStep({ onCapture, savedPhoto, onClear }: SelfieStepProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Detener todos los tracks de la cámara
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Al desmontar o salir del paso, asegurar que se liberen los dispositivos
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Sincronizar el stream con el elemento <video> cuando ambos estén disponibles y montados en el DOM
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    // Llamar explícitamente a play() para garantizar la reproducción y evitar pantalla negra
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("[SelfieStep]: Error al reproducir video de cámara:", err);
      });
    }
  }, [stream]);

  const startCamera = async () => {
    setCameraError(null);
    setIsInitializing(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      setStream(mediaStream);
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setCameraError("Permiso de cámara denegado. Habilita el acceso en tu navegador para continuar.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setCameraError("No se encontró ninguna cámara conectada en tu dispositivo.");
      } else {
        setCameraError("No fue posible acceder a la cámara. Revisa los permisos e inténtalo nuevamente.");
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Aplicar efecto espejo idéntico al que vio el usuario en la vista previa
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64 = canvas.toDataURL("image/jpeg", 0.9);
    stopStream();
    onCapture(base64);
  };

  const handleRetake = () => {
    onClear();
    startCamera();
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-line bg-white p-4 text-center shadow-xs">
        {/* Caso 1: Foto capturada (vista previa final) */}
        {savedPhoto ? (
          <div className="flex flex-col items-center">
            <div className="relative h-44 w-44 sm:h-48 sm:w-48 overflow-hidden rounded-full border-4 border-jade-500 shadow-md">
              <img
                src={savedPhoto}
                alt="Vista previa de selfie capturada"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-jade-700">
              <CheckCircle2 className="h-4 w-4 text-jade-600" />
              <span>Selfie capturada correctamente</span>
            </div>

            <button
              type="button"
              onClick={handleRetake}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3.5 py-1.5 text-xs font-semibold text-ink-soft hover:bg-jade-50 hover:text-jade-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-500"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Repetir foto</span>
            </button>
          </div>
        ) : stream ? (
          /* Caso 2: Cámara transmitiendo en vivo con srcObject activo */
          <div className="flex flex-col items-center">
            <div className="relative h-44 w-44 sm:h-48 sm:w-48 overflow-hidden rounded-full border-4 border-jade-500 bg-black shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ transform: "scaleX(-1)" }}
                className="h-full w-full object-cover block"
              />
              {/* Guía visual circular y ovalada */}
              <div
                className="pointer-events-none absolute inset-2 rounded-full border-2 border-dashed border-white/70"
                aria-hidden="true"
              />
            </div>

            <p className="mt-2 text-[11.5px] text-ink-soft">
              Ubica tu rostro dentro del círculo y mantén buena iluminación.
            </p>

            <button
              type="button"
              onClick={takePhoto}
              className="mt-2.5 inline-flex items-center gap-2 rounded-full bg-jade-500 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-jade-600 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-500"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Tomar foto</span>
            </button>
          </div>
        ) : (
          /* Caso 3: Estado inicial o error de acceso */
          <div className="flex flex-col items-center py-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-jade-50 text-jade-600 border border-jade-100">
              <Camera className="h-6 w-6" />
            </div>

            <h3 className="mt-2 text-sm font-semibold text-ink">
              Verificación facial de seguridad
            </h3>
            <p className="mt-0.5 max-w-xs text-xs text-ink-soft leading-relaxed">
              Validamos que la persona registrándose sea real. Tu selfie solo se almacena de forma local para esta sesión de validación.
            </p>

            {cameraError && (
              <div
                role="alert"
                aria-live="polite"
                className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-2.5 text-left text-xs text-red-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={startCamera}
              disabled={isInitializing}
              className="mt-3.5 inline-flex items-center gap-2 rounded-full bg-jade-500 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-jade-600 active:scale-95 transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-500"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>{isInitializing ? "Iniciando cámara..." : "Abrir cámara"}</span>
            </button>
          </div>
        )}
      </div>

      <div className="text-[10.5px] text-sage-500 leading-relaxed text-center">
        * Nota: La verificación biométrica está en modo simulación de entorno seguro.
      </div>
    </div>
  );
}
