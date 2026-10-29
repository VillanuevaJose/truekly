import { Check } from "lucide-react";

interface StepProgressProps {
  currentStep: 1 | 2 | 3 | 4;
}

const STEPS = [
  { step: 1, label: "DNI" },
  { step: 2, label: "Selfie" },
  { step: 3, label: "Foto DNI" },
  { step: 4, label: "Validación" },
] as const;

export function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <nav aria-label="Progreso del registro" className="mb-3.5">
      <ol className="grid grid-cols-4 w-full">
        {STEPS.map((s, idx) => {
          const isDone = s.step < currentStep;
          const isCurrent = s.step === currentStep;
          const isSegmentCompleted = currentStep >= s.step;

          return (
            <li key={s.step} className="relative flex flex-col items-center">
              {/* Tramo conector solo en los pasos > 1 */}
              {idx > 0 && (
                <div
                  className={`absolute top-3.5 -left-1/2 w-full h-0.5 -translate-y-1/2 z-0 transition-colors duration-300 ${
                    isSegmentCompleted ? "bg-jade-500" : "bg-line"
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Círculo indicador del paso */}
              <div
                className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-200 border-2 ${
                  isDone
                    ? "border-jade-500 bg-jade-500 text-white"
                    : isCurrent
                    ? "border-jade-600 bg-white text-jade-700 ring-2 ring-jade-100"
                    : "border-line bg-paper text-sage-400"
                }`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isDone ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : s.step}
              </div>

              {/* Etiqueta del paso */}
              <span
                className={`mt-1 text-[9.5px] sm:text-[10.5px] font-semibold tracking-wide text-center truncate max-w-full px-0.5 ${
                  isCurrent ? "text-jade-700" : isDone ? "text-ink" : "text-sage-400"
                }`}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
