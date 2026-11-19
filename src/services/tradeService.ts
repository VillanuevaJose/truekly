import { supabase } from "../lib/supabaseClient.ts";

export type TradeStatus = "pendiente" | "confirmado_parcial" | "completada" | "cancelada";

export interface TradeProposal {
  id: string;
  proponenteId: string;
  receptorId: string | null;
  publicacionOfertadaId: string;
  publicacionSolicitadaId: string;
  tituloOfertado: string;
  tituloSolicitado: string;
  imagenOfertada: string;
  imagenSolicitada: string;
  puntoEncuentro: string;
  confirmadoProponente: boolean;
  confirmadoReceptor: boolean;
  estado: TradeStatus;
  createdAt: string;
  fechaCierre?: string | null;
}

export interface CreateTradeProposalDTO {
  proponenteId: string;
  receptorId: string | null;
  publicacionOfertadaId: string;
  publicacionSolicitadaId: string;
  tituloOfertado: string;
  tituloSolicitado: string;
  imagenOfertada: string;
  imagenSolicitada: string;
  puntoEncuentro?: string;
}

const STORAGE_KEY = "truekly_trade_proposals";

function getLocalTrades(): TradeProposal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TradeProposal[]) : [];
  } catch {
    return [];
  }
}

function saveLocalTrades(trades: TradeProposal[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  } catch (err) {
    console.warn("[tradeService] Error al guardar en localStorage:", err);
  }
}

/**
 * Calcula el estado y acción requerida del usuario en el handshake presencial
 */
export function computeHandshakeStatus(
  trade: TradeProposal,
  currentUserId?: string
): {
  badgeLabel: string;
  badgeVariant: "pending" | "waiting" | "completed" | "cancelled";
  canConfirm: boolean;
  isCompleted: boolean;
} {
  if (trade.estado === "completada") {
    return {
      badgeLabel: "Trueque completado",
      badgeVariant: "completed",
      canConfirm: false,
      isCompleted: true,
    };
  }

  if (trade.estado === "cancelada") {
    return {
      badgeLabel: "Cancelado",
      badgeVariant: "cancelled",
      canConfirm: false,
      isCompleted: false,
    };
  }

  const isProponente = currentUserId === trade.proponenteId;
  const userConfirmed = isProponente
    ? trade.confirmadoProponente
    : trade.confirmadoReceptor;

  if (userConfirmed) {
    return {
      badgeLabel: "Esperando confirmación de la otra parte",
      badgeVariant: "waiting",
      canConfirm: false,
      isCompleted: false,
    };
  }

  return {
    badgeLabel: "Pendiente de tu confirmación",
    badgeVariant: "pending",
    canConfirm: true,
    isCompleted: false,
  };
}

/**
 * Crea una propuesta de trueque
 */
export async function createTradeProposal(
  dto: CreateTradeProposalDTO
): Promise<TradeProposal> {
  const newTrade: TradeProposal = {
    id: `trade-${Date.now()}`,
    proponenteId: dto.proponenteId,
    receptorId: dto.receptorId,
    publicacionOfertadaId: dto.publicacionOfertadaId,
    publicacionSolicitadaId: dto.publicacionSolicitadaId,
    tituloOfertado: dto.tituloOfertado,
    tituloSolicitado: dto.tituloSolicitado,
    imagenOfertada: dto.imagenOfertada,
    imagenSolicitada: dto.imagenSolicitada,
    puntoEncuentro: dto.puntoEncuentro || "Plaza de Armas de Chimbote",
    confirmadoProponente: false,
    confirmadoReceptor: false,
    estado: "pendiente",
    createdAt: new Date().toISOString(),
  };

  const local = getLocalTrades();
  saveLocalTrades([newTrade, ...local]);

  try {
    const { data, error } = await supabase
      .from("propuesta_trueque")
      .insert({
        id: newTrade.id,
        proponente_id: dto.proponenteId,
        receptor_id: dto.receptorId,
        publicacion_ofertada_id: dto.publicacionOfertadaId,
        publicacion_solicitada_id: dto.publicacionSolicitadaId,
        titulo_ofertado: dto.tituloOfertado,
        titulo_solicitado: dto.tituloSolicitado,
        imagen_ofertada: dto.imagenOfertada,
        imagen_solicitada: dto.imagenSolicitada,
        punto_encuentro: newTrade.puntoEncuentro,
      })
      .select()
      .single();

    if (!error && data) {
      return {
        ...newTrade,
        id: data.id,
      };
    }
  } catch (err) {
    console.warn("[tradeService] Guardado remoto falló, persistido en local:", err);
  }

  return newTrade;
}

