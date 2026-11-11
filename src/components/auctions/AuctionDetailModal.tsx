import { useEffect, useRef } from "react";
import {
  X,
  Gavel,
  Clock,
  ShieldCheck,
  MapPin,
  Heart,
  TrendingUp,
  Lock,
} from "lucide-react";
import type { SimulatedAuction } from "../../data/mockAuctions";

type AuctionDetailModalProps = {
  auction: SimulatedAuction | null;
  onClose: () => void;
  onBid: (auction: SimulatedAuction) => void;
};

export function AuctionDetailModal({
  auction,
  onClose,
  onBid,
}: AuctionDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (auction) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [auction, onClose]);

  if (!auction) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auction-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-line bg-white shadow-2xl animate-in zoom-in-95 duration-200 no-scrollbar"
      >
        {/* Cabecera con Imagen de portada */}
        <div className="relative h-60 sm:h-72 w-full bg-paper overflow-hidden">
          <img
            src={auction.image}
            alt={auction.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30" />

          {/* Botón cerrar */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/70 focus-visible:outline-2 focus-visible:outline-white cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X size={18} />
          </button>

          {/* Badges superiores */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-ink shadow-sm flex items-center gap-1.5">
              <Gavel size={13} />
              Subasta Especial
            </span>
            <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white flex items-center gap-1.5">
              <Clock size={13} className="text-amber-400" />
              {auction.hoursRemaining}h restantes
            </span>
          </div>

          {/* Título en la base de la imagen */}
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
              {auction.category} · Estado: {auction.condition}
            </span>
            <h1 id="auction-title" className="font-display text-xl sm:text-2xl font-bold leading-tight mt-0.5">
              {auction.title}
            </h1>
            <p className="flex items-center gap-1.5 text-xs text-white/90 mt-1">
              <MapPin size={13} className="text-amber-300" />
              <span>{auction.zone}</span>
            </p>
          </div>
        </div>

        {/* Cuerpo del modal con detalles */}
        <div className="p-6 sm:p-7 space-y-6 text-ink">
          {/* Causa benéfica si aplica */}
          {auction.isBenefic && auction.beneficEntity && (
            <div className="rounded-2xl border border-jade-300 bg-jade-50/80 p-3.5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-jade-100 flex items-center justify-center text-jade-700 shrink-0">
                <Heart size={20} className="fill-jade-600 text-jade-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-jade-900">
                  Subasta con Fin Social Solidario
                </p>
                <p className="text-xs text-jade-800 font-medium">
                  {auction.beneficEntity}
                </p>
              </div>
            </div>
          )}

          {/* Descripción técnica y características */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-sage-500 mb-2">
              Descripción del Artículo
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-ink bg-paper/60 p-4 rounded-2xl border border-line">
              {auction.description}
            </p>
          </div>

          {/* Cuadro de puja líder y estadísticas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-amber-500/40 bg-amber-50/60 p-4">
              <span className="block text-[11px] font-semibold text-sage-600 uppercase">
                Puja líder (Simulada)
              </span>
              <span className="font-display text-2xl font-bold text-ink tabular-nums mt-0.5 block">
                S/ {auction.currentBidSimulated}.00
              </span>
            </div>
            <div className="rounded-2xl border border-line bg-paper/60 p-4">
              <span className="block text-[11px] font-semibold text-sage-500 uppercase">
                Precio base simulado
              </span>
              <span className="font-display text-xl font-bold text-ink tabular-nums mt-0.5 block">
                S/ {auction.initialBidSimulated}.00
              </span>
            </div>
            <div className="rounded-2xl border border-line bg-paper/60 p-4">
              <span className="block text-[11px] font-semibold text-sage-500 uppercase">
                Actividad de pujas
              </span>
              <span className="font-display text-xl font-bold text-ink tabular-nums mt-0.5 block flex items-center gap-1.5">
                <TrendingUp size={18} className="text-amber-600" />
                {auction.bidsCount} registradas
              </span>
            </div>
          </div>

          {/* Historial de pujas registradas */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-sage-500 mb-2.5 flex items-center justify-between">
              <span>Historial de Pujas Recientes</span>
              <span className="text-[11px] font-normal text-sage-400">Total: {auction.bidsHistory.length}</span>
            </h2>
            <div className="rounded-2xl border border-line bg-white overflow-hidden divide-y divide-line">
              {auction.bidsHistory.map((bid) => (
                <div key={bid.id} className="flex items-center justify-between p-3 text-xs hover:bg-paper/50 transition">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-800 text-[10px]">
                      {bid.bidderName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-ink leading-tight">
                        {bid.bidderName} {bid.isCurrentUser && <span className="text-jade-700 font-bold">(Tú)</span>}
                      </p>
                      <p className="text-[10px] text-sage-400">{bid.bidderZone}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-display text-sm font-bold text-ink tabular-nums block">
                      S/ {bid.amount}.00
                    </span>
                    <span className="text-[10px] text-sage-400">{bid.timeAgo}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vendedor, Punto Seguro y Política Anti-Dinero */}
          <div className="space-y-3 rounded-2xl border border-line bg-paper/70 p-4 text-xs">
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-jade-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-ink">
                  Vendedor verificado: {auction.seller} (Confianza {auction.trustScore}★)
                </p>
                <p className="text-sage-500 text-[11px] mt-0.5">
                  Entrega física en: <strong>{auction.safePointRecommended}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Lock size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-ink">Aviso de Moneda Ficticia Simulada</p>
                <p className="text-sage-600 text-[11px] mt-0.5">
                  En Truekly las subastas son 100% simuladas y didácticas. Los montos en Soles (S/) no representan dinero real ni cargos bancarios.
                </p>
              </div>
            </div>
          </div>

          {/* Botones al pie */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-full border border-line bg-white px-5 py-2.5 text-xs font-semibold text-ink hover:bg-paper transition cursor-pointer"
            >
              Volver al catálogo
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onBid(auction);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-ink shadow-sm hover:bg-amber-600 transition focus-visible:outline-2 focus-visible:outline-amber-500 cursor-pointer"
            >
              <Gavel size={16} />
              <span>Realizar puja simulada</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
