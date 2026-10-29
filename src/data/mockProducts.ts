export type Condition = "Nuevo" | "Como nuevo" | "Buen estado" | "Usado";

export type Category =
  | "Tecnología"
  | "Música"
  | "Gaming"
  | "Hogar"
  | "Deportes"
  | "Otros";

export type Zone =
  | "Todas"
  | "Casco Urbano"
  | "Nuevo Chimbote"
  | "Buenos Aires"
  | "27 de Octubre"
  | "Bellamar"
  | "Miramar";

export type Product = {
  id: string;
  title: string;
  image: string;
  category: Category;
  condition: Condition;
  wantsInReturn: string;
  zone: string;
  rating: number;
  exchangesCount: number;
  owner: {
    name: string;
    avatar: string;
    memberSince?: string;
    verified?: boolean;
    reviews?: { reviewer: string; comment: string; rating: number }[];
  };
  isFeatured?: boolean;
  description?: string;
  gallery?: string[];
  distanceKm?: number;
  safePointRecommended?: string;
};

export type Community = {
  id: string;
  name: string;
  zone: string;
  membersCount: number;
  description: string;
  category: string;
  icon: string;
  image?: string;
};

export type CauseSocial = {
  id: string;
  ongName: string;
  city: string;
  objective: string;
  acceptedItems: string[];
  contact: string;
  verified: boolean;
};

export type SimulatedAuction = {
  id: string;
  title: string;
  image: string;
  zone: string;
  seller: string;
  trustScore: number;
  initialBidSimulated: number; // Simulado S/
  currentBidSimulated: number; // Simulado S/
  bidsCount: number;
  hoursRemaining: number;
  isBenefic: boolean;
  beneficEntity?: string;
};

export const CHIMBOTE_ZONES: Zone[] = [
  "Todas",
  "Casco Urbano",
  "Nuevo Chimbote",
  "Buenos Aires",
  "27 de Octubre",
  "Bellamar",
  "Miramar",
];

