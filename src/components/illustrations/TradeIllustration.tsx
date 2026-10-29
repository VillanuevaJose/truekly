interface TradeIllustrationProps {
  className?: string;
  variant?: "light" | "dark";
}

export function TradeIllustration({ className = "", variant = "light" }: TradeIllustrationProps) {
  const isDark = variant === "dark";

  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Ilustración de intercambio presencial seguro"
    >
      {/* Fondo: en modo light tiene rect #EAF3F0; en modo dark es transparente sin marco */}
      {!isDark && <rect width="320" height="200" fill="#EAF3F0" />}

      {/* Círculo suave de fondo como halo verde armónico */}
      <circle
        cx="160"
        cy="100"
        r="80"
        fill={isDark ? "#1E8E77" : "#CFE4DC"}
        fillOpacity={isDark ? "0.35" : "0.45"}
      />

      {/* Monigote Izquierdo */}
      <g transform="translate(48, 56)">
        {/* Cabeza */}
        <circle cx="26" cy="18" r="14" fill={isDark ? "#FFFFFF" : "#0B584D"} />

        {/* Torso */}
        <path
          d="M6 70 C6 46 16 40 26 40 C36 40 46 46 46 70 Z"
          fill={isDark ? "#FFFFFF" : "#0B584D"}
        />

        {/* Brazo extendido hacia el centro ofreciendo un paquete */}
        <path
          d="M26 48 L58 54"
          stroke={isDark ? "#FFFFFF" : "#0B584D"}
          strokeWidth="5.5"
          strokeLinecap="round"
        />

        {/* Caja/Paquete que entrega */}
        <rect
          x="56"
          y="42"
          width="24"
          height="22"
          rx="4"
          fill={isDark ? "#CFE4DC" : "#0F6D5F"}
        />
        <path
          d="M68 42 V64 M56 53 H80"
          stroke={isDark ? "#0B584D" : "#CFE4DC"}
          strokeWidth="1.75"
        />
      </g>

      {/* Monigote Derecho */}
      <g transform="translate(220, 56)">
        {/* Cabeza */}
        <circle cx="26" cy="18" r="14" fill={isDark ? "#CFE4DC" : "#0F6D5F"} />

        {/* Torso */}
        <path
          d="M6 70 C6 46 16 40 26 40 C36 40 46 46 46 70 Z"
          fill={isDark ? "#CFE4DC" : "#0F6D5F"}
        />

        {/* Brazo extendido hacia el centro ofreciendo un paquete */}
        <path
          d="M26 48 L-6 54"
          stroke={isDark ? "#CFE4DC" : "#0F6D5F"}
          strokeWidth="5.5"
          strokeLinecap="round"
        />

        {/* Caja/Paquete que entrega (naranja de acento) */}
        <rect
          x="-28"
          y="42"
          width="24"
          height="22"
          rx="4"
          fill="#E8A33D"
        />
        <path
          d="M-16 42 V64 M-28 53 H-4"
          stroke="#FFFFFF"
          strokeWidth="1.75"
        />
      </g>

      {/* Flechas de intercambio curvadas y dinámicas entre ambos */}
      <g transform="translate(136, 126)">
        {/* Flecha superior (hacia la derecha) */}
        <path
          d="M6 12 Q24 4 42 12"
          stroke={isDark ? "#FFFFFF" : "#0F6D5F"}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M38 7 L44 12 L38 17"
          stroke={isDark ? "#FFFFFF" : "#0F6D5F"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Flecha inferior (hacia la izquierda) */}
        <path
          d="M42 24 Q24 32 6 24"
          stroke="#E8A33D"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M10 29 L4 24 L10 19"
          stroke="#E8A33D"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Pin / Escudo de Punto Seguro en la parte superior central (completo y visible) */}
      <g transform="translate(142, 22)">
        {/* Escudo protector */}
        <path
          d="M18 4 L33 9 V20 C33 29 26 37 18 41 C10 37 3 29 3 20 V9 L18 4 Z"
          fill="#FFFFFF"
          stroke="#0B584D"
          strokeWidth="2.5"
        />
        {/* Check mark dentro del escudo */}
        <path
          d="M11 21 L16 26 L25 15"
          stroke="#E8A33D"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}