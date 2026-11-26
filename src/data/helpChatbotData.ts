export type HelpCategoryId = "seguridad" | "publicar" | "trueque" | "cuenta";

export interface HelpCategory {
  id: HelpCategoryId;
  label: string;
}

export interface HelpFaqItem {
  id: string;
  category: HelpCategoryId;
  question: string;
  answer: string;
  steps?: string[];
  keywords: string[];
}

export const HELP_CATEGORIES: HelpCategory[] = [
  { id: "seguridad", label: "Seguridad" },
  { id: "publicar", label: "Publicar" },
  { id: "trueque", label: "Trueques" },
  { id: "cuenta", label: "Cuenta" },
];

export const HELP_FAQ_ITEMS: HelpFaqItem[] = [
  {
    id: "seg-estafas",
    category: "seguridad",
    question: "¿Cómo evito estafas o riesgos en un trueque?",
    answer:
      "Nunca envíes artículos por adelantado ni salgas del chat interno para cerrar acuerdos.",
    steps: [
      "Verifica que la otra persona tenga insignia de identidad verificada.",
      "Coordina todo dentro del chat de Truekly para dejar registro.",
      "Revisa el objeto en persona antes de entregar el tuyo.",
    ],
    keywords: ["estafa", "riesgo", "seguro", "confianza", "engaño", "cuidado", "fraude"],
  },
  {
    id: "seg-puntos",
    category: "seguridad",
    question: "¿Qué son los Puntos Seguros y cómo elegir uno?",
    answer:
      "Son lugares públicos, iluminados y con vigilancia en Chimbote y Nuevo Chimbote (ej. MegaPlaza, Real Plaza o Plaza de Armas).",
    steps: [
      "Elige horarios de día.",
      "Evita domicilios privados o calles desoladas.",
      "Si puedes, ve acompañado por un familiar o amigo.",
    ],
    keywords: ["punto seguro", "lugar", "encuentro", "megaplaza", "real plaza", "plaza", "donde"],
  },
  {
    id: "seg-no-llega",
    category: "seguridad",
    question: "¿Qué hago si la otra persona no llega o cancela a último momento?",
    answer:
      "No esperes en zonas aisladas. Retírate a un lugar concurrido y cancela el acuerdo desde el chat.",
    steps: [
      "Abre el chat del trueque y pulsa Cancelar propuesta para liberar tu artículo.",
      "Si notaste actitud sospechosa, no insistas en reagendar.",
    ],
    keywords: ["no llega", "planto", "cancelo", "tarde", "esperar", "ausente"],
  },
  {
    id: "seg-danado",
    category: "seguridad",
    question: "¿Qué hago si en persona el objeto no coincide o está dañado?",
    answer:
      "Tienes todo el derecho de no aceptar el intercambio si el objeto no está como se prometió.",
    steps: [
      "No entregues tu artículo ni pulses Confirmar entrega.",
      "Explica con calma que no coincide con lo acordado y cancela en el chat.",
    ],
    keywords: ["dañado", "malo", "roto", "no coincide", "diferente", "falso", "fotos"],
  },
  {
    id: "seg-privacidad",
    category: "seguridad",
    question: "¿Son públicos mi DNI, selfie o correo completo?",
    answer:
      "No. Tu DNI y selfie solo se usan para validar tu identidad y mayoría de edad; tus datos sensibles se muestran censurados en la plataforma.",
    keywords: ["dni", "selfie", "datos", "privacidad", "correo", "publico", "identidad"],
  },
  {
    id: "pub-como",
    category: "publicar",
    question: "¿Cómo publico un artículo?",
    answer:
      "Desde el feed, pulsa el botón naranja (+) en la barra superior y completa los 3 pasos.",
    steps: [
      "Sube al menos 3 fotos reales y un título claro.",
      "Describe el estado real del objeto (sin ocultar fallas).",
      "Indica qué buscas a cambio, tu zona y un Punto Seguro.",
    ],
    keywords: ["publicar", "subir", "vender", "ofrecer", "fotos", "anuncio", "crear"],
  },
  {
    id: "pub-revision",
    category: "publicar",
    question: "Publiqué algo y no aparece en el feed, ¿por qué?",
    answer:
      "Toda publicación pasa por una revisión rápida del administrador para mantener segura la comunidad.",
    steps: [
      "Puedes ver su estado en Mi perfil > Mis publicaciones (En revisión).",
      "Cuando sea aprobada, aparecerá automáticamente en el feed y recibirás una notificación.",
    ],
    keywords: ["no aparece", "revision", "pendiente", "espera", "admin", "aprobar", "demora"],
  },
  {
    id: "pub-rechazada",
    category: "publicar",
    question: "¿Qué pasa si rechazan mi publicación?",
    answer:
      "Recibirás un aviso en la campana de notificaciones indicando el motivo y el estado cambiará a Rechazada en tu perfil.",
    steps: [
      "Revisa el motivo en la campana o en Mi perfil > Mis publicaciones.",
      "Corrige las fotos o descripción y vuelve a enviarla.",
    ],
    keywords: ["rechazada", "rechazo", "motivo", "borraron", "denegada"],
  },
  {
    id: "tru-proponer",
    category: "trueque",
    question: "¿Cómo propongo un trueque si algo me interesa?",
    answer:
      "Entra al artículo que te interesa y abre el chat directo para conversar con el anunciante.",
    steps: [
      "Envía un mensaje claro indicando qué objeto ofreces a cambio.",
      "Puedes adjuntar fotos de tu artículo directamente en el chat.",
    ],
    keywords: ["proponer", "intercambio", "trueque", "chat", "hablar", "interesa", "oferta"],
  },
  {
    id: "tru-pacto",
    category: "trueque",
    question: "¿Por qué no me sale el botón para enviar la propuesta formal?",
    answer:
      "Solo la persona dueña de la publicación puede enviar la propuesta formal del pacto para evitar acuerdos confusos.",
    steps: [
      "Si eres quien está interesado, conversa primero por el chat.",
      "Cuando el dueño envíe la propuesta formal, te aparecerán los botones Aceptar Pacto o Rechazar.",
    ],
    keywords: ["boton", "propuesta formal", "pacto", "aceptar", "dueño", "no sale"],
  },
  {
    id: "tru-entrega",
    category: "trueque",
    question: "Ya aceptamos el pacto, ¿qué sigue?",
    answer:
      "Acuerden día y hora en el Punto Seguro. Al tener el objeto en mano, ambos confirman la entrega en el chat.",
    steps: [
      "Revisa el artículo en persona antes de confirmar.",
      "Pulsa Confirmar entrega (1/2) y espera la confirmación de la otra parte (2/2).",
    ],
    keywords: ["entrega", "pacto aceptado", "confirmar", "2/2", "presencial", "finalizar"],
  },
  {
    id: "cta-avisos",
    category: "cuenta",
    question: "¿Dónde veo mis avisos y chats?",
    answer:
      "En la barra superior del feed tienes el ícono de mensajes (negociaciones de trueque) y la campana (aprobaciones o rechazos de tus publicaciones).",
    keywords: ["notificaciones", "campana", "mensajes", "avisos", "chats", "donde veo"],
  },
  {
    id: "cta-secciones",
    category: "cuenta",
    question: "¿Se cobra dinero real en Subastas o Causas?",
    answer:
      "No. Truekly no procesa pagos ni cobra comisiones: las Subastas usan montos simbólicos didácticos y las Causas Sociales son donaciones directas de objetos.",
    keywords: ["dinero", "pago", "subasta", "causa", "ong", "gratis", "cobro", "soles"],
  },
];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function findBestFaqMatches(query: string): HelpFaqItem[] {
  const clean = normalizeText(query).trim();
  if (!clean) return [];

  const tokens = clean.split(/\s+/).filter((t) => t.length >= 3);
  const scored = HELP_FAQ_ITEMS.map((item) => {
    let score = 0;
    const qNorm = normalizeText(item.question);
    const aNorm = normalizeText(item.answer);

    for (const kw of item.keywords) {
      const kwNorm = normalizeText(kw);
      if (clean.includes(kwNorm)) score += 4;
      else if (tokens.some((t) => kwNorm.includes(t))) score += 2;
    }
    for (const t of tokens) {
      if (qNorm.includes(t)) score += 2;
      if (aNorm.includes(t)) score += 1;
    }
    return { item, score };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((s) => s.item);
}
