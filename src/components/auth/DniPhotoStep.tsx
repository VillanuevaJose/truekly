import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, RefreshCw, AlertCircle, CheckCircle2, IdCard } from "lucide-react";

interface DniPhotoStepProps {
  onCapture: (photoBase64: string) => void;
  savedPhoto: string | null;
  onClear: () => void;
}

// Proporción estándar de tarjeta de identidad ID-1 (85.60 mm x 53.98 mm = aprox. 1.586 : 1)
const ID1_ASPECT_RATIO = 1.586;

export function DniPhotoStep({ onCapture, savedPhoto, onClear }: DniPhotoStepProps) {
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

  // Al desmontar o salir del paso, asegurar que se liberen los recursos de cámara
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Sincronizar el stream con el elemento <video>
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("[DniPhotoStep]: Error al reproducir video de cámara:", err);
      });
    }
  }, [stream]);

  const startCamera = async () => {
    setCameraError(null);
    setIsInitializing(true);
    try {
      // Priorizar cámara trasera (environment) y alta resolución (ideal 1080p)
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch {
        // Fallback en caso de que las restricciones ideales fallen en algunos navegadores
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
      }

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

    const vWidth = video.videoWidth || 1280;
    const vHeight = video.videoHeight || 720;

    // Calcular recorte exacto según object-cover y relación ID-1
    const videoAspect = vWidth / vHeight;
    let srcX = 0;
    let srcY = 0;
    let srcWidth = vWidth;
    let srcHeight = vHeight;

    if (videoAspect > ID1_ASPECT_RATIO) {
      // El video es más ancho: recortar los laterales
      srcWidth = vHeight * ID1_ASPECT_RATIO;
      srcX = (vWidth - srcWidth) / 2;
    } else {
      // El video es más alto (ej. móvil en vertical): recortar arriba y abajo
      srcHeight = vWidth / ID1_ASPECT_RATIO;
      srcY = (vHeight - srcHeight) / 2;
    }

    const outWidth = Math.min(Math.round(srcWidth), 1200);
    const outHeight = Math.round(outWidth / ID1_ASPECT_RATIO);

    const canvas = document.createElement("canvas");
    canvas.width = outWidth;
    canvas.height = outHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dibujar directamente sin invertir (espejo) para que los textos del DNI sean legibles
    ctx.drawImage(video, srcX, srcY, srcWidth, srcHeight, 0, 0, outWidth, outHeight);

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
        {/* Caso 1: Foto capturada */}
        {savedPhoto ? (
          <div className="flex flex-col items-center">
            <div
              className="relative w-full max-w-[320px] sm:max-w-[340px] overflow-hidden rounded-2xl border-4 border-jade-500 shadow-md bg-black"
              style={{ aspectRatio: `${ID1_ASPECT_RATIO}` }}
            >
              <img
                src={savedPhoto}
                alt="Vista previa de DNI capturado"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-jade-700">
              <CheckCircle2 className="h-4 w-4 text-jade-600" />
              <span>DNI capturado correctamente</span>
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
          /* Caso 2: Cámara transmitiendo en vivo con visor rectangular */
          <div className="flex flex-col items-center">
            <div
              className="relative w-full max-w-[320px] sm:max-w-[340px] overflow-hidden rounded-2xl border-4 border-jade-500 bg-black shadow-inner flex items-center justify-center"
              style={{ aspectRatio: `${ID1_ASPECT_RATIO}` }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover block"
              />

              {/* Guía visual con esquinas marcadas (corner brackets) */}
              <div
                className="pointer-events-none absolute inset-3 rounded-lg border border-white/30"
                aria-hidden="true"
              >
                {/* Esquina superior izquierda */}
                <div className="absolute -top-1 -left-1 h-4 w-4 border-t-2 border-l-2 border-white rounded-tl-xs" />
                {/* Esquina superior derecha */}
                <div className="absolute -top-1 -right-1 h-4 w-4 border-t-2 border-r-2 border-white rounded-tr-xs" />
                {/* Esquina inferior izquierda */}
                <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-white rounded-bl-xs" />
                {/* Esquina inferior derecha */}
                <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-white rounded-br-xs" />

                {/* Texto guía */}
                <div className="absolute inset-x-0 bottom-2 text-center">
                  <span className="inline-block rounded-full bg-black/60 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-medium text-white/90">
                    Coloca tu DNI dentro del recuadro
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-2 text-[11.5px] text-ink-soft">
              Asegúrate de que los datos y la foto sean completamente legibles y sin reflejos.
            </p>

            <button
              type="button"
              onClick={takePhoto}
              className="mt-2.5 inline-flex items-center gap-2 rounded-full bg-jade-500 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-jade-600 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-500"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Capturar DNI</span>
            </button>
          </div>
        ) : (
          /* Caso 3: Estado inicial / permiso */
          <div className="flex flex-col items-center py-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-jade-50 text-jade-600 border border-jade-100">
              <IdCard className="h-6 w-6" />
            </div>

            <h3 className="mt-2 text-sm font-semibold text-ink">
              Fotografía de documento de identidad
            </h3>
            <p className="mt-0.5 max-w-xs text-xs text-ink-soft leading-relaxed">
              Captura el anverso (lado frontal) de tu DNI físico para validar la autenticidad de tu registro.
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
