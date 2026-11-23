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
  CheckCheck,
  Loader2,
  X,
  Paperclip,
  Image as ImageIcon,
  Video,
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
  markMessagesAsRead,
  type TradeChatMessage,
} from "../services/chatService";
import {
  fetchUserTrades,
  createTradeProposal,
  acceptTradePact,
  cancelTradeProposal,
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
  counterpartyName: string;
}

const CHIMBOTE_SAFE_POINTS = [
  "MegaPlaza Chimbote (Zona Bancaria)",
  "Plaza de Armas de Chimbote (Frente a Comisaría)",
  "Vivero Forestal de Chimbote (Entrada Principal)",
  "Real Plaza Nuevo Chimbote",
  "Terminal Terrestre El Chimbador",
];

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

  // Adjuntos multimedia (Fotos o Videos para mostrar el producto a cambiar)
  const [attachedMedia, setAttachedMedia] = useState<{
    url: string;
    tipo: "imagen" | "video";
    name: string;
  } | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [isCompressingMedia, setIsCompressingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal para proponer pacto de trueque
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [offeredItemText, setOfferedItemText] = useState("");
  const [selectedSafePoint, setSelectedSafePoint] = useState(CHIMBOTE_SAFE_POINTS[0]);
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);

  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  // 1. Carga inicial de datos
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
  }, [user?.id, initialPublicationId, selectedPubId]);

  // 2. Sincronización continua bidireccional cada 2.5 segundos
  useEffect(() => {
    const currentUserId = user?.id;
    if (!currentUserId) return;
    let isMounted = true;

    const syncInterval = setInterval(async () => {
      try {
        const [msgs, trades] = await Promise.all([
          fetchAllUserConversations(currentUserId),
          fetchUserTrades(currentUserId),
        ]);
        if (!isMounted) return;

        setAllMessages((prev) => {
          if (
            prev.length !== msgs.length ||
            (msgs.length > 0 && prev[prev.length - 1]?.id !== msgs[msgs.length - 1]?.id)
          ) {
            return msgs;
          }
          return prev;
        });

        setUserTrades((prev) => {
          if (
            prev.length !== trades.length ||
            trades.some((t, i) => prev[i]?.id !== t.id || prev[i]?.estado !== t.estado)
          ) {
            return trades;
          }
          return prev;
        });

        if (selectedPubId) {
          const chatMsgs = await fetchMessagesByPublication(selectedPubId, user.id);
          if (!isMounted) return;
          setActiveMessages((prev) => {
            if (
              prev.length !== chatMsgs.length ||
              (chatMsgs.length > 0 &&
                (prev[prev.length - 1]?.id !== chatMsgs[chatMsgs.length - 1]?.id ||
                  prev[prev.length - 1]?.leido !== chatMsgs[chatMsgs.length - 1]?.leido))
            ) {
              return chatMsgs;
            }
            return prev;
          });
        }
      } catch {
        // Silencioso para estabilidad
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(syncInterval);
    };
  }, [user?.id, selectedPubId]);

  // 3. Suscripción a eventos reactivos de Supabase / Local / Read Receipts
  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToTradeChat(selectedPubId || "", (incoming) => {
      setAllMessages((prev) => {
        const exists = prev.some((m) => m.id === incoming.id);
        if (exists) {
          return prev.map((m) => (m.id === incoming.id ? incoming : m));
        }
        return [incoming, ...prev];
      });
      if (selectedPubId && incoming.publicacionId === selectedPubId) {
        setActiveMessages((prev) => {
          const exists = prev.some((m) => m.id === incoming.id);
          if (exists) {
            return prev.map((m) => (m.id === incoming.id ? incoming : m));
          }
          return [...prev, incoming];
        });
      }
    });

    const handleTradeEvent = () => {
      if (user?.id) {
        fetchUserTrades(user.id).then(setUserTrades);
      }
    };

    const handleReadEvent = (e: Event) => {
      const custom = e as CustomEvent<{ publicacionId: string }>;
      if (custom.detail?.publicacionId === selectedPubId && user?.id) {
        fetchMessagesByPublication(selectedPubId, user.id).then(setActiveMessages);
      }
    };

    window.addEventListener("truekly_trade_updated", handleTradeEvent);
    window.addEventListener("truekly_chat_read", handleReadEvent);

    return () => {
      unsub();
      window.removeEventListener("truekly_trade_updated", handleTradeEvent);
      window.removeEventListener("truekly_chat_read", handleReadEvent);
    };
  }, [selectedPubId, user?.id]);

  // 4. Cargar mensajes del chat seleccionado al cambiar y marcar como leídos
  useEffect(() => {
    if (!selectedPubId) {
      setActiveMessages([]);
      return;
    }
    let isMounted = true;
    fetchMessagesByPublication(selectedPubId, user?.id).then((msgs) => {
      if (isMounted) {
        setActiveMessages(msgs);
        if (user?.id) {
          const hasUnread = msgs.some((m) => m.emisorId !== user.id && !m.leido);
          if (hasUnread) {
            markMessagesAsRead(selectedPubId, user.id);
          }
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedPubId, user?.id]);

  // Scroll interno al final del chat sin mover la ventana del navegador
  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTop = chatScrollContainerRef.current.scrollHeight;
    }
  }, [activeMessages]);

  // Construir la lista de hilos de conversación agrupados por publicación
  const threads: ChatThread[] = React.useMemo(() => {
    const threadMap = new Map<string, ChatThread>();

    const sortedDesc = [...allMessages].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    for (const msg of sortedDesc) {
      if (!threadMap.has(msg.publicacionId)) {
        const pub = publications.find((p) => p.id === msg.publicacionId) || {
          id: msg.publicacionId,
          title: "Publicación de trueque",
          category: "Otros",
          condition: "Buen estado",
          zone: "Chimbote",
          wantsInReturn: "Objeto a coordinar",
          image:
            "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80",
          rating: 5.0,
          exchangesCount: 0,
          owner: {
            name: msg.emisorNombre || "Usuario",
            avatar:
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
          },
        } as Product;

        const matchingTrades = userTrades.filter(
          (t) =>
            (t.publicacionSolicitadaId === msg.publicacionId ||
              t.publicacionOfertadaId === msg.publicacionId) &&
            t.estado !== "cancelada"
        );
        matchingTrades.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const trade = matchingTrades[0] || null;

        const isUserOwner = Boolean(user?.id && pub.userId && pub.userId === user.id);
        const counterparty = isUserOwner
          ? msg.emisorId !== user?.id && msg.emisorNombre
            ? msg.emisorNombre
            : "Interesado en tu artículo"
          : pub.owner.name;

        threadMap.set(msg.publicacionId, {
          publication: pub,
          lastMessage: msg,
          tradeProposal: trade || null,
          counterpartyName: counterparty,
        });
      }
    }

    if (initialPublicationId && !threadMap.has(initialPublicationId)) {
      const pub = publications.find((p) => p.id === initialPublicationId);
      if (pub) {
        const isUserOwner = Boolean(user?.id && pub.userId && pub.userId === user.id);
        const matchingTrades = userTrades.filter(
          (t) =>
            (t.publicacionSolicitadaId === pub.id ||
              t.publicacionOfertadaId === pub.id) &&
            t.estado !== "cancelada"
        );
        matchingTrades.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const trade = matchingTrades[0] || null;

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
          tradeProposal: trade || null,
          counterpartyName: isUserOwner ? "Interesado en tu artículo" : pub.owner.name,
        });
      }
    }

    const list = Array.from(threadMap.values());
    if (!searchTerm.trim()) return list;

    const term = searchTerm.toLowerCase();
    return list.filter(
      (t) =>
        t.publication.title.toLowerCase().includes(term) ||
        t.counterpartyName.toLowerCase().includes(term) ||
        t.publication.owner.name.toLowerCase().includes(term) ||
        t.lastMessage.contenido.toLowerCase().includes(term)
    );
  }, [allMessages, publications, userTrades, initialPublicationId, searchTerm, user]);

  const selectedThread = threads.find((t) => t.publication.id === selectedPubId);
  const selectedProduct = selectedThread?.publication;

  const isOwner = Boolean(
    user?.id && selectedProduct?.userId && selectedProduct.userId === user.id
  );

  const activeTrade = userTrades
    .filter(
      (t) =>
        (t.publicacionSolicitadaId === selectedPubId ||
          t.publicacionOfertadaId === selectedPubId) &&
        t.estado !== "cancelada"
    )
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0] || null;

  const otherUserName = isOwner
    ? selectedThread?.counterpartyName || "Interesado en tu artículo"
    : selectedProduct?.owner.name || "Anunciante";

  const otherUserAvatar = isOwner
    ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
    : selectedProduct?.owner.avatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80";

  // Procesamiento y compresión de archivos multimedia antes de envío
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      setIsCompressingMedia(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL("image/jpeg", 0.8);
          setAttachedMedia({
            url: compressed,
            tipo: "imagen",
            name: file.name,
          });
          setIsCompressingMedia(false);
        };
        img.onerror = () => setIsCompressingMedia(false);
        img.src = event.target?.result as string;
      };
      reader.onerror = () => setIsCompressingMedia(false);
      reader.readAsDataURL(file);
    } else if (file.type.startsWith("video/")) {
      if (file.size > 15 * 1024 * 1024) {
        alert("El video seleccionado supera los 15 MB. Por favor elige uno más corto.");
        return;
      }
      setIsCompressingMedia(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedMedia({
          url: event.target?.result as string,
          tipo: "video",
          name: file.name,
        });
        setIsCompressingMedia(false);
      };
      reader.onerror = () => setIsCompressingMedia(false);
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if ((!text && !attachedMedia) || isSending || !user?.id || !selectedPubId) return;

    setIsSending(true);
    try {
      let targetUserId: string | null = null;
      if (isOwner) {
        const counterMsg = activeMessages.find((m) => m.emisorId && m.emisorId !== user.id);
        targetUserId =
          counterMsg?.emisorId ||
          activeTrade?.proponenteId ||
          (selectedThread?.lastMessage.emisorId !== user.id
            ? selectedThread?.lastMessage.emisorId || null
            : null);
      } else {
        targetUserId = selectedProduct?.userId || activeTrade?.receptorId || null;
      }

      const mediaToSend = attachedMedia;
      setAttachedMedia(null);

      const sent = await sendChatMessage({
        publicacionId: selectedPubId,
        emisorId: user.id,
        emisorNombre: user.nombre || user.username || "Usuario",
        receptorId: targetUserId,
        contenido: text,
        multimediaUrl: mediaToSend?.url,
        multimediaTipo: mediaToSend?.tipo,
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

  // 1. Proponer pacto de trueque (exclusivo para el dueño del artículo publicado)
  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !selectedProduct || !offeredItemText.trim() || isCreatingProposal) return;

    if (!isOwner) {
      alert("Solo el usuario que publicó el artículo puede proponer formalmente el trueque.");
      return;
    }

    setIsCreatingProposal(true);
    try {
      const counterMsg = activeMessages.find((m) => m.emisorId && m.emisorId !== user.id);
      const counterReceptor = activeMessages.find((m) => m.receptorId && m.receptorId !== user.id);
      const targetUserId =
        counterMsg?.emisorId ||
        counterReceptor?.receptorId ||
        (selectedThread?.lastMessage.emisorId !== user.id
          ? selectedThread?.lastMessage.emisorId
          : selectedThread?.lastMessage.receptorId !== user.id
          ? selectedThread?.lastMessage.receptorId
          : null) ||
        null;

      const newProposal = await createTradeProposal({
        proponenteId: user.id,
        receptorId: targetUserId,
        publicacionOfertadaId: `offered-${Date.now()}`,
        publicacionSolicitadaId: selectedProduct.id,
        tituloOfertado: offeredItemText.trim(),
        tituloSolicitado: selectedProduct.title,
        imagenOfertada:
          user.fotoPerfil ||
          "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop&q=80",
        imagenSolicitada: selectedProduct.image,
        puntoEncuentro: selectedSafePoint,
      });

      const updatedProposal = {
        ...newProposal,
        confirmadoProponente: true,
      };

      setUserTrades((prev) => [updatedProposal, ...prev.filter((t) => t.id !== newProposal.id)]);

      await sendChatMessage({
        publicacionId: selectedProduct.id,
        emisorId: user.id,
        emisorNombre: user.nombre || user.username || "Usuario",
        receptorId: targetUserId,
        contenido: `🔄 He propuesto formalmente un pacto de trueque: "${offeredItemText.trim()}" a cambio de mi "${selectedProduct.title}" en ${selectedSafePoint}. Por favor pulsa en 'Aceptar Pacto' para confirmar el acuerdo.`,
      });

      const updatedMsgs = await fetchMessagesByPublication(selectedProduct.id, user.id);
      setActiveMessages(updatedMsgs);
      setShowProposalModal(false);
      setOfferedItemText("");
    } catch (err) {
      console.error("[MessagesPage] Error al crear propuesta:", err);
    } finally {
      setIsCreatingProposal(false);
    }
  };

  // 2. Aceptar el pacto formal (ambos de acuerdo)
  const handleAcceptPact = async () => {
    if (!activeTrade || !user?.id || isConfirming) return;
    setIsConfirming(true);
    try {
      const updated = await acceptTradePact(activeTrade.id, user.id);
      if (updated) {
        setUserTrades((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      }

      const counterMsg = activeMessages.find((m) => m.emisorId && m.emisorId !== user.id);
      const targetUserId = isOwner
        ? counterMsg?.emisorId || null
        : selectedProduct?.userId || null;

      await sendChatMessage({
        publicacionId: selectedPubId || "",
        emisorId: user.id,
        emisorNombre: user.nombre || user.username || "Usuario",
        receptorId: targetUserId,
        contenido: `🤝 ¡Pacto formal de trueque aceptado por ambas partes! Acordaron intercambiar "${activeTrade.tituloOfertado}" por "${activeTrade.tituloSolicitado}" en ${activeTrade.puntoEncuentro}. Ahora procedan a encontrarse en el punto seguro y confirmen la entrega física al tener el objeto en mano.`,
      });

      if (selectedPubId) {
        const msgs = await fetchMessagesByPublication(selectedPubId, user.id);
        setActiveMessages(msgs);
      }
    } finally {
      setIsConfirming(false);
    }
  };

  // 3. Cancelar o rechazar la propuesta
  const handleCancelPact = async () => {
    if (!activeTrade || !user?.id || isConfirming) return;
    setIsConfirming(true);
    try {
      await cancelTradeProposal(activeTrade.id, user.id);
      const updatedTrades = await fetchUserTrades(user.id);
      setUserTrades(updatedTrades);

      const counterMsg = activeMessages.find((m) => m.emisorId && m.emisorId !== user.id);
      const targetUserId = isOwner
        ? counterMsg?.emisorId || null
        : selectedProduct?.userId || null;

      await sendChatMessage({
        publicacionId: selectedPubId || "",
        emisorId: user.id,
        emisorNombre: user.nombre || user.username || "Usuario",
        receptorId: targetUserId,
        contenido: `❌ La propuesta de trueque ha sido cancelada. Pueden coordinar un nuevo acuerdo en el chat.`,
      });

      if (selectedPubId) {
        const msgs = await fetchMessagesByPublication(selectedPubId, user.id);
        setActiveMessages(msgs);
      }
    } finally {
      setIsConfirming(false);
    }
  };

  // 4. Confirmar entrega física presencial
  const handleConfirmTrade = async () => {
    if (!activeTrade || !user?.id || isConfirming) return;
    setIsConfirming(true);
    try {
      await confirmTradeHandshake(activeTrade.id, user.id);
      const updatedTrades = await fetchUserTrades(user.id);
      setUserTrades(updatedTrades);

      const counterMsg = activeMessages.find((m) => m.emisorId && m.emisorId !== user.id);
      const targetUserId = isOwner
        ? counterMsg?.emisorId || null
        : selectedProduct?.userId || null;

      const isCompleted =
        updatedTrades.find((t) => t.id === activeTrade.id)?.estado === "completada";

      await sendChatMessage({
        publicacionId: selectedPubId || "",
        emisorId: user.id,
        emisorNombre: user.nombre || user.username || "Usuario",
        receptorId: targetUserId,
        contenido: isCompleted
          ? `🎉 ¡Trueque finalizado con éxito! Ambas partes han confirmado la entrega presencial en ${activeTrade.puntoEncuentro}.`
          : `🤝 He confirmado la entrega física presencial del trueque en ${activeTrade.puntoEncuentro}.`,
      });

      if (selectedPubId) {
        const msgs = await fetchMessagesByPublication(selectedPubId, user.id);
        setActiveMessages(msgs);
      }
    } finally {
      setIsConfirming(false);
    }
  };

  const handshakeStatus = activeTrade
    ? computeHandshakeStatus(activeTrade, user?.id)
    : null;

  return (
    <div className="h-screen max-h-screen bg-[#F7F8F6] font-sans text-ink flex flex-col antialiased overflow-hidden">
      {/* Top Header Barra de Navegación */}
      <header className="shrink-0 z-30 border-b border-line bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
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
      <main className="mx-auto flex-1 min-h-0 w-full max-w-7xl p-2 sm:p-3 lg:p-4 overflow-hidden">
        <div className="h-full grid grid-cols-1 md:grid-cols-12 rounded-2xl border border-line bg-white shadow-xs overflow-hidden">
          {/* PANEL IZQUIERDO: LISTA DE CONVERSACIONES (4 cols en md/lg) */}
          <section
            className={`border-r border-line flex flex-col bg-white md:col-span-4 h-full min-h-0 overflow-hidden ${
              selectedPubId ? "hidden md:flex" : "flex"
            }`}
            aria-label="Lista de chats"
          >
            {/* Buscador */}
            <div className="shrink-0 p-3 border-b border-line bg-[#FAFBF9]">
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
            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-line/60">
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
                  const isUserOwner = Boolean(
                    user?.id && thread.publication.userId === user.id
                  );
                  const isUnread =
                    !thread.lastMessage.leido &&
                    thread.lastMessage.emisorId &&
                    thread.lastMessage.emisorId !== user?.id;

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
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] text-sage-400">
                              {formatMessageTime(thread.lastMessage.createdAt)}
                            </span>
                            {isUnread && (
                              <span className="h-2 w-2 rounded-full bg-jade-600" />
                            )}
                          </div>
                        </div>

                        <p className="text-[11px] text-sage-600 truncate mt-0.5">
                          {isUserOwner ? "Interesado: " : "Dueño: "}
                          <span className="font-medium text-ink">
                            {thread.counterpartyName}
                          </span>
                        </p>

                        <div className="text-[11px] text-sage-500 truncate mt-0.5 flex items-center gap-1">
                          {thread.lastMessage.multimediaTipo === "video" ? (
                            <>
                              <Video className="h-3 w-3 shrink-0 text-sage-500" />
                              <span>{thread.lastMessage.contenido || "Video"}</span>
                            </>
                          ) : thread.lastMessage.multimediaUrl ? (
                            <>
                              <ImageIcon className="h-3 w-3 shrink-0 text-sage-500" />
                              <span>{thread.lastMessage.contenido || "Foto"}</span>
                            </>
                          ) : (
                            <span>{thread.lastMessage.contenido}</span>
                          )}
                        </div>

                        {thread.tradeProposal && thread.tradeProposal.estado !== "cancelada" && (
                          <span
                            className={`inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                              thread.tradeProposal.estado === "completada"
                                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                : thread.tradeProposal.estado === "pactado"
                                ? "text-jade-800 bg-jade-50 border-jade-200"
                                : "text-amber-700 bg-amber-50 border-amber-200"
                            }`}
                          >
                            <Repeat className="h-2.5 w-2.5" />
                            <span>
                              {thread.tradeProposal.estado === "completada"
                                ? "Trueque completado"
                                : thread.tradeProposal.estado === "pactado"
                                ? "Pacto acordado"
                                : "Propuesta pendiente"}
                            </span>
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
            className={`flex flex-col bg-[#F7F8F6] md:col-span-8 h-full min-h-0 overflow-hidden ${
              !selectedPubId ? "hidden md:flex" : "flex"
            }`}
            aria-label="Ventana de chat"
          >
            {selectedProduct ? (
              <div className="flex flex-col h-full min-h-0 overflow-hidden">
                {/* Cabecera del Chat Activo */}
                <div className="shrink-0 flex items-center justify-between border-b border-line bg-white px-4 py-3 sm:px-5">
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
                        src={otherUserAvatar}
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
                    {isOwner && (!activeTrade || activeTrade.estado === "cancelada") && (
                      <button
                        type="button"
                        onClick={() => setShowProposalModal(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-jade-600 bg-jade-50 px-3 py-1.5 text-xs font-bold text-jade-800 shadow-2xs hover:bg-jade-100 transition"
                      >
                        <Repeat className="h-3.5 w-3.5 text-jade-700" />
                        <span>Pactar Trueque</span>
                      </button>
                    )}
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-jade-50 px-2.5 py-1 text-[11px] font-semibold text-jade-700 border border-jade-200">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Chat Directo</span>
                    </span>
                  </div>
                </div>

                {/* Banner del Producto en Negociación */}
                <div className="shrink-0 flex items-center justify-between gap-3 border-b border-line bg-[#F2F5F3] px-4 py-2 text-xs">
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
                    <span>{selectedProduct.safePointRecommended || "MegaPlaza Chimbote"}</span>
                  </span>
                </div>

                {/* Banner de Pacto / Handshake si hay propuesta activa */}
                {activeTrade && activeTrade.estado !== "cancelada" && handshakeStatus ? (
                  <div
                    className={`shrink-0 border-b px-4 py-2.5 sm:py-3 transition-colors ${
                      handshakeStatus.isCompleted
                        ? "bg-emerald-50/90 border-emerald-200"
                        : handshakeStatus.isPactado
                        ? "bg-jade-50/90 border-jade-200"
                        : "bg-amber-50/90 border-amber-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
                          <Repeat className="h-4 w-4 text-jade-700 shrink-0" />
                          <span className="truncate">
                            {handshakeStatus.isCompleted
                              ? "¡Trueque Completado con Éxito! (2/2)"
                              : handshakeStatus.isPactado
                              ? "✅ Pacto formal acordado — Coordinar entrega presencial"
                              : isOwner
                              ? "⏳ Esperando aceptación del pacto por la contraparte"
                              : "🔔 Propuesta de pacto recibida del dueño — Confirma para formalizar el trueque"}
                          </span>
                        </div>
                        <p className="text-[11px] text-sage-600 truncate">
                          <span className="font-semibold text-ink">{activeTrade.tituloOfertado}</span> por{" "}
                          <span className="font-semibold text-ink">{activeTrade.tituloSolicitado}</span> en{" "}
                          <span className="text-jade-800 font-medium">{activeTrade.puntoEncuentro}</span>
                        </p>
                      </div>

                      {/* Acciones según el estado del flujo */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* FASE 1: Pendiente de aceptación formal mutua */}
                        {!handshakeStatus.isPactado && !handshakeStatus.isCompleted && (
                          <>
                            {!isOwner ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={isConfirming}
                                  onClick={handleAcceptPact}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-jade-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-jade-700 active:scale-[0.98] transition disabled:opacity-50"
                                >
                                  {isConfirming ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5" />
                                  )}
                                  <span>Aceptar Pacto</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={isConfirming}
                                  onClick={handleCancelPact}
                                  className="rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                                >
                                  Rechazar
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-300">
                                  <Clock className="h-3.5 w-3.5 text-amber-700" />
                                  <span>Esperando respuesta de la contraparte</span>
                                </span>
                                <button
                                  type="button"
                                  disabled={isConfirming}
                                  onClick={handleCancelPact}
                                  className="rounded-lg p-1.5 text-sage-400 hover:bg-paper hover:text-rose-600 transition"
                                  title="Cancelar propuesta de trueque"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </>
                        )}

                        {/* FASE 2: Pactado formalmente, pendiente de entrega física */}
                        {handshakeStatus.isPactado && !handshakeStatus.isCompleted && (
                          <>
                            {handshakeStatus.canConfirmDelivery && user?.id ? (
                              <button
                                type="button"
                                disabled={isConfirming}
                                onClick={handleConfirmTrade}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-jade-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-jade-700 active:scale-[0.98] transition disabled:opacity-50"
                              >
                                {isConfirming ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span>Confirmando...</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4" />
                                    <span>Confirmar entrega presencial</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 border border-amber-300">
                                <Clock className="h-3.5 w-3.5 text-amber-700" />
                                <span>Esperando confirmación física de contraparte (1/2)</span>
                              </span>
                            )}
                          </>
                        )}

                        {/* FASE 3: Completado */}
                        {handshakeStatus.isCompleted && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                            <span>Trueque finalizado</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="shrink-0 border-b border-line bg-jade-50/40 px-4 py-2 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-sage-600 min-w-0">
                      <Repeat className="h-3.5 w-3.5 text-jade-700 shrink-0" />
                      <span className="truncate">
                        {isOwner
                          ? "¿Acordaron el intercambio en el chat? Como dueño del artículo, formaliza el pacto."
                          : "Conversa con el anunciante para acordar los detalles. El dueño formalizará el pacto de trueque."}
                      </span>
                    </div>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => setShowProposalModal(true)}
                        className="inline-flex items-center gap-1.5 shrink-0 rounded-lg bg-jade-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-jade-700 transition"
                      >
                        <Repeat className="h-3.5 w-3.5" />
                        <span>Pactar Trueque</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Cuerpo del Chat / Mensajes con scroll interno confinado */}
                <div
                  ref={chatScrollContainerRef}
                  className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3 overscroll-contain"
                >
                  {activeMessages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center p-6 text-sage-500">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-jade-50 text-jade-600 mb-3">
                        <Repeat className="h-7 w-7" aria-hidden="true" />
                      </div>
                      <h3 className="text-sm font-bold text-ink">Inicia la conversación</h3>
                      <p className="mt-1 max-w-sm text-xs leading-relaxed text-sage-500">
                        Escríbele o adjunta una foto del artículo que deseas intercambiar y coordinen el punto seguro en Chimbote.
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
                            className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs break-words overflow-hidden ${
                              isMine
                                ? "bg-jade-600 text-white rounded-tr-xs"
                                : "bg-white text-ink border border-line rounded-tl-xs"
                            }`}
                          >
                            {!isMine && (
                              <span className="block text-[10px] font-bold text-jade-700 mb-1 truncate">
                                {msg.emisorNombre || otherUserName}
                              </span>
                            )}

                            {/* Foto o Video adjunto */}
                            {msg.multimediaUrl && (
                              <div className="mb-2 overflow-hidden rounded-xl bg-black/5">
                                {msg.multimediaTipo === "video" ? (
                                  <video
                                    src={msg.multimediaUrl}
                                    controls
                                    playsInline
                                    className="max-h-56 sm:max-h-72 w-auto max-w-full rounded-xl bg-black object-contain mx-auto"
                                  />
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewModalUrl(msg.multimediaUrl!)}
                                    className="block overflow-hidden rounded-xl text-left focus:outline-none"
                                  >
                                    <img
                                      src={msg.multimediaUrl}
                                      alt="Artículo para trueque"
                                      className="max-h-56 sm:max-h-72 w-auto max-w-full rounded-xl object-contain hover:opacity-95 transition mx-auto"
                                    />
                                  </button>
                                )}
                              </div>
                            )}

                            {msg.contenido && (
                              <p className="whitespace-pre-wrap break-words">{msg.contenido}</p>
                            )}

                            {/* Hora y Checks estilo WhatsApp */}
                            <div
                              className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${
                                isMine ? "text-white/80" : "text-sage-400"
                              }`}
                            >
                              <span>{formatMessageTime(msg.createdAt)}</span>
                              {isMine && (
                                msg.leido ? (
                                  <CheckCheck
                                    className="h-3 w-3 text-sky-300"
                                    aria-label="Visto / Leído"
                                  />
                                ) : (
                                  <CheckCheck
                                    className="h-3 w-3 text-white/70"
                                    aria-label="Entregado"
                                  />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Preview de multimedia lista para enviar */}
                {attachedMedia && (
                  <div className="shrink-0 flex items-center justify-between gap-2 border-t border-line bg-jade-50/50 px-4 py-2 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {attachedMedia.tipo === "imagen" ? (
                        <img
                          src={attachedMedia.url}
                          alt="Vista previa"
                          className="h-10 w-10 rounded-lg object-cover border border-jade-300 shrink-0"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-jade-100 text-jade-700">
                          <Video className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-semibold text-ink block truncate">
                          {attachedMedia.name}
                        </span>
                        <span className="text-[10px] text-sage-500">
                          {attachedMedia.tipo === "imagen"
                            ? "Foto adjunta lista para enviar"
                            : "Video adjunto listo para enviar"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedMedia(null)}
                      className="p-1 rounded-lg text-sage-400 hover:bg-paper hover:text-ink transition"
                      title="Eliminar adjunto"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Input de Envío */}
                <form
                  onSubmit={handleSendMessage}
                  className="shrink-0 border-t border-line bg-white p-3 sm:px-4"
                >
                  <div className="flex items-center gap-2">
                    {/* Botón para adjuntar foto o video */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="chat-file-attachment"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isCompressingMedia || isSending}
                      title="Adjuntar foto o video del artículo a cambiar"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-paper text-sage-600 hover:bg-jade-50 hover:text-jade-700 transition disabled:opacity-50"
                    >
                      {isCompressingMedia ? (
                        <Loader2 className="h-4 w-4 animate-spin text-jade-600" />
                      ) : (
                        <Paperclip className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>

                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Escribe un mensaje para coordinar el trueque..."
                      className="flex-1 rounded-xl border border-line bg-paper px-4 py-2.5 text-xs text-ink placeholder:text-sage-400 focus:border-jade-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-jade-500"
                    />
                    <button
                      type="submit"
                      disabled={(!inputText.trim() && !attachedMedia) || isSending || !user?.id}
                      aria-label="Enviar mensaje"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jade-600 text-white shadow-2xs transition hover:bg-jade-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-jade-500"
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center p-8 text-sage-500">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-paper text-sage-400 mb-4">
                  <Package className="h-8 w-8" />
                </div>
                <h2 className="text-base font-bold text-ink">Selecciona una conversación</h2>
                <p className="mt-1 max-w-sm text-xs leading-relaxed text-sage-500">
                  Elige un intercambio de la lista a la izquierda para ver los mensajes, ver fotos y coordinar el punto de entrega.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modal Pactar Trueque Presencial (Exclusivo para el dueño de la publicación) */}
      {showProposalModal && selectedProduct && isOwner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2">
                <Repeat className="h-5 w-5 text-jade-700" />
                <h3 className="text-sm font-bold text-ink">Formalizar Pacto de Trueque</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProposalModal(false)}
                className="rounded-lg p-1.5 text-sage-400 hover:bg-paper hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProposal} className="mt-4 space-y-4 text-xs">
              {/* Artículo fijo de la publicación */}
              <div>
                <label className="block font-semibold text-ink mb-1.5">
                  Tu artículo publicado (Fijo)
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-line bg-paper p-2.5">
                  <img
                    src={selectedProduct.image}
                    alt=""
                    className="h-11 w-11 rounded-lg border border-line object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-ink truncate">{selectedProduct.title}</p>
                    <p className="text-[11px] text-sage-500 truncate">
                      Lo que buscabas: {selectedProduct.wantsInReturn}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">
                  Artículo que acordaron que te entregará la contraparte
                </label>
                <input
                  type="text"
                  value={offeredItemText}
                  onChange={(e) => setOfferedItemText(e.target.value)}
                  placeholder={`Ej. ${selectedProduct.wantsInReturn || "Monitor gamer, consola, bicicleta, etc."}`}
                  className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs text-ink placeholder:text-sage-400 focus:border-jade-500 focus:bg-white focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-semibold text-ink mb-1">
                  Punto seguro de encuentro (Zonas vigiladas en Chimbote)
                </label>
                <select
                  value={selectedSafePoint}
                  onChange={(e) => setSelectedSafePoint(e.target.value)}
                  className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-xs text-ink focus:border-jade-500 focus:bg-white focus:outline-none"
                >
                  {CHIMBOTE_SAFE_POINTS.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-sage-500">
                  Lugar vigilado y de alta afluencia para realizar el intercambio con total seguridad.
                </p>
              </div>

              <div className="rounded-xl bg-jade-50/60 border border-jade-100 p-2.5 text-[11px] text-jade-900 leading-relaxed">
                ℹ️ Al enviar la propuesta, ambos usuarios deben pulsar para aceptar los términos del pacto. Una vez aceptado, queda formalmente registrado y procederán a la entrega presencial.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProposalModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-sage-600 hover:bg-paper"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!offeredItemText.trim() || isCreatingProposal}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-jade-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-jade-700 disabled:opacity-50"
                >
                  {isCreatingProposal ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Enviar propuesta de pacto</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lightbox para fotos ampliadas */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              type="button"
              onClick={() => setPreviewModalUrl(null)}
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={previewModalUrl}
              alt="Foto ampliada del trueque"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
