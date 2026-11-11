export type AuctionCategory =
  | "Fotografía & Óptica"
  | "Astronomía & Ciencia"
  | "Instrumentos & Sonido"
  | "Gaming & Consolas"
  | "Herramientas de Taller"
  | "Tecnología & Video"
  | "Movilidad Urbana";

export type SimulatedBid = {
  id: string;
  bidderName: string;
  bidderZone: string;
  amount: number;
  timeAgo: string;
  isCurrentUser?: boolean;
};

export type SimulatedAuction = {
  id: string;
  title: string;
  category: AuctionCategory;
  image: string;
  gallery?: string[];
  zone: string;
  seller: string;
  sellerAvatar?: string;
  sellerRole?: string;
  trustScore: number;
  initialBidSimulated: number;
  currentBidSimulated: number;
  bidsCount: number;
  hoursRemaining: number;
  minIncrement: number;
  isBenefic: boolean;
  beneficEntity?: string;
  description: string;
  condition: "Nuevo" | "Como nuevo" | "Buen estado" | "Colección";
  safePointRecommended: string;
  bidsHistory: SimulatedBid[];
};

export const mockSimulatedAuctions: SimulatedAuction[] = [
  {
    id: "auc-1",
    title: "Cámara Réflex Canon EOS T6 + 2 Lentes",
    category: "Fotografía & Óptica",
    image: "/products/camara-canon.jpg",
    gallery: [
      "/products/camara-canon.jpg",
      "/products/sets/camara-1.jpg",
      "/products/sets/camara-2.jpg",
    ],
    zone: "Casco Urbano, Chimbote",
    seller: "Marcos L.",
    sellerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    sellerRole: "Docente de Fotografía",
    trustScore: 4.95,
    initialBidSimulated: 250,
    currentBidSimulated: 380,
    bidsCount: 9,
    hoursRemaining: 18,
    minIncrement: 20,
    isBenefic: true,
    beneficEntity: "50% destinado al Comedor Popular San Pedrito",
    description: "Cuerpo Canon T6 con sensor APS-C de 18MP, incluye parasoles originales, cargador dual, batería original y estuche antigolpes Lowepro. Ideal para estudiantes de artes visuales o periodismo comunitario.",
    condition: "Como nuevo",
    safePointRecommended: "Punto Seguro MegaPlaza Chimbote",
    bidsHistory: [
      { id: "b1", bidderName: "Carlos M.", bidderZone: "Casco Urbano", amount: 380, timeAgo: "Hace 15 min" },
      { id: "b2", bidderName: "Diana S.", bidderZone: "Nuevo Chimbote", amount: 360, timeAgo: "Hace 2 horas" },
      { id: "b3", bidderName: "Alonso V.", bidderZone: "Bellamar", amount: 340, timeAgo: "Hace 5 horas" },
      { id: "b4", bidderName: "Renzo V.", bidderZone: "Miraflores", amount: 300, timeAgo: "Ayer" },
      { id: "b5", bidderName: "Elena Q.", bidderZone: "27 de Octubre", amount: 250, timeAgo: "Hace 2 días" },
    ],
  },
  {
    id: "auc-2",
    title: "Telescopio Astronómico Celestrón 70mm",
    category: "Astronomía & Ciencia",
    image: "/products/telescopio.jpg",
    gallery: [
      "/products/telescopio.jpg",
      "/products/tripode.jpg",
    ],
    zone: "Nuevo Chimbote",
    seller: "Patricia B.",
    sellerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
    sellerRole: "Divulgadora Científica",
    trustScore: 4.88,
    initialBidSimulated: 180,
    currentBidSimulated: 240,
    bidsCount: 6,
    hoursRemaining: 32,
    minIncrement: 15,
    isBenefic: true,
    beneficEntity: "100% destinado a la Biblioteca Popular Bellamar",
    description: "Refractor acromático de 70mm con trípode de aluminio regulable. Incluye oculares intercambiables y buscador de punto rojo para observación nítida de la Luna y planetas.",
    condition: "Como nuevo",
    safePointRecommended: "Punto Seguro Plaza Mayor de Nuevo Chimbote",
    bidsHistory: [
      { id: "b20", bidderName: "Jorge B.", bidderZone: "Buenos Aires", amount: 240, timeAgo: "Hace 40 min" },
      { id: "b21", bidderName: "Elena Q.", bidderZone: "27 de Octubre", amount: 220, timeAgo: "Hace 3 horas" },
      { id: "b22", bidderName: "Miguel T.", bidderZone: "Miraflores", amount: 200, timeAgo: "Hace 8 horas" },
      { id: "b23", bidderName: "Alonso V.", bidderZone: "Bellamar", amount: 180, timeAgo: "Hace 1 día" },
    ],
  },
  {
    id: "auc-3",
    title: "Amplificador de Guitarra Fender Frontman 15G",
    category: "Instrumentos & Sonido",
    image: "/products/amplificador.jpg",
    gallery: [
      "/products/amplificador.jpg",
    ],
    zone: "Buenos Aires, Chimbote",
    seller: "Rodrigo P.",
    sellerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    sellerRole: "Músico & Luthier Aficionado",
    trustScore: 4.92,
    initialBidSimulated: 160,
    currentBidSimulated: 230,
    bidsCount: 11,
    hoursRemaining: 8,
    minIncrement: 15,
    isBenefic: true,
    beneficEntity: "40% donado a Sonrisas del Santa (Pediatría)",
    description: "15W de potencia real con altavoz especial de 8 pulgadas. Canal limpio cristalino y canal drive para distorsión clásica Fender. Entrada auxiliar para pistas y salida de auriculares.",
    condition: "Buen estado",
    safePointRecommended: "Punto Seguro Malecón Grau Chimbote",
    bidsHistory: [
      { id: "b31", bidderName: "Renzo V.", bidderZone: "Miraflores", amount: 230, timeAgo: "Hace 10 min" },
      { id: "b32", bidderName: "Carlos M.", bidderZone: "Casco Urbano", amount: 210, timeAgo: "Hace 45 min" },
      { id: "b33", bidderName: "Diana S.", bidderZone: "Nuevo Chimbote", amount: 190, timeAgo: "Hace 3 horas" },
    ],
  },
  {
    id: "auc-4",
    title: "Microscopio Biológico Monocular para Laboratorio Escolar",
    category: "Astronomía & Ciencia",
    image: "/products/microscopio.jpg",
    gallery: [
      "/products/microscopio.jpg",
    ],
    zone: "Casco Urbano / La Caleta",
    seller: "Beatriz L.",
    sellerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
    sellerRole: "Docente de Ciencias Naturales",
    trustScore: 4.91,
    initialBidSimulated: 190,
    currentBidSimulated: 280,
    bidsCount: 8,
    hoursRemaining: 21,
    minIncrement: 20,
    isBenefic: true,
    beneficEntity: "50% destinado a Guardianes de la Bahía El Ferrol",
    description: "Cuerpo de metal pesado con aumentos de hasta 400x, iluminación eléctrica inferior y espejo orientable. Platina con pinzas de sujeción para muestras biológicas.",
    condition: "Buen estado",
    safePointRecommended: "Punto Seguro Mercado Central / Casco Urbano",
    bidsHistory: [
      { id: "b41", bidderName: "Jorge B.", bidderZone: "Buenos Aires", amount: 280, timeAgo: "Hace 1 hora" },
      { id: "b42", bidderName: "Alonso V.", bidderZone: "Bellamar", amount: 250, timeAgo: "Hace 5 horas" },
    ],
  },
  {
    id: "auc-5",
    title: "Combo Herramientas: Taladro Percutor + Amoladora Angular",
    category: "Herramientas de Taller",
    image: "/products/taladro-percutor.jpg",
    gallery: [
      "/products/taladro-percutor.jpg",
      "/products/amoladora.jpg",
    ],
    zone: "27 de Octubre, Chimbote",
    seller: "Manuel V.",
    sellerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    sellerRole: "Técnico en Soldadura y Construcción",
    trustScore: 4.89,
    initialBidSimulated: 210,
    currentBidSimulated: 320,
    bidsCount: 13,
    hoursRemaining: 6,
    minIncrement: 20,
    isBenefic: false,
    description: "Taladro percutor de velocidad variable y reversa con mandril metálico, más amoladora angular de 4 1/2 pulgadas con mango auxiliar y llave de ajuste. Funcionan al 100%.",
    condition: "Buen estado",
    safePointRecommended: "Punto Seguro Plaza Mayor San Pedro",
    bidsHistory: [
      { id: "b51", bidderName: "Carlos M.", bidderZone: "Casco Urbano", amount: 320, timeAgo: "Hace 15 min" },
      { id: "b52", bidderName: "Diana S.", bidderZone: "Nuevo Chimbote", amount: 300, timeAgo: "Hace 40 min" },
      { id: "b53", bidderName: "Miguel T.", bidderZone: "Miraflores", amount: 270, timeAgo: "Hace 2 horas" },
    ],
  },
  {
    id: "auc-6",
    title: "Consola PlayStation 4 Slim 1TB con 2 Mandos Inalámbricos",
    category: "Gaming & Consolas",
    image: "/products/ps4-consola.jpg",
    gallery: [
      "/products/ps4-consola.jpg",
    ],
    zone: "Nuevo Chimbote",
    seller: "Mateo R.",
    sellerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80",
    sellerRole: "Gamer & Entusiasta Tech",
    trustScore: 4.94,
    initialBidSimulated: 420,
    currentBidSimulated: 590,
    bidsCount: 16,
    hoursRemaining: 12,
    minIncrement: 30,
    isBenefic: true,
    beneficEntity: "50% donado a Huellitas Chimbote (Alimento)",
    description: "Consola PS4 Slim de 1TB en excelente estado térmico, poco uso. Viene con 2 mandos DualShock 4 originales sin drift, cable HDMI de alta velocidad y cables de alimentación.",
    condition: "Como nuevo",
    safePointRecommended: "Punto Seguro Plaza Mayor de Nuevo Chimbote",
    bidsHistory: [
      { id: "b61", bidderName: "Renzo V.", bidderZone: "Miraflores", amount: 590, timeAgo: "Hace 20 min" },
      { id: "b62", bidderName: "Jorge B.", bidderZone: "Buenos Aires", amount: 550, timeAgo: "Hace 1 hora" },
      { id: "b63", bidderName: "Alonso V.", bidderZone: "Bellamar", amount: 500, timeAgo: "Hace 4 horas" },
    ],
  },
  {
    id: "auc-7",
    title: "Scooter Eléctrico Plegable 250W con Freno Regenerativo y Luces LED",
    category: "Movilidad Urbana",
    image: "/products/scooter-electrico.jpg",
    gallery: [
      "/products/scooter-electrico.jpg",
      "/products/scooter-electrico-2.jpg",
    ],
    zone: "Buenos Aires, Chimbote",
    seller: "Franco A.",
    sellerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    sellerRole: "Ingeniero & Ciclista Urbano",
    trustScore: 4.93,
    initialBidSimulated: 340,
    currentBidSimulated: 490,
    bidsCount: 14,
    hoursRemaining: 15,
    minIncrement: 25,
    isBenefic: true,
    beneficEntity: "50% donado a Guardianes de la Bahía El Ferrol",
    description: "Scooter eléctrico plegable con motor de 250W, velocidad de hasta 25 km/h y autonomía real de 18-20 km. Incluye cargador rápido original, display digital con velocímetro, luz delantera LED y freno de disco trasero con pastillas nuevas.",
    condition: "Buen estado",
    safePointRecommended: "Punto Seguro Plaza Mayor de Nuevo Chimbote",
    bidsHistory: [
      { id: "b71", bidderName: "Alonso V.", bidderZone: "Bellamar", amount: 490, timeAgo: "Hace 25 min" },
      { id: "b72", bidderName: "Diana S.", bidderZone: "Nuevo Chimbote", amount: 465, timeAgo: "Hace 1 hora" },
      { id: "b73", bidderName: "Carlos M.", bidderZone: "Casco Urbano", amount: 420, timeAgo: "Hace 4 horas" },
    ],
  },
  {
    id: "auc-8",
    title: "Proyector Portátil Full HD con Parlante Integrado y HDMI",
    category: "Tecnología & Video",
    image: "/products/proyector.jpg",
    gallery: [
      "/products/proyector.jpg",
      "/products/tripode.jpg",
    ],
    zone: "Casco Urbano, Chimbote",
    seller: "Claudia R.",
    sellerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    sellerRole: "Coordinadora Cultural",
    trustScore: 4.96,
    initialBidSimulated: 280,
    currentBidSimulated: 390,
    bidsCount: 10,
    hoursRemaining: 19,
    minIncrement: 20,
    isBenefic: true,
    beneficEntity: "100% destinado al Hogar de Ancianos San José",
    description: "Proyector compacto con resolución nativa 1080p, conectividad HDMI, USB y AV. Lámpara LED con más de 20,000 horas de vida útil restante. Incluye control remoto y cable de poder.",
    condition: "Como nuevo",
    safePointRecommended: "Punto Seguro Vivero Forestal de Chimbote",
    bidsHistory: [
      { id: "b81", bidderName: "Alonso V.", bidderZone: "Bellamar", amount: 390, timeAgo: "Hace 30 min" },
      { id: "b82", bidderName: "Elena Q.", bidderZone: "27 de Octubre", amount: 360, timeAgo: "Hace 2 horas" },
    ],
  },
];