export const products: Product[] = [
  {
    id: "p1",
    title: "Bicicleta de montaña Trek Marlin 5",
    image: "/products/bicicleta.jpg",
    category: "Deportes",
    condition: "Buen estado",
    wantsInReturn: "Busco laptop de oficina o herramientas mecánicas completas",
    zone: "Casco Urbano",
    distanceKm: 0.8,
    rating: 4.9,
    exchangesCount: 15,
    owner: {
      name: "Carlos Mendoza",
      avatar: "https://picsum.photos/seed/carlos-mendoza/80/80",
      memberSince: "Enero 2025",
      verified: true,
      reviews: [
        { reviewer: "María G.", comment: "Excelente persona, el producto tal como se describe.", rating: 5 },
        { reviewer: "Carlos M.", comment: "Buen intercambio, muy puntual en la Plaza Mayor.", rating: 4.8 },
      ],
    },
    isFeatured: true,
    description: "Bicicleta de montaña en excelente estado, poco uso. Marca Trek, modelo 2023 aro 29, frenos hidráulicos Shimano. Incluye luces LED recargables y candado de alta seguridad. Perfecta para rutas por Chimbote, Coishco y alrededores.",
    gallery: [
      "/products/sets/bici-1.jpg",
      "/products/sets/bici-2.jpg",
      "/products/sets/bici-3.jpg"
    ],
    safePointRecommended: "Plaza de Armas de Chimbote (Frente a la Catedral)",
  },
  {
    id: "p2",
    title: "Laptop HP Core i5 10ma gen 16GB RAM",
    image: "/products/sets/laptop-1.jpg",
    category: "Tecnología",
    condition: "Como nuevo",
    wantsInReturn: "Cambio por bicicleta de ruta aro 28 o cámara semi-profesional",
    zone: "Buenos Aires",
    distanceKm: 1.4,
    rating: 5.0,
    exchangesCount: 8,
    owner: {
      name: "Ana Torres",
      avatar: "https://picsum.photos/seed/ana-t/80/80",
      memberSince: "Marzo 2025",
      verified: true,
      reviews: [
        { reviewer: "Pedro L.", comment: "Equipo impecable, trato transparente.", rating: 5 },
      ],
    },
    description: "Laptop ultrabook con disco SSD de 512GB, batería con 5 horas de autonomía real. Cargador original y funda impermeable. Se entrega formateada.",
    gallery: [
      "/products/sets/laptop-1.jpg",
      "/products/sets/laptop-2.jpg",
      "/products/sets/laptop-3.jpg"
    ],
    safePointRecommended: "Plaza Mayor de Nuevo Chimbote",
  },
  {
    id: "p3",
    title: "Guitarra acústica de estudio Yamaha C40",
    image: "/products/sets/guitarra-1.jpg",
    category: "Música",
    condition: "Buen estado",
    wantsInReturn: "Teclado MIDI de 49 teclas o amplificador para bajo",
    zone: "27 de Octubre",
    distanceKm: 2.1,
    rating: 4.8,
    exchangesCount: 15,
    owner: {
      name: "Sofía Rodríguez",
      avatar: "https://picsum.photos/seed/sofia-r/80/80",
      memberSince: "Noviembre 2024",
      verified: true,
      reviews: [
        { reviewer: "Lucas V.", comment: "Sonido hermoso y afinación precisa.", rating: 5 },
      ],
    },
    isFeatured: true,
    description: "Guitarra clásica ideal para estudiantes de música o conservatorio. Cuerdas D'Addario recién cambiadas, incluye funda acolchada.",
    gallery: [
      "/products/sets/guitarra-1.jpg",
      "/products/sets/guitarra-2.jpg",
      "/products/sets/guitarra-3.jpg"
    ],
    safePointRecommended: "Bulevar Isla Blanca",
  },
  {
    id: "p4",
    title: "Consola PS4 Slim 1TB con 2 mandos",
    image: "/products/ps4-consola.jpg",
    category: "Gaming",
    condition: "Usado",
    wantsInReturn: "Busco Nintendo Switch v2 o herramientas de carpintería",
    zone: "Nuevo Chimbote",
    distanceKm: 1.8,
    rating: 4.7,
    exchangesCount: 6,
    owner: {
      name: "Mateo Rivas",
      avatar: "https://picsum.photos/seed/mateo-r/80/80",
      memberSince: "Febrero 2025",
      verified: true,
    },
    description: "Consola mantenida y libre de polvo. Mandos originales inalámbricos DualShock 4 con cables de carga y 3 juegos físicos incluidos.",
    gallery: ["/products/ps4-consola.jpg"],
    safePointRecommended: "Mall Plaza Chimbote (Zona Bancos)",
  },
  {
    id: "p5",
    title: "Cafetera italiana Bialetti y molinillo manual",
    image: "/products/cafetera-italiana.jpg",
    category: "Hogar",
    condition: "Como nuevo",
    wantsInReturn: "Juegos de mesa familiares (Catan / Carcassonne) o licuadora",
    zone: "Casco Urbano",
    distanceKm: 0.5,
    rating: 4.9,
    exchangesCount: 4,
    owner: {
      name: "Valeria Castillo",
      avatar: "https://picsum.photos/seed/valeria-c/80/80",
      memberSince: "Enero 2025",
      verified: true,
    },
    description: "Bialetti Moka Express de 6 tazas, acero inoxidable con junta de silicona nueva. Molinillo de muelas cónicas cerámicas ajustable.",
    gallery: ["/products/cafetera-italiana.jpg"],
    safePointRecommended: "Plaza de Armas de Chimbote",
  },
  {
    id: "p6",
    title: "Audífonos Sony con cancelación activa de ruido",
    image: "/products/audifonos-inalambricos.jpg",
    category: "Tecnología",
    condition: "Nuevo",
    wantsInReturn: "Parlante portátil JBL o kindle para lectura",
    zone: "Buenos Aires",
    distanceKm: 1.2,
    rating: 4.7,
    exchangesCount: 3,
    owner: {
      name: "Gabriel Morales",
      avatar: "https://picsum.photos/seed/gabriel-m/80/80",
      memberSince: "Abril 2025",
      verified: false,
    },
    description: "Caja sellada sin abrir. Excelente autonomía de 30 horas y conexión multipunto bluetooth.",
    gallery: ["/products/audifonos-inalambricos.jpg"],
    safePointRecommended: "Plaza Mayor de Nuevo Chimbote",
  },
  {
    id: "p7",
    title: "Patines en línea profesionales Rollerblade T39",
    image: "/products/patines-linea.jpg",
    category: "Deportes",
    condition: "Buen estado",
    wantsInReturn: "Casco para ciclismo urbano con visera o tabla de skate",
    zone: "Bellamar",
    distanceKm: 3.4,
    rating: 4.8,
    exchangesCount: 5,
    owner: {
      name: "Daniel Fuentes",
      avatar: "https://picsum.photos/seed/daniel-f/80/80",
      memberSince: "Diciembre 2024",
      verified: true,
    },
    description: "Ruedas 80mm de uretano con rodamientos SG7 en perfecto rodamiento. Bota rígida con botín interior lavable.",
    gallery: ["/products/patines-linea.jpg"],
    safePointRecommended: "Polideportivo de Casuarinas",
  },
  {
    id: "p8",
    title: "Mesa de centro artesanal en madera tornillo",
    image: "/products/mesa-centro.jpg",
    category: "Hogar",
    condition: "Usado",
    wantsInReturn: "Silla ergonómica de oficina o librero vertical de melamina",
    zone: "Nuevo Chimbote",
    distanceKm: 2.5,
    rating: 4.5,
    exchangesCount: 7,
    owner: {
      name: "Julio Noriega",
      avatar: "https://picsum.photos/seed/julio-n/80/80",
      memberSince: "Mayo 2024",
      verified: true,
    },
    description: "Madera sólida curada y barnizada en tono mate natural. Medidas: 90x50x45cm. Sin polillas ni rayones profundos.",
    gallery: ["/products/mesa-centro.jpg"],
    safePointRecommended: "Catedral de Nuevo Chimbote",
  },
  {
    id: "p9",
    title: "Taladro percutor Bosch 650W con maletín de brocas",
    image: "/products/taladro-percutor.jpg",
    category: "Otros",
    condition: "Buen estado",
    wantsInReturn: "Sierra caladora pendular o juego completo de llaves mixtas",
    zone: "Miramar",
    distanceKm: 1.1,
    rating: 4.9,
    exchangesCount: 11,
    owner: {
      name: "Carlos Meza",
      avatar: "https://picsum.photos/seed/carlos-m/80/80",
      memberSince: "Agosto 2024",
      verified: true,
    },
    description: "Mandril de 13mm, velocidad variable y reversible. Poco uso en reparaciones caseras ligeras.",
    gallery: ["/products/taladro-percutor.jpg"],
    safePointRecommended: "Malecón Grau (Frente a Capitanía)",
  },
  {
    id: "p10",
    title: "Cámara Réflex Canon EOS Rebel T6 con lente 18-55mm",
    image: "/products/camara-canon.jpg",
    category: "Tecnología",
    condition: "Buen estado",
    wantsInReturn: "Monitor IPS de 27 pulgadas o tablet Samsung",
    zone: "Casco Urbano",
    distanceKm: 0.9,
    rating: 5.0,
    exchangesCount: 19,
    owner: {
      name: "Renato Salazar",
      avatar: "https://picsum.photos/seed/renato-s/80/80",
      memberSince: "Enero 2024",
      verified: true,
    },
    isFeatured: true,
    description: "Sensor CMOS de 18 MP, conectividad Wi-Fi y NFC. Incluye 2 baterías originales, cargador de pared y bolso acolchado.",
    gallery: [
      "/products/sets/camara-1.jpg",
      "/products/sets/camara-2.jpg"
    ],
    safePointRecommended: "Plaza de Armas de Chimbote",
  },
  {
    id: "p11",
    title: "Telescopio Astronómico Celestron PowerSeeker",
    image: "/products/telescopio.jpg",
    category: "Otros",
    condition: "Como nuevo",
    wantsInReturn: "Binoculares de largo alcance o dron principiante",
    zone: "Buenos Aires",
    distanceKm: 1.7,
    rating: 4.9,
    exchangesCount: 3,
    owner: {
      name: "Elena Paredes",
      avatar: "https://picsum.photos/seed/elena-p/80/80",
      memberSince: "Febrero 2025",
      verified: true,
    },
    description: "Montura ecuatorial con trípode de aluminio. Incluye 2 oculares (20mm y 4mm) más lente Barlow 3x para ver la luna y planetas.",
    gallery: ["/products/telescopio.jpg"],
    safePointRecommended: "Plaza Mayor de Nuevo Chimbote",
  },
  {
    id: "p12",
    title: "Teclado Mecánico Redragon RGB Switch Blue",
    image: "/products/teclado-mecanico.jpg",
    category: "Gaming",
    condition: "Como nuevo",
    wantsInReturn: "Mouse inalámbrico gamer ergonómico o headset",
    zone: "27 de Octubre",
    distanceKm: 2.2,
    rating: 4.6,
    exchangesCount: 4,
    owner: {
      name: "Kevin Ramos",
      avatar: "https://picsum.photos/seed/kevin-r/80/80",
      memberSince: "Julio 2024",
      verified: true,
    },
    description: "Formato TKL compacto, chasis metálico robusto, teclas de repuesto y extractor incluidos.",
    gallery: ["/products/teclado-mecanico.jpg"],
    safePointRecommended: "Bulevar Isla Blanca",
  },
  {
    id: "p13",
    title: "Set de Mancuernas de Fundición 20kg",
    image: "/products/mancuernas.jpg",
    category: "Deportes",
    condition: "Buen estado",
    wantsInReturn: "Banca inclinable de ejercicios o barra de dominadas",
    zone: "Bellamar",
    distanceKm: 3.1,
    rating: 4.8,
    exchangesCount: 9,
    owner: {
      name: "Víctor Huamán",
      avatar: "https://picsum.photos/seed/victor-h/80/80",
      memberSince: "Septiembre 2024",
      verified: true,
    },
    description: "Discos de hierro fundido estándar con 2 barras roscadas y seguros de estrella reforzados.",
    gallery: ["/products/mancuernas.jpg"],
    safePointRecommended: "Polideportivo Casuarinas",
  },
  {
    id: "p14",
    title: "Monitor Gamer Asus 24'' 144Hz 1ms",
    image: "/products/monitor-gamer.jpg",
    category: "Tecnología",
    condition: "Buen estado",
    wantsInReturn: "iPad básico o guitarra electroacústica",
    zone: "Casco Urbano",
    distanceKm: 0.6,
    rating: 4.9,
    exchangesCount: 14,
    owner: {
      name: "Diego Cueva",
      avatar: "https://picsum.photos/seed/diego-c/80/80",
      memberSince: "Noviembre 2024",
      verified: true,
    },
    description: "Panel Full HD IPS con soporte FreeSync y altura ajustable. Cable DisplayPort y HDMI incluidos.",
    gallery: ["/products/monitor-gamer.jpg"],
    safePointRecommended: "Plaza de Armas de Chimbote",
  },
  {
    id: "p15",
    title: "Ukulele Concierto Kala Caoba con funda",
    image: "/products/ukulele.jpg",
    category: "Música",
    condition: "Nuevo",
    wantsInReturn: "Micrófono USB para streaming o podcast",
    zone: "Nuevo Chimbote",
    distanceKm: 1.5,
    rating: 4.9,
    exchangesCount: 6,
    owner: {
      name: "Lucía Benites",
      avatar: "https://picsum.photos/seed/lucia-b/80/80",
      memberSince: "Enero 2025",
      verified: true,
    },
    description: "Madera de caoba satinada, clavijeros abiertos precisos y cuerdas Aquila Nylgut originales.",
    gallery: ["/products/ukulele.jpg"],
    safePointRecommended: "Catedral de Nuevo Chimbote",
  },
  {
    id: "p16",
    title: "Olla Arrocera Multiusos Oster 1.8L",
    image: "/products/olla-arrocera.jpg",
    category: "Hogar",
    condition: "Como nuevo",
    wantsInReturn: "Tostadora eléctrica o sartén de hierro fundido",
    zone: "Miramar",
    distanceKm: 1.3,
    rating: 4.7,
    exchangesCount: 5,
    owner: {
      name: "Carmen Soto",
      avatar: "https://picsum.photos/seed/carmen-s/80/80",
      memberSince: "Diciembre 2024",
      verified: false,
    },
    description: "Tazón antiadherente removible con bandeja de vapor para vegetales.",
    gallery: ["/products/olla-arrocera.jpg"],
    safePointRecommended: "Malecón Grau",
  },
  {
    id: "p17",
    title: "Scooter Eléctrico Plegable 250W",
    image: "/products/scooter-electrico.jpg",
    category: "Deportes",
    condition: "Buen estado",
    wantsInReturn: "Smartphone gama media o laptop para estudios",
    zone: "Buenos Aires",
    distanceKm: 1.3,
    rating: 4.8,
    exchangesCount: 8,
    owner: {
      name: "Franco Alva",
      avatar: "https://picsum.photos/seed/franco-a/80/80",
      memberSince: "Octubre 2024",
      verified: true,
    },
    description: "Velocidad máxima 20 km/h, autonomía de 20 km. Frenos regenerativos y llantas antipinchazos recién instaladas.",
    gallery: ["/products/scooter-electrico.jpg"],
    safePointRecommended: "Plaza Mayor de Nuevo Chimbote",
  },
  {
    id: "p18",
    title: "Amoladora Angular Dewalt 4 1/2'' 800W",
    image: "/products/amoladora.jpg",
    category: "Otros",
    condition: "Buen estado",
    wantsInReturn: "Lijadora orbital o cepillo eléctrico de madera",
    zone: "27 de Octubre",
    distanceKm: 2.3,
    rating: 4.8,
    exchangesCount: 10,
    owner: {
      name: "Manuel Vega",
      avatar: "https://picsum.photos/seed/manuel-v/80/80",
      memberSince: "Agosto 2024",
      verified: true,
    },
    description: "Motor potente con guarda de protección y mango lateral de dos posiciones.",
    gallery: ["/products/amoladora.jpg"],
    safePointRecommended: "Bulevar Isla Blanca",
  },
  {
    id: "p19",
    title: "Juego de Catan Edición Básica en Español",
    image: "/products/juego-catan.jpg",
    category: "Otros",
    condition: "Como nuevo",
    wantsInReturn: "Juegos Dixit, Carcassonne o 7 Wonders",
    zone: "Casco Urbano",
    distanceKm: 0.4,
    rating: 5.0,
    exchangesCount: 13,
    owner: {
      name: "Rosa Medina",
      avatar: "https://picsum.photos/seed/rosa-m/80/80",
      memberSince: "Junio 2024",
      verified: true,
    },
    description: "Cartas plastificadas con fundas protectoras, piezas de madera completas sin faltantes.",
    gallery: ["/products/juego-catan.jpg"],
    safePointRecommended: "Plaza de Armas de Chimbote",
  },
  {
    id: "p20",
    title: "Silla de Oficina Ergonómica con Malla",
    image: "/products/silla-oficina.jpg",
    category: "Hogar",
    condition: "Buen estado",
    wantsInReturn: "Escritorio en L o estante para libros",
    zone: "Nuevo Chimbote",
    distanceKm: 2.0,
    rating: 4.6,
    exchangesCount: 7,
    owner: {
      name: "Jorge Campos",
      avatar: "https://picsum.photos/seed/jorge-c/80/80",
      memberSince: "Marzo 2025",
      verified: true,
    },
    description: "Soporte lumbar regulable, reposabrazos acolchados y pistón de gas clase 4.",
    gallery: ["/products/silla-oficina.jpg"],
    safePointRecommended: "Catedral de Nuevo Chimbote",
  },
  {
    id: "p21",
    title: "Nintendo 3DS XL con tarjeta 32GB",
    image: "/products/nintendo-3ds.jpg",
    category: "Gaming",
    condition: "Buen estado",
    wantsInReturn: "PlayStation Vita o juegos originales de PS4",
    zone: "Bellamar",
    distanceKm: 3.3,
    rating: 4.9,
    exchangesCount: 11,
    owner: {
      name: "Andrés Pinto",
      avatar: "https://picsum.photos/seed/andres-p/80/80",
      memberSince: "Febrero 2024",
      verified: true,
    },
    description: "Pantallas sin rayones con micas protectoras, cargador original y stylus incluido.",
    gallery: ["/products/nintendo-3ds.jpg"],
    safePointRecommended: "Polideportivo Casuarinas",
  },
  {
    id: "p22",
    title: "Amplificador de Guitarra Fender Frontman 15G",
    image: "/products/amplificador.jpg",
    category: "Música",
    condition: "Buen estado",
    wantsInReturn: "Pedal de overdrive/distorsión o afinador de pedal",
    zone: "Buenos Aires",
    distanceKm: 1.6,
    rating: 4.7,
    exchangesCount: 8,
    owner: {
      name: "Rodrigo Paz",
      avatar: "https://picsum.photos/seed/rodrigo-p/80/80",
      memberSince: "Enero 2025",
      verified: true,
    },
    description: "15W de potencia, canal limpio y distorsión clásica Fender. Entrada para audífonos de práctica.",
    gallery: ["/products/amplificador.jpg"],
    safePointRecommended: "Plaza Mayor de Nuevo Chimbote",
  },
  {
    id: "p23",
    title: "Proyector Portátil Full HD con HDMI y USB",
    image: "/products/proyector.jpg",
    category: "Tecnología",
    condition: "Como nuevo",
    wantsInReturn: "Smart TV de 32 pulgadas o barra de sonido",
    zone: "Casco Urbano",
    distanceKm: 0.7,
    rating: 4.8,
    exchangesCount: 4,
    owner: {
      name: "Claudia Ríos",
      avatar: "https://picsum.photos/seed/claudia-r/80/80",
      memberSince: "Noviembre 2024",
      verified: true,
    },
    description: "Proyecta hasta 120 pulgadas en pared blanca, parlante integrado y control remoto original.",
    gallery: ["/products/proyector.jpg"],
    safePointRecommended: "Plaza de Armas de Chimbote",
  },
  {
    id: "p24",
    title: "Raqueta de Tenis Wilson Blade 98 v7",
    image: "/products/raqueta-tenis.jpg",
    category: "Deportes",
    condition: "Buen estado",
    wantsInReturn: "Paleta de pádel profesional o zapatillas deportivas 41",
    zone: "Nuevo Chimbote",
    distanceKm: 2.4,
    rating: 5.0,
    exchangesCount: 6,
    owner: {
      name: "Renzo Díaz",
      avatar: "https://picsum.photos/seed/renzo-d/80/80",
      memberSince: "Mayo 2024",
      verified: true,
    },
    description: "Encordado recién colocado a 52 libras, peso 305g, grip nuevo tamaño 3.",
    gallery: ["/products/raqueta-tenis.jpg"],
    safePointRecommended: "Catedral de Nuevo Chimbote",
  },
  {
    id: "p25",
    title: "Licuadora de Vaso de Vidrio Oster 2 Velocidades",
    image: "/products/licuadora.jpg",
    category: "Hogar",
    condition: "Buen estado",
    wantsInReturn: "Exprimidor de cítricos potente o sandwichera grill",
    zone: "Miramar",
    distanceKm: 1.0,
    rating: 4.5,
    exchangesCount: 9,
    owner: {
      name: "Teresa Luna",
      avatar: "https://picsum.photos/seed/teresa-l/80/80",
      memberSince: "Julio 2024",
      verified: false,
    },
    description: "Cuchilla picahielo de acero inoxidable, acople metálico All-Metal Drive en perfecto funcionamiento.",
    gallery: ["/products/licuadora.jpg"],
    safePointRecommended: "Malecón Grau",
  },
  {
    id: "p26",
    title: "Trípode Profesional Manfrotto Compact Action",
    image: "/products/tripode.jpg",
    category: "Tecnología",
    condition: "Como nuevo",
    wantsInReturn: "Luz LED continua para fotografía o micrófono corbatero",
    zone: "Casco Urbano",
    distanceKm: 0.8,
    rating: 4.9,
    exchangesCount: 16,
    owner: {
      name: "Gonzalo Vidal",
      avatar: "https://picsum.photos/seed/gonzalo-v/80/80",
      memberSince: "Septiembre 2024",
      verified: true,
    },
    description: "Cabezal tipo joystick con zapata rápida redonda, súper liviano y soporta hasta 1.5 kg.",
    gallery: ["/products/tripode.jpg"],
    safePointRecommended: "Plaza de Armas de Chimbote",
  },
  {
    id: "p27",
    title: "Mochila de Trekking Quechua Forclaz 50L",
    image: "/products/mochila-trekking.jpg",
    category: "Deportes",
    condition: "Buen estado",
    wantsInReturn: "Carpa para 2 personas o bolsa de dormir térmica",
    zone: "Bellamar",
    distanceKm: 3.2,
    rating: 4.7,
    exchangesCount: 5,
    owner: {
      name: "Alonso Vera",
      avatar: "https://picsum.photos/seed/alonso-v/80/80",
      memberSince: "Octubre 2024",
      verified: true,
    },
    description: "Espaldar regulable y ventilado, incluye funda impermeable para lluvia y compartimento inferior.",
    gallery: ["/products/mochila-trekking.jpg"],
    safePointRecommended: "Polideportivo Casuarinas",
  },
  {
    id: "p28",
    title: "Mouse Gamer Logitech G502 HERO",
    image: "/products/mouse-gamer.jpg",
    category: "Gaming",
    condition: "Como nuevo",
    wantsInReturn: "Teclado mecánico compacto o alfombrilla XXL gamer",
    zone: "27 de Octubre",
    distanceKm: 2.0,
    rating: 4.9,
    exchangesCount: 7,
    owner: {
      name: "Esteban Cruz",
      avatar: "https://picsum.photos/seed/esteban-c/80/80",
      memberSince: "Enero 2025",
      verified: true,
    },
    description: "Sensor HERO 25K de máxima precisión, pesos ajustables completos y cable trenzado intacto.",
    gallery: ["/products/mouse-gamer.jpg"],
    safePointRecommended: "Bulevar Isla Blanca",
  },
  {
    id: "p29",
    title: "Microscopio Biológico Monocular para Colegio",
    image: "/products/microscopio.jpg",
    category: "Otros",
    condition: "Buen estado",
    wantsInReturn: "Calculadora científica programable o libros de ingeniería",
    zone: "Buenos Aires",
    distanceKm: 1.5,
    rating: 4.8,
    exchangesCount: 4,
    owner: {
      name: "Beatriz Loyola",
      avatar: "https://picsum.photos/seed/beatriz-l/80/80",
      memberSince: "Marzo 2025",
      verified: true,
    },
    description: "Aumentos hasta 400x con iluminación eléctrica y espejo reflector. Ideal para proyectos escolares.",
    gallery: ["/products/microscopio.jpg"],
    safePointRecommended: "Plaza Mayor de Nuevo Chimbote",
  },
  {
    id: "p30",
    title: "Estante Librero Modular en Melamina Blanca",
    image: "/products/estante-librero.jpg",
    category: "Hogar",
    condition: "Como nuevo",
    wantsInReturn: "Lámpara de pie moderna o cuadro decorativo grande",
    zone: "Casco Urbano",
    distanceKm: 0.6,
    rating: 4.9,
    exchangesCount: 12,
    owner: {
      name: "Patricia Rojas",
      avatar: "https://picsum.photos/seed/patricia-r/80/80",
      memberSince: "Noviembre 2024",
      verified: true,
    },
    description: "Medidas: 180x60x30cm con cantos gruesos sellados. Muy firme y desarmable para fácil transporte.",
    gallery: ["/products/estante-librero.jpg"],
    safePointRecommended: "Plaza de Armas de Chimbote",
  },
];

