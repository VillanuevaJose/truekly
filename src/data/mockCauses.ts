export type CauseCategory =
  | "Animales & Rescate"
  | "Alimentación & Comedores"
  | "Educación & Juventud"
  | "Adulto Mayor"
  | "Ecología & Bahía"
  | "Salud & Apoyo Médico";

export type CauseSocial = {
  id: string;
  ongName: string;
  category: CauseCategory;
  city: string;
  zone: string;
  objective: string;
  story: string;
  acceptedItems: string[];
  urgency: "urgente" | "alta" | "normal";
  impactMetric: {
    received: number;
    goal: number;
    unit: string;
  };
  contact: string;
  coordinator: string;
  verified: boolean;
  image: string;
  deliveryPoint: string;
};

export const mockCauses: CauseSocial[] = [
  {
    id: "ong-1",
    ongName: "Albergue Canino Huellitas Chimbote",
    category: "Animales & Rescate",
    city: "Nuevo Chimbote",
    zone: "Nuevo Chimbote / Los Cedros",
    objective: "Cuidado, recuperación médica y esterilización de perritos y gatitos rescatados de la calle en el distrito sur.",
    story: "Iniciamos en 2021 rescatando animales en estado de abandono en la Panamericana y el óvalo de Nuevo Chimbote. Actualmente albergamos a 48 perritos y 22 felinos que esperan una familia responsable. No manejamos dinero en efectivo; nos sostenemos con mantas, platos, alimentos balanceados y materiales de construcción para techar sus caniles.",
    acceptedItems: [
      "Mantas y toallas limpias",
      "Platos y comederos de acero o plástico",
      "Correas y collares resistentes",
      "Materiales para techar caniles",
      "Alimento balanceado en bolsa sellada",
      "Champú medicado y gasas limpias",
    ],
    urgency: "urgente",
    impactMetric: {
      received: 84,
      goal: 120,
      unit: "mantas y collares",
    },
    contact: "Coordinación comunitaria Huellitas",
    coordinator: "Valeria Soto (Voluntaria Principal)",
    verified: true,
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80",
    deliveryPoint: "Punto Seguro Plaza Mayor de Nuevo Chimbote",
  },
  {
    id: "ong-2",
    ongName: "Comedor Popular San Pedrito",
    category: "Alimentación & Comedores",
    city: "Casco Urbano, Chimbote",
    zone: "Casco Urbano / La Caleta",
    objective: "Apoyo alimentario diario con raciones nutritivas a familias de adultos mayores, madres solteras y pescadores en retiro.",
    story: "Fundado por vecinas organizadas de La Caleta para asegurar un almuerzo digno a más de 120 personas todos los días. Necesitamos renovar menaje industrial pesado para seguir cocinando a fuego limpio y mantener los alimentos protegidos bajo normas sanitarias.",
    acceptedItems: [
      "Ollas industriales #40 a #60",
      "Mesas y bancas en buen estado",
      "Envases de almacenamiento herméticos",
      "Cucharones y espumaderas de acero",
      "Platos hondos y cubiertos de metal",
      "Bidones para agua potable de 20L",
    ],
    urgency: "urgente",
    impactMetric: {
      received: 31,
      goal: 45,
      unit: "utensilios industriales",
    },
    contact: "Comité de Madres San Pedrito",
    coordinator: "Sra. Rosaura Méndez",
    verified: true,
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=600&q=80",
    deliveryPoint: "Punto Seguro Mercado Central / Casco Urbano",
  },
  {
    id: "ong-3",
    ongName: "Biblioteca Popular Bellamar",
    category: "Educación & Juventud",
    city: "Bellamar, Chimbote",
    zone: "Bellamar Sector II",
    objective: "Fomento de la lectura escolar, talleres artísticos y apoyo en tareas a escolares de escasos recursos de Bellamar.",
    story: "Transformamos un local comunal en desuso en un refugio de aprendizaje seguro. Más de 65 niños acuden cada tarde a leer y hacer sus tareas guiados por profesores voluntarios de Chimbote. Buscamos libros escolares vigentes, estantes y materiales de arte.",
    acceptedItems: [
      "Libros escolares primaria y secundaria",
      "Diccionarios y enciclopedias",
      "Mobiliario de estudio o estantes",
      "Lápices, colores y útiles sin uso",
      "Pizarras acrílicas y plumones",
      "Cuentos ilustrados para niños",
    ],
    urgency: "alta",
    impactMetric: {
      received: 156,
      goal: 220,
      unit: "libros y materiales escolares",
    },
    contact: "Comunidad Bellamar Sector II",
    coordinator: "Prof. David Morales",
    verified: true,
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80",
    deliveryPoint: "Punto Seguro Plaza Mayor de Nuevo Chimbote",
  },
  {
    id: "ong-4",
    ongName: "Guardianes de la Bahía El Ferrol",
    category: "Ecología & Bahía",
    city: "Chimbote",
    zone: "Malecón Grau / La Caleta",
    objective: "Campañas periódicas de limpieza costera, protección del ecosistema marino y recuperación de los humedales de Villa María.",
    story: "Somos un colectivo de jóvenes ambientalistas, buzos y pescadores que limpiamos las playas y orillas de la bahía de Chimbote para retirar plásticos de un solo uso y redes fantasma. Necesitamos equipo de protección física y herramientas duraderas para nuestras jornadas comunitarias.",
    acceptedItems: [
      "Costales de polipropileno para recojo",
      "Guantes de lona y nitrilo reforzados",
      "Rastrillos de metal y palanas",
      "Carretillas para traslado de residuos",
      "Botas de hule tallas 39 a 43",
      "Toldos plegables para punto de hidratación",
    ],
    urgency: "normal",
    impactMetric: {
      received: 68,
      goal: 100,
      unit: "herramientas de limpieza",
    },
    contact: "Colectivo Ambiental Chimbote Verde",
    coordinator: "Biól. Giancarlo Alva",
    verified: true,
    image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=600&q=80",
    deliveryPoint: "Punto Seguro Malecón Grau Chimbote",
  },
  {
    id: "ong-5",
    ongName: "Hogar de Ancianos San José de la Esperanza",
    category: "Adulto Mayor",
    city: "Chimbote",
    zone: "27 de Octubre, Chimbote",
    objective: "Alojamiento, alimentación y cuidados afectivos para 35 adultos mayores en situación de desamparo o abandono familiar.",
    story: "Nuestra casa hogar brinda calidez humana a abuelitos que no cuentan con pensión ni familia que vele por ellos. Toda contribución en artículos de asistencia geriátrica y aseo personal marca una enorme diferencia en su calidad de vida.",
    acceptedItems: [
      "Sillas de ruedas usadas o reparables",
      "Andadores plegables y bastones",
      "Sábanas de 1.5 plazas y frazadas térmicas",
      "Pañales para adultos tallas G y XG",
      "Toallitas húmedas y jabones neutros",
      "Juegos de mesa y dominós con fichas grandes",
    ],
    urgency: "urgente",
    impactMetric: {
      received: 22,
      goal: 35,
      unit: "implementos geriátricos",
    },
    contact: "Patronato San José",
    coordinator: "Hermana Carmen Luz",
    verified: true,
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80",
    deliveryPoint: "Punto Seguro Hospital La Caleta / Casco Urbano",
  },
  {
    id: "ong-6",
    ongName: "Ropero Solidario Santa María de la Cabeza",
    category: "Alimentación & Comedores",
    city: "Chimbote",
    zone: "Miraflores Alto",
    objective: "Clasificación y entrega gratuita de prendas abrigadoras, calzado y frazadas a familias de los asentamientos humanos altos.",
    story: "Durante los meses de neblina y frío porteño, las familias de los cerros de Miraflores sufren las bajas temperaturas. Recibimos ropa limpia, la organizamos por edades y la entregamos de manera ordenada y transparente a madres de familia registradas.",
    acceptedItems: [
      "Casacas y chompas abrigadoras limpias",
      "Zapatillas escolares y urbanas sin roturas",
      "Pantalones y buzos deportivos niños/adultos",
      "Mochilas y morrales en buen estado",
      "Frazadas y colchas limpias",
      "Cajas organizadoras de plástico",
    ],
    urgency: "normal",
    impactMetric: {
      received: 140,
      goal: 200,
      unit: "prendas clasificadas",
    },
    contact: "Parroquia Santa María de la Cabeza",
    coordinator: "Sra. Lucía Paredes",
    verified: true,
    image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80",
    deliveryPoint: "Punto Seguro Plaza Mayor de Nuevo Chimbote",
  },
  {
    id: "ong-7",
    ongName: "Sonrisas del Santa - Apoyo Pediátrico",
    category: "Salud & Apoyo Médico",
    city: "Nuevo Chimbote",
    zone: "Buenos Aires / Hospital Regional",
    objective: "Acompañamiento lúdico y donación de kits didácticos a niños internados en el área pediátrica del Hospital Regional.",
    story: "Estar hospitalizado es difícil para un niño. Nuestro equipo de payasos de hospital y psicólogos voluntarios lleva momentos de alegría, lectura y juegos que ayudan en su pronta recuperación. Aceptamos juguetes lavables, libros de colorear y cuentos.",
    acceptedItems: [
      "Juguetes plásticos lavables (nuevos o como nuevos)",
      "Libros de colorear y cuentos ilustrados",
      "Cajas de colores y plumones no tóxicos",
      "Juegos didácticos de encaje y rompecabezas",
      "Pañales pediátricos diversas etapas",
      "Ropa de bebé limpia y en buen estado",
    ],
    urgency: "alta",
    impactMetric: {
      received: 48,
      goal: 80,
      unit: "kits lúdicos pediátricos",
    },
    contact: "Asociación Sonrisas del Santa",
    coordinator: "Dra. Mariela Carrión",
    verified: true,
    image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=600&q=80",
    deliveryPoint: "Punto Seguro Hospital Regional Eleazar Guzmán",
  },
  {
    id: "ong-8",
    ongName: "Colectivo Sembrando Vida San Pedro",
    category: "Ecología & Bahía",
    city: "Chimbote Norte",
    zone: "San Pedro / Cerros del Norte",
    objective: "Arborización con especies nativas y riego comunitario para crear pulmones verdes en Chimbote Norte.",
    story: "Buscamos transformar laderas polvorientas en áreas arboladas con algarrobos y molles que fijan el suelo y purifican el aire de la zona pesquera. Los vecinos nos turnamos para el riego y necesitamos mangueras, plantones y herramientas de jardinería.",
    acceptedItems: [
      "Mangueras para riego de 1/2 pulgada",
      "Palanas y picos de jardinería",
      "Plantones de molle, algarrobo o tara",
      "Baldes grandes de pintura reciclados limpios",
      "Malla raschel para sombra de plantines",
      "Regaderas de plástico",
    ],
    urgency: "normal",
    impactMetric: {
      received: 75,
      goal: 120,
      unit: "materiales y plantones",
    },
    contact: "Junta Vecinal San Pedro Alto",
    coordinator: "Sr. Walter Huamán",
    verified: true,
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
    deliveryPoint: "Punto Seguro Plaza Mayor San Pedro",
  },
];
