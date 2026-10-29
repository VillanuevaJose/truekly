
export function ChatIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Ilustración de conversación y acuerdo por chat"
    >
      {/* Fondo suave en tono jade de la paleta */}
      <rect width="320" height="200" fill="#EAF3F0" />

      {/* Círculo suave de fondo */}
      <circle cx="160" cy="100" r="76" fill="#CFE4DC" fillOpacity="0.45" />

      {/* Monigote Izquierdo */}
      <g transform="translate(48, 48)">
        {/* Cabeza */}
        <circle cx="28" cy="20" r="14" fill="#0B584D" />

        {/* Torso */}
        <path
          d="M8 72 C8 48 18 42 28 42 C38 42 48 48 48 72 Z"
          fill="#0B584D"
        />

        {/* Brazo sosteniendo el teléfono */}
        <path
          d="M16 50 Q30 58 46 54"
          stroke="#0B584D"
          strokeWidth="5.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Pequeño celular */}
        <rect
          x="44"
          y="42"
          width="16"
          height="26"
          rx="3"
          fill="#FFFFFF"
          stroke="#0B584D"
          strokeWidth="2"
        />
      </g>

      {/* Monigote Derecho */}
      <g transform="translate(216, 48)">
        {/* Cabeza */}
        <circle cx="28" cy="20" r="14" fill="#0F6D5F" />

        {/* Torso */}
        <path
          d="M8 72 C8 48 18 42 28 42 C38 42 48 48 48 72 Z"
          fill="#0F6D5F"
        />

        {/* Brazo con teléfono */}
        <path
          d="M40 50 Q26 58 10 54"
          stroke="#0F6D5F"
          strokeWidth="5.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Pequeño celular */}
        <rect
          x="-4"
          y="42"
          width="16"
          height="26"
          rx="3"
          fill="#FFFFFF"
          stroke="#0F6D5F"
          strokeWidth="2"
        />
      </g>

      {/* Burbujas de conversación centrales con micro-animaciones */}
      {/* Burbuja 1: Verde oscuro (Monigote izquierdo pregunta/propone) */}
      <g transform="translate(108, 38)" className="animate-micro-pulse">
        <rect
          x="0"
          y="0"
          width="74"
          height="32"
          rx="12"
          fill="#0B584D"
        />
        {/* Cola de burbuja hacia la izquierda */}
        <path
          d="M6 30 L-2 36 L12 32 Z"
          fill="#0B584D"
        />
        {/* Puntos de conversación en el interior */}
        <circle cx="24" cy="16" r="3" fill="#EAF3F0" />
        <circle cx="37" cy="16" r="3" fill="#EAF3F0" />
        <circle cx="50" cy="16" r="3" fill="#EAF3F0" />
      </g>

      {/* Burbuja 2: Naranja de marca (Monigote derecho responde/acepta) */}
      <g transform="translate(138, 80)" className="animate-micro-pulse" style={{ animationDelay: "-1.75s" }}>
        <rect
          x="0"
          y="0"
          width="74"
          height="32"
          rx="12"
          fill="#E8A33D"
        />
        {/* Cola de burbuja hacia la derecha */}
        <path
          d="M68 30 L76 36 L62 32 Z"
          fill="#E8A33D"
        />
        {/* Check mark o líneas de acuerdo en interior */}
        <path
          d="M26 16 L33 22 L48 11"
          stroke="#FFFFFF"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Mini indicador de estado 'En línea / seguro' */}
      <g className="animate-micro-pulse" style={{ animationDelay: "-0.8s" }}>
        <circle cx="160" cy="138" r="4.5" fill="#1E8E77" />
        <circle cx="160" cy="138" r="8" stroke="#1E8E77" strokeWidth="1.5" strokeOpacity="0.4" />
      </g>
    </svg>
  );
}
