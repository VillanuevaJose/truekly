import { useState } from "react";
import {
  Gavel,
  Clock,
  ShieldCheck,
  Star,
  MapPin,
  Heart,
  TrendingUp,
  History,
} from "lucide-react";
import type { SimulatedAuction } from "../../data/mockAuctions";

type AuctionCardProps = {
  auction: SimulatedAuction;
  onBid: (auction: SimulatedAuction) => void;
  onViewDetails: (auction: SimulatedAuction) => void;
};

export function AuctionCard({ auction, onBid, onViewDetails }: AuctionCardProps) {
  const [imgError, setImgError] = useState(false);

  const isUrgent = auction.hoursRemaining <= 8;
  const isEndingSoon = auction.hoursRemaining <= 24;

  return (
    <article className="group flex flex-col justify-between rounded-3xl border border-line bg-white overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md">
      {/* 1. Imagen de portada con badges superpuestos */}
      <div className="relative aspect-[16/10] w-full bg-paper overflow-hidden">
        {auction.image && !imgError ? (
          <img
            src={auction.image}
            alt={auction.title}
            onError={() => setImgError(true)}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-103"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-amber-50 text-amber-700 font-display font-bold text-2xl">
            {auction.title.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

        {/* Badges superiores sobre imagen */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          {auction.isBenefic ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-jade-600/95 text-white backdrop-blur-md px-2.5 py-1 text-[11px] font-bold shadow-xs">
              <Heart size={12} className="fill-white" />
              <span>Causa Benéfica</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-ink px-2.5 py-1 text-[11px] font-bold shadow-xs">
              <Gavel size={12} />
              <span>Subasta Singular</span>
            </span>
          )}

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
              isUrgent
                ? "bg-rose-500 text-white"
                : isEndingSoon
                ? "bg-amber-500 text-ink"
                : "bg-black/60 text-white"
            }`}
          >
            <Clock size={11} />
            <span>{auction.hoursRemaining}h restantes</span>
          </span>
        </div>

        {/* Badges inferiores sobre la imagen */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs pointer-events-none">
          <span className="rounded-full bg-white/90 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
            {auction.category}
          </span>
          <span className="text-[11px] font-medium text-white/90 drop-shadow-sm flex items-center gap-1">
            <TrendingUp size={12} className="text-amber-300" />
            {auction.bidsCount} pujas realizadas
          </span>
        </div>
      </div>

      {/* 2. Cuerpo con título y vendedor de alta confianza */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-sage-500 mb-1.5">
            <span className="flex items-center gap-1 truncate text-[11px]">
              <MapPin size={12} className="text-amber-600 shrink-0" />
              <span className="truncate">{auction.zone}</span>
            </span>
            <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-medium text-ink-soft border border-line shrink-0">
              {auction.condition}
            </span>
          </div>

          <h3 className="font-display text-base font-bold text-ink leading-snug group-hover:text-amber-700 transition-colors line-clamp-2">
            {auction.title}
          </h3>

          {/* Vendedor y reputación */}
          <div className="mt-2.5 flex items-center gap-2">
            <div className="h-7 w-7 rounded-full overflow-hidden bg-amber-100 border border-amber-200 shrink-0">
              {auction.sellerAvatar ? (
                <img src={auction.sellerAvatar} alt={auction.seller} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-amber-800">
                  {auction.seller.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <p className="font-medium text-ink truncate leading-tight flex items-center gap-1">
                <span>{auction.seller}</span>
                <ShieldCheck size={12} className="text-jade-600 shrink-0" />
                <span className="text-amber-700 font-bold flex items-center gap-0.5 text-[11px]">
                  <Star size={10} className="fill-amber-500 text-amber-500" />
                  {auction.trustScore}
                </span>
              </p>
              {auction.sellerRole && (
                <p className="text-[10px] text-sage-500 truncate leading-none mt-0.5">
                  {auction.sellerRole}
                </p>
              )}
            </div>
          </div>

          {/* Causa benéfica asociada */}
          {auction.isBenefic && auction.beneficEntity && (
            <div className="mt-3 rounded-xl border border-jade-200 bg-jade-50/70 px-3 py-1.5 text-xs text-jade-800 flex items-center gap-1.5">
              <Heart size={13} className="text-jade-600 shrink-0 fill-jade-600" />
              <span className="text-[11px] font-semibold truncate leading-tight">
                {auction.beneficEntity}
              </span>
            </div>
          )}

          {/* 3. Recuadro de Transparencia de Puja Simulada */}
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-50/50 p-3.5">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="block text-[11px] font-semibold text-sage-600 uppercase tracking-wider">
                  Puja actual (Simulada)
                </span>
                <span className="font-display text-2xl font-bold text-ink tabular-nums">
                  S/ {auction.currentBidSimulated}.00
                </span>
              </div>
              <div className="text-right text-xs">
                <span className="block text-[11px] text-sage-500">
                  Base: S/ {auction.initialBidSimulated}
                </span>
                <span className="text-[11px] font-semibold text-amber-700">
                  +{auction.minIncrement} mín.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Botones de acción */}
        <div className="mt-5 pt-3 border-t border-line flex items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={() => onViewDetails(auction)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-line bg-white py-2 text-xs font-semibold text-ink hover:bg-paper hover:border-amber-500 transition focus-visible:outline-2 focus-visible:outline-amber-500 cursor-pointer"
          >
            <History size={13} className="text-sage-500" />
            <span>Detalles</span>
          </button>

          <button
            type="button"
            onClick={() => onBid(auction)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-500 py-2 text-xs font-bold text-ink hover:bg-amber-600 shadow-xs transition focus-visible:outline-2 focus-visible:outline-amber-500 cursor-pointer"
          >
            <Gavel size={14} />
            <span>Pujar ahora</span>
          </button>
        </div>
      </div>
    </article>
  );
}
