
export function PublishIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Ilustración de publicar un producto"
    >
      {/* Fondo suave en tono jade de la paleta */}
      <rect width="320" height="200" fill="#EAF3F0" />

      {/* Círculo suave de fondo decorativo */}
      <circle cx="160" cy="100" r="76" fill="#CFE4DC" fillOpacity="0.45" />

      {/* Monigote minimalista (silueta de persona) */}
      <g transform="translate(74, 34)">
        {/* Cabeza */}
        <circle cx="34" cy="22" r="15" fill="#0B584D" />

        {/* Torso */}
        <path
          d="M12 78 C12 52 22 45 34 45 C46 45 56 52 56 78 Z"
          fill="#0B584D"
        />

        {/* Brazo izquierdo que sostiene el celular */}
        <path
          d="M20 54 Q36 68 54 62"
          stroke="#0B584D"
          strokeWidth="6.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Brazo derecho que toca o apunta a la pantalla */}
        <path
          d="M48 54 Q64 62 70 52"
          stroke="#0B584D"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Dispositivo móvil / Pantalla flotante */}
      <g transform="translate(142, 28)">
        {/* Cuerpo del smartphone */}
        <rect
          x="0"
          y="0"
          width="92"
          height="144"
          rx="14"
          fill="#FFFFFF"
          stroke="#0B584D"
          strokeWidth="3"
        />
        {/* Speaker / Notch */}
        <rect x="36" y="7" width="20" height="3" rx="1.5" fill="#CFE4DC" />

        {/* Barra superior de app */}
        <rect x="10" y="16" width="38" height="6" rx="3" fill="#0F6D5F" fillOpacity="0.3" />

        {/* Tarjeta del producto */}
        <rect
          x="10"
          y="28"
          width="72"
          height="70"
          rx="8"
          fill="#F7F8F6"
          stroke="#E4E7E3"
          strokeWidth="1.5"
        />

        {/* Mini foto del producto dentro de la tarjeta */}
        <rect x="16" y="34" width="60" height="36" rx="5" fill="#CFE4DC" fillOpacity="0.7" />
        {/* Silueta de objeto en la mini foto */}
        <path
          d="M36 58 L46 46 L58 58 Z"
          fill="#0F6D5F"
          fillOpacity="0.5"
        />
        <circle cx="34" cy="42" r="3.5" fill="#E8A33D" />

        {/* Líneas de título y precio del producto */}
        <rect x="16" y="76" width="34" height="4" rx="2" fill="#16201C" fillOpacity="0.6" />
        <rect x="16" y="84" width="22" height="4" rx="2" fill="#E8A33D" />

        {/* Botón principal de Publicar con ícono '+' en acento naranja */}
        <rect
          x="10"
          y="108"
          width="72"
          height="22"
          rx="11"
          fill="#E8A33D"
        />
        {/* Ícono '+' dentro del botón */}
        <path
          d="M46 114 V124 M41 119 H51"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>

      {/* Pequeño destello o badge de novedad con micro-pulso */}
      <g className="animate-micro-pulse">
        <circle cx="236" cy="38" r="7" fill="#E8A33D" />
        <path
          d="M236 34 V42 M232 38 H240"
          stroke="#FFFFFF"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
