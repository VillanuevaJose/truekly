import { useState, useEffect } from "react";
import {
  X,
  Gavel,
  CheckCircle2,
  TrendingUp,
  Lock,
} from "lucide-react";
import type { SimulatedAuction } from "../../data/mockAuctions";

type BidModalProps = {
  auction: SimulatedAuction | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    nombre?: string;
    primerNombre?: string;
  } | null;
  onRequireAuth?: (mode?: "login" | "register") => void;
  onBidSuccess?: (auctionId: string, newAmount: number, bidderName: string) => void;
};

export function BidModal({
  auction,
  isOpen,
  onClose,
  currentUser,
  onRequireAuth,
  onBidSuccess,
}: BidModalProps) {
  const minIncrement = auction?.minIncrement || 20;
  const currentBid = auction?.currentBidSimulated || 0;
  const minAllowedBid = currentBid + minIncrement;

  const [bidAmount, setBidAmount] = useState<number>(minAllowedBid);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !auction) return null;

  // Si el usuario no está autenticado, invitar a iniciar sesión
  if (!currentUser) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full max-w-md rounded-3xl border border-line bg-white p-7 text-center shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shadow-xs mb-4">
            <Gavel size={28} />
          </div>
          <h2 className="font-display text-xl font-bold text-ink">
            Inicia sesión para realizar una puja
          </h2>
          <p className="mt-2 text-xs text-sage-600 leading-relaxed">
            Para participar en las subastas benéficas y registrar tus ofertas simuladas en Truekly necesitas tener una cuenta.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequireAuth?.("login");
              }}
              className="w-full rounded-full bg-amber-500 py-2.5 text-xs font-bold text-ink hover:bg-amber-600 transition cursor-pointer"
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequireAuth?.("register");
              }}
              className="w-full rounded-full border border-line bg-white py-2.5 text-xs font-semibold text-ink hover:bg-paper transition cursor-pointer"
            >
              Registrarse gratis
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="mt-1 text-xs text-sage-500 hover:underline cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bidAmount < minAllowedBid) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const code = `PUJA-${Math.floor(1000 + Math.random() * 9000)}-AUC`;
      setConfirmationCode(code);
      setIsSubmitting(false);
      setIsSuccess(true);
      const name = currentUser.primerNombre || currentUser.nombre || "Tú";
      onBidSuccess?.(auction.id, bidAmount, name);
    }, 450);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) handleClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-line bg-white shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-amber-50/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl overflow-hidden bg-amber-100 border border-amber-200 shrink-0">
              <img
                src={auction.image}
                alt={auction.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Puja Especial Simulada
              </span>
              <h2 className="font-display text-sm font-bold text-ink truncate leading-tight">
                {auction.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-sage-500 hover:bg-paper hover:text-ink transition cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X size={16} />
          </button>
        </div>

        {/* Estado de Éxito */}
        {isSuccess ? (
          <div className="p-7 text-center animate-in fade-in duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200 mb-4">
              <CheckCircle2 size={36} />
            </div>

            <span className="inline-block rounded-full bg-amber-100 text-amber-900 px-3 py-1 text-xs font-bold font-mono tracking-wider mb-2">
              Código de Puja: {confirmationCode}
            </span>

            <h3 className="font-display text-xl font-bold text-ink">
              ¡Tu puja ha sido registrada como líder!
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-sage-600 leading-relaxed max-w-sm mx-auto">
              Ahora lideras la subasta con una oferta simulada de{" "}
              <strong className="text-ink font-bold">S/ {bidAmount}.00</strong>.
            </p>

            <div className="mt-5 rounded-2xl border border-line bg-paper/70 p-4 text-left text-xs space-y-2">
              <div className="flex items-start gap-2">
                <TrendingUp size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-ink">
                  <strong>Estado:</strong> Oferta más alta actual. Si alguien supera tu oferta antes de que finalice, te avisaremos.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Lock size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sage-500 text-[11px]">
                  Recuerda que en Truekly no hay cobros bancarios reales. Toda la coordinación final se realiza en el Punto Seguro acordado.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="mt-6 w-full rounded-full bg-amber-500 py-3 text-xs font-bold text-ink hover:bg-amber-600 transition shadow-xs cursor-pointer"
            >
              Entendido, volver a las subastas
            </button>
          </div>
        ) : (
          /* Formulario de puja */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Resumen de puja actual */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-50/50 p-4 flex items-center justify-between">
              <div>
                <span className="block text-[11px] font-semibold text-sage-600 uppercase">
                  Puja actual líder:
                </span>
                <span className="font-display text-2xl font-bold text-ink tabular-nums">
                  S/ {currentBid}.00
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[11px] font-semibold text-amber-700">
                  Mínimo a pujar:
                </span>
                <span className="font-display text-lg font-bold text-amber-900 tabular-nums">
                  S/ {minAllowedBid}.00
                </span>
              </div>
            </div>

            {/* Atajos de incremento rápido */}
            <div>
              <span className="block font-bold text-ink mb-1.5">
                Incrementos rápidos sugeridos:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[minIncrement, minIncrement * 2, minIncrement * 3].map((inc) => {
                  const val = currentBid + inc;
                  const active = bidAmount === val;
                  return (
                    <button
                      key={inc}
                      type="button"
                      onClick={() => setBidAmount(val)}
                      className={`rounded-xl border py-2 text-center text-xs font-bold transition cursor-pointer ${
                        active
                          ? "border-amber-500 bg-amber-100 text-amber-900"
                          : "border-line bg-white text-ink hover:bg-paper"
                      }`}
                    >
                      + S/ {inc} (S/ {val})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Monto personalizado */}
            <div>
              <label htmlFor="bid-amount-input" className="block font-bold text-ink mb-1">
                O ingresa un monto personalizado (Simulado S/): *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sage-500">
                  S/
                </span>
                <input
                  id="bid-amount-input"
                  type="number"
                  min={minAllowedBid}
                  max={9999}
                  step={5}
                  required
                  value={bidAmount || ""}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-line bg-paper text-ink font-bold text-sm outline-none transition focus:border-amber-500 focus:bg-white"
                />
              </div>
              {bidAmount < minAllowedBid && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">
                  El monto debe ser al menos S/ {minAllowedBid}.00 (incremento mínimo de S/ {minIncrement}).
                </p>
              )}
            </div>

            {/* Banner de Seguridad y Transparencia */}
            <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-3 flex items-start gap-2.5">
              <Lock size={15} className="text-amber-700 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-900 leading-relaxed">
                <strong>Aviso de Transparencia:</strong> En Truekly las subastas son 100% simuladas y didácticas. Los montos en Soles (S/) no representan dinero real ni cargos bancarios.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-ink hover:bg-paper transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={bidAmount < minAllowedBid || isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-5 py-2 text-xs font-bold text-ink shadow-sm hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Registrando puja...</span>
                ) : (
                  <>
                    <Gavel size={15} />
                    <span>Confirmar puja simulada</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
