import type { TradeItem } from '../types/trade';

export const INITIAL_ITEMS: TradeItem[] = [
  {
    id: 'tr-01',
    title: 'Sony Alpha a6400 (Cuerpo + Lente 16-50mm)',
    category: 'audio-foto',
    estimatedValuePEN: 3200,
    condition: 'Excelente',
    location: 'Miraflores, Lima',
    owner: {
      name: 'Camila Rossi',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      reputation: 4.95,
      tradesCompleted: 18,
      verified: true,
      city: 'Lima'
    },
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    seeking: 'iPad Pro M1/M2 11 pulgadas o MacBook Air con compensación mutua',
    description: 'Cámara mirrorless con sensor APS-C de 24.2 MP, 12,400 disparos de obturador. Incluye 2 baterías originales y estuche Lowepro.',
    safeMeetingPoint: 'Centro Comercial Real Plaza Salaverry (Zona Café)',
    tags: ['Fotografía', 'Mirrorless', '4K Video'],
    createdAt: 'Hace 2 horas'
  },
  {
    id: 'tr-02',
    title: 'Bicicleta de Ruta Trek Domane AL 2 (Talla 54)',
    category: 'movilidad',
    estimatedValuePEN: 2850,
    condition: 'Excelente',
    location: 'Barranco, Lima',
    owner: {
      name: 'Mateo Cárdenas',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      reputation: 4.88,
      tradesCompleted: 12,
      verified: true,
      city: 'Lima'
    },
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80',
    seeking: 'Cámara Fuji X-T30 II o equipo de estudio de grabación',
    description: 'Cuadro de aluminio Alpha serie 100, horquilla de carbono IsoSpeed. Mantenimiento general al día en taller especializado.',
    safeMeetingPoint: 'Estación Balta del Metropolitano (Zona Comercial)',
    tags: ['Ciclismo', 'Ruta', 'Trek'],
    createdAt: 'Hace 5 horas'
  },
  {
    id: 'tr-03',
    title: 'Guitarra Fender Stratocaster Player Series (Mástil Maple)',
    category: 'instrumentos',
    estimatedValuePEN: 2900,
    condition: 'Como nuevo',
    location: 'San Isidro, Lima',
    owner: {
      name: 'Sebastián Zúñiga',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      reputation: 5.0,
      tradesCompleted: 24,
      verified: true,
      city: 'Lima'
    },
    image: 'https://images.unsplash.com/photo-1550291652-6ea9114a47b1?w=800&auto=format&fit=crop&q=80',
    seeking: 'Sintetizador Minilogue XD o estación de trabajo Akai MPC One',
    description: 'Acabado Sonic Red clásico, pastillas Alnico 5 originales. Calibrada con cuerdas D’Addario 0.10. Cero golpes en la laca.',
    safeMeetingPoint: 'Centro Comercial Camino Real (Área Financiera)',
    tags: ['Música', 'Guitarras', 'Fender'],
    createdAt: 'Ayer'
  },
  {
    id: 'tr-04',
    title: 'Monitor Profesional Dell UltraSharp 27" 4K USB-C (U2723QE)',
    category: 'tecnologia',
    estimatedValuePEN: 2400,
    condition: 'Como nuevo',
    location: 'Surco, Lima',
    owner: {
      name: 'Valeria Mendoza',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      reputation: 4.92,
      tradesCompleted: 9,
      verified: true,
      city: 'Lima'
    },
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
    seeking: 'iPad Mini 6 con Apple Pencil o Lente Sigma 24-70 f/2.8 montura E',
    description: 'Panel IPS Black con contraste 2000:1 y 98% DCI-P3. Entrega 90W de carga por USB-C. Conservo caja y factura de compra original.',
    safeMeetingPoint: 'Jockey Plaza (Plaza Gourmet / Starbucks)',
    tags: ['Pantallas', 'Diseño', 'Dell 4K'],
    createdAt: 'Hace 1 día'
  },
  {
    id: 'tr-05',
    title: 'Audífonos Focal Elegia Hi-Fi Cerrados (Audiophile)',
    category: 'audio-foto',
    estimatedValuePEN: 1850,
    condition: 'Excelente',
    location: 'Cayma, Arequipa',
    owner: {
      name: 'Diego Benavente',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      reputation: 4.98,
      tradesCompleted: 31,
      verified: true,
      city: 'Arequipa'
    },
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    seeking: 'DAC portátil Chord Mojo 2 o tornamesa Audio-Technica LP120X',
    description: 'Drivers de cúpula invertida en aluminio-magnesio. Almohadillas de microfibra transpirable en perfecto estado. Cable balanceado adicional.',
    safeMeetingPoint: 'Mall Aventura Cayma (Entrada Principal)',
    tags: ['Hi-Fi', 'Audio', 'Audiófilo'],
    createdAt: 'Hace 2 días'
  },
  {
    id: 'tr-06',
    title: 'Colección Completa Clásicos de Arquitectura y Urbanismo (10 tomos)',
    category: 'libros-cultura',
    estimatedValuePEN: 1200,
    condition: 'Excelente',
    location: 'Pueblo Libre, Lima',
    owner: {
      name: 'Elena Morales',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      reputation: 4.85,
      tradesCompleted: 7,
      verified: true,
      city: 'Lima'
    },
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&auto=format&fit=crop&q=80',
    seeking: 'Escáner fotográfico plano Epson V600 o tableta gráfica Wacom',
    description: 'Ediciones Gustavo Gili y Taschen en tapa dura, sin marcas ni anotaciones. Incluye monografías de Le Corbusier, Tadao Ando y Jane Jacobs.',
    safeMeetingPoint: 'Centro Cultural PUCP (San Isidro)',
    tags: ['Libros', 'Diseño', 'Coleccionismo'],
    createdAt: 'Hace 3 días'
  }
];

export const CATEGORIES = [
  { id: 'todos', label: 'Todas las categorías', count: 6 },
  { id: 'audio-foto', label: 'Fotografía y Óptica', count: 2 },
  { id: 'tecnologia', label: 'Cómputo y Pantallas', count: 1 },
  { id: 'movilidad', label: 'Bicicletas y Movilidad', count: 1 },
  { id: 'instrumentos', label: 'Instrumentos Musicales', count: 1 },
  { id: 'libros-cultura', label: 'Libros y Colección', count: 1 },
] as const;

export const SAFE_MEETING_POINTS = [
  {
    name: 'Real Plaza Salaverry — Zona Cafeterías',
    district: 'Jesús María / San Isidro',
    city: 'Lima',
    security: 'Vigilancia 24/7, cámaras perimétricas y estacionamiento vigilado',
    rating: '5.0 de seguridad'
  },
  {
    name: 'Jockey Plaza — Plaza Barrio Gourmet',
    district: 'Santiago de Surco',
    city: 'Lima',
    security: 'Monitoreo de seguridad privada y alta afluencia peatonal',
    rating: '4.9 de seguridad'
  },
  {
    name: 'Estación Central Metropolitano — Galería Comercial',
    district: 'Cercado de Lima',
    city: 'Lima',
    security: 'Personal de Policía Nacional y personal ATU en torniquetes',
    rating: '4.8 de seguridad'
  },
  {
    name: 'Mall Aventura Cayma — Plaza Central',
    district: 'Cayma',
    city: 'Arequipa',
    security: 'Seguridad privada, cobertura de circuito cerrado y conectividad',
    rating: '4.9 de seguridad'
  }
];
