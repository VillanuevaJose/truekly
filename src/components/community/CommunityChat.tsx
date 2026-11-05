import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Users,
  Send,
  ShieldCheck,
  Repeat,
  Sparkles,
  CheckCircle2,
  X,
  Bell,
  Lock,
  LogOut,
  Flag,
  Share2,
} from "lucide-react";
import type { Community } from "../../data/mockProducts";
import {
  type CommunityMessage,
  getInitialCommunityMessages,
} from "../../data/mockCommunityChats";
import { useAuth } from "../../context/AuthContext";

type CommunityChatProps = {
  community: Community;
  isJoined?: boolean;
  onToggleJoin?: () => void;
  onBack: () => void;
  onOpenTradeModal?: (tradeProposal: { offered: string; wanted: string }) => void;
};

export function CommunityChat({
  community,
  isJoined = false,
  onToggleJoin,
  onBack,
}: CommunityChatProps) {
  const { user } = useAuth();
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [messages, setMessages] = useState<CommunityMessage[]>(() => {
    try {
      const stored = localStorage.getItem(`truekly_comm_chat_${community.id}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    return getInitialCommunityMessages(community.id, community.name, community.category);
  });

  const [inputVal, setInputVal] = useState("");
  const [showTradeComposer, setShowTradeComposer] = useState(false);
  const [offeredItem, setOfferedItem] = useState("");
  const [wantedItem, setWantedItem] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showTradeComposer]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputVal.trim();
    if (!text && !offeredItem.trim()) return;

    const myName = user?.nombre || "Tú";
    const myInitials = (user?.primerNombre && user?.apellidoPaterno)
      ? `${user.primerNombre[0]}${user.apellidoPaterno[0]}`.toUpperCase()
      : "TÚ";

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const timestamp = `${hours}:${minutes}`;

    const newMsg: CommunityMessage = {
      id: `msg-${Date.now()}`,
      communityId: community.id,
      senderName: myName,
      senderAvatar: user?.fotoPerfil || undefined,
      senderInitials: myInitials,
      verified: true,
      zone: "Chimbote",
      timestamp,
      text: text || `Propuesta de trueque para ${community.name}`,
      isTradeProposal: Boolean(offeredItem.trim() && wantedItem.trim()),
      tradeOffered: offeredItem.trim() || undefined,
      tradeWanted: wantedItem.trim() || undefined,
    };

    const next = [...messages, newMsg];
    setMessages(next);
    try {
      localStorage.setItem(`truekly_comm_chat_${community.id}`, JSON.stringify(next));
    } catch {}

    setInputVal("");
    setOfferedItem("");
    setWantedItem("");
    setShowTradeComposer(false);
  };

  // Iniciales y nombre dinámicos reales del usuario en sesión
  const currentUserName = user?.nombre || "Tú";
  const currentUserInitials = (user?.primerNombre && user?.apellidoPaterno)
    ? `${user.primerNombre[0]}${user.apellidoPaterno[0]}`.toUpperCase()
    : (user?.nombre || "TU").slice(0, 2).toUpperCase();

  type Member = {
    name: string;
    avatar?: string;
    initials: string;
    role: string;
    verified: boolean;
    zone: string;
  };

  // Miembros base de la comunidad
  const baseMembers: Member[] = [
    { name: "Carlos Mendoza", initials: "CM", role: "Admin. del grupo", verified: true, zone: "Casco Urbano" },
    { name: "Diana Solís", initials: "DS", role: "Miembro", verified: true, zone: "Nuevo Chimbote" },
    { name: "Miguel Talledo", initials: "MT", role: "Miembro", verified: false, zone: "Miraflores" },
    { name: "Alonso Vera", initials: "AV", role: "Miembro", verified: true, zone: "Bellamar" },
    { name: "Elena Quispe", initials: "EQ", role: "Miembro", verified: true, zone: "27 de Octubre" },
  ];

  // Solo se incluye al usuario en sesión como miembro si realmente se ha unido
  const sampleMembers: Member[] = isJoined
    ? [
        {
          name: `${currentUserName} (Tú)`,
          avatar: user?.fotoPerfil || undefined,
          initials: currentUserInitials,
          role: "Miembro",
          verified: true,
          zone: "Chimbote",
        },
        ...baseMembers,
      ]
    : baseMembers;

  const totalMembers = community.membersCount + (isJoined ? 1 : 0);

  return (
    <div className="flex h-[calc(100vh-175px)] w-full rounded-2xl border border-line bg-paper overflow-hidden shadow-sm animate-in fade-in duration-150">
      {/* ================= COLUMNA PRINCIPAL DE CHAT ================= */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f7f8f6]">
        {/* 1. Header estilo WhatsApp */}
        <header className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-line shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={onBack}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:bg-paper hover:border-jade-500 focus-visible:outline-2 focus-visible:outline-jade-500"
              aria-label="Volver a la lista de comunidades"
            >
              <ArrowLeft size={17} />
            </button>

            {/* Cabecera clicable para abrir/cerrar el panel lateral derecho estilo WhatsApp */}
            <button
              type="button"
              onClick={() => setShowRightPanel((prev) => !prev)}
              className="flex items-center gap-3 min-w-0 text-left hover:bg-paper/70 transition rounded-xl p-1.5 -m-1 focus-visible:outline-2 focus-visible:outline-jade-500 group flex-1"
              title="Haz clic para ver info del grupo"
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-jade-100 border border-line">
                {community.image ? (
                  <img
                    src={community.image}
                    alt={community.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-jade-700">
                    {community.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-sm font-bold text-ink truncate leading-tight group-hover:text-jade-700 transition-colors">
                    {community.name}
                  </h2>
                  <span className="hidden sm:inline-block rounded-full bg-jade-50 px-2 py-0.5 text-[10px] font-semibold text-jade-700">
                    {community.category}
                  </span>
                </div>
                <p className="text-[11px] text-sage-500 truncate mt-0.5">
                  {community.zone} • {totalMembers} miembros
                </p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowRightPanel((prev) => !prev)}
              className={`p-2 rounded-xl text-sage-600 transition ${
                showRightPanel ? "bg-jade-50 text-jade-700" : "hover:bg-paper hover:text-ink"
              }`}
              title="Info. del grupo"
            >
              <Users size={18} />
            </button>
          </div>
        </header>

        {/* 2. Área de Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 no-scrollbar">
          {/* Banner central de bienvenida */}
          <div className="mx-auto max-w-sm rounded-xl border border-line bg-white/90 p-3 text-center text-xs text-ink-soft shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 font-semibold text-jade-700 mb-0.5">
              <Sparkles size={13} />
              <span>Grupo de trueque local</span>
            </div>
            <p className="text-[11px] text-sage-600 leading-relaxed">
              Acuerden intercambios libres y recuerden reunirse en los <strong>Puntos Seguros</strong> autorizados de Chimbote.
            </p>
          </div>

          {messages.map((msg) => {
            const isMe = user?.nombre && msg.senderName === user.nombre;

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%] ${
                  isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-jade-100 flex items-center justify-center text-[11px] font-bold text-jade-700 border border-line">
                  {msg.senderAvatar ? (
                    <img src={msg.senderAvatar} alt={msg.senderName} className="h-full w-full object-cover" />
                  ) : (
                    msg.senderInitials
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className={`flex items-center gap-1.5 text-[10px] text-sage-500 ${isMe ? "justify-end" : ""}`}>
                    <span className="font-semibold text-ink">{isMe ? "Tú" : msg.senderName}</span>
                    {msg.verified && <CheckCircle2 size={11} className="text-jade-600 shrink-0" />}
                    <span>•</span>
                    <span>{msg.zone}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`rounded-2xl px-3.5 py-2 text-xs sm:text-sm leading-relaxed shadow-2xs ${
                      isMe
                        ? "bg-jade-500 text-white rounded-tr-xs"
                        : "bg-white text-ink border border-line rounded-tl-xs"
                    }`}
                  >
                    <p>{msg.text}</p>

                    {msg.isTradeProposal && msg.tradeOffered && msg.tradeWanted && (
                      <div
                        className={`mt-2 rounded-xl p-2.5 border text-xs ${
                          isMe
                            ? "bg-jade-600/50 border-jade-400 text-white"
                            : "bg-jade-50/70 border-jade-200 text-ink"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold mb-1.5">
                          <Repeat size={12} className={isMe ? "text-amber-300" : "text-jade-700"} />
                          <span className={isMe ? "text-white" : "text-jade-800"}>Propuesta de Trueque</span>
                        </div>
                        <div className="space-y-0.5 text-[11px]">
                          <div><span className="font-semibold opacity-80">Ofrece:</span> {msg.tradeOffered}</div>
                          <div><span className="font-semibold opacity-80">Busca:</span> {msg.tradeWanted}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. Panel opcional de proponer trueque estructurado */}
        {showTradeComposer && (
          <div className="border-t border-line bg-jade-50/80 p-3 space-y-2 shrink-0 animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between text-xs font-bold text-jade-800">
              <span className="flex items-center gap-1.5">
                <Repeat size={14} className="text-jade-600" />
                Proponer trueque directo en el grupo
              </span>
              <button
                type="button"
                onClick={() => setShowTradeComposer(false)}
                className="text-sage-500 hover:text-ink"
              >
                <X size={15} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                value={offeredItem}
                onChange={(e) => setOfferedItem(e.target.value)}
                placeholder="¿Qué ofreces? Ej. Batería de moto"
                className="h-8 px-3 rounded-xl border border-line bg-white text-xs text-ink outline-none focus:border-jade-500"
              />
              <input
                type="text"
                value={wantedItem}
                onChange={(e) => setWantedItem(e.target.value)}
                placeholder="¿Qué buscas a cambio? Ej. Casco L"
                className="h-8 px-3 rounded-xl border border-line bg-white text-xs text-ink outline-none focus:border-jade-500"
              />
            </div>
          </div>
        )}

        {/* 4. Barra de Enviar Mensaje */}
        <footer className="p-3 bg-white border-t border-line shrink-0">
          {isJoined ? (
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTradeComposer((prev) => !prev)}
                title="Proponer trueque en el grupo"
                className={`flex h-10 shrink-0 items-center gap-1.5 px-3 rounded-xl border text-xs font-semibold transition ${
                  showTradeComposer
                    ? "bg-jade-500 text-white border-jade-500"
                    : "bg-paper text-jade-700 border-line hover:border-jade-400 hover:bg-jade-50"
                }`}
              >
                <Repeat size={15} />
                <span className="hidden sm:inline">Proponer Trueque</span>
              </button>

              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={`Escribe un mensaje en ${community.name}...`}
                className="flex-1 h-10 px-4 rounded-xl border border-line bg-paper text-xs sm:text-sm text-ink outline-none transition focus:border-jade-500 focus:bg-white"
              />

              <button
                type="submit"
                disabled={!inputVal.trim() && !offeredItem.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-jade-500 text-white transition hover:bg-jade-600 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-jade-500"
                aria-label="Enviar mensaje"
              >
                <Send size={16} />
              </button>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-paper p-3 rounded-2xl border border-line">
              <div className="flex items-center gap-2 text-xs text-ink-soft">
                <Users size={16} className="text-jade-600 shrink-0" />
                <span>Debes unirte a <strong>{community.name}</strong> para poder enviar mensajes y proponer trueques.</span>
              </div>
              {onToggleJoin && (
                <button
                  type="button"
                  onClick={onToggleJoin}
                  className="inline-flex items-center gap-1.5 rounded-full bg-jade-500 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-jade-600 shadow-xs"
                >
                  Unirme a la comunidad
                </button>
              )}
            </div>
          )}
        </footer>
      </div>

      {/* ================= COLUMNA DERECHA: INFO DEL GRUPO (ESTILO WHATSAPP) ================= */}
      {showRightPanel && (
        <aside className="w-80 sm:w-96 border-l border-line bg-white flex flex-col shrink-0 animate-in slide-in-from-right duration-200">
          {/* Header del panel */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-line bg-white shrink-0">
            <span className="font-display text-sm font-bold text-ink">Info. del grupo</span>
            <button
              type="button"
              onClick={() => setShowRightPanel(false)}
              className="p-1.5 rounded-full text-sage-500 hover:text-ink hover:bg-paper transition"
              aria-label="Cerrar panel de información"
            >
              <X size={18} />
            </button>
          </div>

          {/* Contenido scroleable estilo WhatsApp */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5">
            {/* Foto grande centrada + Nombre + Miembros */}
            <div className="text-center">
              <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-line shadow-xs bg-jade-100">
                {community.image ? (
                  <img src={community.image} alt={community.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xl font-bold text-jade-700">
                    {community.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <h3 className="mt-3 font-display text-base font-bold text-ink leading-snug">
                {community.name}
              </h3>
              <p className="text-xs text-sage-500 mt-0.5">
                Grupo · {totalMembers} miembros
              </p>
            </div>

            {/* Acciones rápidas circulares estilo WhatsApp */}
            <div className="grid grid-cols-3 gap-2 border-y border-line py-3 text-center">
              <button
                type="button"
                onClick={() => alert(`Enlace de invitación copiado para ${community.name}`)}
                className="flex flex-col items-center gap-1 text-xs text-jade-700 hover:opacity-80"
              >
                <div className="h-9 w-9 rounded-full bg-jade-50 border border-jade-100 flex items-center justify-center">
                  <Share2 size={16} />
                </div>
                <span className="text-[11px] font-medium text-ink">Compartir</span>
              </button>

              <button
                type="button"
                onClick={() => alert("Notificaciones silenciadas para esta comunidad.")}
                className="flex flex-col items-center gap-1 text-xs text-sage-600 hover:opacity-80"
              >
                <div className="h-9 w-9 rounded-full bg-paper border border-line flex items-center justify-center">
                  <Bell size={16} />
                </div>
                <span className="text-[11px] font-medium text-ink">Silenciar</span>
              </button>

              <button
                type="button"
                onClick={onToggleJoin}
                className="flex flex-col items-center gap-1 text-xs text-jade-700 hover:opacity-80"
              >
                <div className="h-9 w-9 rounded-full bg-jade-50 border border-jade-100 flex items-center justify-center">
                  <Users size={16} />
                </div>
                <span className="text-[11px] font-medium text-ink">
                  {isJoined ? "Salir" : "Unirme"}
                </span>
              </button>
            </div>

            {/* Descripción */}
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-sage-500 mb-1">
                Descripción
              </span>
              <p className="text-xs leading-relaxed text-ink bg-paper p-3 rounded-xl border border-line">
                {community.description}
              </p>
              <p className="text-[11px] text-sage-400 mt-1">
                Ubicación principal: <strong>{community.zone}</strong>
              </p>
            </div>

            {/* Seguridad y Privacidad */}
            <div className="space-y-2 border-t border-line pt-3">
              <div className="flex items-center gap-3 text-xs text-ink">
                <ShieldCheck size={16} className="text-jade-600 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-ink leading-tight">Intercambio Verificado</p>
                  <p className="text-[11px] text-sage-500">Puntos Seguros oficiales de Chimbote</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-ink">
                <Lock size={16} className="text-sage-500 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-ink leading-tight">Comunidad protegida</p>
                  <p className="text-[11px] text-sage-500">Sin dinero ni transacciones bancarias</p>
                </div>
              </div>
            </div>

            {/* Lista de Miembros estilo WhatsApp */}
            <div className="border-t border-line pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-ink">
                  {totalMembers} miembros
                </span>
                <span className="text-[11px] text-jade-600 font-medium">Ver todos</span>
              </div>

              <div className="space-y-2">
                {sampleMembers.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-1 rounded-lg hover:bg-paper">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-jade-100 flex items-center justify-center text-xs font-bold text-jade-700 border border-line shrink-0">
                        {m.avatar ? (
                          <img src={m.avatar} alt={m.name} className="h-full w-full object-cover" />
                        ) : (
                          m.initials || m.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-ink truncate leading-tight flex items-center gap-1">
                          {m.name}
                          {m.verified && <CheckCircle2 size={11} className="text-jade-600 shrink-0" />}
                        </p>
                        <p className="text-[10px] text-sage-500 truncate">{m.zone}</p>
                      </div>
                    </div>
                    {m.role === "Admin. del grupo" ? (
                      <span className="text-[10px] bg-jade-50 text-jade-700 px-2 py-0.5 rounded-full font-semibold shrink-0">
                        Admin. del grupo
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* Opciones finales: Salir / Reportar */}
            <div className="border-t border-line pt-3 space-y-2">
              {isJoined && (
                <button
                  type="button"
                  onClick={onToggleJoin}
                  className="flex items-center gap-2 text-xs font-medium text-red-600 hover:text-red-700 w-full p-2 rounded-xl hover:bg-red-50 transition"
                >
                  <LogOut size={15} />
                  <span>Salir del grupo</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => alert("Reporte enviado a los moderadores de Truekly.")}
                className="flex items-center gap-2 text-xs font-medium text-sage-600 hover:text-ink w-full p-2 rounded-xl hover:bg-paper transition"
              >
                <Flag size={15} />
                <span>Reportar comunidad</span>
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
