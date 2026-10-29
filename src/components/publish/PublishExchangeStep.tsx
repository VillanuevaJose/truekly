import { MapPin, ShieldCheck, Sparkles } from "lucide-react";
import type { PublishFormData } from "./publishTypes";
import { CHIMBOTE_ZONES } from "../../data/mockProducts";

interface Props {
  data: PublishFormData;
  onChange: (fields: Partial<PublishFormData>) => void;
}

const QUICK_SEEKING_PROMPTS = [
  "Monitor gamer o periféricos",
  "Bicicleta de paseo o aro 29",
  "Instrumento musical o pedal",
  "Tablet o lector electrónico",
  "Abierto a escuchar propuestas",
];

const SAFE_POINTS_LIST = [
  "MegaPlaza Chimbote (Zona Bancaria)",
  "Plaza Mayor de Nuevo Chimbote",
  "Plaza de Armas de Chimbote",
  "Metro / Tottus Chimbote (Ingreso)",
  "Punto neutral acordado por chat",
];

export function PublishExchangeStep({ data, onChange }: Props) {
  const zones = CHIMBOTE_ZONES.filter((z) => z !== "Todas");

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* ¿Qué buscas a cambio? */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="pub-seeking" className="text-xs font-semibold uppercase tracking-wider text-ink">
            ¿Qué buscas a cambio? <span className="text-amber-600">*</span>
          </label>
          <span className="text-[11px] text-sage-400">Sé específico</span>
        </div>
        <input
          id="pub-seeking"
          type="text"
          value={data.wantsInReturn}
          onChange={(e) => onChange({ wantsInReturn: e.target.value })}
          placeholder="Ej: Auriculares inalámbricos Sony o monitor para oficina"
          className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-ink placeholder:text-sage-400 focus:border-jade-500 focus:outline-none focus:ring-1 focus:ring-jade-500"
        />

        {/* Sugerencias Rápidas */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sage-500">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Sugerencias:</span>
          </span>
          {QUICK_SEEKING_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onChange({ wantsInReturn: prompt })}
              className="rounded-full border border-line bg-paper/80 px-2.5 py-1 text-[10px] font-medium text-sage-700 hover:border-jade-400 hover:bg-jade-50/50 hover:text-jade-800 transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Zona y Punto Seguro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="pub-zone" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
            Zona de referencia <span className="text-amber-600">*</span>
          </label>
          <div className="relative">
            <select
              id="pub-zone"
              value={data.zone}
              onChange={(e) => onChange({ zone: e.target.value })}
              className="w-full appearance-none rounded-xl border border-line bg-white px-3 py-2.5 text-xs text-ink focus:border-jade-500 focus:outline-none focus:ring-1 focus:ring-jade-500"
            >
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
            <MapPin className="pointer-events-none absolute right-3 top-3 h-3.5 w-3.5 text-sage-400" />
          </div>
        </div>

        <div>
          <label htmlFor="pub-safepoint" className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
            Punto de encuentro sugerido
          </label>
          <div className="relative">
            <select
              id="pub-safepoint"
              value={data.safePointRecommended}
              onChange={(e) => onChange({ safePointRecommended: e.target.value })}
              className="w-full appearance-none rounded-xl border border-line bg-white px-3 py-2.5 text-xs text-ink focus:border-jade-500 focus:outline-none focus:ring-1 focus:ring-jade-500"
            >
              {SAFE_POINTS_LIST.map((point) => (
                <option key={point} value={point}>
                  {point}
                </option>
              ))}
            </select>
            <ShieldCheck className="pointer-events-none absolute right-3 top-3 h-3.5 w-3.5 text-jade-600" />
          </div>
        </div>
      </div>

      {/* Aviso de Seguridad */}
      <div className="rounded-xl border border-line bg-jade-50/40 p-3 flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 text-jade-700 shrink-0 mt-0.5" />
        <div className="text-[11px] text-jade-900 leading-relaxed">
          <p className="font-semibold">Trueque seguro y presencial</p>
          <p className="text-sage-600">
            Recomendamos realizar todo trueque en zonas iluminadas y con concurrencia. Nunca compartas datos bancarios.
          </p>
        </div>
      </div>
    </div>
  );
}
