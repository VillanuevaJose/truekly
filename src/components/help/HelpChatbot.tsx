import { useEffect, useRef, useState } from "react";
import { HelpCircle, RotateCcw, Send, ShieldCheck, X } from "lucide-react";
import {
  HELP_CATEGORIES,
  HELP_FAQ_ITEMS,
  findBestFaqMatches,
  type HelpCategoryId,
  type HelpFaqItem,
} from "../../data/helpChatbotData";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  steps?: string[];
  suggestions?: HelpFaqItem[];
}

const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome",
  sender: "bot",
  text: "Hola, soy la guía rápida de Truekly. Elige un tema o escribe tu duda sobre seguridad, publicaciones o intercambios.",
};

export function HelpChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<HelpCategoryId>("seguridad");
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const categoryQuestions = HELP_FAQ_ITEMS.filter((i) => i.category === activeCategory);

  const handleSelectFaq = (item: HelpFaqItem) => {
    const now = Date.now();
    setMessages((prev) => [
      ...prev,
      { id: `u-${now}`, sender: "user", text: item.question },
      { id: `b-${now + 1}`, sender: "bot", text: item.answer, steps: item.steps },
    ]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");

    const matches = findBestFaqMatches(trimmed);
    const now = Date.now();

    if (matches.length > 0) {
      const top = matches[0];
      const others = matches.slice(1);
      setMessages((prev) => [
        ...prev,
        { id: `u-${now}`, sender: "user", text: trimmed },
        {
          id: `b-${now + 1}`,
          sender: "bot",
          text: top.answer,
          steps: top.steps,
          suggestions: others.length > 0 ? others : undefined,
        },
      ]);
      return;
    }

    setMessages((prev) => [
      ...prev,
      { id: `u-${now}`, sender: "user", text: trimmed },
      {
        id: `b-${now + 1}`,
        sender: "bot",
        text: "No encontré una coincidencia exacta. Aquí tienes las guías principales de seguridad y uso:",
        suggestions: HELP_FAQ_ITEMS.slice(0, 3),
      },
    ]);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          role="dialog"
          aria-label="Asistente de ayuda Truekly"
          className="mb-3 flex h-[min(540px,78vh)] w-[min(370px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-xl dark:border-white/10 dark:bg-[#121413]"
        >
          {/* Cabecera */}
          <header className="flex items-center justify-between border-b border-line bg-paper/70 px-4 py-3 dark:border-white/10 dark:bg-[#181C1A]">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-jade-50 text-jade-700 dark:bg-jade-500/15 dark:text-jade-400">
                <ShieldCheck size={17} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-ink dark:text-white">
                  Asistente Truekly
                </h2>
                <p className="text-[11px] text-sage-600 dark:text-white/60">
                  Guía de uso y seguridad
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMessages([INITIAL_MESSAGE])}
                aria-label="Reiniciar conversación"
                title="Reiniciar"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sage-600 transition hover:bg-white dark:text-white/60 dark:hover:bg-white/10"
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar asistente"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sage-600 transition hover:bg-white dark:text-white/60 dark:hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>
          </header>

          {/* Selector de categorías */}
          <div
            role="tablist"
            aria-label="Temas de ayuda"
            className="flex gap-1.5 overflow-x-auto border-b border-line px-3 py-2 dark:border-white/10"
          >
            {HELP_CATEGORIES.map((cat) => {
              const active = cat.id === activeCategory;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                    active
                      ? "bg-jade-600 text-white"
                      : "bg-paper text-ink-soft hover:bg-jade-50 dark:bg-white/5 dark:text-white/75 dark:hover:bg-white/10"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Conversación + preguntas rápidas */}
          <div className="flex-1 space-y-3 overflow-y-auto p-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-jade-600 text-white"
                      : "border border-line bg-paper/70 text-ink dark:border-white/10 dark:bg-[#181C1A] dark:text-white/90"
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.steps && msg.steps.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] text-ink-soft dark:text-white/80">
                      {msg.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.suggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectFaq(s)}
                        className="rounded-xl border border-line bg-white px-2.5 py-1.5 text-left text-[11px] font-medium text-jade-700 transition hover:border-jade-400 hover:bg-jade-50 dark:border-white/10 dark:bg-[#181C1A] dark:text-jade-400 dark:hover:bg-white/10"
                      >
                        {s.question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Preguntas de la categoría activa */}
            <div className="pt-1">
              <p className="mb-1.5 text-[11px] font-semibold text-sage-600 dark:text-white/55">
                Preguntas frecuentes ({HELP_CATEGORIES.find((c) => c.id === activeCategory)?.label}):
              </p>
              <div className="flex flex-col gap-1.5">
                {categoryQuestions.map((faq) => (
                  <button
                    key={faq.id}
                    type="button"
                    onClick={() => handleSelectFaq(faq)}
                    className="rounded-xl border border-line bg-white px-3 py-2 text-left text-xs font-medium text-ink transition hover:border-jade-500 hover:bg-jade-50/60 dark:border-white/10 dark:bg-[#181C1A] dark:text-white/90 dark:hover:border-jade-500/50 dark:hover:bg-white/10"
                  >
                    {faq.question}
                  </button>
                ))}
              </div>
            </div>
            <div ref={endRef} />
          </div>

          {/* Buscador de duda */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 border-t border-line bg-white p-2.5 dark:border-white/10 dark:bg-[#121413]"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu duda (ej. estafa, revisión...)"
              aria-label="Escribir pregunta de ayuda"
              className="h-9 flex-1 rounded-xl border border-line bg-paper px-3 text-xs text-ink outline-none transition placeholder:text-sage-500 focus:border-jade-500 focus:bg-white dark:border-white/10 dark:bg-[#181C1A] dark:text-white dark:placeholder:text-white/40"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Buscar respuesta"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-jade-600 text-white transition hover:bg-jade-700 disabled:opacity-40"
            >
              <Send size={14} />
            </button>
          </form>
        </section>
      )}

      {/* Botón flotante >= 44px */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Cerrar asistente de ayuda" : "Abrir asistente de ayuda"}
        className="ml-auto flex h-12 items-center gap-2 rounded-full border border-jade-700/20 bg-jade-600 px-4 text-xs font-semibold text-white shadow-lg transition hover:bg-jade-700 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade-500 motion-reduce:transition-none"
      >
        <HelpCircle size={18} aria-hidden="true" />
        <span>Ayuda</span>
      </button>
    </div>
  );
}
