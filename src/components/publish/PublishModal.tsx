import { useState, useEffect } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { INITIAL_FORM_DATA, type PublishFormData } from "./publishTypes";
import { PublishPhotosStep } from "./PublishPhotosStep";
import { PublishDetailsStep } from "./PublishDetailsStep";
import { PublishExchangeStep } from "./PublishExchangeStep";
import { PublishAuthPrompt, PublishSuccessView } from "./PublishFeedbackStates";
import { PublishHeader } from "./PublishHeader";
import type { Product } from "../../data/mockProducts";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onPublishSuccess?: (item: Product) => void;
  onRequireAuth?: (mode: "login" | "register") => void;
}

export function PublishModal({ isOpen, onClose, onPublishSuccess, onRequireAuth }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<PublishFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const updateFields = (fields: Partial<PublishFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const isStepValid = () => {
    if (step === 1) return formData.photos.length >= 3 && formData.title.trim().length >= 4;
    if (step === 2) return formData.description.trim().length >= 15;
    if (step === 3) return formData.wantsInReturn.trim().length >= 3;
    return true;
  };

  const handleSubmit = async () => {
    if (!isStepValid() || isSubmitting) return;
    setIsSubmitting(true);

    const newProduct: Product = {
      id: `usr-pub-${Date.now()}`,
      title: formData.title.trim(),
      image: formData.photos[0],
      gallery: formData.photos,
      category: formData.category,
      condition: formData.condition,
      wantsInReturn: formData.wantsInReturn.trim(),
      zone: formData.zone,
      rating: 0,
      exchangesCount: 0,
      owner: {
        name: user?.username ? `@${user.username}` : user?.nombre || "Usuario",
        avatar: user?.fotoPerfil || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
        verified: Boolean(user?.verificado),
      },
      description: formData.description.trim(),
      safePointRecommended: formData.safePointRecommended,
      isFeatured: true,
    };

    await new Promise((r) => setTimeout(r, 600));
    setIsSubmitting(false);
    setIsDone(true);
    if (onPublishSuccess) onPublishSuccess(newProduct);
  };

  const handleResetAndClose = () => {
    setStep(1);
    setFormData(INITIAL_FORM_DATA);
    setIsDone(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl border border-line bg-white shadow-xl flex flex-col">
        <PublishHeader
          step={step}
          isDone={isDone}
          onPrev={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
          onClose={handleResetAndClose}
        />

        {/* Contenido / Pasos */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {!user ? (
            <PublishAuthPrompt
              onLogin={() => {
                onClose();
                onRequireAuth?.("login");
              }}
              onRegister={() => {
                onClose();
                onRequireAuth?.("register");
              }}
            />
          ) : isDone ? (
            <PublishSuccessView onExplore={handleResetAndClose} />
          ) : (
            <>
              {step === 1 && <PublishPhotosStep data={formData} onChange={updateFields} />}
              {step === 2 && <PublishDetailsStep data={formData} onChange={updateFields} />}
              {step === 3 && <PublishExchangeStep data={formData} onChange={updateFields} />}
            </>
          )}
        </div>

        {/* Pie de navegación */}
        {user && !isDone && (
          <div className="sticky bottom-0 border-t border-line bg-paper/60 px-5 py-3.5 backdrop-blur-md flex items-center justify-between gap-3">
            <span className="text-[11px] text-sage-500 hidden sm:inline">
              {step === 1 && "Mínimo 3 fotos y título descriptivo"}
              {step === 2 && "Describe el estado real del objeto"}
              {step === 3 && "Sin precios en soles: trueque libre"}
            </span>

            <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                  className="w-1/2 sm:w-auto rounded-xl border border-line bg-white px-4 py-2 text-xs font-semibold text-ink hover:bg-paper"
                >
                  Atrás
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  disabled={!isStepValid()}
                  onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-jade-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-jade-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Continuar</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!isStepValid() || isSubmitting}
                  onClick={handleSubmit}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-jade-600 px-6 py-2 text-xs font-semibold text-white shadow-xs hover:bg-jade-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Publicando...</span>
                    </>
                  ) : (
                    <span>Publicar en Truekly</span>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
