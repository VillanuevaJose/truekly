import { useState } from "react";
import { Users, MapPin, Check, MessageSquare } from "lucide-react";
import type { Community } from "../../data/mockProducts";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "C";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

type CommunityCardProps = {
  community: Community;
  isJoined?: boolean;
  onToggleJoin?: () => void;
  onOpenChat?: () => void;
};

export function CommunityCard({
  community,
  isJoined: controlledJoined,
  onToggleJoin,
  onOpenChat,
}: CommunityCardProps) {
  const [imgError, setImgError] = useState(false);
  const [localJoined, setLocalJoined] = useState(false);

  const isJoined = controlledJoined !== undefined ? controlledJoined : localJoined;
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleJoin) {
      onToggleJoin();
    } else {
      setLocalJoined((prev) => !prev);
    }
  };

  const initials = getInitials(community.name);
  const showImage = Boolean(community.image && !imgError);

  return (
    <article
      onClick={onOpenChat}
      className="flex flex-col justify-between rounded-2xl border border-line bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-jade-400 hover:shadow-md cursor-pointer group"
    >
      {/* Cuerpo superior: Avatar a la izquierda, detalles a la derecha */}
      <div className="flex items-start gap-4">
        {/* Avatar cuadrado con esquinas redondeadas 64x64px */}
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-jade-100 flex items-center justify-center border border-jade-100 shadow-xs group-hover:scale-102 transition-transform">
          {showImage ? (
            <img
              src={community.image}
              alt={community.name}
              onError={() => setImgError(true)}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              className="font-display text-lg font-bold text-jade-700 tracking-wider select-none"
              aria-hidden="true"
            >
              {initials}
            </span>
          )}
        </div>

        {/* Detalles: Categoría, Nombre, Descripción (line-clamp-2) y Chip de miembros */}
        <div className="flex-1 min-w-0">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-jade-600 truncate">
            {community.category}
          </span>
          <h3 className="mt-0.5 font-display text-base font-bold text-ink leading-snug truncate group-hover:text-jade-700 transition-colors">
            {community.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-soft">
            {community.description}
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-jade-50 px-2.5 py-0.5 text-[11px] font-semibold text-jade-700">
              <Users size={12} className="shrink-0" />
              <span>{community.membersCount + (isJoined ? 1 : 0)} miembros</span>
            </span>

            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sage-500 group-hover:text-jade-600 transition-colors">
              <MessageSquare size={12} />
              <span>Ver chat</span>
            </span>
          </div>
        </div>
      </div>

      {/* Pie de la tarjeta: Ubicación a la izquierda, botón de acción a la derecha */}
      <div className="mt-5 flex items-center justify-between border-t border-line pt-3.5 text-xs">
        <span className="flex items-center gap-1.5 text-sage-500 truncate max-w-[55%]">
          <MapPin size={13} className="shrink-0 text-jade-500" />
          <span className="truncate">{community.zone}</span>
        </span>

        <button
          type="button"
          onClick={handleToggle}
          className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-500 ${
            isJoined
              ? "border border-jade-600/40 bg-jade-50 text-jade-700 hover:bg-jade-100"
              : "bg-jade-500 text-paper hover:bg-jade-600 shadow-xs"
          }`}
        >
          {isJoined ? "Ya eres miembro" : "Unirme"}
        </button>
      </div>
    </article>
  );
}
