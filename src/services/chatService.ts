import { supabase } from "../lib/supabaseClient.ts";

export interface TradeChatMessage {
  id: string;
  publicacionId: string;
  emisorId: string;
  emisorNombre?: string;
  receptorId: string | null;
  contenido: string;
  multimediaUrl?: string;
  multimediaTipo?: "imagen" | "video";
  leido: boolean;
  createdAt: string;
}

export interface SendMessageDTO {
  publicacionId: string;
  emisorId: string;
  emisorNombre?: string;
  receptorId: string | null;
  contenido: string;
  multimediaUrl?: string;
  multimediaTipo?: "imagen" | "video";
}

export interface ConversationSummary {
  publicacionId: string;
  tituloPublicacion: string;
  imagenPublicacion: string;
  interlocutorId: string;
  interlocutorNombre: string;
  interlocutorAvatar?: string;
  ultimoMensaje: string;
  ultimaFecha: string;
  noLeidos: number;
}

const STORAGE_KEY = "truekly_trade_chat_messages";
const USER_NAMES_KEY = "truekly_user_names_cache";
let memoryStorage: TradeChatMessage[] = [];

export function cacheUserName(userId: string, name: string): void {
  if (!userId || !name || typeof window === "undefined" || !window.localStorage) return;
  try {
    const raw = localStorage.getItem(USER_NAMES_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[userId] = name;
    localStorage.setItem(USER_NAMES_KEY, JSON.stringify(map));
  } catch {}
}

export function getCachedUserName(userId: string): string | undefined {
  if (!userId || typeof window === "undefined" || !window.localStorage) return undefined;
  try {
    const raw = localStorage.getItem(USER_NAMES_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map[userId];
  } catch {
    return undefined;
  }
}

/**
 * Generador seguro de UUID v4 estándar compatible con PostgreSQL y navegadores
 */
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Valida el contenido de un mensaje antes de su transmisión
 */
export function validateMessageContent(
  content: string,
  hasMedia = false
): { valid: boolean; error?: string } {
  const trimmed = content.trim();
  if (trimmed.length === 0 && !hasMedia) {
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
 * Envía un mensaje con UUID válido a Supabase y caché local
 */
export async function sendChatMessage(dto: SendMessageDTO): Promise<TradeChatMessage> {
  const hasMedia = Boolean(dto.multimediaUrl);
  const validation = validateMessageContent(dto.contenido, hasMedia);
  if (!validation.valid) {
    throw new Error(validation.error || "Mensaje inválido");
  }

  const cleanContent = dto.contenido.trim();
  const validId = generateUUID();

  const newMessage: TradeChatMessage = {
    id: validId,
    publicacionId: dto.publicacionId,
    emisorId: dto.emisorId,
    emisorNombre: dto.emisorNombre || "Usuario",
    receptorId: dto.receptorId,
    contenido: cleanContent || (dto.multimediaTipo === "video" ? "🎥 Video adjunto" : "📷 Foto adjunta"),
    multimediaUrl: dto.multimediaUrl,
    multimediaTipo: dto.multimediaTipo,
    leido: false,
    createdAt: new Date().toISOString(),
  };

  const current = getLocalMessages();
  saveLocalMessages([...current, newMessage]);
  if (dto.emisorId && dto.emisorNombre) {
    cacheUserName(dto.emisorId, dto.emisorNombre);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("truekly_chat_message", {
        detail: newMessage,
      })
    );
  }

  // Persistir en Supabase con UUID válido y soporte multimedia
  try {
    const payload: Record<string, any> = {
      id: validId,
      publicacion_id: dto.publicacionId,
      emisor_id: dto.emisorId,
      receptor_id: dto.receptorId || null,
      contenido: newMessage.contenido,
      leido: false,
    };

    if (dto.multimediaUrl) {
      payload.multimedia_url = dto.multimediaUrl;
      payload.multimedia_tipo = dto.multimediaTipo || "imagen";
    }

    let { data, error } = await supabase
      .from("mensaje_trueque")
      .insert(payload)
      .select()
      .single();

    // Fallback defensivo si la columna multimedia_url no ha sido agregada en Supabase
    if (error && (error.code === "PGRST204" || error.message?.includes("multimedia_url"))) {
      console.warn("[chatService] Columna multimedia_url no existe aún en Supabase, guardando campos estándar.");
      delete payload.multimedia_url;
      delete payload.multimedia_tipo;
      const retry = await supabase
        .from("mensaje_trueque")
        .insert(payload)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (!error && data) {
      return {
        ...newMessage,
        id: data.id,
        createdAt: data.created_at,
      };
    } else if (error) {
      console.error("[chatService] Error Supabase al insertar mensaje:", error.message);
    }
  } catch (err) {
    console.warn("[chatService] Fallback local activo:", err);
  }

  return newMessage;
}

/**
 * Marca mensajes de una conversación como leídos
 */
export async function markMessagesAsRead(
  publicacionId: string,
  currentUserId: string
): Promise<void> {
  if (!publicacionId || !currentUserId) return;

  const current = getLocalMessages();
  let changed = false;
  const updated = current.map((m) => {
    if (m.publicacionId === publicacionId && m.emisorId !== currentUserId && !m.leido) {
      changed = true;
      return { ...m, leido: true };
    }
    return m;
  });

  if (changed) {
    saveLocalMessages(updated);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("truekly_chat_read", {
          detail: { publicacionId },
        })
      );
    }
  }

  try {
    await supabase
      .from("mensaje_trueque")
      .update({ leido: true })
      .eq("publicacion_id", publicacionId)
      .neq("emisor_id", currentUserId)
      .eq("leido", false);
  } catch (err) {
    console.warn("[chatService] Error al marcar leídos en Supabase:", err);
  }
}

/**
 * Obtiene el historial de mensajes de una publicación consultando Supabase y local
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
      query = query.or(`emisor_id.eq.${userId},receptor_id.eq.${userId},receptor_id.is.null`);
    }

    const { data, error } = await query;

    if (!error && data) {
      const remote: TradeChatMessage[] = data.map((d: any) => ({
        id: d.id,
        publicacionId: d.publicacion_id,
        emisorId: d.emisor_id,
        receptorId: d.receptor_id,
        contenido: d.contenido,
        multimediaUrl: d.multimedia_url || undefined,
        multimediaTipo: d.multimedia_tipo || undefined,
        leido: d.leido,
        createdAt: d.created_at,
      }));

      const map = new Map<string, TradeChatMessage>();
      local.forEach((m) => map.set(m.id, m));
      remote.forEach((m) => {
        const existing = map.get(m.id);
        const resolvedName =
          existing?.emisorNombre ||
          getCachedUserName(m.emisorId) ||
          (userId && m.emisorId === userId ? "Tú" : undefined);

        map.set(m.id, {
          ...m,
          multimediaUrl: m.multimediaUrl || existing?.multimediaUrl,
          multimediaTipo: m.multimediaTipo || existing?.multimediaTipo,
          emisorNombre: resolvedName || m.emisorNombre,
        });
      });

      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      saveLocalMessages(merged);
      return merged;
    }
  } catch (err) {
    console.warn("[chatService] Consulta Supabase falló, usando local:", err);
  }

  return local.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

/**
 * Obtiene todas las conversaciones activas para la pantalla completa de mensajes
 */
export async function fetchAllUserConversations(
  userId: string
): Promise<TradeChatMessage[]> {
  const local = getLocalMessages().filter(
    (m) => m.emisorId === userId || m.receptorId === userId || !m.receptorId
  );

  try {
    const { data, error } = await supabase
      .from("mensaje_trueque")
      .select("*")
      .or(`emisor_id.eq.${userId},receptor_id.eq.${userId},receptor_id.is.null`)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const remote: TradeChatMessage[] = data.map((d: any) => ({
        id: d.id,
        publicacionId: d.publicacion_id,
        emisorId: d.emisor_id,
        receptorId: d.receptor_id,
        contenido: d.contenido,
        multimediaUrl: d.multimedia_url || undefined,
        multimediaTipo: d.multimedia_tipo || undefined,
        leido: d.leido,
        createdAt: d.created_at,
      }));

      const map = new Map<string, TradeChatMessage>();
      local.forEach((m) => map.set(m.id, m));
      remote.forEach((m) => {
        const existing = map.get(m.id);
        const resolvedName =
          existing?.emisorNombre ||
          getCachedUserName(m.emisorId) ||
          (m.emisorId === userId ? "Tú" : undefined);

        map.set(m.id, {
          ...m,
          multimediaUrl: m.multimediaUrl || existing?.multimediaUrl,
          multimediaTipo: m.multimediaTipo || existing?.multimediaTipo,
          emisorNombre: resolvedName || m.emisorNombre,
        });
      });
      const combined = Array.from(map.values()).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      saveLocalMessages(combined);
      return combined;
    }
  } catch (err) {
    console.warn("[chatService] Error al obtener conversaciones globales:", err);
  }

  return local;
}

/**
 * Suscripción reactiva para recibir mensajes en tiempo real (Realtime + Polling fallback)
 */
export function subscribeToTradeChat(
  publicacionId: string,
  onMessageReceived: (message: TradeChatMessage) => void
): () => void {
  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<TradeChatMessage>;
    if (custom.detail && (!publicacionId || custom.detail.publicacionId === publicacionId)) {
      onMessageReceived(custom.detail);
    }
  };

  const handleReadEvent = (e: Event) => {
    const custom = e as CustomEvent<{ publicacionId: string }>;
    if (custom.detail && (!publicacionId || custom.detail.publicacionId === publicacionId)) {
      const local = getLocalMessages();
      const last = local[local.length - 1];
      if (last) onMessageReceived(last);
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed: TradeChatMessage[] = JSON.parse(e.newValue);
        const last = parsed[parsed.length - 1];
        if (last && (!publicacionId || last.publicacionId === publicacionId)) {
          onMessageReceived(last);
        }
      } catch {}
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("truekly_chat_message", handleCustomEvent);
    window.addEventListener("truekly_chat_read", handleReadEvent);
    window.addEventListener("storage", handleStorageEvent);
  }

  // Canal Realtime de Supabase (solo en entorno navegador)
  let channel: any = null;
  if (typeof window !== "undefined") {
    try {
      const filterStr = publicacionId ? `publicacion_id=eq.${publicacionId}` : undefined;
      channel = supabase
        .channel(`chat_sub_${publicacionId || "global"}_${Date.now()}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "mensaje_trueque",
            filter: filterStr,
          },
          (payload: any) => {
            if (payload.new) {
              onMessageReceived({
                id: payload.new.id,
                publicacionId: payload.new.publicacion_id,
                emisorId: payload.new.emisor_id,
                receptorId: payload.new.receptor_id,
                contenido: payload.new.contenido,
                multimediaUrl: payload.new.multimedia_url || undefined,
                multimediaTipo: payload.new.multimedia_tipo || undefined,
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
  }

  // Polling de respaldo cada 2.5 segundos para sincronizar pestañas de incógnito
  let pollInterval: any = null;
  if (typeof window !== "undefined") {
    pollInterval = setInterval(async () => {
      try {
        if (!publicacionId) return;
        const latest = await fetchMessagesByPublication(publicacionId);
        if (latest.length > 0) {
          const lastMsg = latest[latest.length - 1];
          onMessageReceived(lastMsg);
        }
      } catch {}
    }, 2500);

    if (pollInterval && typeof pollInterval.unref === "function") {
      pollInterval.unref();
    }
  }

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("truekly_chat_message", handleCustomEvent);
      window.removeEventListener("truekly_chat_read", handleReadEvent);
      window.removeEventListener("storage", handleStorageEvent);
      if (pollInterval) clearInterval(pollInterval);
    }
    if (channel) {
      supabase.removeChannel(channel);
    }
  };
}
