import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  MapPin,
  FileCheck2,
  ArrowRight,
  ArrowLeftRight,
} from "lucide-react";
import { esPE as t } from "../i18n/es-PE";
import { products, type Product } from "../data/mockProducts";
import { PublishIllustration } from "../components/illustrations/PublishIllustration";
import { ChatIllustration } from "../components/illustrations/ChatIllustration";
import { TradeIllustration } from "../components/illustrations/TradeIllustration";

type LandingProps = {
  onNavigateToFeed?: () => void;
  onOpenAuth?: () => void;
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

/**
 * Hook para micro-efecto magnético sutil (máx. 6px) en botones principales
 */
function useMagnetic(reducedMotion: boolean, maxOffset = 6) {
  const ref = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * 0.12;
      const deltaY = (e.clientY - centerY) * 0.12;
      const clampX = Math.max(-maxOffset, Math.min(maxOffset, deltaX));
      const clampY = Math.max(-maxOffset, Math.min(maxOffset, deltaY));
      el.style.transform = `translate3d(${clampX}px, ${clampY}px, 0)`;
    };

    const handleMouseLeave = () => {
      el.style.transform = "translate3d(0, 0, 0)";
    };

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
      el.style.transform = "translate3d(0, 0, 0)";
    };
  }, [reducedMotion, maxOffset]);

  return ref;
}

