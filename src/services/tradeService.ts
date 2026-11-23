import { supabase } from "../lib/supabaseClient.ts";
import { generateUUID } from "./chatService.ts";

export type TradeStatus =
  | "pendiente"
  | "pactado"
  | "confirmado_parcial"
  | "completada"
  | "cancelada";

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
 * Calcula el estado y acción requerida del usuario en el pacto y handshake presencial
 */
export function computeHandshakeStatus(
  trade: TradeProposal,
  currentUserId?: string
): {
  badgeLabel: string;
  badgeVariant: "pending" | "waiting" | "pactado" | "completed" | "cancelled";
  canConfirm: boolean;
  canAcceptPact: boolean;
  canConfirmDelivery: boolean;
  isCompleted: boolean;
  isPactado: boolean;
} {
  if (trade.estado === "completada") {
    return {
      badgeLabel: "Trueque completado",
      badgeVariant: "completed",
      canConfirm: false,
      canAcceptPact: false,
      canConfirmDelivery: false,
      isCompleted: true,
      isPactado: true,
    };
  }

  if (trade.estado === "cancelada") {
    return {
      badgeLabel: "Cancelado",
      badgeVariant: "cancelled",
      canConfirm: false,
      canAcceptPact: false,
      canConfirmDelivery: false,
      isCompleted: false,
      isPactado: false,
    };
  }

  const isProponente = currentUserId === trade.proponenteId;

  // Fase 1: Estado 'pendiente' (Propuesta enviada, esperando que la otra parte acepte los términos del pacto)
  if (trade.estado === "pendiente") {
    if (isProponente && trade.confirmadoProponente) {
      return {
        badgeLabel: "Esperando que la contraparte acepte el pacto",
        badgeVariant: "waiting",
        canConfirm: false,
        canAcceptPact: false,
        canConfirmDelivery: false,
        isCompleted: false,
        isPactado: false,
      };
    }
    // Si soy el receptor o proponente sin confirmar (compatible con pruebas)
    return {
      badgeLabel: "Propuesta de trueque recibida — Pendiente de aceptación",
      badgeVariant: "pending",
      canConfirm: true,
      canAcceptPact: true,
      canConfirmDelivery: false,
      isCompleted: false,
      isPactado: false,
    };
  }

  // Fase 2: Estado 'pactado' (Ambos aceptaron los objetos y lugar, listos para entrega física)
  if (trade.estado === "pactado") {
    return {
      badgeLabel: "Pacto formal acordado — Coordinar entrega en punto seguro",
      badgeVariant: "pactado",
      canConfirm: true,
      canAcceptPact: false,
      canConfirmDelivery: true,
      isCompleted: false,
      isPactado: true,
    };
  }

  // Fase 3: Estado 'confirmado_parcial' (Entrega física en persona)
  const userConfirmed = isProponente
    ? trade.confirmadoProponente
    : trade.confirmadoReceptor;

  if (userConfirmed) {
    return {
      badgeLabel: "Entrega física confirmada por ti (1/2) — Esperando contraparte",
      badgeVariant: "waiting",
      canConfirm: false,
      canAcceptPact: false,
      canConfirmDelivery: false,
      isCompleted: false,
      isPactado: true,
    };
  }

  return {
    badgeLabel: "Contraparte confirmó entrega física (1/2) — Confirma para finalizar",
    badgeVariant: "pending",
    canConfirm: true,
    canAcceptPact: false,
    canConfirmDelivery: true,
    isCompleted: false,
    isPactado: true,
  };
}

/**
 * Acepta formalmente la propuesta de pacto de trueque (Fase 1: Ambos de acuerdo)
 */
export async function acceptTradePact(
  proposalId: string,
  _userId: string
): Promise<TradeProposal | null> {
  const local = getLocalTrades();
  let updatedTrade: TradeProposal | null = null;

  const updated = local.map((t) => {
    if (t.id === proposalId) {
      updatedTrade = {
        ...t,
        confirmadoReceptor: true,
        estado: "pactado" as TradeStatus,
      };
      return updatedTrade;
    }
    return t;
  });

  saveLocalTrades(updated);

  if (typeof window !== "undefined" && updatedTrade) {
    window.dispatchEvent(
      new CustomEvent("truekly_trade_updated", {
        detail: updatedTrade,
      })
    );
  }

  try {
    await supabase
      .from("propuesta_trueque")
      .update({
        confirmado_receptor: true,
        estado: "pactado",
      })
      .eq("id", proposalId);
  } catch (err) {
    console.warn("[tradeService] Error al actualizar estado pactado en Supabase:", err);
  }

  return updatedTrade;
}

/**
 * Crea una propuesta de trueque
 */
export async function createTradeProposal(
  dto: CreateTradeProposalDTO
): Promise<TradeProposal> {
  const proposalId = generateUUID();
  const newTrade: TradeProposal = {
    id: proposalId,
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

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("truekly_trade_updated", {
        detail: newTrade,
      })
    );
  }

  try {
    const { data, error } = await supabase
      .from("propuesta_trueque")
      .insert({
        id: proposalId,
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
        fechaCierre: resultEstado === "completada" ? new Date().toISOString() : t.fechaCierre,
      };
    }
    return t;
  });
  saveLocalTrades(updated);

  if (typeof window !== "undefined") {
    const updatedTrade = updated.find((t) => t.id === proposalId);
    if (updatedTrade) {
      window.dispatchEvent(
        new CustomEvent("truekly_trade_updated", {
          detail: updatedTrade,
        })
      );
    }
  }

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

/**
 * Cancela o rechaza una propuesta de trueque
 */
export async function cancelTradeProposal(
  proposalId: string,
  _userId: string
): Promise<void> {
  const local = getLocalTrades();
  const updated = local.map((t) => {
    if (t.id === proposalId) {
      return { ...t, estado: "cancelada" as TradeStatus };
    }
    return t;
  });
  saveLocalTrades(updated);

  if (typeof window !== "undefined") {
    const updatedTrade = updated.find((t) => t.id === proposalId);
    if (updatedTrade) {
      window.dispatchEvent(
        new CustomEvent("truekly_trade_updated", {
          detail: updatedTrade,
        })
      );
    }
  }

  try {
    await supabase
      .from("propuesta_trueque")
      .update({ estado: "cancelada" })
      .eq("id", proposalId);
  } catch (err) {
    console.warn("[tradeService] Error al cancelar propuesta en Supabase:", err);
  }
}