/**
 * Ejecuta el Handshake transaccional ACID en PostgreSQL mediante RPC
 */
export async function confirmTradeHandshake(
  proposalId: string,
  userId: string
): Promise<{ success: boolean; estado: TradeStatus; mensaje: string }> {
  try {
    const { data, error } = await supabase.rpc("confirmar_handshake_trueque", {
      p_propuesta_id: proposalId,
    });

    if (!error && data) {
      // Sincronizar en caché local
      const local = getLocalTrades().map((t) => {
        if (t.id === proposalId) {
          const isProp = t.proponenteId === userId;
          return {
            ...t,
            confirmadoProponente: isProp ? true : t.confirmadoProponente,
            confirmadoReceptor: !isProp ? true : t.confirmadoReceptor,
            estado: data.estado as TradeStatus,
          };
        }
        return t;
      });
      saveLocalTrades(local);
      return data;
    }
  } catch (err) {
    console.warn("[tradeService] RPC en Supabase falló, aplicando handshake local:", err);
  }

  // Simulación transaccional local en caso de desconexión
  const local = getLocalTrades();
  const target = local.find((t) => t.id === proposalId);
  const isProp = target ? target.proponenteId === userId : false;
  const cProp = target ? (isProp ? true : target.confirmadoProponente) : false;
  const cRec = target ? (!isProp ? true : target.confirmadoReceptor) : false;
  const resultEstado: TradeStatus = cProp && cRec ? "completada" : "confirmado_parcial";

  const updated = local.map((t) => {
    if (t.id === proposalId) {
      return {
        ...t,
        confirmadoProponente: cProp,
        confirmadoReceptor: cRec,
        estado: resultEstado,
      };
    }
    return t;
  });
  saveLocalTrades(updated);

  return {
    success: true,
    estado: resultEstado,
    mensaje:
      resultEstado === "completada"
        ? "Trueque completado con éxito"
        : "Confirmación registrada",
  };
}

/**
 * Obtiene las propuestas de trueque del usuario
 */
export async function fetchUserTrades(userId: string): Promise<TradeProposal[]> {
  const local = getLocalTrades().filter(
    (t) => t.proponenteId === userId || t.receptorId === userId
  );

  try {
    const { data, error } = await supabase
      .from("propuesta_trueque")
      .select("*")
      .or(`proponente_id.eq.${userId},receptor_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const remote: TradeProposal[] = data.map((d: any) => ({
        id: d.id,
        proponenteId: d.proponente_id,
        receptorId: d.receptor_id,
        publicacionOfertadaId: d.publicacion_ofertada_id,
        publicacionSolicitadaId: d.publicacion_solicitada_id,
        tituloOfertado: d.titulo_ofertado,
        tituloSolicitado: d.titulo_solicitado,
        imagenOfertada: d.imagen_ofertada,
        imagenSolicitada: d.imagen_solicitada,
        puntoEncuentro: d.punto_encuentro,
        confirmadoProponente: d.confirmado_proponente,
        confirmadoReceptor: d.confirmado_receptor,
        estado: d.estado,
        createdAt: d.created_at,
        fechaCierre: d.fecha_cierre,
      }));

      const map = new Map<string, TradeProposal>();
      local.forEach((t) => map.set(t.id, t));
      remote.forEach((t) => map.set(t.id, t));
      const combined = Array.from(map.values());
      saveLocalTrades(combined);
      return combined;
    }
  } catch (err) {
    console.warn("[tradeService] Error al obtener propuestas de Supabase:", err);
  }

  return local;
}
