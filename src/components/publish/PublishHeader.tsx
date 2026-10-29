import { X, ArrowLeft } from "lucide-react";

interface Props {
  step: 1 | 2 | 3;
  isDone: boolean;
  onPrev: () => void;
  onClose: () => void;
}

export function PublishHeader({ step, isDone, onPrev, onClose }: Props) {
  return (
    <>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white/95 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {step > 1 && !isDone && (
            <button
              type="button"
              onClick={onPrev}
              className="rounded-lg p-1 text-sage-500 hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-jade-500"
              aria-label="Volver al paso anterior"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div>
            <h2 id="modal-title" className="text-sm font-bold text-ink">
              {isDone ? "¡Publicación completada!" : "Publicar objeto para trueque"}
            </h2>
            {!isDone && (
              <p className="text-[11px] text-sage-500">Paso {step} de 3 · Trueque libre y seguro</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-sage-400 hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-jade-500"
          aria-label="Cerrar modal"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {!isDone && (
        <div className="h-1 w-full bg-paper">
          <div
            className="h-full bg-jade-600 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      )}
    </>
  );
}
