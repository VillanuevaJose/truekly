import { supabase } from "../lib/supabaseClient.ts";
import type { Product, Category, Condition } from "../data/mockProducts.ts";

const STORAGE_KEY = "truekly_user_publications";

export interface PublicationRow {
  id: string;
  user_id: string | null;
  title: string;
  category: string;
  condition: string;
  wants_in_return: string;
  description: string;
  zone: string;
  safe_point_recommended: string | null;
  image: string;
  gallery: string[];
  owner_name: string;
  owner_avatar: string | null;
  owner_verified: boolean;
  estado_revision?: "pendiente" | "aprobada" | "rechazada";
  motivo_rechazo?: string | null;
  created_at?: string;
}

export function mapRowToProduct(row: PublicationRow): Product {
  return {
    id: row.id,
    title: row.title,
    category: row.category as Category,
    condition: row.condition as Condition,
    wantsInReturn: row.wants_in_return,
    description: row.description,
    zone: row.zone,
    safePointRecommended: row.safe_point_recommended || "Punto acordado por chat",
    image: row.image,
    gallery: row.gallery && row.gallery.length > 0 ? row.gallery : [row.image],
    rating: 0,
    exchangesCount: 0,
    owner: {
      name: row.owner_name,
      avatar: row.owner_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      verified: row.owner_verified,
    },
    isFeatured: true,
    userId: row.user_id || undefined,
    estadoRevision: row.estado_revision || "aprobada",
    motivoRechazo: row.motivo_rechazo || undefined,
  };
}

function getLocalPublications(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
}

function saveLocalPublications(items: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn("[publicationService] Error al guardar en localStorage:", err);
  }
}

/**
 * Obtiene todas las publicaciones de Supabase y las combina con el almacenamiento local
 */
export async function fetchPublications(): Promise<Product[]> {
  const localItems = getLocalPublications().filter(
    (p) => !p.estadoRevision || p.estadoRevision === "aprobada"
  );

  try {
    const { data, error } = await supabase
      .from("publicacion")
      .select("*")
      .eq("estado_revision", "aprobada")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const remoteItems = (data as PublicationRow[]).map(mapRowToProduct);
      const map = new Map<string, Product>();
      localItems.forEach((item) => map.set(item.id, item));
      remoteItems.forEach((item) => map.set(item.id, item));
      const combined = Array.from(map.values());
      return combined;
    }
  } catch (err) {
    console.warn("[publicationService] Supabase no disponible, usando cache local:", err);
  }

  return localItems;
}

export async function fetchMyPublications(userId: string): Promise<Product[]> {
  if (!userId) return [];
  const localMine = getLocalPublications().filter((p) => p.userId === userId);
  try {
    const { data, error } = await supabase
      .from("publicacion")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error && data) {
      return (data as PublicationRow[]).map(mapRowToProduct);
    }
  } catch {
    // fallback local
  }
  return localMine;
}

export async function fetchPendingPublications(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("publicacion")
      .select("*")
      .eq("estado_revision", "pendiente")
      .order("created_at", { ascending: true });

    if (!error && data) {
      return (data as PublicationRow[]).map(mapRowToProduct);
    }
  } catch (err) {
    console.warn("[publicationService] Error al listar publicaciones pendientes:", err);
  }
  return [];
}

export async function reviewPublication(
  publicationId: string,
  decision: "aprobada" | "rechazada",
  motivo?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.rpc("revisar_publicacion", {
      p_publicacion_id: publicationId,
      p_decision: decision,
      p_motivo: motivo?.trim() || null,
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    const local = getLocalPublications();
    saveLocalPublications(
      local.map((p) =>
        p.id === publicationId
          ? { ...p, estadoRevision: decision, motivoRechazo: motivo?.trim() || undefined }
          : p
      )
    );
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error inesperado" };
  }
}

export function buildRowPayload(p: Product, uid: string | null): PublicationRow {
  return {
    id: p.id,
    user_id: uid,
    title: p.title,
    category: p.category,
    condition: p.condition,
    wants_in_return: p.wantsInReturn,
    description: p.description || "",
    zone: p.zone,
    safe_point_recommended: p.safePointRecommended || null,
    image: p.image,
    gallery: p.gallery || [p.image],
    owner_name: p.owner.name,
    owner_avatar: p.owner.avatar || null,
    owner_verified: Boolean(p.owner.verified),
    estado_revision: p.estadoRevision || "pendiente",
    motivo_rechazo: p.motivoRechazo || null,
  };
}

/**
 * Guarda una nueva publicación en Supabase (tabla publicacion) y en la caché local
 */
export async function savePublication(product: Product, userId?: string): Promise<Product> {
  const localList = getLocalPublications();

  // Obtener el ID de usuario autenticado real desde Supabase si no viene provisto
  let currentUserId = userId || product.userId;
  if (!currentUserId) {
    try {
      const { data: authData } = await supabase.auth.getUser();
      currentUserId = authData?.user?.id;
    } catch {
      // ignore
    }
  }

  const productWithUser: Product = {
    ...product,
    userId: currentUserId || product.userId,
  };

  saveLocalPublications([productWithUser, ...localList.filter((p) => p.id !== product.id)]);

  try {
    const rowPayload = buildRowPayload(productWithUser, currentUserId || null);
    const { error } = await supabase.from("publicacion").upsert(rowPayload);
    if (error) {
      console.warn("[publicationService] Error al insertar en Supabase (usando fallback local):", error.message);
    }
  } catch (err) {
    console.warn("[publicationService] Excepción al guardar en base de datos:", err);
  }

  return productWithUser;
}

/**
 * Sincroniza publicaciones creadas localmente hacia Supabase cuando la tabla esté disponible
 */
export async function syncLocalPublications(): Promise<void> {
  const localItems = getLocalPublications();
  if (localItems.length === 0) return;

  try {
    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData?.user?.id;
    if (!currentUserId) return;

    for (const item of localItems) {
      if (!item.userId || item.userId === currentUserId) {
        const payload = buildRowPayload(item, currentUserId);
        await supabase.from("publicacion").upsert(payload);
      }
    }
  } catch (err) {
    console.warn("[publicationService] Error en syncLocalPublications:", err);
  }
}

/**
 * Elimina una publicación de Supabase y de la memoria local
 */
export async function removePublication(productId: string): Promise<boolean> {
  const current = getLocalPublications();
  const filtered = current.filter((p) => p.id !== productId);
  saveLocalPublications(filtered);

  try {
    const { error } = await supabase.from("publicacion").delete().eq("id", productId);
    if (error) {
      console.warn("[publicationService] Error al borrar en Supabase:", error.message);
    }
    return true;
  } catch (err) {
    console.warn("[publicationService] Excepción al borrar en base de datos:", err);
    return true;
  }
}
