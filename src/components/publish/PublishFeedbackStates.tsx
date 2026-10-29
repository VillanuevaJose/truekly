import { ShieldAlert, CheckCircle2 } from "lucide-react";

interface AuthPromptProps {
  onLogin: () => void;
  onRegister: () => void;
}

export function PublishAuthPrompt({ onLogin, onRegister }: AuthPromptProps) {
  return (
    <div className="py-6 text-center space-y-4">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <div className="max-w-sm mx-auto space-y-1">
        <h3 className="text-sm font-bold text-ink">Inicia sesión para publicar</h3>
        <p className="text-xs text-sage-500">
          Para proteger la confianza de los intercambios, necesitas una cuenta verificada.
        </p>
      </div>
      <div className="flex items-center justify-center gap-2.5 pt-2">
        <button
          type="button"
          onClick={onLogin}
          className="rounded-xl border border-line bg-white px-4 py-2 text-xs font-semibold text-ink hover:bg-paper"
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={onRegister}
          className="rounded-xl bg-jade-600 px-4 py-2 text-xs font-semibold text-white hover:bg-jade-700"
        >
          Crear cuenta gratis
        </button>
      </div>
    </div>
  );
}

interface SuccessProps {
  onExplore: () => void;
}

export function PublishSuccessView({ onExplore }: SuccessProps) {
  return (
    <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-jade-50 text-jade-700 border border-jade-200">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-ink">¡Tu objeto ya está en el feed!</h3>
        <p className="text-xs text-sage-500 max-w-sm mx-auto">
          Otros usuarios podrán ver tus fotos y enviarte propuestas directas por el chat seguro.
        </p>
      </div>
      <button
        type="button"
        onClick={onExplore}
        className="mt-2 inline-flex items-center rounded-xl bg-jade-600 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-jade-700"
      >
        Explorar en el Feed
      </button>
    </div>
  );
}
