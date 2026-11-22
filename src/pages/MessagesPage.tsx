import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Send,
  ShieldCheck,
  Repeat,
  MapPin,
  CheckCircle2,
  Clock,
  MessageCircle,
  Search,
  Package,
  Check,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchPublications } from "../services/publicationService";
import type { Product } from "../data/mockProducts";
import {
  sendChatMessage,
  fetchMessagesByPublication,
  fetchAllUserConversations,
  subscribeToTradeChat,
  formatMessageTime,
  type TradeChatMessage,
} from "../services/chatService";
import {
  fetchUserTrades,
  confirmTradeHandshake,
  computeHandshakeStatus,
  type TradeProposal,
} from "../services/tradeService";

interface MessagesPageProps {
  onBack: () => void;
  initialPublicationId?: string | null;
  onSelectProduct?: (product: Product) => void;
}

interface ChatThread {
  publication: Product;
  lastMessage: TradeChatMessage;
  tradeProposal?: TradeProposal | null;
}

export default function MessagesPage({
  onBack,
  initialPublicationId,
}: MessagesPageProps) {
  const { user } = useAuth();
  const [publications, setPublications] = useState<Product[]>([]);
  const [allMessages, setAllMessages] = useState<TradeChatMessage[]>([]);
  const [userTrades, setUserTrades] = useState<TradeProposal[]>([]);
  const [selectedPubId, setSelectedPubId] = useState<string | null>(
    initialPublicationId || null
  );
  const [activeMessages, setActiveMessages] = useState<TradeChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Cargar publicaciones, mensajes del usuario y trueques
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetchPublications(),
      user?.id ? fetchAllUserConversations(user.id) : Promise.resolve([]),
      user?.id ? fetchUserTrades(user.id) : Promise.resolve([]),
    ]).then(([pubs, msgs, trades]) => {
      if (!isMounted) return;
      setPublications(pubs);
      setAllMessages(msgs);
      setUserTrades(trades);

      if (!selectedPubId && (initialPublicationId || msgs.length > 0)) {
        setSelectedPubId(initialPublicationId || msgs[0]?.publicacionId || null);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user?.id, initialPublicationId]);

  // 2. Suscribirse a mensajes en tiempo real
  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToTradeChat(selectedPubId || "", (incoming) => {
      setAllMessages((prev) => {
        if (prev.some((m) => m.id === incoming.id)) return prev;
        return [incoming, ...prev];
      });
      if (selectedPubId && incoming.publicacionId === selectedPubId) {
        setActiveMessages((prev) => {
          if (prev.some((m) => m.id === incoming.id)) return prev;
          return [...prev, incoming];
        });
      }
    });

    return () => {
      unsub();
    };
  }, [selectedPubId, user?.id]);

  // 3. Cargar mensajes del chat seleccionado
  useEffect(() => {
    if (!selectedPubId) {
      setActiveMessages([]);
      return;
    }
    let isMounted = true;
    fetchMessagesByPublication(selectedPubId, user?.id).then((msgs) => {
      if (isMounted) {
        setActiveMessages(msgs);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedPubId, user?.id]);

  // Auto-scroll al final del chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  // Construir la lista de hilos de conversación agrupados por publicación
  const threads: ChatThread[] = React.useMemo(() => {
    const threadMap = new Map<string, ChatThread>();

    // Añadir publicaciones con mensajes existentes
    for (const msg of allMessages) {
      if (!threadMap.has(msg.publicacionId)) {
        const pub = publications.find((p) => p.id === msg.publicacionId) || {
          id: msg.publicacionId,
          title: "Publicación de trueque",
          category: "Otros",
          condition: "Buen estado",
          zone: "Chimbote",
          wantsInReturn: "Objeto a coordinar",
          image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80",
          rating: 5.0,
          exchangesCount: 0,
          owner: {
            name: msg.emisorNombre || "Usuario",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
          },
        } as Product;

        const trade = userTrades.find(
          (t) =>
            t.publicacionSolicitadaId === msg.publicacionId ||
            t.publicacionOfertadaId === msg.publicacionId
        );

        threadMap.set(msg.publicacionId, {
          publication: pub,
          lastMessage: msg,
          tradeProposal: trade || null,
        });
      }
    }

    // Si hay un initialPublicationId seleccionado pero aún no tiene mensajes, agregarlo a la lista
    if (initialPublicationId && !threadMap.has(initialPublicationId)) {
      const pub = publications.find((p) => p.id === initialPublicationId);
      if (pub) {
        threadMap.set(initialPublicationId, {
          publication: pub,
          lastMessage: {
            id: "initial",
            publicacionId: pub.id,
            emisorId: "",
            receptorId: pub.userId || null,
            contenido: "Conversación iniciada. Envía un mensaje para coordinar.",
            leido: true,
            createdAt: new Date().toISOString(),
          },
          tradeProposal: userTrades.find(
            (t) =>
              t.publicacionSolicitadaId === pub.id ||
              t.publicacionOfertadaId === pub.id
          ),
        });
      }
    }

    const list = Array.from(threadMap.values());
    if (!searchTerm.trim()) return list;

    const term = searchTerm.toLowerCase();
    return list.filter(
      (t) =>
        t.publication.title.toLowerCase().includes(term) ||
        t.publication.owner.name.toLowerCase().includes(term) ||
        t.lastMessage.contenido.toLowerCase().includes(term)
    );
  }, [allMessages, publications, userTrades, initialPublicationId, searchTerm]);

  const selectedThread = threads.find((t) => t.publication.id === selectedPubId);
  const selectedProduct = selectedThread?.publication;
  const activeTrade = selectedThread?.tradeProposal;

  const isOwner = Boolean(
    user?.id && selectedProduct?.userId && selectedProduct.userId === user.id
  );
  const otherUserName = isOwner
    ? selectedThread?.lastMessage.emisorNombre || "Interesado en tu artículo"
    : selectedProduct?.owner.name || "Anunciante";

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isSending || !user?.id || !selectedPubId) return;

    setIsSending(true);
    try {
      const targetUserId = isOwner
        ? selectedThread?.lastMessage.emisorId || null
        : selectedProduct?.userId || null;

      const sent = await sendChatMessage({
        publicacionId: selectedPubId,
        emisorId: user.id,
        emisorNombre: user.nombre || user.username || "Usuario",
        receptorId: targetUserId,
        contenido: text,
      });

      setActiveMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
      setInputText("");
    } catch (err) {
      console.error("[MessagesPage] Error al enviar mensaje:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handshakeStatus = activeTrade
    ? computeHandshakeStatus(activeTrade, user?.id)
    : null;

  return (
    <div className="min-h-screen bg-[#F7F8F6] font-sans text-ink flex flex-col antialiased">
      {/* Top Header Barra de Navegación */}
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ink-soft transition hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-jade-500"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Volver al feed</span>
            </button>
            <div className="h-4 w-px bg-line" />
            <div className="flex items-center gap-2 text-jade-700">
              <MessageCircle className="h-4 w-4" />
              <h1 className="text-sm font-bold text-ink">Mensajes de Trueque</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-sage-500">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Canal seguro activo</span>
          </div>
        </div>
      </header>

      {/* Main Split Layout estilo WhatsApp Web */}
      <main className="mx-auto flex-1 w-full max-w-7xl p-3 sm:p-4 lg:p-6">
        <div className="h-[calc(100vh-100px)] grid grid-cols-1 md:grid-cols-12 rounded-2xl border border-line bg-white shadow-xs overflow-hidden">
          {/* PANEL IZQUIERDO: LISTA DE CONVERSACIONES (4 cols en md/lg) */}
          <section
            className={`border-r border-line flex flex-col bg-white md:col-span-4 ${
              selectedPubId ? "hidden md:flex" : "flex"
            }`}
            aria-label="Lista de chats"
          >
            {/* Buscador */}
            <div className="p-3 border-b border-line bg-[#FAFBF9]">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-sage-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por artículo o persona..."
                  className="w-full rounded-xl border border-line bg-white pl-8 pr-3 py-1.5 text-xs text-ink placeholder:text-sage-400 focus:outline-none focus:border-jade-500 focus:ring-1 focus:ring-jade-500"
                />
              </div>
            </div>

            {/* Listado de Hilos */}
            <div className="flex-1 overflow-y-auto divide-y divide-line/60">
              {threads.length === 0 ? (
                <div className="p-8 text-center text-sage-500">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-paper text-sage-400">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-semibold text-ink">Sin mensajes todavía</p>
                  <p className="mt-1 text-[11px] text-sage-500">
                    Cuando escribas a un anunciante o alguien te escriba, aparecerán aquí.
                  </p>
                  <button
                    type="button"
                    onClick={onBack}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-paper"
                  >
                    <span>Explorar el feed</span>
                  </button>
                </div>
              ) : (
                threads.map((thread) => {
                  const isSelected = thread.publication.id === selectedPubId;
                  const isUserOwner =
                    user?.id && thread.publication.userId === user.id;

                  return (
                    <button
                      key={thread.publication.id}
                      type="button"
                      onClick={() => setSelectedPubId(thread.publication.id)}
                      className={`w-full flex items-start gap-3 p-3.5 text-left transition-colors ${
                        isSelected
                          ? "bg-jade-50/70 border-l-4 border-jade-600"
                          : "hover:bg-[#FAFBF9]"
                      }`}
                    >
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-line bg-paper">
                        <img
                          src={thread.publication.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h2 className="text-xs font-bold text-ink truncate">
                            {thread.publication.title}
                          </h2>
                          <span className="text-[10px] text-sage-400 shrink-0">
                            {formatMessageTime(thread.lastMessage.createdAt)}
                          </span>
                        </div>

                        <p className="text-[11px] text-sage-600 truncate mt-0.5">
                          {isUserOwner ? "Interesado: " : "Dueño: "}
                          <span className="font-medium text-ink">
                            {thread.publication.owner.name}
                          </span>
                        </p>

                        <p className="text-[11px] text-sage-500 truncate mt-0.5">
                          {thread.lastMessage.contenido}
                        </p>

                        {thread.tradeProposal && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            <Repeat className="h-2.5 w-2.5" />
                            <span>Trueque en curso</span>
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* PANEL DERECHO: CONVERSACIÓN COMPLETA (8 cols en md/lg) */}
          <section
            className={`flex flex-col bg-[#F7F8F6] md:col-span-8 ${
              !selectedPubId ? "hidden md:flex" : "flex"
            }`}
            aria-label="Ventana de chat"
          >
            {selectedProduct ? (
              <>
                {/* Cabecera del Chat Activo */}
                <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => setSelectedPubId(null)}
                      className="md:hidden p-1.5 rounded-lg text-sage-500 hover:bg-paper"
                      aria-label="Volver a la lista de chats"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>

                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-line bg-paper">
                      <img
                        src={selectedProduct.owner.avatar}
                        alt={otherUserName}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-sm font-bold text-ink truncate">
                          {otherUserName}
                        </h2>
                        <span
                          title="Perfil Verificado con DNI"
                          className="inline-flex items-center text-jade-600"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      </div>
                      <p className="text-[11px] text-sage-500 truncate">
                        {isOwner
                          ? "Conversación sobre tu artículo"
                          : `Publicó: ${selectedProduct.title}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-jade-50 px-2.5 py-1 text-[11px] font-semibold text-jade-700 border border-jade-200">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Chat Directo</span>
                    </span>
                  </div>
                </div>

                {/* Banner del Producto en Negociación */}
                <div className="flex items-center justify-between gap-3 border-b border-line bg-[#F2F5F3] px-4 py-2.5 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={selectedProduct.image}
                      alt=""
                      className="h-9 w-9 rounded-lg border border-line object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-semibold text-ink block truncate">
                        {selectedProduct.title}
                      </span>
                      <span className="text-[11px] text-sage-600 block truncate">
                        Busca a cambio: {selectedProduct.wantsInReturn}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-sage-500">
                    <MapPin className="h-3 w-3 text-jade-600" />
                    <span>{selectedProduct.safePointRecommended || "Plaza de Armas"}</span>
                  </span>
                </div>

                {/* Widget de Handshake si hay propuesta activa */}
                {activeTrade && handshakeStatus && (
                  <div className="border-b border-line bg-amber-50/80 px-4 py-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                          <Repeat className="h-3.5 w-3.5 text-amber-700" />
                          <span>Acuerdo de trueque presencial</span>
                        </div>
                        <p className="text-[11px] text-amber-800">
                          Punto acordado: {activeTrade.puntoEncuentro}
                        </p>
                      </div>

                      {handshakeStatus.canConfirm && user?.id ? (
                        <button
                          type="button"
                          disabled={isConfirming}
                          onClick={async () => {
                            if (!user?.id) return;
                            setIsConfirming(true);
                            try {
                              await confirmTradeHandshake(activeTrade.id, user.id);
                              const updatedTrades = await fetchUserTrades(user.id);
                              setUserTrades(updatedTrades);
                            } finally {
                              setIsConfirming(false);
                            }
                          }}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-jade-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-jade-700 disabled:opacity-50"
                        >
                          {isConfirming ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              <span>Confirmando...</span>
                            </>
                          ) : (
                            <>
                              <Check className="h-3.5 w-3.5" />
                              <span>Confirmar entrega presencial</span>
                            </>
                          )}
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

                {/* Cuerpo del Chat / Mensajes */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                  {activeMessages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center p-6 text-sage-500">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-jade-50 text-jade-600 mb-3">
                        <Repeat className="h-7 w-7" aria-hidden="true" />
                      </div>
                      <h3 className="text-sm font-bold text-ink">Inicia la conversación</h3>
                      <p className="mt-1 max-w-sm text-xs leading-relaxed text-sage-500">
                        Escríbele para pactar detalles del objeto y coordinar el encuentro en un punto seguro de Chimbote.
                      </p>
                    </div>
                  ) : (
                    activeMessages.map((msg) => {
                      const isMine = msg.emisorId === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${
                            isMine ? "items-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                              isMine
                                ? "bg-jade-600 text-white rounded-tr-xs"
                                : "bg-white text-ink border border-line rounded-tl-xs"
                            }`}
                          >
                            {!isMine && (
                              <span className="block text-[10px] font-bold text-jade-700 mb-1">
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

                {/* Input de Envío */}
                <form
                  onSubmit={handleSendMessage}
                  className="border-t border-line bg-white p-3 sm:px-4"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Escribe un mensaje para coordinar el trueque..."
                      className="flex-1 rounded-xl border border-line bg-paper px-4 py-2.5 text-xs text-ink placeholder:text-sage-400 focus:border-jade-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-jade-500"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || isSending || !user?.id}
                      aria-label="Enviar mensaje"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jade-600 text-white shadow-2xs transition hover:bg-jade-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-jade-500"
                    >
                      <Send className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center p-8 text-sage-500">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-paper text-sage-400 mb-4">
                  <Package className="h-8 w-8" />
                </div>
                <h2 className="text-base font-bold text-ink">Selecciona una conversación</h2>
                <p className="mt-1 max-w-sm text-xs leading-relaxed text-sage-500">
                  Elige un intercambio de la lista a la izquierda para ver los mensajes y coordinar el punto de entrega.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
