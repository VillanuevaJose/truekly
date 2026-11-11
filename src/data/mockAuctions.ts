export type AuctionCategory =
  | "Fotografía & Óptica"
  | "Astronomía & Ciencia"
  | "Instrumentos & Sonido"
  | "Coleccionismo & Retro"
  | "Herramientas de Taller"
  | "Tecnología & Drones";

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
    title: "Cámara Réflex Canon EOS T6 + 2 Lentes (18-55mm + 75-300mm)",
    category: "Fotografía & Óptica",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=600&q=80",
    ],
    zone: "Casco Urbano, Chimbote",
    seller: "Marcos L.",
    sellerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    sellerRole: "Docente de Fotografía en Chimbote",
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
    title: "Telescopio Astronómico Celestron PowerSeeker 70AZ con Trípode",
    category: "Astronomía & Ciencia",
    image: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80",
    ],
    zone: "Nuevo Chimbote / Buenos Aires",
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
    description: "Refractor acromático de 70mm con distancia focal de 700mm. Incluye dos oculares (20mm y 4mm) y lente Barlow 3x para observación nítida de cráteres lunares y satélites galileanos.",
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
    title: "Guitarra Eléctrica Fender Squier Stratocaster + Amplificador Fender 15W",
    category: "Instrumentos & Sonido",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    ],
    zone: "Casco Urbano, Chimbote",
    seller: "Rodrigo M.",
    sellerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    sellerRole: "Músico & Luthier Aficionado",
    trustScore: 4.92,
    initialBidSimulated: 320,
    currentBidSimulated: 460,
    bidsCount: 14,
    hoursRemaining: 8,
    minIncrement: 20,
    isBenefic: true,
    beneficEntity: "40% donado a Sonrisas del Santa (Pediatría)",
    description: "Configuración clásica HSS con mástil de arce suave, trastes calibrados, cable blindado de 3 metros y funda impermeable. El amplificador incluye canal clean y overdrive.",
    condition: "Buen estado",
    safePointRecommended: "Punto Seguro Malecón Grau Chimbote",
    bidsHistory: [
      { id: "b31", bidderName: "Renzo V.", bidderZone: "Miraflores", amount: 460, timeAgo: "Hace 5 min" },
      { id: "b32", bidderName: "Carlos M.", bidderZone: "Casco Urbano", amount: 440, timeAgo: "Hace 35 min" },
      { id: "b33", bidderName: "Diana S.", bidderZone: "Nuevo Chimbote", amount: 400, timeAgo: "Hace 4 horas" },
    ],
  },
  {
    id: "auc-4",
    title: "Tornamesa Vinilo Vintage Audio-Technica AT-LP60X con Púa Nueva",
    category: "Instrumentos & Sonido",
    image: "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?auto=format&fit=crop&w=600&q=80",
    ],
    zone: "Nuevo Chimbote / Los Cedros",
    seller: "Sonia G.",
    sellerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    sellerRole: "Coleccionista de Música Porteña",
    trustScore: 4.96,
    initialBidSimulated: 210,
    currentBidSimulated: 310,
    bidsCount: 8,
    hoursRemaining: 24,
    minIncrement: 15,
    isBenefic: false,
    description: "Tocadiscos totalmente automático accionado por correa con velocidades de 33-1/3 y 45 RPM. Púa de diamante elíptica cambiada hace un mes. Salida RCA y preamplificador phono integrado.",
    condition: "Como nuevo",
    safePointRecommended: "Punto Seguro Plaza Mayor de Nuevo Chimbote",
    bidsHistory: [
      { id: "b41", bidderName: "Jorge B.", bidderZone: "Buenos Aires", amount: 310, timeAgo: "Hace 1 hora" },
      { id: "b42", bidderName: "Alonso V.", bidderZone: "Bellamar", amount: 290, timeAgo: "Hace 6 horas" },
    ],
  },
  {
    id: "auc-5",
    title: "Dron DJI Mini 2 Ultraligero 4K con Combo 3 Baterías y Bolso",
    category: "Tecnología & Drones",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80",
    ],
    zone: "Casco Urbano, Chimbote",
    seller: "Álvaro T.",
    sellerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    sellerRole: "Operador Audiovisual Costero",
    trustScore: 4.98,
    initialBidSimulated: 550,
    currentBidSimulated: 780,
    bidsCount: 19,
    hoursRemaining: 5,
    minIncrement: 30,
    isBenefic: true,
    beneficEntity: "50% donado a Guardianes de la Bahía El Ferrol",
    description: "Peso menor a 249 gramos, grabación de video 4K a 30fps y transmisión OcuSync 2.0 hasta 10km. 3 baterías con menos de 18 ciclos de carga cada una y protector de hélices.",
    condition: "Como nuevo",
    safePointRecommended: "Punto Seguro Vivero Forestal de Chimbote",
    bidsHistory: [
      { id: "b51", bidderName: "Carlos M.", bidderZone: "Casco Urbano", amount: 780, timeAgo: "Hace 10 min" },
      { id: "b52", bidderName: "Diana S.", bidderZone: "Nuevo Chimbote", amount: 750, timeAgo: "Hace 25 min" },
      { id: "b53", bidderName: "Miguel T.", bidderZone: "Miraflores", amount: 700, timeAgo: "Hace 2 horas" },
    ],
  },
  {
    id: "auc-6",
    title: "Máquina de Escribir Mecánica Portátil Olivetti Lettera 32 (1968)",
    category: "Coleccionismo & Retro",
    image: "https://images.unsplash.com/photo-1526550517342-e086b387edda?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1526550517342-e086b387edda?auto=format&fit=crop&w=600&q=80",
    ],
    zone: "La Caleta, Chimbote",
    seller: "Elena R.",
    sellerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
    sellerRole: "Historiadora Porteña",
    trustScore: 4.91,
    initialBidSimulated: 190,
    currentBidSimulated: 270,
    bidsCount: 7,
    hoursRemaining: 40,
    minIncrement: 20,
    isBenefic: true,
    beneficEntity: "100% donado al Hogar de Ancianos San José",
    description: "Joya del diseño industrial italiano diseñada por Marcello Nizzoli. Teclado QWERTY en español con la letra 'ñ'. Cinta bicolor recién cambiada y maletín original de transporte.",
    condition: "Colección",
    safePointRecommended: "Punto Seguro Malecón Grau Chimbote",
    bidsHistory: [
      { id: "b61", bidderName: "Alonso V.", bidderZone: "Bellamar", amount: 270, timeAgo: "Hace 2 horas" },
      { id: "b62", bidderName: "Jorge B.", bidderZone: "Buenos Aires", amount: 250, timeAgo: "Hace 7 horas" },
    ],
  },
  {
    id: "auc-7",
    title: "Set Industrial Bosch Professional: Taladro Percutor + Amoladora 4 1/2''",
    category: "Herramientas de Taller",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80",
    ],
    zone: "Bellamar, Chimbote",
    seller: "Guillermo P.",
    sellerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    sellerRole: "Maestro Metalmecánico",
    trustScore: 4.89,
    initialBidSimulated: 220,
    currentBidSimulated: 340,
    bidsCount: 11,
    hoursRemaining: 14,
    minIncrement: 20,
    isBenefic: false,
    description: "Combo industrial con cable reforzado para trabajo continuo en taller. Incluye mandril de 13mm, juego de brocas para concreto y discos abrasivos de corte de acero.",
    condition: "Buen estado",
    safePointRecommended: "Punto Seguro Plaza Mayor de Nuevo Chimbote",
    bidsHistory: [
      { id: "b71", bidderName: "Renzo V.", bidderZone: "Miraflores", amount: 340, timeAgo: "Hace 30 min" },
      { id: "b72", bidderName: "Carlos M.", bidderZone: "Casco Urbano", amount: 320, timeAgo: "Hace 2 horas" },
    ],
  },
  {
    id: "auc-8",
    title: "Microscopio Óptico Binocular Profesional Celestron Labs CB2000CF",
    category: "Astronomía & Ciencia",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80",
    ],
    zone: "Buenos Aires, Chimbote",
    seller: "Biól. Giancarlo A.",
    sellerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80",
    sellerRole: "Investigador Marino del Santa",
    trustScore: 4.97,
    initialBidSimulated: 380,
    currentBidSimulated: 520,
    bidsCount: 12,
    hoursRemaining: 29,
    minIncrement: 25,
    isBenefic: true,
    beneficEntity: "50% destinado a Huellitas Chimbote (Insumos veterinarios)",
    description: "Aumentos hasta 2000x con iluminación halógena Abbe NA 1.25 y platina mecánica de doble capa. Oculares de campo amplio WF10x y WF20x con 4 objetivos acromáticos.",
    condition: "Como nuevo",
    safePointRecommended: "Punto Seguro MegaPlaza Chimbote",
    bidsHistory: [
      { id: "b81", bidderName: "Elena Q.", bidderZone: "27 de Octubre", amount: 520, timeAgo: "Hace 15 min" },
      { id: "b82", bidderName: "Diana S.", bidderZone: "Nuevo Chimbote", amount: 495, timeAgo: "Hace 3 horas" },
    ],
  },
];
