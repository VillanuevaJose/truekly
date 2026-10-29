import { Check } from "lucide-react";
import { CONDITION_OPTIONS, type PublishFormData } from "./publishTypes";
import type { Condition } from "../../data/mockProducts";

interface Props {
  data: PublishFormData;
  onChange: (fields: Partial<PublishFormData>) => void;
}

export function PublishDetailsStep({ data, onChange }: Props) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Condición / Estado */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
          Estado de conservación <span className="text-amber-600">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {CONDITION_OPTIONS.map((cond) => {
            const isSelected = data.condition === cond.id;
            return (
              <button
                key={cond.id}
                type="button"
                onClick={() => onChange({ condition: cond.id as Condition })}
                className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition ${
                  isSelected
                    ? "border-jade-600 bg-jade-50/40 text-jade-900 shadow-2xs"
                    : "border-line bg-white text-ink hover:bg-paper"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs font-semibold">{cond.label}</span>
                  {isSelected && (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-jade-600 text-white">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <span className="mt-0.5 text-[11px] text-sage-500">{cond.hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Descripción Libre */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="pub-desc" className="text-xs font-semibold uppercase tracking-wider text-ink">
            Descripción y detalles <span className="text-amber-600">*</span>
          </label>
          <span
            className={`text-[11px] ${
              data.description.trim().length < 15 ? "text-amber-700" : "text-sage-400"
            }`}
          >
            {data.description.length} car. (mínimo 15)
          </span>
        </div>
        <textarea
          id="pub-desc"
          rows={4}
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Menciona tiempo de uso, si incluye cables/caja original, detalles estéticos o por qué deseas cambiarlo..."
          className="w-full rounded-xl border border-line bg-white p-3 text-xs text-ink placeholder:text-sage-400 focus:border-jade-500 focus:outline-none focus:ring-1 focus:ring-jade-500"
        />
        <p className="mt-1 text-[11px] text-sage-500">
          Una descripción honesta y clara acelera los acuerdos y construye reputación comunitaria.
        </p>
      </div>
    </div>
  );
}
