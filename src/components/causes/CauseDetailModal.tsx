import { useEffect, useRef } from "react";
import {
  X,
  MapPin,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
  Lock,
  Clock,
  Sparkles,
  UserCheck,
} from "lucide-react";
import type { CauseSocial } from "../../data/mockCauses";

type CauseDetailModalProps = {
  cause: CauseSocial | null;
  onClose: () => void;
  onDonate: (cause: CauseSocial) => void;
};

export function CauseDetailModal({ cause, onClose, onDonate }: CauseDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (cause) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cause, onClose]);

  if (!cause) return null;

  const percent = cause.impactMetric
    ? Math.min(
        100,
        Math.round((cause.impactMetric.received / cause.impactMetric.goal) * 100)
      )
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cause-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-line bg-white shadow-2xl animate-in zoom-in-95 duration-200 no-scrollbar"
      >
        {/* Cabecera con Imagen de portada */}
        <div className="relative h-56 sm:h-64 w-full bg-paper overflow-hidden">
          <img
            src={cause.image}
            alt={cause.ongName}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

          {/* Botón cerrar */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-white"
            aria-label="Cerrar ventana"
          >
            <X size={18} />
          </button>

          {/* Badges superiores */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-jade-700 shadow-sm flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-jade-600" />
              ONG Verificada
            </span>
            {cause.urgency === "urgente" && (
              <span className="rounded-full bg-rose-500 px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Clock size={12} />
                Causa Urgente
              </span>
            )}
          </div>

          {/* Título y categoría superpuestos en la base de la imagen */}
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <span className="text-[11px] font-bold uppercase tracking-wider text-jade-300">
              {cause.category}
            </span>
            <h1 id="cause-title" className="font-display text-xl sm:text-2xl font-bold leading-tight mt-0.5">
              {cause.ongName}
            </h1>
            <p className="flex items-center gap-1.5 text-xs text-white/90 mt-1">
              <MapPin size={13} className="text-jade-300" />
              <span>{cause.zone} ({cause.city})</span>
            </p>
          </div>
        </div>

        {/* Cuerpo del modal con detalles */}
        <div className="p-6 sm:p-7 space-y-6 text-ink">
          {/* Misión y labor */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-sage-500 mb-2">
              Nuestra Labor Comunitaria
            </h2>
            <p className="text-sm leading-relaxed text-ink bg-paper/60 p-4 rounded-2xl border border-line">
              {cause.story || cause.objective}
            </p>
          </div>

          {/* Avance de recolección solidaria */}
          {cause.impactMetric && (
            <div className="rounded-2xl border border-line bg-jade-50/50 p-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-jade-800 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-jade-600" />
                  Meta solidaria en marcha
                </span>
                <span className="font-bold text-jade-700">
                  {cause.impactMetric.received} de {cause.impactMetric.goal} {cause.impactMetric.unit} ({percent}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-jade-200/60 overflow-hidden">
                <div
                  className="h-full bg-jade-600 rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Lista completa de objetos que necesitan */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-sage-500 mb-2.5">
              Todos los Objetos y Materiales Solicitados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cause.acceptedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-line bg-white hover:border-jade-400 transition"
                >
                  <CheckCircle2 size={15} className="text-jade-600 shrink-0" />
                  <span className="text-xs font-medium text-ink">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Punto Seguro y Reglas de Solidaridad */}
          <div className="space-y-3 rounded-2xl border border-line bg-paper/70 p-4 text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin size={16} className="text-jade-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-ink">Punto Seguro Oficial de Entrega</p>
                <p className="text-sage-600 text-[11px] mt-0.5">{cause.deliveryPoint}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <UserCheck size={16} className="text-jade-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-ink">Responsable de Coordinación</p>
                <p className="text-sage-600 text-[11px] mt-0.5">{cause.coordinator} · {cause.contact}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Lock size={16} className="text-sage-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-ink">Política Cero Dinero de Truekly</p>
                <p className="text-sage-600 text-[11px] mt-0.5">
                  Toda donación es exclusivamente en objetos físicos útiles. Las ONGs no solicitan depósitos, Yape ni dinero en efectivo.
                </p>
              </div>
            </div>
          </div>

          {/* Botones de acción al pie */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-full border border-line bg-white px-5 py-2.5 text-xs font-semibold text-ink hover:bg-paper transition"
            >
              Volver al catálogo
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onDonate(cause);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-jade-500 px-6 py-2.5 text-xs sm:text-sm font-semibold text-paper shadow-sm hover:bg-jade-600 transition focus-visible:outline-2 focus-visible:outline-jade-500 cursor-pointer"
            >
              <HeartHandshake size={16} />
              <span>Aportar un objeto a esta causa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
