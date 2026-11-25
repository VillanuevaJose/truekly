import { supabase } from "../lib/supabaseClient.ts";

export interface AppNotification {
  id: string;
  usuarioId: string;
  tipo: string;
  contenido: string;
  leida: boolean;
  fecha: string;
}

interface NotificationRow {
  id: string;
  usuario_id: string;
  tipo: string;
  contenido: string;
  leida: boolean;
  fecha: string;
}

function mapNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    usuarioId: row.usuario_id,
    tipo: row.tipo,
    contenido: row.contenido,
    leida: row.leida,
    fecha: row.fecha,
  };
}

export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from("notificacion")
      .select("*")
      .eq("usuario_id", userId)
      .order("fecha", { ascending: false })
      .limit(30);

    if (error || !data) return [];
    return (data as NotificationRow[]).map(mapNotification);
  } catch {
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await supabase
      .from("notificacion")
      .update({ leida: true })
      .eq("id", notificationId);
  } catch {
    // ignore
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  if (!userId) return;
  try {
    await supabase
      .from("notificacion")
      .update({ leida: true })
      .eq("usuario_id", userId)
      .eq("leida", false);
  } catch {
    // ignore
  }
}
