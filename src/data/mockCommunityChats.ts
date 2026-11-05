export type CommunityMessage = {
  id: string;
  communityId: string;
  senderName: string;
  senderAvatar?: string;
  senderInitials: string;
  verified: boolean;
  zone: string;
  timestamp: string;
  text: string;
  isTradeProposal?: boolean;
  tradeOffered?: string;
  tradeWanted?: string;
};

// Generador de historial inicial contextualizado según la temática de la comunidad
export function getInitialCommunityMessages(communityId: string, communityName: string, category: string): CommunityMessage[] {
  const baseMap: Record<string, CommunityMessage[]> = {
    c1: [
      {
        id: "m-c1-1",
        communityId: "c1",
        senderName: "Carlos Mendoza",
        senderInitials: "CM",
        verified: true,
        zone: "Casco Urbano",
        timestamp: "09:15 AM",
        text: "Buenos días comunidad. ¿Alguien tiene una fuente ATX de 500W funcionando? Tengo cautín con soporte para cambiar.",
        isTradeProposal: true,
        tradeOffered: "Cautín tipo lápiz con soporte",
        tradeWanted: "Fuente de poder ATX 500W+",
      },
      {
        id: "m-c1-2",
        communityId: "c1",
        senderName: "Renzo Valdivia",
        senderInitials: "RV",
        verified: true,
        zone: "21 de Abril",
        timestamp: "09:32 AM",
        text: "Hola Carlos, yo tengo una Corsair de 550W guardada del taller. Te paso fotos.",
      },
      {
        id: "m-c1-3",
        communityId: "c1",
        senderName: "Miguel Talledo",
        senderInitials: "MT",
        verified: false,
        zone: "Miraflores",
        timestamp: "10:04 AM",
        text: "Tengo lote de condensadores y resistencias surtidas para quien esté armando proyectos Arduino en Chimbote.",
      },
    ],
    c2: [
      {
        id: "m-c2-1",
        communityId: "c2",
        senderName: "Diana Solís",
        senderInitials: "DS",
        verified: true,
        zone: "Nuevo Chimbote",
        timestamp: "08:20 AM",
        text: "¡Hola ciclistas! Hoy salimos por la Panamericana hasta Vesique. ¿Alguien tiene una cámara 29 válvula presta para llevar de repuesto?",
      },
      {
        id: "m-c2-2",
        communityId: "c2",
        senderName: "Jorge Bazán",
        senderInitials: "JB",
        verified: true,
        zone: "Buenos Aires",
        timestamp: "08:45 AM",
        text: "Tengo dos cámaras Maxxis 29 selladas. Busco un inflador de mano compacto con soporte de cuadro.",
        isTradeProposal: true,
        tradeOffered: "2x Cámaras Maxxis 29 Presta",
        tradeWanted: "Inflador de mano para bicicleta",
      },
      {
        id: "m-c2-3",
        communityId: "c2",
        senderName: "Alonso Vera",
        senderInitials: "AV",
        verified: true,
        zone: "Bellamar",
        timestamp: "09:12 AM",
        text: "Nos vemos a las 4pm en la Plaza Mayor de Nuevo Chimbote para el trueque antes de pedalear.",
      },
    ],
    c3: [
      {
        id: "m-c3-1",
        communityId: "c3",
        senderName: "Rosaura Paredes",
        senderInitials: "RP",
        verified: true,
        zone: "Bellamar",
        timestamp: "10:10 AM",
        text: "Vecinos, tengo 5 esquejes enraizados de monstera deliciosa y suculentas cebra. Me gustaría cambiarlas por semillas de albahaca o macetas de barro.",
        isTradeProposal: true,
        tradeOffered: "Esquejes enraizados de Monstera",
        tradeWanted: "Macetas medianas de barro cocido",
      },
      {
        id: "m-c3-2",
        communityId: "c3",
        senderName: "Elena Quispe",
        senderInitials: "EQ",
        verified: false,
        zone: "27 de Octubre",
        timestamp: "10:45 AM",
        text: "Yo tengo compost maduro de lombriz californiana, unas 3 bolsitas de 2kg. Avísenme si coordinamos por aquí.",
      },
    ],
    c4: [
      {
        id: "m-c4-1",
        communityId: "c4",
        senderName: "Bryan Córdova",
        senderInitials: "BC",
        verified: true,
        zone: "Casco Urbano",
        timestamp: "11:00 AM",
        text: "Terminé el Zelda Tears of the Kingdom para Switch. Quiero probar el Mario Odyssey o Metroid Dread. Cartucho físico original.",
        isTradeProposal: true,
        tradeOffered: "Zelda Tears of the Kingdom (Switch)",
        tradeWanted: "Super Mario Odyssey o Metroid Dread",
      },
      {
        id: "m-c4-2",
        communityId: "c4",
        senderName: "Kevin Loyola",
        senderInitials: "KL",
        verified: true,
        zone: "El Progreso",
        timestamp: "11:22 AM",
        text: "Yo tengo el Mario Odyssey impecable con caja. ¿Hacemos el cambio en el punto seguro de la Plaza de Armas hoy en la tarde?",
      },
    ],
  };

  if (baseMap[communityId]) {
    return baseMap[communityId];
  }

  // Generador dinámico temático para las demás comunidades
  return [
    {
      id: `m-${communityId}-1`,
      communityId,
      senderName: "Vecino Truekly",
      senderInitials: "VT",
      verified: true,
      zone: "Chimbote Centro",
      timestamp: "Ayer 06:30 PM",
      text: `¡Bienvenidos al grupo de ${communityName}! Recuerden acordar intercambios en puntos seguros registrados de la ciudad.`,
    },
    {
      id: `m-${communityId}-2`,
      communityId,
      senderName: "Marcos Ríos",
      senderInitials: "MR",
      verified: true,
      zone: "Nuevo Chimbote",
      timestamp: "Hoy 10:15 AM",
      text: `Tengo artículos disponibles de la categoría ${category} para trueque libre. Escriban si tienen algo de interés.`,
      isTradeProposal: true,
      tradeOffered: `Accesorio de ${category} en buen estado`,
      tradeWanted: "Herramienta o libro útil",
    },
  ];
}
