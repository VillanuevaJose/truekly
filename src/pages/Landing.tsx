import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  AlertTriangle,
  X,
  User,
  Package,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import type { Product } from "../data/mockProducts";

type LandingProps = {
  onNavigateToFeed?: () => void;
  onOpenAuth?: () => void;
  onOpenProfile?: () => void;
  onSelectProduct?: (prod: Product) => void;
};

/**
 * Hook para detectar si el usuario prefiere movimiento reducido
 */
function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
}

export default function Landing({
  onNavigateToFeed,
  onOpenAuth,
  onOpenProfile,
  onSelectProduct: _onSelectProduct,
}: LandingProps) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const reducedMotion = useReducedMotion();

  const [isLoaded, setIsLoaded] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Aviso legal flotante con persistencia en sessionStorage
  const [showDemoNotice, setShowDemoNotice] = useState(() => {
    if (typeof window === "undefined") return true;
    return sessionStorage.getItem("truekly_demo_notice_dismissed") !== "true";
  });

  const handleDismissNotice = () => {
    setShowDemoNotice(false);
    try {
      sessionStorage.setItem("truekly_demo_notice_dismissed", "true");
    } catch {
      // Ignorar en caso de bloqueo de storage
    }
  };

  // Trigger de inicio de la coreografía Lyniq
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Cierre de menú de usuario al hacer click afuera
  useEffect(() => {
    if (!isUserMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  const handleFeed = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (onNavigateToFeed) onNavigateToFeed();
    else window.location.hash = "#feed";
  };

  const handleAuth = () => {
    if (onOpenAuth) onOpenAuth();
    else window.location.hash = "#ingresar";
  };

  const userInitials = user?.nombre
    ? user.nombre
        .split(" ")
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
    : "TK";

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 selection:bg-jade-500 selection:text-white ${
        isDark ? "bg-[#070908] text-[#F3F4F3]" : "bg-[#F8F9F8] text-ink"
      }`}
    >
      
      {/* =========================================================
          ESTILOS Y FÍSICA CINEMATOGRÁFICA LYNIQ
          Extraídos de https://jazzed-goal-219652.framer.app
          ========================================================= */}
      <style>{`
        /* 1. Zoom out cinematográfico del fondo (0.0s - 1.5s) */
        .lyniq-bg-enter {
          animation: lyniqBgZoom 1.5s cubic-bezier(0.68, 0, 0.16, 0.97) forwards;
          will-change: transform;
        }
        @keyframes lyniqBgZoom {
          0% { transform: scale(1.22); }
          100% { transform: scale(1.0); }
        }

        /* 2. Aterrizaje monumental del titular (1.15s - 2.35s) */
        .lyniq-headline-enter {
          animation: lyniqHeadlineLand 1.2s cubic-bezier(0.05, 0.65, 0.22, 0.96) 1.15s forwards;
          will-change: transform, opacity;
        }
        @keyframes lyniqHeadlineLand {
          0% {
            opacity: 0;
            transform: scale(1.35) translateY(120px);
          }
          100% {
            opacity: 1;
            transform: scale(1.0) translateY(0);
          }
        }

        /* 3. Resorte elástico de navegación y controles (1.8s) */
        .lyniq-spring-nav {
          animation: lyniqSpring 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 1.8s forwards;
          will-change: transform, opacity;
        }

        @keyframes lyniqSpring {
          0% {
            opacity: 0;
            transform: translateY(32px);
          }
          65% {
            transform: translateY(-4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Reducción de movimiento accesible */
        @media (prefers-reduced-motion: reduce) {
          .lyniq-bg-enter,
          .lyniq-headline-enter,
          .lyniq-spring-nav {
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>

      {/* Aviso legal de prototipo técnico (ANPD) */}
      {showDemoNotice && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-4 right-4 left-4 sm:left-auto sm:right-6 z-50 max-w-md rounded-2xl border border-amber-500/30 bg-[#121008]/95 p-3.5 shadow-2xl backdrop-blur-md transition-all duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            </div>

            <div className="flex-1 pr-1 text-xs">
              <p className="font-semibold text-amber-200">
                Entorno de demostración y portafolio
              </p>
              <p className="mt-0.5 leading-relaxed text-amber-300/80 text-[11px]">
                Este aplicativo es un prototipo técnico de muestra. Las funciones son de prueba; por favor, no ingreses documentos ni datos oficiales reales.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDismissNotice}
              aria-label="Cerrar notificación"
              className="shrink-0 rounded-lg p-1 text-amber-400 hover:bg-amber-500/20 transition-colors focus-visible:outline-2 focus-visible:outline-amber-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </aside>
      )}

      {/* =========================================================
          1. HERO POSTER 100VH (ESTILO LYNIQ PURO)
          ========================================================= */}
      <section 
        id="inicio"
        className="relative w-full h-screen min-h-[680px] max-h-[1080px] overflow-hidden flex flex-col justify-between p-5 sm:p-8 lg:p-12 sticky top-0 z-10"
      >
        {/* Fondo Cinematográfico con Zoom-Out Lento */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src="/images/hero-intercambio.jpg"
            alt=""
            aria-hidden="true"
            className={`w-full h-full object-cover object-center filter ${
              isDark
                ? "brightness-[0.72] contrast-[1.08] saturate-[1.10]"
                : "brightness-[0.98] contrast-[1.02] saturate-[1.05]"
            } ${
              isLoaded && !reducedMotion ? "lyniq-bg-enter" : "scale-100"
            }`}
          />
          {/* Degradado suave y reducido: deja el centro despejado y visible */}
          <div 
            className={`absolute inset-0 ${
              isDark
                ? "bg-gradient-to-t from-[#070908] via-transparent to-[#070908]/30"
                : "bg-gradient-to-t from-[#F8F9F8] via-transparent to-[#F8F9F8]/25"
            }`}
            aria-hidden="true"
          />
        </div>

        {/* TOPBAR / NAVEGACIÓN FLOTANTE LYNIQ */}
        <header className={`relative z-20 flex items-center justify-between opacity-0 ${isLoaded ? "lyniq-spring-nav" : ""}`}>
          
          {/* Logo Brandmark */}
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
            }}
            className="flex items-center gap-2 group focus-visible:outline-2 focus-visible:outline-jade-500"
          >
            <span className={`font-bold text-xl sm:text-2xl tracking-tighter uppercase font-sans ${isDark ? "text-white" : "text-ink"}`}>
              Truekly<span className="text-jade-500">®</span>
            </span>
          </a>

          {/* Menú Central Discreto */}
          <nav className={`hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest ${isDark ? "text-white/70" : "text-ink/70"}`}>
            <a href="#manifiesto" className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-ink"}`}>Filosofía</a>
            <a href="#comparativa" className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-ink"}`}>Por qué Truekly</a>
            <a href="#protocolo" className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-ink"}`}>Protocolo</a>
          </nav>

          {/* Acciones de Cabecera */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border shadow-sm transition-transform active:scale-95 ${
                    isDark ? "border-white/20" : "border-line"
                  }`}
                >
                  {user.fotoPerfil ? (
                    <img src={user.fotoPerfil} alt={user.nombre} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-jade-600 text-xs font-bold uppercase text-white select-none">
                      {userInitials}
                    </div>
                  )}
                </button>

                {isUserMenuOpen && (
                  <div
                    role="menu"
                    className={`absolute right-0 top-full mt-2 w-56 rounded-2xl border p-2 shadow-2xl z-50 ${
                      isDark ? "border-white/10 bg-[#121413] text-white" : "border-line bg-white text-ink"
                    }`}
                  >
                    <div className="px-3 py-2">
                      <p className={`truncate text-xs font-semibold ${isDark ? "text-white" : "text-ink"}`}>{user.nombre}</p>
                      <p className={`truncate text-[11px] ${isDark ? "text-white/60" : "text-sage-500"}`}>{user.email}</p>
                    </div>
                    <div className={`my-1.5 border-t ${isDark ? "border-white/10" : "border-line"}`} />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onOpenProfile) onOpenProfile();
                        else window.location.hash = "#perfil";
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition ${
                        isDark ? "text-white/80 hover:bg-white/10" : "text-ink/80 hover:bg-paper"
                      }`}
                    >
                      <User size={15} className={isDark ? "text-white/60" : "text-sage-500"} />
                      <span>Mi perfil</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onOpenProfile) onOpenProfile();
                        else window.location.hash = "#perfil";
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition ${
                        isDark ? "text-white/80 hover:bg-white/10" : "text-ink/80 hover:bg-paper"
                      }`}
                    >
                      <Package size={15} className={isDark ? "text-white/60" : "text-sage-500"} />
                      <span>Mis publicaciones</span>
                    </button>
                    <div className={`my-1.5 border-t ${isDark ? "border-white/10" : "border-line"}`} />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-500 transition hover:bg-rose-500/10"
                    >
                      <LogOut size={15} className="text-rose-500" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAuth}
                className={`hidden sm:inline-flex items-center text-xs font-semibold uppercase tracking-wider px-3 py-2 transition-colors ${
                  isDark ? "text-white/80 hover:text-white" : "text-ink/80 hover:text-ink"
                }`}
              >
                Ingresar
              </button>
            )}

            {/* Botón de alternar modo claro / oscuro */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-200 active:scale-95 shadow-sm ${
                isDark
                  ? "border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-amber-400"
                  : "border-line bg-white text-ink hover:bg-paper hover:text-jade-600"
              }`}
            >
              {isDark ? (
                <Sun size={18} className="text-amber-400" />
              ) : (
                <Moon size={18} className="text-sage-500" />
              )}
            </button>

            {/* Botón Explorar */}
            <a
              href="#feed"
              onClick={handleFeed}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-lg ${
                isDark
                  ? "bg-white text-[#070908] hover:bg-jade-400 hover:text-white"
                  : "bg-jade-600 text-white hover:bg-jade-500 shadow-jade-950/20"
              }`}
            >
              <span>Explorar</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </header>

        {/* BASE DEL HERO: TITULAR MONUMENTAL LYNIQ (Borde a Borde) */}
        <div className="relative z-20 w-full overflow-hidden pb-2">
          
          {/* Titular Masivo que ocupa todo el ancho */}
          <div className={`opacity-0 ${isLoaded ? "lyniq-headline-enter" : ""}`}>
            <h1 className={`text-[clamp(54px,14vw,220px)] font-bold tracking-[-0.06em] leading-[0.82] uppercase select-none text-left ${
              isDark ? "text-white" : "text-ink"
            }`}>
              Intercambio
            </h1>
          </div>

          {/* Fila Inferior con Descripción Editorial y Botón de Inicio */}
          <div className={`mt-6 pt-5 border-t flex flex-col md:flex-row md:items-end justify-between gap-6 opacity-0 ${
            isDark ? "border-white/15" : "border-line"
          } ${isLoaded ? "lyniq-spring-nav" : ""}`}>
            <p className={`max-w-xl text-sm sm:text-base leading-relaxed font-normal ${
              isDark ? "text-white/80" : "text-ink/80"
            }`}>
              Cambia lo que tienes por lo que necesitas. La primera plataforma de trueque directo entre personas con perfiles verificados y acuerdos claros antes de salir de casa.
            </p>

            <div className="flex items-center gap-4 shrink-0">
              <a
                href="#feed"
                onClick={handleFeed}
                className="inline-flex items-center gap-3 rounded-full bg-jade-600 hover:bg-jade-500 text-white font-semibold text-xs uppercase tracking-widest px-7 py-4 transition-all duration-200 active:scale-95 shadow-xl shadow-jade-950/20"
              >
                <span>Ver artículos en Chimbote</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          2. SECCIÓN: MANIFIESTO Y FILOSOFÍA EDITORIAL
          ========================================================= */}
      <section id="manifiesto" className={`relative z-20 border-t py-24 sm:py-32 px-5 sm:px-8 ${
        isDark ? "bg-[#0C0E0D] border-white/10" : "bg-[#F2F4F2] border-line"
      }`}>
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Columna Izquierda */}
            <div className="lg:col-span-4 text-left">
              <span className={`text-xs uppercase tracking-[0.2em] font-bold block mb-3 ${
                isDark ? "text-jade-400" : "text-jade-600"
              }`}>
                Filosofía
              </span>
              <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight leading-tight ${
                isDark ? "text-white" : "text-ink"
              }`}>
                El trueque no es el pasado. Es el futuro más inteligente.
              </h2>
            </div>

            {/* Columna Derecha: 3 Pilares */}
            <div className="lg:col-span-8 space-y-12">
              <p className={`text-lg sm:text-xl leading-relaxed font-light ${
                isDark ? "text-white/80" : "text-ink/80"
              }`}>
                En Perú miles de personas guardan en sus casas bicicletas, cámaras, instrumentos o laptops que ya no usan mientras buscan comprar exactamente lo que otro vecino tiene arrimado. Truekly elimina el dinero de la ecuación para recuperar el valor real de las cosas.
              </p>

              <div className={`grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t ${
                isDark ? "border-white/10" : "border-line"
              }`}>
                <div>
                  <div className={`text-xs font-bold tracking-wider uppercase mb-2 ${
                    isDark ? "text-jade-400" : "text-jade-600"
                  }`}>Libre</div>
                  <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-ink"}`}>Sin tasaciones forzadas</h3>
                  <p className={`mt-2 text-xs leading-relaxed ${isDark ? "text-white/60" : "text-sage-500"}`}>
                    Ambas partes deciden libremente qué equivale a qué. Sin comisiones bancarias ni valuadores automáticos.
                  </p>
                </div>

                <div>
                  <div className={`text-xs font-bold tracking-wider uppercase mb-2 ${
                    isDark ? "text-amber-400" : "text-amber-600"
                  }`}>Seguro</div>
                  <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-ink"}`}>Puntos de encuentro</h3>
                  <p className={`mt-2 text-xs leading-relaxed ${isDark ? "text-white/60" : "text-sage-500"}`}>
                    Lugares públicos, concurridos y con resguardo recomendados en tu ciudad para hacer el intercambio sin riesgos.
                  </p>
                </div>

                <div>
                  <div className={`text-xs font-bold tracking-wider uppercase mb-2 ${
                    isDark ? "text-jade-400" : "text-jade-600"
                  }`}>Auditable</div>
                  <h3 className={`text-base font-semibold ${isDark ? "text-white" : "text-ink"}`}>Acuerdos registrados</h3>
                  <p className={`mt-2 text-xs leading-relaxed ${isDark ? "text-white/60" : "text-sage-500"}`}>
                    Términos pactados por ambas partes dentro de la app antes de salir de casa para evitar sorpresas.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          3. SECCIÓN: MATRIZ DE CONTRASTE (MARKETPLACE TRADICIONAL VS TRUEKLY)
          ========================================================= */}
      <section id="comparativa" className={`relative z-20 border-t py-24 sm:py-32 px-5 sm:px-8 ${
        isDark ? "bg-[#070908] border-white/10" : "bg-[#F8F9F8] border-line"
      }`}>
        <div className="max-w-7xl mx-auto">
          
          {/* Encabezado Editorial */}
          <div className="max-w-3xl mb-16 text-left">
            <span className={`text-xs uppercase tracking-[0.2em] font-bold block mb-3 ${
              isDark ? "text-jade-400" : "text-jade-600"
            }`}>
              Por Qué Truekly
            </span>
            <h2 className={`text-3xl sm:text-5xl font-bold tracking-tight leading-tight ${
              isDark ? "text-white" : "text-ink"
            }`}>
              Comprar o vender por internet en Perú se convirtió en una ruleta rusa.
            </h2>
            <p className={`mt-4 text-base sm:text-lg leading-relaxed font-normal ${
              isDark ? "text-white/70" : "text-sage-500"
            }`}>
              Vouchers de Yape falsos, regateos que destruyen el valor de tus cosas y citas con perfiles anónimos. Eliminamos el dinero de la ecuación para eliminar el riesgo.
            </p>
          </div>

          {/* Grid de Dos Columnas Comparativas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Panel Izquierdo: El Caos Habitual */}
            <div className={`rounded-3xl border p-7 sm:p-10 flex flex-col justify-between relative overflow-hidden ${
              isDark
                ? "bg-[#0F1110] border-rose-500/20 shadow-2xl"
                : "bg-white border-rose-200 shadow-md"
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500/40 via-rose-500/20 to-transparent" />
              
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-6 ${
                  isDark
                    ? "bg-rose-950/60 border-rose-500/30 text-rose-300"
                    : "bg-rose-50 border-rose-200 text-rose-700"
                }`}>
                  <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  <span>El Mercado Tradicional</span>
                </div>

                <h3 className={`text-2xl sm:text-3xl font-bold mb-3 ${
                  isDark ? "text-white" : "text-ink"
                }`}>
                  La segunda mano informal
                </h3>
                <p className={`text-sm mb-8 leading-relaxed ${
                  isDark ? "text-white/60" : "text-sage-500"
                }`}>
                  Facebook Marketplace, grupos de reventa y clasificados anónimos sin ningún respaldo.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                      isDark ? "bg-rose-950/60 border-rose-500/30" : "bg-rose-50 border-rose-200"
                    }`}>
                      <XCircle className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <h4 className={`text-base font-semibold ${isDark ? "text-white" : "text-ink"}`}>Vouchers falsos y estafas bancarias</h4>
                      <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isDark ? "text-white/60" : "text-sage-500"}`}>
                        Capturas editadas de Yape o Plin, transferencias diferidas que se cancelan al minuto y cheques sin fondos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                      isDark ? "bg-rose-950/60 border-rose-500/30" : "bg-rose-50 border-rose-200"
                    }`}>
                      <XCircle className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <h4 className={`text-base font-semibold ${isDark ? "text-white" : "text-ink"}`}>Perfiles anónimos y doxxing</h4>
                      <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isDark ? "text-white/60" : "text-sage-500"}`}>
                        Cuentas recién creadas sin identidad real, sin historial y con riesgo permanente de asalto o acoso.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                      isDark ? "bg-rose-950/60 border-rose-500/30" : "bg-rose-50 border-rose-200"
                    }`}>
                      <XCircle className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <h4 className={`text-base font-semibold ${isDark ? "text-white" : "text-ink"}`}>Regateo descarado y pérdida de valor</h4>
                      <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isDark ? "text-white/60" : "text-sage-500"}`}>
                        Ofertas que intentan quitarte tus cosas al 20% de su valor real aprovechando tu urgencia para revenderlas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                      isDark ? "bg-rose-950/60 border-rose-500/30" : "bg-rose-50 border-rose-200"
                    }`}>
                      <XCircle className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <h4 className={`text-base font-semibold ${isDark ? "text-white" : "text-ink"}`}>Citas en esquinas peligrosas</h4>
                      <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isDark ? "text-white/60" : "text-sage-500"}`}>
                        Tener que dar la dirección de tu casa a extraños o coordinar encuentros en calles oscuras sin vigilancia.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`mt-10 pt-6 border-t flex items-center justify-between text-xs ${
                isDark ? "border-white/10 text-rose-300/80" : "border-rose-100 text-rose-700"
              }`}>
                <span>Riesgo para el usuario:</span>
                <span className="font-semibold uppercase tracking-wider">Alto y desprotegido</span>
              </div>
            </div>

            {/* Panel Derecho: El Estándar Truekly */}
            <div className={`rounded-3xl border p-7 sm:p-10 flex flex-col justify-between relative overflow-hidden ${
              isDark
                ? "bg-gradient-to-b from-[#0F1F1A] to-[#0A1412] border-jade-500/40 shadow-2xl"
                : "bg-gradient-to-b from-[#F2FBF7] to-[#E6F4EE] border-jade-500/30 shadow-lg"
            }`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-jade-400 via-jade-500 to-transparent" />
              
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-6 ${
                  isDark
                    ? "bg-jade-950/80 border-jade-500/40 text-jade-300"
                    : "bg-jade-100/90 border-jade-300 text-jade-800"
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-jade-500" />
                  <span>El Estándar Truekly</span>
                </div>

                <h3 className={`text-2xl sm:text-3xl font-bold mb-3 ${
                  isDark ? "text-white" : "text-ink"
                }`}>
                  Intercambio directo, seguro y verificado
                </h3>
                <p className={`text-sm mb-8 leading-relaxed ${
                  isDark ? "text-jade-100/70" : "text-sage-600"
                }`}>
                  Plataforma C2C diseñada para proteger tu integridad física y el valor real de tus bienes.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                      isDark ? "bg-jade-950 border-jade-500/40" : "bg-white border-jade-300"
                    }`}>
                      <CheckCircle2 className="w-4 h-4 text-jade-500" />
                    </div>
                    <div>
                      <h4 className={`text-base font-semibold ${isDark ? "text-white" : "text-ink"}`}>Cero dinero = Cero estafas</h4>
                      <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isDark ? "text-white/70" : "text-ink/80"}`}>
                        Al intercambiar objeto por objeto, es técnicamente imposible que te engañen con transferencias falsas o billetes adulterados.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                      isDark ? "bg-jade-950 border-jade-500/40" : "bg-white border-jade-300"
                    }`}>
                      <CheckCircle2 className="w-4 h-4 text-jade-500" />
                    </div>
                    <div>
                      <h4 className={`text-base font-semibold ${isDark ? "text-white" : "text-ink"}`}>Identidad validada con DNI (Reniec)</h4>
                      <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isDark ? "text-white/70" : "text-ink/80"}`}>
                        Cero bots ni perfiles fantasma. Sabes el nombre y reputación real del vecino con quien estás coordinando.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                      isDark ? "bg-jade-950 border-jade-500/40" : "bg-white border-jade-300"
                    }`}>
                      <CheckCircle2 className="w-4 h-4 text-jade-500" />
                    </div>
                    <div>
                      <h4 className={`text-base font-semibold ${isDark ? "text-white" : "text-ink"}`}>100% de valor conservado</h4>
                      <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isDark ? "text-white/70" : "text-ink/80"}`}>
                        Sin comisiones bancarias ni pérdida por devaluación rápida. Recibes algo de valor equiparable acordado libremente.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                      isDark ? "bg-jade-950 border-jade-500/40" : "bg-white border-jade-300"
                    }`}>
                      <CheckCircle2 className="w-4 h-4 text-jade-500" />
                    </div>
                    <div>
                      <h4 className={`text-base font-semibold ${isDark ? "text-white" : "text-ink"}`}>Puntos seguros de encuentro</h4>
                      <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isDark ? "text-white/70" : "text-ink/80"}`}>
                        Centros comerciales, estaciones y plazas concurridas sugeridas por la plataforma para un trato presencial con resguardo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
                isDark ? "border-jade-500/20" : "border-jade-300/50"
              }`}>
                <div className={`flex items-center gap-2 text-xs ${
                  isDark ? "text-jade-300" : "text-jade-800 font-medium"
                }`}>
                  <ShieldCheck className="w-4 h-4 text-jade-500 shrink-0" />
                  <span>Validado y respaldado en la app</span>
                </div>

                <a
                  href="#feed"
                  onClick={handleFeed}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-lg ${
                    isDark
                      ? "bg-jade-500 hover:bg-jade-400 text-white shadow-jade-950/60"
                      : "bg-jade-600 hover:bg-jade-500 text-white shadow-jade-950/20"
                  }`}
                >
                  <span>Conocer la comunidad</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          4. SECCIÓN: PROTOCOLO DE INTERCAMBIO (CÓMO FUNCIONA)
          ========================================================= */}
      <section id="protocolo" className={`relative z-20 border-t py-24 sm:py-32 px-5 sm:px-8 ${
        isDark ? "bg-[#0C0E0D] border-white/10" : "bg-[#F2F4F2] border-line"
      }`}>
        <div className="max-w-7xl mx-auto">
          
          <div className="max-w-2xl text-left mb-16">
            <span className={`text-xs uppercase tracking-[0.15em] font-bold ${
              isDark ? "text-jade-400" : "text-jade-600"
            }`}>
              Protocolo
            </span>
            <h2 className={`text-3xl sm:text-5xl font-bold tracking-tight mt-2 ${
              isDark ? "text-white" : "text-ink"
            }`}>
              Cómo funciona el intercambio
            </h2>
            <p className={`mt-4 text-base leading-relaxed ${
              isDark ? "text-white/70" : "text-sage-500"
            }`}>
              Diseñado con rigor para proteger tu integridad física y garantizar que ambas partes cumplan con lo acordado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                tag: "PUBLICACIÓN",
                title: "Muestra lo que tienes",
                desc: "Sube fotos reales de tus cosas, especifica su condición honesta y qué buscas recibir a cambio.",
                img: "/images/como-funciona/paso-1-publica.jpg",
              },
              {
                step: "02",
                tag: "NEGOCIACIÓN",
                title: "Conversa en privado",
                desc: "Coordina detalles en el chat directo. Anti-spam integrado: un mensaje inicial hasta que decidas responder.",
                img: "/images/como-funciona/paso-2-conversa.jpg",
              },
              {
                step: "03",
                tag: "ENCUENTRO SEGURO",
                title: "Trato en punto seguro",
                desc: "Encuéntrense en plazas o centros comerciales sugeridos por la app y confirmen el trueque juntos.",
                img: "/images/como-funciona/paso-3-intercambia.jpg",
              },
            ].map((p, idx) => (
              <div 
                key={idx}
                className={`rounded-2xl border p-6 flex flex-col justify-between ${
                  isDark
                    ? "border-white/10 bg-[#121413] text-white"
                    : "border-line bg-white text-ink shadow-sm"
                }`}
              >
                <div>
                  <div className={`relative aspect-[16/10] w-full overflow-hidden rounded-xl mb-6 ${
                    isDark ? "bg-black/40" : "bg-paper"
                  }`}>
                    <img 
                      src={p.img} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-jade-600 flex items-center justify-center font-bold text-xs text-white">
                      {p.step}
                    </div>
                  </div>

                  <span className={`text-[10px] uppercase tracking-widest font-bold ${
                    isDark ? "text-jade-400" : "text-jade-600"
                  }`}>
                    {p.tag}
                  </span>
                  <h3 className={`text-xl font-bold mt-1 ${isDark ? "text-white" : "text-ink"}`}>
                    {p.title}
                  </h3>
                  <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-white/70" : "text-sage-500"}`}>
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================
          5. SECCIÓN FINAL: LLAMADO A LA ACCIÓN (ESTILO MANIFIESTO)
          ========================================================= */}
      <section className={`relative z-20 border-t py-24 sm:py-36 px-5 sm:px-8 text-center ${
        isDark ? "bg-[#070908] border-white/10" : "bg-[#F8F9F8] border-line"
      }`}>
        <div className="max-w-4xl mx-auto">
          
          <span className={`text-xs uppercase tracking-[0.2em] font-bold ${
            isDark ? "text-jade-400" : "text-jade-600"
          }`}>
            Comienza Hoy
          </span>
          
          <h2 className={`text-4xl sm:text-6xl font-bold tracking-tight mt-4 leading-tight uppercase font-sans ${
            isDark ? "text-white" : "text-ink"
          }`}>
            ¿Listo para cambiar lo que tienes por lo que quieres?
          </h2>
          
          <p className={`mt-6 text-base sm:text-lg max-w-xl mx-auto leading-relaxed ${
            isDark ? "text-white/70" : "text-sage-500"
          }`}>
            Explora las publicaciones de tu ciudad, conecta con otros usuarios y dale un nuevo destino a tus objetos.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#feed"
              onClick={handleFeed}
              className={`inline-flex items-center gap-3 rounded-full font-bold text-xs uppercase tracking-widest px-8 py-4 transition-all duration-200 active:scale-95 shadow-2xl ${
                isDark
                  ? "bg-white hover:bg-jade-400 text-[#070908] hover:text-white"
                  : "bg-jade-600 hover:bg-jade-500 text-white shadow-jade-950/20"
              }`}
            >
              <span>Explorar catálogo ahora</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

        </div>
      </section>

      {/* =========================================================
          6. FOOTER INSTITUCIONAL EDITORIAL
          ========================================================= */}
      <footer className={`relative z-20 border-t py-14 text-xs px-5 sm:px-8 ${
        isDark ? "border-white/10 bg-[#040505] text-white/50" : "border-line bg-[#EAEEEA] text-sage-500"
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-2.5">
            <span className={`font-bold text-lg tracking-tighter uppercase font-sans ${
              isDark ? "text-white" : "text-ink"
            }`}>
              Truekly<span className="text-jade-500">®</span>
            </span>
            <span className={isDark ? "text-white/20" : "text-ink/20"}>/</span>
            <span className={isDark ? "text-white/60" : "text-sage-500"}>Plataforma C2C de Trueque Libre en Perú</span>
          </div>

          <nav className={`flex flex-wrap items-center justify-center gap-6 text-[11px] font-medium uppercase tracking-wider ${
            isDark ? "text-white/60" : "text-sage-500"
          }`}>
            <a href="#inicio" className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-ink"}`}>Inicio</a>
            <a href="#manifiesto" className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-ink"}`}>Filosofía</a>
            <a href="#comparativa" className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-ink"}`}>Por qué Truekly</a>
            <a href="#protocolo" className={`transition-colors ${isDark ? "hover:text-white" : "hover:text-ink"}`}>Protocolo</a>
          </nav>

          <p className={`text-center md:text-right text-[11px] ${
            isDark ? "text-white/40" : "text-sage-400"
          }`}>
            Ley N° 29733 · Chimbote, Perú
          </p>

        </div>
      </footer>

    </div>
  );
}