export const mockCommunities: Community[] = [
  {
    id: "c1",
    name: "Makers & Técnicos del Santa",
    zone: "Casco Urbano, Chimbote",
    membersCount: 84,
    description: "Intercambio libre de repuestos, herramientas, placas y componentes de taller.",
    category: "Tecnología y Oficio",
    icon: "wrench",
  },
  {
    id: "c2",
    name: "Ciclistas Urbanos Chimbote",
    zone: "Nuevo Chimbote / Buenos Aires",
    membersCount: 142,
    description: "Comunidad dedicada al trueque de accesorios de ruta, repuestos y equipamiento ciclista.",
    category: "Movilidad",
    icon: "bike",
  },
  {
    id: "c3",
    name: "Huertos y Esquejes Urbanos",
    zone: "Bellamar y 27 de Octubre",
    membersCount: 67,
    description: "Intercambiamos plantas, abono casero, macetas y semillas orgánicas entre personas de la ciudad.",
    category: "Ecología y Hogar",
    icon: "sprout",
  },
];

export const mockCauses: CauseSocial[] = [
  {
    id: "ong-1",
    ongName: "Albergue Canino Huellitas Chimbote",
    city: "Nuevo Chimbote",
    objective: "Cuidado y rescate de perritos callejeros de la zona sur.",
    acceptedItems: [
      "Mantas y toallas limpias",
      "Platos y comederos de acero o plástico",
      "Correas y collares resistentes",
      "Materiales para techar caniles",
    ],
    contact: "Coordinación comunitaria por Truekly",
    verified: true,
  },
  {
    id: "ong-2",
    ongName: "Comedor Comunitario San Pedrito",
    city: "Casco Urbano, Chimbote",
    objective: "Apoyo alimentario diario a familias de adultos mayores y pescadores en retiro.",
    acceptedItems: [
      "Ollas grandes y menaje de cocina",
      "Mesas y bancas en buen estado",
      "Envases de almacenamiento herméticos",
    ],
    contact: "Comité de madres San Pedrito",
    verified: true,
  },
  {
    id: "ong-3",
    ongName: "Biblioteca Popular Bellamar",
    city: "Bellamar, Chimbote",
    objective: "Fomento de lectura escolar y apoyo en tareas a escolares de la zona.",
    acceptedItems: [
      "Libros escolares y diccionarios",
      "Mobiliario de estudio o estantes",
      "Lápices, colores y útiles sin uso",
    ],
    contact: "Comunidad Bellamar Sector II",
    verified: true,
  },
];

export const mockSimulatedAuctions: SimulatedAuction[] = [
  {
    id: "auc-1",
    title: "Cámara Réflex Canon EOS T6 + 2 Lentes",
    image: "/products/camara-canon.jpg",
    zone: "Casco Urbano, Chimbote",
    seller: "Marcos L. (Docente de Fotografía)",
    trustScore: 4.95,
    initialBidSimulated: 250,
    currentBidSimulated: 380,
    bidsCount: 9,
    hoursRemaining: 18,
    isBenefic: true,
    beneficEntity: "50% destinado al Comedor San Pedrito",
  },
  {
    id: "auc-2",
    title: "Telescopio Astronómico Celestrón 70mm",
    image: "/products/telescopio.jpg",
    zone: "Nuevo Chimbote",
    seller: "Patricia B. (Usuario Verificado)",
    trustScore: 4.88,
    initialBidSimulated: 180,
    currentBidSimulated: 240,
    bidsCount: 6,
    hoursRemaining: 32,
    isBenefic: false,
  },
];
