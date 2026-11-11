import { useState } from "react";
import {
  MapPin,
  ShieldCheck,
  HeartHandshake,
  Info,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import type { CauseSocial } from "../../data/mockCauses";

type CauseCardProps = {
  cause: CauseSocial;
  onDonate: (cause: CauseSocial) => void;
  onViewDetails: (cause: CauseSocial) => void;
};

export function CauseCard({ cause, onDonate, onViewDetails }: CauseCardProps) {
  const [imgError, setImgError] = useState(false);

  const percent = cause.impactMetric
    ? Math.min(
        100,
        Math.round((cause.impactMetric.received / cause.impactMetric.goal) * 100)
      )
    : 0;

  return (
    <article className="group flex flex-col xl:flex-row rounded-3xl border border-line bg-white overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-jade-400 hover:shadow-md">
      {/* 1. Imagen representativa con ratio controlado y badges superpuestos */}
      <div className="relative w-full xl:w-72 h-52 xl:h-auto shrink-0 bg-paper overflow-hidden">
        {cause.image && !imgError ? (
          <img
            src={cause.image}
            alt={cause.ongName}
            onError={() => setImgError(true)}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-jade-50 text-jade-700 font-display font-bold text-3xl">
            {cause.ongName.slice(0, 2).toUpperCase()}
          </div>
        )}

        {/* Gradiente sutil para legibilidad en móvil */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 xl:hidden pointer-events-none" />

        {/* Badges superiores sobre la imagen */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          {cause.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-jade-700 shadow-xs border border-white/40">
              <ShieldCheck size={13} className="text-jade-600" />
              <span>Verificada</span>
            </span>
          )}

          {cause.urgency === "urgente" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-xs">
              <Clock size={11} />
              Urgente
            </span>
          )}
          {cause.urgency === "alta" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-xs">
              <Clock size={11} />
              Prioridad
            </span>
          )}
        </div>

        {/* Etiqueta de categoría en esquina inferior móvil */}
        <div className="absolute bottom-3 left-3 xl:hidden">
          <span className="rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-jade-800">
            {cause.category}
          </span>
        </div>
      </div>

      {/* 2. Cuerpo de información estructurada */}
      <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between min-w-0">
        <div>
          {/* Categoría y ubicación */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="hidden xl:inline-block font-semibold uppercase tracking-wider text-[11px] text-jade-600">
              {cause.category}
            </span>
            <span className="flex items-center gap-1 text-sage-500 truncate text-[11px] sm:text-xs">
              <MapPin size={13} className="shrink-0 text-jade-500" />
              <span className="truncate">{cause.zone}</span>
            </span>
          </div>

          {/* Nombre de la ONG */}
          <h2 className="mt-1.5 font-display text-lg sm:text-xl font-bold text-ink group-hover:text-jade-700 transition-colors leading-snug">
            {cause.ongName}
          </h2>

          {/* Misión y objetivo */}
          <p className="mt-2 text-xs sm:text-sm text-ink-soft leading-relaxed line-clamp-2">
            {cause.objective}
          </p>

          {/* Métrica de avance / impacto transparente */}
          {cause.impactMetric && (
            <div className="mt-4 rounded-2xl border border-line bg-paper/60 p-3 sm:p-3.5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-ink flex items-center gap-1.5">
                  <Sparkles size={13} className="text-jade-600" />
                  Meta solidaria del mes:
                </span>
                <span className="font-bold text-jade-700">
                  {cause.impactMetric.received} de {cause.impactMetric.goal}{" "}
                  <span className="text-sage-500 font-normal">({percent}%)</span>
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-line overflow-hidden">
                <div
                  className="h-full bg-jade-500 rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-sage-500">
                Recolectados para esta causa: <strong>{cause.impactMetric.unit}</strong>
              </p>
            </div>
          )}

          {/* Chips de objetos necesitados */}
          <div className="mt-4">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-sage-500 mb-2">
              Objetos que necesitan actualmente:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {cause.acceptedItems.slice(0, 5).map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-1 text-xs text-ink transition hover:border-jade-400 hover:bg-jade-50/50"
                >
                  <CheckCircle2 size={11} className="text-jade-600 shrink-0" />
                  <span>{item}</span>
                </span>
              ))}
              {cause.acceptedItems.length > 5 && (
                <button
                  type="button"
                  onClick={() => onViewDetails(cause)}
                  className="rounded-full border border-dashed border-line px-2 py-1 text-xs font-medium text-sage-600 hover:text-jade-700 hover:border-jade-400"
                >
                  +{cause.acceptedItems.length - 5} más
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Footer con Punto Seguro y Acciones */}
        <div className="mt-5 pt-4 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <p className="text-[11px] text-sage-500 truncate">
              Entrega en: <strong className="text-ink">{cause.deliveryPoint}</strong>
            </p>
            <p className="text-[11px] text-sage-400 truncate mt-0.5">
              Coordinador: {cause.coordinator}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onViewDetails(cause)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink hover:bg-paper hover:border-jade-500 transition focus-visible:outline-2 focus-visible:outline-jade-500"
            >
              <Info size={14} className="text-sage-500" />
              <span>Conocer más</span>
            </button>

            <button
              type="button"
              onClick={() => onDonate(cause)}
              className="inline-flex items-center gap-1.5 rounded-full bg-jade-500 px-4 py-2 text-xs font-semibold text-paper hover:bg-jade-600 shadow-xs transition focus-visible:outline-2 focus-visible:outline-jade-500 cursor-pointer"
            >
              <HeartHandshake size={15} />
              <span>Aportar un objeto</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
