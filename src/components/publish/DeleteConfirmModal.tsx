import { useEffect } from "react";
import { AlertTriangle, Trash2, X, Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  isDeleting: boolean;
  itemTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  isDeleting,
  itemTitle,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting) onCancel();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-5 shadow-xl space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="rounded-lg p-1 text-sage-400 hover:bg-paper hover:text-ink disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div>
          <h3 id="delete-dialog-title" className="text-sm font-bold text-ink">
            ¿Eliminar esta publicación?
          </h3>
          <p className="mt-1 text-xs text-sage-600 leading-relaxed">
            Se eliminará <span className="font-semibold text-ink">"{itemTitle}"</span> de la base de datos y ya no aparecerá en el feed ni en tu perfil. Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="rounded-xl border border-line bg-white px-4 py-2 text-xs font-semibold text-ink hover:bg-paper disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Sí, eliminar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
