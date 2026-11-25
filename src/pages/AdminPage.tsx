import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  MapPin,
  Repeat,
  RefreshCw,
  Clock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import type { Product } from "../data/mockProducts";
import {
  fetchPendingPublications,
  reviewPublication,
} from "../services/publicationService";

interface AdminPageProps {
  onBack?: () => void;
}

export default function AdminPage({ onBack }: AdminPageProps) {
  const { user } = useAuth();
  const [pending, setPending] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const loadPending = async () => {
    setLoading(true);
    const items = await fetchPendingPublications();
    setPending(items);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role === "admin") {
      loadPending();
    } else {
      setLoading(false);
    }
  }, [user?.role]);

  const handleBack = () => {
    if (onBack) onBack();
    else window.location.hash = "#feed";
  };

  const handleDecision = async (id: string, decision: "aprobada" | "rechazada") => {
    setProcessingId(id);
    setFeedback(null);
    const motivo = decision === "rechazada" ? rejectReasons[id] : undefined;
    const res = await reviewPublication(id, decision, motivo);
    setProcessingId(null);

    if (!res.ok) {
      setFeedback({ type: "err", text: res.error || "No se pudo procesar la revisión." });
      return;
    }

    setPending((prev) => prev.filter((item) => item.id !== id));
    setFeedback({
      type: "ok",
      text:
        decision === "aprobada"
          ? "Publicación aprobada: ya aparece en el feed y se notificó al autor."
          : "Publicación rechazada: no se publicará y se notificó al autor.",
    });
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-paper dark:bg-[#0C0E0D] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-line dark:border-white/10 bg-white dark:bg-[#121413] p-6 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-base font-bold text-ink dark:text-white">
            Acceso restringido a administradores
          </h1>
          <p className="text-xs text-sage-500 dark:text-white/60">
            Esta sección es exclusiva para la cuenta de moderación de Truekly.
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 rounded-xl bg-jade-600 px-4 py-2 text-xs font-semibold text-white hover:bg-jade-700"
          >
            <ArrowLeft size={14} />
            Volver al Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-[#0C0E0D] text-ink dark:text-white">
      <header className="sticky top-0 z-20 border-b border-line dark:border-white/10 bg-white/95 dark:bg-[#0C0E0D]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line dark:border-white/10 bg-paper dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-ink dark:text-white hover:bg-white dark:hover:bg-white/10"
            >
              <ArrowLeft size={14} />
              <span>Feed</span>
            </button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-jade-600 dark:text-jade-400" />
              <div>
                <h1 className="text-sm font-bold leading-tight">Panel de Moderación</h1>
                <p className="text-[11px] text-sage-500 dark:text-white/50">
                  Solicitudes de publicación pendientes ({pending.length})
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={loadPending}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line dark:border-white/10 bg-white dark:bg-[#141715] px-3 py-1.5 text-xs font-semibold hover:bg-paper dark:hover:bg-white/10 disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Actualizar</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-8 space-y-5">
        {feedback && (
          <div
            role="status"
            className={`rounded-xl border px-4 py-3 text-xs font-medium ${
              feedback.type === "ok"
                ? "border-jade-200 bg-jade-50 text-jade-800 dark:border-jade-500/30 dark:bg-jade-950/30 dark:text-jade-300"
                : "border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-300"
            }`}
          >
            {feedback.text}
          </div>
        )}

        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-jade-600 border-t-transparent" />
          </div>
        ) : pending.length === 0 ? (
          <div className="rounded-2xl border border-line dark:border-white/10 bg-white dark:bg-[#121413] p-10 text-center space-y-2">
            <Clock className="mx-auto h-8 w-8 text-sage-400" />
            <h2 className="text-sm font-bold">No hay solicitudes pendientes</h2>
            <p className="text-xs text-sage-500 dark:text-white/50">
              Cuando un usuario envíe una nueva publicación, aparecerá aquí para tu revisión.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {pending.map((item) => {
              const busy = processingId === item.id;
              const photos = item.gallery && item.gallery.length > 0 ? item.gallery : [item.image];
              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-line dark:border-white/10 bg-white dark:bg-[#121413] p-4 sm:p-5 space-y-4 shadow-xs"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line dark:border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.owner.avatar}
                        alt={item.owner.name}
                        className="h-9 w-9 rounded-full object-cover border border-line"
                      />
                      <div>
                        <p className="text-xs font-bold">{item.owner.name}</p>
                        <p className="text-[11px] text-sage-500 dark:text-white/50 flex items-center gap-1">
                          <MapPin size={11} />
                          {item.zone} · {item.safePointRecommended}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="rounded-full bg-paper dark:bg-white/10 px-2.5 py-0.5 font-medium">
                        {item.category}
                      </span>
                      <span className="rounded-full bg-jade-50 dark:bg-jade-500/10 text-jade-700 dark:text-jade-400 px-2.5 py-0.5 font-semibold">
                        {item.condition}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-5 grid grid-cols-3 gap-2">
                      {photos.slice(0, 6).map((src, idx) => (
                        <img
                          key={`${item.id}-img-${idx}`}
                          src={src}
                          alt={`${item.title} ${idx + 1}`}
                          className="aspect-square w-full rounded-xl object-cover border border-line dark:border-white/10 bg-paper"
                        />
                      ))}
                    </div>

                    <div className="md:col-span-7 space-y-3">
                      <div>
                        <h2 className="text-base font-bold">{item.title}</h2>
                        <p className="mt-1 text-xs leading-relaxed text-ink-soft dark:text-white/80">
                          {item.description || "Sin descripción adicional."}
                        </p>
                      </div>

                      <div className="rounded-xl border border-line dark:border-white/10 bg-paper/60 dark:bg-white/5 p-3">
                        <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-sage-500 dark:text-white/60">
                          <Repeat size={12} className="text-jade-500" />
                          Busca a cambio:
                        </span>
                        <p className="mt-1 text-xs font-medium">{item.wantsInReturn}</p>
                      </div>

                      <div className="pt-1 space-y-2.5">
                        <input
                          type="text"
                          value={rejectReasons[item.id] || ""}
                          onChange={(e) =>
                            setRejectReasons((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          placeholder="Motivo de rechazo (opcional, se enviará al usuario si rechazas)"
                          className="w-full rounded-xl border border-line dark:border-white/10 bg-paper dark:bg-[#181C1A] px-3 py-2 text-xs outline-none focus:border-jade-500"
                        />
                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleDecision(item.id, "aprobada")}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-jade-600 px-4 py-2 text-xs font-semibold text-white hover:bg-jade-700 disabled:opacity-50"
                          >
                            <CheckCircle2 size={14} />
                            <span>{busy ? "Procesando..." : "Aprobar y publicar"}</span>
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleDecision(item.id, "rechazada")}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-950/30 px-4 py-2 text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/50 disabled:opacity-50"
                          >
                            <XCircle size={14} />
                            <span>Rechazar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
