import React from 'react';
import { MapPin, ArrowRightLeft, CheckCircle2, Star } from 'lucide-react';
import type { TradeItem } from '../../types/trade';

interface TradeCardProps {
  item: TradeItem;
  onSelectForTrade: (item: TradeItem) => void;
}

export const TradeCard: React.FC<TradeCardProps> = ({ item, onSelectForTrade }) => {
  return (
    <article className="card-craft rounded-lg overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Imagen del artículo con aspect ratio 16:10 consistente */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#EFEBE1]">
          <img
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 bg-[#FAF8F4]/90 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-semibold text-[#1C1A17] border border-[#E5DFD3]">
            {item.condition}
          </div>
          <div className="absolute bottom-3 right-3 bg-[#1C1A17]/85 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-medium text-white">
            Ref: S/ {item.estimatedValuePEN.toLocaleString('es-PE')}
          </div>
        </div>

        {/* Cuerpo de la publicación */}
        <div className="p-5">
          {/* Ubicación y tiempo */}
          <div className="flex items-center justify-between text-xs text-[#645E56] mb-2">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#C2410C]" />
              {item.location}
            </span>
            <span>{item.createdAt}</span>
          </div>

          {/* Titular del artículo */}
          <h3 className="font-serif-editorial text-xl font-medium text-[#1C1A17] leading-snug line-clamp-2 mb-3 group-hover:text-[#C2410C] transition-colors">
            {item.title}
          </h3>

          <p className="text-xs text-[#645E56] line-clamp-2 mb-4 leading-relaxed">
            {item.description}
          </p>

          {/* Bloque distintivo de Trueque: Qué busca a cambio */}
          <div className="p-3 rounded-md bg-[#FFF7ED] border border-[#FDBA74]/40 mb-4">
            <div className="flex items-start gap-2">
              <ArrowRightLeft className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A3412] block">
                  Busca a cambio:
                </span>
                <p className="text-xs text-[#1C1A17] font-medium mt-0.5 leading-tight">
                  {item.seeking}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer de la tarjeta: Perfil de usuario y CTA */}
      <div className="px-5 pb-5 pt-2 border-t border-[#EFEBE1] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={item.owner.avatar}
            alt={`Avatar de ${item.owner.name}`}
            className="w-8 h-8 rounded-full object-cover border border-[#E5DFD3] shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-[#1C1A17] truncate">
                {item.owner.name}
              </span>
              {item.owner.verified && (
                <span title="Identidad Verificada">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1E4E38] shrink-0" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#645E56]">
              <span className="inline-flex items-center text-amber-600 font-medium">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5" />
                {item.owner.reputation}
              </span>
              <span>·</span>
              <span>{item.owner.tradesCompleted} trueques</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelectForTrade(item)}
          className="shrink-0 px-3 py-1.5 rounded-md bg-[#1C1A17] text-white text-xs font-medium hover:bg-[#C2410C] active:scale-[0.98] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C]"
        >
          Proponer Trueque
        </button>
      </div>
    </article>
  );
};
