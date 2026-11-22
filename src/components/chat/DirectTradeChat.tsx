import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  ShieldCheck,
  Repeat,
  MapPin,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type { Product } from "../../data/mockProducts";
import {
  sendChatMessage,
  fetchMessagesByPublication,
  subscribeToTradeChat,
  formatMessageTime,
  type TradeChatMessage,
} from "../../services/chatService";
import {
  computeHandshakeStatus,
  type TradeProposal,
} from "../../services/tradeService";

interface DirectTradeChatProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  currentUserId?: string;
  currentUserName?: string;
  activeTrade?: TradeProposal | null;
  onOpenTradeModal?: () => void;
  onConfirmTrade?: (tradeId: string) => Promise<void>;
}

export function DirectTradeChat({
  isOpen,
  onClose,
  product,
  currentUserId,
  currentUserName,
  activeTrade,
  onOpenTradeModal,
  onConfirmTrade,
}: DirectTradeChatProps) {
  const [messages, setMessages] = useState<TradeChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isOwner = Boolean(currentUserId && product.userId === currentUserId);
  const otherUserName = isOwner ? "Interesado en tu artículo" : product.owner.name;

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    fetchMessagesByPublication(product.id, currentUserId).then((initial) => {
      if (isMounted) {
        setMessages(initial);
      }
    });

    const unsubscribe = subscribeToTradeChat(product.id, (incoming) => {
      if (!isMounted) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === incoming.id)) return prev;
        return [...prev, incoming];
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isOpen, product.id, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending || !currentUserId) return;

    setIsSending(true);
    try {
      const recipientId = isOwner ? null : product.userId || null;
      const sent = await sendChatMessage({
        publicacionId: product.id,
        emisorId: currentUserId,
        emisorNombre: currentUserName || "Usuario",
        receptorId: recipientId,
        contenido: text,
      });
      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
      setInputText("");
    } catch (err) {
      console.error("[DirectTradeChat] Error al enviar mensaje:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handshakeStatus = activeTrade
    ? computeHandshakeStatus(activeTrade, currentUserId)
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-ink/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-partner-name"
    >
      <div className="relative flex h-[92vh] max-h-[640px] w-full max-w-xl flex-col rounded-2xl border border-line bg-paper shadow-2xl overflow-hidden font-sans">
        {/* Cabecera del Chat */}
        <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-line bg-paper">
              <img
                src={product.owner.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                alt={otherUserName}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 id="chat-partner-name" className="text-sm font-bold text-ink truncate">
                  {otherUserName}
                </h3>
                <span
                  title="Perfil Verificado con DNI"
                  className="inline-flex items-center text-jade-600"
                >
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>
              <p className="text-[11px] text-sage-500 truncate">
                {isOwner ? "Negociando tu publicación" : `Publicó: ${product.title}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar chat"
            className="rounded-xl p-2 text-sage-500 hover:bg-paper hover:text-ink transition-colors"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Banner de Contexto de Negociación */}
        <div className="flex items-center justify-between gap-3 border-b border-line bg-[#F2F5F3] px-4 py-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={product.image}
              alt=""
              className="h-8 w-8 rounded-lg border border-line object-cover shrink-0"
            />
            <div className="min-w-0 truncate">
              <span className="font-semibold text-ink truncate block">
                {product.title}
              </span>
              <span className="text-[11px] text-sage-600 truncate block">
                Busca a cambio: {product.wantsInReturn}
              </span>
            </div>
          </div>

          {!activeTrade && onOpenTradeModal && !isOwner && (
            <button
              type="button"
              onClick={onOpenTradeModal}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-jade-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-2xs hover:bg-jade-700 transition"
            >
              <Repeat className="h-3 w-3" aria-hidden="true" />
              <span>Proponer trueque</span>
            </button>
          )}
        </div>

        {/* Tarjeta de Estado del Handshake si ya existe acuerdo */}
        {activeTrade && handshakeStatus && (
          <div className="border-b border-line bg-amber-50/70 px-4 py-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                  <Repeat className="h-3.5 w-3.5 text-amber-700" />
                  <span>Acuerdo de trueque en curso</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-amber-800">
                  <MapPin className="h-3 w-3 text-amber-700" />
                  <span>Punto seguro: {activeTrade.puntoEncuentro}</span>
                </div>
              </div>

              {handshakeStatus.canConfirm && onConfirmTrade && currentUserId ? (
                <button
                  type="button"
                  disabled={isConfirming}
                  onClick={async () => {
                    setIsConfirming(true);
                    try {
                      await onConfirmTrade(activeTrade.id);
                    } finally {
                      setIsConfirming(false);
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-jade-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-jade-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{isConfirming ? "Confirmando..." : "Confirmar entrega"}</span>
                </button>
              ) : (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                    handshakeStatus.badgeVariant === "completed"
                      ? "bg-jade-50 text-jade-700 border-jade-200"
                      : "bg-amber-100 text-amber-800 border-amber-300"
                  }`}
                >
                  {handshakeStatus.badgeLabel}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Lista de Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-6 text-sage-500">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-jade-50 text-jade-600 mb-3">
                <Repeat className="h-6 w-6" aria-hidden="true" />
              </div>
              <h4 className="text-sm font-semibold text-ink">Inicia la conversación</h4>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-sage-500">
                Pacta detalles del objeto y coordinen el encuentro en un punto seguro de Chimbote.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.emisorId === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
                      isMine
                        ? "bg-jade-600 text-white rounded-tr-xs"
                        : "bg-white text-ink border border-line rounded-tl-xs"
                    }`}
                  >
                    {!isMine && (
                      <span className="block text-[10px] font-bold text-jade-700 mb-0.5">
                        {msg.emisorNombre || "Contraparte"}
                      </span>
                    )}
                    <p className="whitespace-pre-wrap">{msg.contenido}</p>
                    <div
                      className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${
                        isMine ? "text-white/80" : "text-sage-400"
                      }`}
                    >
                      <Clock className="h-2.5 w-2.5" />
                      <span>{formatMessageTime(msg.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de Mensaje */}
        <form
          onSubmit={handleSendMessage}
          className="border-t border-line bg-white p-3 sm:px-4"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe un mensaje para coordinar..."
              className="flex-1 rounded-xl border border-line bg-paper px-3.5 py-2 text-xs text-ink placeholder:text-sage-400 focus:border-jade-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-jade-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending || !currentUserId}
              aria-label="Enviar mensaje"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-jade-600 text-white shadow-2xs transition hover:bg-jade-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-jade-500"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