export default function Landing({ onNavigateToFeed, onOpenAuth }: LandingProps) {
  const reducedMotion = useReducedMotion();
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroMounted, setHeroMounted] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  // Observadores de scroll para reveals de sección
  const [howItWorksVisible, setHowItWorksVisible] = useState(false);
  const [trustVisible, setTrustVisible] = useState(false);
  const [featuredVisible, setFeaturedVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  const howItWorksRef = useRef<HTMLElement>(null);
  const trustRef = useRef<HTMLElement>(null);
  const featuredRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  // Progreso de dibujo de la línea punteada en "Cómo funciona"
  const [dottedProgress, setDottedProgress] = useState(0);

  // Magnetic refs para los dos CTAs principales
  const heroMagneticRef = useMagnetic(reducedMotion, 6);
  const finalCtaMagneticRef = useMagnetic(reducedMotion, 6);

  const handleFeed = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateToFeed) {
      onNavigateToFeed();
    } else {
      window.location.hash = "#feed";
    }
  };

  // Stagger de entrada inicial del Hero
  useEffect(() => {
    const timer = setTimeout(() => {
      setHeroMounted(true);
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // Control de scroll: header background, parallax sutil del hero, y trazado de línea punteada
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          setIsScrolled(scrollY > 20);

          // Parallax sutil en hero (desplazamiento máximo 40px)
          if (!reducedMotion && scrollY < 900) {
            setParallaxOffset(Math.min(40, scrollY * 0.08));
          }

          // Dotted line progress en Cómo funciona
          if (howItWorksRef.current) {
            if (reducedMotion) {
              setDottedProgress(1);
            } else {
              const rect = howItWorksRef.current.getBoundingClientRect();
              const windowHeight = window.innerHeight;
              const start = windowHeight * 0.8;
              const end = windowHeight * 0.25;
              const progress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
              setDottedProgress(progress);
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [reducedMotion]);

  // Observer de reveal al entrar al viewport para cada sección
  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.2,
      rootMargin: "0px 0px -40px 0px",
    };

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === howItWorksRef.current) setHowItWorksVisible(true);
          if (entry.target === trustRef.current) setTrustVisible(true);
          if (entry.target === featuredRef.current) setFeaturedVisible(true);
          if (entry.target === ctaRef.current) setCtaVisible(true);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    if (howItWorksRef.current) observer.observe(howItWorksRef.current);
    if (trustRef.current) observer.observe(trustRef.current);
    if (featuredRef.current) observer.observe(featuredRef.current);
    if (ctaRef.current) observer.observe(ctaRef.current);

    return () => observer.disconnect();
  }, []);

  // Artículos para el carrusel continuo
  const baseItems = products.length > 0 ? (products.length >= 8 ? products.slice(0, 8) : products) : [];
  // Asegurar suficientes elementos base para que el bucle continuo infinito sea perfectamente fluido
  const featuredItems: Product[] = baseItems.length > 0
    ? baseItems.length < 5
      ? [...baseItems, ...baseItems]
      : baseItems
    : [];

  return (
    <div className="min-h-screen bg-paper font-sans text-ink antialiased selection:bg-jade-100 selection:text-jade-700">
      {/* 
        HEADER INSTITUCIONAL:
        Transición suave de transparente a blanco con borde hairline al hacer scroll
      */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "border-b border-ink/[0.08] bg-white/95 backdrop-blur-md shadow-xs"
            : "border-b border-transparent bg-white/70 backdrop-blur-xs"
        }`}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 min-[360px]:px-5 sm:px-8 py-3.5 sm:py-4">
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
            }}
            className="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 focus-visible:outline-offset-4"
            aria-label="Truekly - Inicio"
          >
            <img src="/logo.png" alt="" className="h-8 w-8 sm:h-9 sm:w-9 object-contain" aria-hidden="true" />
            <span className="text-xl sm:text-2xl font-medium tracking-tight text-ink">
              Truekly
            </span>
          </a>

          {/* Navegación: máx. 4 ítems con subrayado animado hairline de izquierda a derecha */}
          <nav aria-label="Navegación principal" className="hidden items-center gap-7 text-sm font-medium text-ink/70 md:flex">
            <a
              href="#como-funciona"
              className="group relative py-1 transition-colors hover:text-jade-600 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 focus-visible:outline-offset-4 rounded-xs"
            >
              <span>{t.nav.howItWorks}</span>
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-jade-600 transition-transform duration-200 ease-out group-hover:scale-x-100"
              />
            </a>
            <a
              href="#articulos-destacados"
              className="group relative py-1 transition-colors hover:text-jade-600 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 focus-visible:outline-offset-4 rounded-xs"
            >
              <span>{t.nav.featured}</span>
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-jade-600 transition-transform duration-200 ease-out group-hover:scale-x-100"
              />
            </a>
            <a
              href="#confianza"
              className="group relative py-1 transition-colors hover:text-jade-600 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 focus-visible:outline-offset-4 rounded-xs"
            >
              <span>{t.nav.trust}</span>
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-jade-600 transition-transform duration-200 ease-out group-hover:scale-x-100"
              />
            </a>
            <a
              href="#feed"
              onClick={handleFeed}
              className="group relative py-1 transition-colors hover:text-jade-600 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 focus-visible:outline-offset-4 rounded-xs"
            >
              <span>{t.nav.explore}</span>
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-jade-600 transition-transform duration-200 ease-out group-hover:scale-x-100"
              />
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-ink/[0.12] px-4 py-2 text-xs sm:text-sm font-medium text-ink transition-all duration-200 hover:border-jade-600 hover:text-jade-700 hover:bg-jade-50/50 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 focus-visible:outline-offset-4"
              >
                Ingresar
              </button>
            )}
            <a
              href="#feed"
              onClick={handleFeed}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-jade-500 px-5 py-2.5 text-xs sm:text-sm font-medium text-white transition-all duration-200 hover:bg-jade-600 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 focus-visible:outline-offset-4"
            >
              {t.nav.explore}
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* 
          1. HERO IMPACTANTE (FONDO BLANCO):
          Tipografía Figma, stagger de entrada en cascada, collage protagonista con fotos de artículos y chips flotantes
        */}
        <section id="inicio" className="relative border-b border-ink/[0.08] bg-white py-14 sm:py-20 lg:py-24 overflow-hidden">
          <div className="mx-auto max-w-[1280px] px-4 min-[360px]:px-5 sm:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
              
              {/* Lado izquierdo: Eyebrow Mono, H1 con clamp, Párrafo con opacidad y CTAs */}
              <div className="lg:col-span-6 text-left">
                {/* Eyebrow con fuente mono y tracking disciplinado */}
                <div
                  className={`transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    heroMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                  }`}
                >
                  <span className="inline-block font-mono text-xs uppercase tracking-[0.08em] text-jade-600 font-medium">
                    {t.howItWorks.tagline}
                  </span>
                </div>

                {/* H1 línea con máscara y desplazamiento hacia arriba */}
                <div className="mt-3 overflow-hidden">
                  <h1
                    className={`text-[clamp(44px,7vw,88px)] font-normal sm:font-medium leading-[1.02] tracking-[-0.02em] text-ink transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] delay-[80ms] ${
                      heroMounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    }`}
                  >
                    {t.hero.title}
                  </h1>
                </div>

                {/* Párrafo con peso disciplinado y 70% de opacidad */}
                <p
                  className={`mt-6 max-w-lg text-[17px] sm:text-[18px] font-normal leading-[1.5] text-ink/70 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] delay-[160ms] ${
                    heroMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  {t.hero.subtitle}
                </p>

                {/* Botones: Primario magnético con flecha dinámica + Secundario con subrayado */}
                <div
                  className={`mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] delay-[240ms] ${
                    heroMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  <a
                    ref={heroMagneticRef}
                    href="#feed"
                    onClick={handleFeed}
                    className="group inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-jade-500 px-7 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:bg-jade-600 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 focus-visible:outline-offset-4 shadow-xs"
                  >
                    <span>{t.hero.primaryCta}</span>
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </a>
                  <a
                    href="#como-funciona"
                    className="group relative inline-flex min-h-[44px] items-center justify-center px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:text-jade-600 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 focus-visible:outline-offset-4 rounded-xs"
                  >
                    <span>{t.hero.secondaryCta}</span>
                    <span
                      aria-hidden="true"
                      className="absolute bottom-1 left-4 right-4 h-[1px] origin-left scale-x-0 bg-jade-600 transition-transform duration-200 ease-out group-hover:scale-x-100"
                    />
                  </a>
                </div>
              </div>

              {/* 
                Lado derecho: Collage de fotos (~50% ancho), formas decorativas detrás con movimiento continuo,
                3 tarjetas de artículos (radio 24px) y 3 chips flotantes estilo pill con borde hairline
              */}
              <div
                className="relative lg:col-span-6 flex items-center justify-center"
                style={{
                  transform: reducedMotion ? "none" : `translate3d(0, -${parallaxOffset}px, 0)`,
                  transition: "transform 0.1s linear",
                }}
              >
                {/* Formas decorativas con movimiento sutil */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-10 -left-8 h-48 w-48 rounded-full bg-jade-100/70 animate-shape-pulse blur-[1px]"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-8 -right-6 h-36 w-36 rounded-full bg-amber-400/25 animate-float-2 blur-[1px]"
                />

                {/* Estructura asimétrica del Collage */}
                <div
                  className={`relative z-10 w-full max-w-[540px] transition-all duration-800 ease-[cubic-bezier(0.22,1,0.36,1)] delay-[320ms] ${
                    heroMounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  }`}
                >
                  <div className="grid grid-cols-12 gap-3.5 sm:gap-4">
                    {/* Tarjeta 1 (Principal dominante): Bicicleta de montaña */}
                    <div className="col-span-12 group relative aspect-[16/10] overflow-hidden rounded-[24px] border border-ink/[0.08] hover:border-ink/20 bg-paper transition-all duration-300 animate-float-1 shadow-xs">
                      <img
                        src="/products/bicicleta.jpg"
                        alt="Bicicleta de montaña en buen estado para intercambio"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="eager"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-60" />
                      
                      {/* Chip flotante 1 sobre la foto principal */}
                      <div className="absolute top-3.5 right-3.5 z-20 animate-chip-1">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-ink/[0.08] bg-white/95 backdrop-blur-md px-3.5 py-1.5 shadow-sm">
                          <ShieldCheck className="h-3.5 w-3.5 text-jade-600" aria-hidden="true" />
                          <span className="font-mono text-[11px] font-medium text-ink">
                            Perfil verificado
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tarjeta 2: Guitarra acústica (col-span-6) */}
                    <div className="col-span-6 group relative aspect-[4/3] overflow-hidden rounded-[24px] border border-ink/[0.08] hover:border-ink/20 bg-paper transition-all duration-300 animate-float-2 shadow-xs">
                      <img
                        src="/products/guitarra-acustica.jpg"
                        alt="Guitarra acústica para intercambio"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Chip flotante 2 sobre la segunda foto */}
                      <div className="absolute bottom-3 left-3 z-20 animate-chip-2">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-ink/[0.08] bg-white/95 backdrop-blur-md px-3 py-1.5 shadow-sm">
                          <MapPin className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                          <span className="font-mono text-[11px] font-medium text-ink">
                            Punto seguro
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tarjeta 3: Cámara Canon (col-span-6) */}
                    <div className="col-span-6 group relative aspect-[4/3] overflow-hidden rounded-[24px] border border-ink/[0.08] hover:border-ink/20 bg-paper transition-all duration-300 animate-float-3 shadow-xs">
                      <img
                        src="/products/camara-canon.jpg"
                        alt="Cámara fotográfica para intercambio"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Chip flotante 3 sobre la tercera foto */}
                      <div className="absolute top-3 right-3 z-20 animate-chip-3">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-ink/[0.08] bg-white/95 backdrop-blur-md px-3 py-1.5 shadow-sm">
                          <ArrowLeftRight className="h-3.5 w-3.5 text-jade-600" aria-hidden="true" />
                          <span className="font-mono text-[11px] font-medium text-ink">
                            Trato acordado
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 
          2. CÓMO FUNCIONA (FONDO HUESO / BG-PAPER):
          Tarjetas con radio 24px, número en círculo jade, ilustraciones con micro-animaciones SVG,
          y línea punteada conectora que se dibuja con el scroll
        */}
        <section
          id="como-funciona"
          ref={howItWorksRef}
          className="relative border-b border-ink/[0.08] bg-paper py-14 sm:py-20"
        >
          <div className="mx-auto max-w-[1280px] px-4 min-[360px]:px-5 sm:px-8">
            <div
              className={`max-w-2xl text-left transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                howItWorksVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <span className="font-mono text-xs uppercase tracking-[0.08em] text-jade-600 font-medium">
                {t.howItWorks.tagline}
              </span>
              <h2 className="mt-2 text-3xl sm:text-[40px] font-normal sm:font-medium tracking-[-0.01em] text-ink">
                {t.howItWorks.title}
              </h2>
            </div>

            <div className="relative mt-12">
              {/* Línea punteada SVG conectora que se dibuja en desktop al hacer scroll */}
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute top-10 left-[15%] right-[15%] w-[70%] h-2 hidden lg:block overflow-visible"
              >
                <line
                  x1="0%"
                  y1="50%"
                  x2="100%"
                  y2="50%"
                  stroke="#0F6D5F"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  pathLength={100}
                  strokeDashoffset={100 - dottedProgress * 100}
                  className="transition-[stroke-dashoffset] duration-150 ease-out opacity-40"
                />
              </svg>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {[
                  {
                    stepNumber: 1,
                    image: "/images/como-funciona/paso-1-publica.jpg",
                    alt: "Nutria publicando un jarrón en la app",
                    illustration: PublishIllustration,
                    ...t.howItWorks.steps[0],
                    href: "#feed",
                  },
                  {
                    stepNumber: 2,
                    image: "/images/como-funciona/paso-2-conversa.jpg",
                    alt: "Dos nutrias conversando por chat",
                    illustration: ChatIllustration,
                    ...t.howItWorks.steps[1],
                    href: "#confianza",
                  },
                  {
                    stepNumber: 3,
                    image: "/images/como-funciona/paso-3-intercambia.jpg",
                    alt: "Dos nutrias intercambiando un jarrón y un libro de forma segura",
                    illustration: TradeIllustration,
                    ...t.howItWorks.steps[2],
                    href: "#confianza",
                  },
                ].map((step, idx) => {
                  const IllustrationComponent = step.illustration;
                  return (
                    <div
                      key={idx}
                      style={{
                        transitionDelay: `${idx * 100}ms`,
                      }}
                      className={`group relative flex h-full flex-col rounded-[24px] border border-ink/[0.08] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-ink/20 shadow-xs focus-within:ring-2 focus-within:ring-jade-500 ${
                        howItWorksVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                      }`}
                    >
                      {/* Contenedor de ilustración con número en círculo jade */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[20px] bg-paper">
                        <span
                          aria-hidden="true"
                          className="absolute top-3.5 left-3.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-jade-600 font-mono text-xs font-medium text-white shadow-xs"
                        >
                          {step.stepNumber}
                        </span>

                        {imgErrors[idx] ? (
                          <IllustrationComponent className="h-full w-full object-cover" />
                        ) : (
                          <img
                            src={step.image}
                            alt={step.alt}
                            width={600}
                            height={375}
                            loading="lazy"
                            decoding="async"
                            onError={() => setImgErrors((prev) => ({ ...prev, [idx]: true }))}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <div className="mt-5 flex flex-1 flex-col">
                        <h3 className="text-xl font-medium tracking-tight text-ink">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink/70">
                          {step.description}
                        </p>
                        <div className="mt-auto pt-5">
                          <div className="border-t border-ink/[0.06] pt-3.5">
                            <a
                              href={step.href}
                              onClick={step.href === "#feed" ? handleFeed : undefined}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-jade-600 hover:text-jade-700 transition-colors focus:outline-none after:absolute after:inset-0 after:rounded-[24px]"
                            >
                              <span>{step.action}</span>
                              <ArrowRight
                                className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                                aria-hidden="true"
                              />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 
          3. COMUNIDAD SEGURA / TRANQUILIDAD GARANTIZADA (FONDO VERDE MUY SUAVE):
          Tarjetas más grandes y con más aire, contenedor de icono jade 48px, fondo bg-jade-50/70
        */}
        <section
          id="confianza"
          ref={trustRef}
          className="border-b border-ink/[0.08] bg-jade-50/70 py-14 sm:py-20"
        >
          <div className="mx-auto max-w-[1280px] px-4 min-[360px]:px-5 sm:px-8">
            <div
              className={`mb-12 text-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                trustVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <span className="font-mono text-xs uppercase tracking-[0.08em] text-jade-600 font-medium">
                {t.trustBanner.tagline}
              </span>
              <h2 className="mt-2 text-3xl sm:text-[40px] font-normal sm:font-medium tracking-[-0.01em] text-ink">
                {t.trustBanner.title}
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, ...t.trustBanner.points[0] },
                { icon: MapPin, ...t.trustBanner.points[1] },
                { icon: FileCheck2, ...t.trustBanner.points[2] },
              ].map((point, idx) => {
                const IconComponent = point.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      transitionDelay: `${idx * 100}ms`,
                    }}
                    className={`group flex flex-col items-start rounded-[24px] border border-ink/[0.08] hover:border-ink/20 bg-white p-7 transition-all duration-300 hover:-translate-y-1 shadow-xs ${
                      trustVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    }`}
                  >
                    {/* Contenedor icono jade claro 48px */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-jade-100 text-jade-700 transition-transform duration-250 group-hover:scale-105 group-hover:rotate-2">
                      <IconComponent className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="mt-5 text-lg font-medium tracking-tight text-ink">
                      {point.title}
                    </h3>
                    <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-ink/70">
                      {point.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 
          4. ARTÍCULOS DESTACADOS / EN CIRCULACIÓN (FONDO BLANCO):
          Carrusel continuo infinito (marquee) con pausa al hover, estética Figma y fade en los bordes
        */}
        <section
          id="articulos-destacados"
          ref={featuredRef}
          className="border-b border-ink/[0.08] bg-white py-14 sm:py-20 overflow-hidden"
        >
          <div className="mx-auto max-w-[1280px] px-4 min-[360px]:px-5 sm:px-8">
            <div
              className={`flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                featuredVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.08em] text-jade-600 font-medium">
                  {t.featured.tagline}
                </span>
                <h2 className="mt-1 text-3xl sm:text-[40px] font-normal sm:font-medium tracking-[-0.01em] text-ink">
                  {t.featured.title}
                </h2>
              </div>

              {/* Enlace ver catálogo con subrayado animado */}
              <a
                href="#feed"
                onClick={handleFeed}
                className="group relative inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-jade-600 transition-colors hover:text-jade-700 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 focus-visible:outline-offset-4 rounded-xs"
              >
                <span>{t.featured.viewAll}</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
                <span
                  aria-hidden="true"
                  className="absolute bottom-0 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-jade-600 transition-transform duration-200 ease-out group-hover:scale-x-100"
                />
              </a>
            </div>

            {/* Contenedor del Carrusel Marquee continuo e infinito */}
            <div className="relative mt-10 overflow-hidden">
              {/* Degradados laterales para difuminado suave en bordes (blanco sobre fondo blanco) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent"
              />

              {/* Riel deslizable: movimiento continuo automático, se pausa al hover o focus */}
              <div
                tabIndex={0}
                aria-label="Carrusel continuo de artículos destacados"
                className="group flex overflow-x-auto no-scrollbar py-2 focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 focus-visible:outline-offset-4 rounded-[28px]"
              >
                <div className="animate-marquee flex gap-6 pr-6">
                  {/* Primer set: interactivo y accesible por teclado */}
                  {featuredItems.map((item, idx) => (
                    <article
                      key={`primary-${item.id}-${idx}`}
                      onClick={handleFeed}
                      className="group/card cursor-pointer flex w-[280px] sm:w-[320px] shrink-0 flex-col justify-between rounded-[24px] border border-ink/[0.08] hover:border-ink/20 bg-white p-4 transition-all duration-300 hover:-translate-y-1 shadow-xs"
                    >
                      {/* Imagen con relación 4:3 y zoom suave al hover */}
                      <div className="aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-paper relative flex items-center justify-center p-2.5">
                        <img
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-contain transition-transform duration-400 group-hover/card:scale-105 pointer-events-none"
                        />
                      </div>

                      <div className="mt-4 flex flex-1 flex-col">
                        <div className="flex items-center justify-between font-mono text-[11px] font-medium text-sage-500 uppercase tracking-wider">
                          <span>{item.category}</span>
                          <span>{item.zone}</span>
                        </div>
                        <h3 className="mt-1.5 text-base font-medium text-ink line-clamp-1">
                          {item.title}
                        </h3>
                        <div className="mt-3.5 rounded-2xl border border-ink/[0.06] bg-paper/70 p-3 text-xs text-ink/70">
                          <span className="block font-semibold text-ink text-[11px]">
                            {t.featured.wantsInReturn}
                          </span>
                          <p className="line-clamp-2 mt-0.5 text-xs leading-relaxed">{item.wantsInReturn}</p>
                        </div>
                      </div>
                    </article>
                  ))}

                  {/* Segundo set clonado: sólo visual para el bucle continuo sin fin (aria-hidden y no enfocable) */}
                  {featuredItems.map((item, idx) => (
                    <article
                      key={`clone-${item.id}-${idx}`}
                      aria-hidden="true"
                      tabIndex={-1}
                      onClick={handleFeed}
                      className="group/card cursor-pointer flex w-[280px] sm:w-[320px] shrink-0 flex-col justify-between rounded-[24px] border border-ink/[0.08] hover:border-ink/20 bg-white p-4 transition-all duration-300 hover:-translate-y-1 shadow-xs"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-paper relative flex items-center justify-center p-2.5">
                        <img
                          src={item.image}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-contain transition-transform duration-400 group-hover/card:scale-105 pointer-events-none"
                        />
                      </div>

                      <div className="mt-4 flex flex-1 flex-col">
                        <div className="flex items-center justify-between font-mono text-[11px] font-medium text-sage-500 uppercase tracking-wider">
                          <span>{item.category}</span>
                          <span>{item.zone}</span>
                        </div>
                        <h3 className="mt-1.5 text-base font-medium text-ink line-clamp-1">
                          {item.title}
                        </h3>
                        <div className="mt-3.5 rounded-2xl border border-ink/[0.06] bg-paper/70 p-3 text-xs text-ink/70">
                          <span className="block font-semibold text-ink text-[11px]">
                            {t.featured.wantsInReturn}
                          </span>
                          <p className="line-clamp-2 mt-0.5 text-xs leading-relaxed">{item.wantsInReturn}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 
          5. SECCIÓN FINAL DE CTA ("EMPIEZA A INTERCAMBIAR"):
          Fondo jade oscuro con texto claro, botón primario generoso y efecto magnético
        */}
        <section
          ref={ctaRef}
          className="bg-paper py-14 sm:py-20"
        >
          <div className="mx-auto max-w-[1280px] px-4 min-[360px]:px-5 sm:px-8">
            <div
              className={`relative overflow-hidden rounded-[32px] bg-[#0B584D] px-6 py-16 sm:px-12 sm:py-20 text-center text-white shadow-sm transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              {/* Formas decorativas sutiles dentro del bloque CTA */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-12 -right-12 h-64 w-64 rounded-full bg-jade-400/20 blur-xl"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-amber-400/15 blur-xl"
              />

              <div className="relative z-10 mx-auto max-w-2xl">
                <span className="font-mono text-xs uppercase tracking-[0.08em] text-jade-100 font-medium">
                  Empieza a intercambiar
                </span>
                <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-normal sm:font-medium tracking-[-0.02em] text-white">
                  {t.cta.title}
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-base sm:text-lg leading-relaxed text-jade-100/85 font-normal">
                  {t.cta.subtitle}
                </p>

                <div className="mt-8 flex justify-center">
                  <a
                    ref={finalCtaMagneticRef}
                    href="#feed"
                    onClick={handleFeed}
                    className="group inline-flex min-h-[50px] items-center justify-center gap-2.5 rounded-2xl bg-white px-9 py-4 text-sm font-medium text-jade-700 shadow-sm transition-all duration-200 hover:bg-jade-50 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-white focus-visible:outline-offset-4"
                  >
                    <span>{t.cta.button}</span>
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 
        6. FOOTER INSTITUCIONAL (FONDO JADE OSCURO CON TEXTO CLARO):
        Ritmo final con logo en contraste, máx 4 enlaces y aviso legal
      */}
      <footer className="border-t border-jade-700/60 bg-[#08453C] py-12 text-xs text-jade-100/70">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-6 px-4 min-[360px]:px-5 sm:px-8 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 p-1">
              <img src="/logo.png" alt="" className="h-6 w-6 object-contain" aria-hidden="true" />
            </div>
            <span className="text-base font-medium text-white tracking-tight">Truekly</span>
          </div>

          {/* Menú con máx. 4 enlaces con hover a blanco */}
          <nav aria-label="Enlaces al pie" className="flex flex-wrap items-center justify-center gap-6 text-xs text-jade-100/80">
            <a
              href="#como-funciona"
              className="hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-white focus-visible:outline-offset-4 rounded-xs"
            >
              {t.nav.howItWorks}
            </a>
            <a
              href="#articulos-destacados"
              className="hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-white focus-visible:outline-offset-4 rounded-xs"
            >
              {t.nav.featured}
            </a>
            <a
              href="#confianza"
              className="hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-white focus-visible:outline-offset-4 rounded-xs"
            >
              {t.nav.trust}
            </a>
            <a
              href="#feed"
              onClick={handleFeed}
              className="hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-white focus-visible:outline-offset-4 rounded-xs"
            >
              {t.nav.explore}
            </a>
          </nav>

          <p className="text-center sm:text-right text-jade-100/60 text-[11px] font-normal">
            {t.footer.legal}
          </p>
        </div>
      </footer>
    </div>
  );
}