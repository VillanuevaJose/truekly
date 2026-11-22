import { supabase } from "../lib/supabaseClient.ts";

export interface TradeChatMessage {
  id: string;
  publicacionId: string;
  emisorId: string;
  emisorNombre?: string;
  receptorId: string | null;
  contenido: string;
  leido: boolean;
  createdAt: string;
}

export interface SendMessageDTO {
  publicacionId: string;
  emisorId: string;
  emisorNombre?: string;
  receptorId: string | null;
  contenido: string;
}

const STORAGE_KEY = "truekly_trade_chat_messages";
let memoryStorage: TradeChatMessage[] = [];

/**
 * Valida el contenido de un mensaje antes de su transmisión
 */
export function validateMessageContent(content: string): { valid: boolean; error?: string } {
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: "El mensaje no puede estar vacío" };
  }
  if (trimmed.length > 2000) {
    return { valid: false, error: "El mensaje excede el límite de 2000 caracteres" };
  }
  return { valid: true };
}

/**
 * Formatea la hora del mensaje para la interfaz (HH:mm)
 */
export function formatMessageTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  } catch {
    return "";
  }
}

/**
 * Filtra mensajes visibles para un usuario dentro de un contexto de publicación
 */
export function filterMessagesForUser(
  messages: TradeChatMessage[],
  userId?: string,
  publicacionId?: string
): TradeChatMessage[] {
  return messages.filter((m) => {
    if (publicacionId && m.publicacionId !== publicacionId) return false;
    if (!userId) return true;
    return m.emisorId === userId || m.receptorId === userId || !m.receptorId;
  });
}

function getLocalMessages(): TradeChatMessage[] {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as TradeChatMessage[]) : [];
    } catch {
      return [];
    }
  }
  return memoryStorage;
}

function saveLocalMessages(messages: TradeChatMessage[]): void {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (err) {
      console.warn("[chatService] Error al guardar en localStorage:", err);
    }
  } else {
    memoryStorage = [...messages];
  }
}

/**
 * Envía un mensaje y sincroniza en local y remoto
 */
export async function sendChatMessage(dto: SendMessageDTO): Promise<TradeChatMessage> {
  const validation = validateMessageContent(dto.contenido);
  if (!validation.valid) {
    throw new Error(validation.error || "Mensaje inválido");
  }

  const cleanContent = dto.contenido.trim();
  const newMessage: TradeChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    publicacionId: dto.publicacionId,
    emisorId: dto.emisorId,
    emisorNombre: dto.emisorNombre || "Usuario",
    receptorId: dto.receptorId,
    contenido: cleanContent,
    leido: false,
    createdAt: new Date().toISOString(),
  };

  const current = getLocalMessages();
  saveLocalMessages([...current, newMessage]);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("truekly_chat_message", {
        detail: newMessage,
      })
    );
  }

  // Persistencia en Supabase
  try {
    const { data, error } = await supabase
      .from("mensaje_trueque")
      .insert({
        id: newMessage.id,
        publicacion_id: dto.publicacionId,
        emisor_id: dto.emisorId,
        receptor_id: dto.receptorId,
        contenido: cleanContent,
        leido: false,
      })
      .select()
      .single();

    if (!error && data) {
      return {
        ...newMessage,
        id: data.id,
        createdAt: data.created_at,
      };
    }
  } catch (err) {
    console.warn("[chatService] Supabase no disponible, guardado en fallback local:", err);
  }

  return newMessage;
}

/**
 * Obtiene el historial de mensajes de la publicación
 */
export async function fetchMessagesByPublication(
  publicacionId: string,
  userId?: string
): Promise<TradeChatMessage[]> {
  const local = filterMessagesForUser(getLocalMessages(), userId, publicacionId);

  try {
    let query = supabase
      .from("mensaje_trueque")
      .select("*")
      .eq("publicacion_id", publicacionId)
      .order("created_at", { ascending: true });

    if (userId) {
      query = query.or(`emisor_id.eq.${userId},receptor_id.eq.${userId}`);
    }

    const { data, error } = await query;

    if (!error && data) {
      const remote: TradeChatMessage[] = data.map((d: any) => ({
        id: d.id,
        publicacionId: d.publicacion_id,
        emisorId: d.emisor_id,
        receptorId: d.receptor_id,
        contenido: d.contenido,
        leido: d.leido,
        createdAt: d.created_at,
      }));

      const map = new Map<string, TradeChatMessage>();
      local.forEach((m) => map.set(m.id, m));
      remote.forEach((m) => {
        const existing = map.get(m.id);
        map.set(m.id, {
          ...m,
          emisorNombre: existing?.emisorNombre || m.emisorNombre,
        });
      });

      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      saveLocalMessages(merged);
      return merged;
    }
  } catch (err) {
    console.warn("[chatService] Error al consultar Supabase, usando local:", err);
  }

  return local.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

/**
 * Suscripción reactiva para recibir mensajes en tiempo real
 */
export function subscribeToTradeChat(
  publicacionId: string,
  onMessageReceived: (message: TradeChatMessage) => void
): () => void {
  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<TradeChatMessage>;
    if (custom.detail && custom.detail.publicacionId === publicacionId) {
      onMessageReceived(custom.detail);
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed: TradeChatMessage[] = JSON.parse(e.newValue);
        const last = parsed[parsed.length - 1];
        if (last && last.publicacionId === publicacionId) {
          onMessageReceived(last);
        }
      } catch {}
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("truekly_chat_message", handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);
  }

  let channel: any = null;
  try {
    channel = supabase
      .channel(`trade_chat_${publicacionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensaje_trueque",
          filter: `publicacion_id=eq.${publicacionId}`,
        },
        (payload: any) => {
          if (payload.new) {
            onMessageReceived({
              id: payload.new.id,
              publicacionId: payload.new.publicacion_id,
              emisorId: payload.new.emisor_id,
              receptorId: payload.new.receptor_id,
              contenido: payload.new.contenido,
              leido: payload.new.leido,
              createdAt: payload.new.created_at,
            });
          }
        }
      )
      .subscribe();
  } catch (err) {
    console.warn("[chatService] Canal Realtime falló:", err);
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("truekly_chat_message", handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    }
    if (channel) {
      supabase.removeChannel(channel);
    }
  };
}
