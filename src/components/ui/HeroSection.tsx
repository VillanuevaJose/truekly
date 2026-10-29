import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, ShieldCheck, MapPin, CheckCircle2 } from "lucide-react";
import { APP_CONFIG } from "../../config/appConfig";

interface HeroCardItem {
  id: string;
  title: string;
  image: string;
  zone: string;
  wantsInReturn: string;
  tag: string;
}

const HERO_EXAMPLES: HeroCardItem[] = [
  {
    id: "hero-1",
    title: "Bicicleta de montaña Trek",
    image: "/products/bicicleta.jpg",
    zone: "Casco Urbano",
    wantsInReturn: "Laptop para oficina o herramientas",
    tag: "Deportes",
  },
  {
    id: "hero-2",
    title: "Guitarra acústica de estudio",
    image: "/products/guitarra-acustica.jpg",
    zone: "Buenos Aires",
    wantsInReturn: "Teclado MIDI o amplificador",
    tag: "Música",
  },
  {
    id: "hero-3",
    title: "Taladro percutor 650W",
    image: "/products/taladro-percutor.jpg",
    zone: "Nuevo Chimbote",
    wantsInReturn: "Carpa de camping o juegos de mesa",
    tag: "Herramientas",
  },
];

interface HeroSectionProps {
  onNavigateToFeed?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigateToFeed }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleFeedAction = (e: React.MouseEvent) => {
    if (onNavigateToFeed) {
      e.preventDefault();
      onNavigateToFeed();
    } else {
      window.location.hash = "#feed";
    }
  };

  return (
    <section
      ref={sectionRef}
      id="inicio"
      aria-labelledby="hero-title"
      className="relative overflow-hidden border-b border-line bg-paper py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 min-[360px]:px-5 sm:px-8">
        {/* Cabecera del Hero: Título, Frase y Llamados a la Acción */}
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge contextual de confianza comunitaria */}
          <div
            className={`inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-[#5A6962] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 ${
              isVisible
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-4 scale-[0.98] opacity-0"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-jade-500" aria-hidden="true" />
            <span>Red comunitaria de intercambio libre{APP_CONFIG.city ? ` · ${APP_CONFIG.city}` : ""}</span>
          </div>

          {/* Título grande en Fraunces 600 con clamp fluido */}
          <h1
            id="hero-title"
            className={`mt-6 font-display text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-ink transition-[opacity,transform] duration-500 delay-[80ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 ${
              isVisible
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-4 scale-[0.98] opacity-0"
            }`}
          >
            En tu ciudad, lo que a ti te sobra es justo lo que otra persona necesita.
          </h1>

          {/* Frase / Subtítulo editorial en Manrope */}
          <p
            className={`mx-auto mt-6 max-w-2xl font-body text-[16px] sm:text-[17px] font-normal leading-[1.47] text-[#5A6962] transition-[opacity,transform] duration-500 delay-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 ${
              isVisible
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-4 scale-[0.98] opacity-0"
            }`}
          >
            Trueque libre y honesto{APP_CONFIG.city ? ` en ${APP_CONFIG.city}` : ""}: sin tasaciones forzadas, con perfiles
            verificados y acuerdos seguros en lugares públicos concurridos.
          </p>

          {/* Botones: Primario en Jade + Secundario contorno 1px */}
          <div
            className={`mt-8 flex flex-col items-center justify-center gap-3.5 min-[480px]:flex-row transition-[opacity,transform] duration-500 delay-[240ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 ${
              isVisible
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-4 scale-[0.98] opacity-0"
            }`}
          >
            {/* Botón Primario: Relleno Jade, texto blanco, píldora, min 44px */}
            <a
              href="#feed"
              onClick={handleFeedAction}
              className="inline-flex min-h-[44px] w-full min-[480px]:w-auto items-center justify-center gap-2 rounded-full bg-jade-500 px-8 py-3.5 text-sm font-semibold text-white transition-[opacity,transform,background-color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-500 focus-visible:ring-offset-2 [@media(hover:hover)]:hover:bg-jade-600"
            >
              <span>Explorar catálogo libre</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>

            {/* Botón Secundario: Contorno 1px, sin relleno, píldora, min 44px */}
            <a
              href="#protocolo"
              className="inline-flex min-h-[44px] w-full min-[480px]:w-auto items-center justify-center gap-2 rounded-full border border-line bg-transparent px-7 py-3.5 text-sm font-semibold text-ink transition-[opacity,transform,border-color,color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jade-500 focus-visible:ring-offset-2 [@media(hover:hover)]:hover:border-jade-500 [@media(hover:hover)]:hover:text-jade-600"
            >
              <ShieldCheck className="h-4 w-4 text-jade-500" aria-hidden="true" />
              <span>Protocolo de seguridad</span>
            </a>
          </div>
        </div>

        {/* Cuadrícula de 3 tarjetas de ejemplo: 28px radius, sin sombra, imagen completa */}
        <div className="mt-14 sm:mt-16 grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
          {HERO_EXAMPLES.map((item, index) => {
            const staggerDelay = [320, 400, 480][index] || 320;

            return (
              <article
                key={item.id}
                style={{ transitionDelay: `${staggerDelay}ms` }}
                className={`flex flex-col justify-between rounded-[28px] border border-[#D6DAD7] bg-white p-5 shadow-none sm:p-7 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 ${
                  isVisible
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-4 scale-[0.98] opacity-0"
                }`}
              >
                {/* Imagen completa sin recortes arbitrarios */}
                <div className="relative mb-5 aspect-[4/3] w-full overflow-hidden rounded-[20px] bg-paper">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover object-center"
                  />
                  {/* Badge de verificación oficial */}
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-line/60 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-jade-700 backdrop-blur-sm">
                    <CheckCircle2 className="h-3 w-3 text-jade-500" aria-hidden="true" />
                    <span>Verificado</span>
                  </span>
                </div>

                {/* Datos del objeto y zona */}
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-jade-600">
                      {item.tag}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#5A6962]">
                      <MapPin className="h-3.5 w-3.5 text-jade-500" aria-hidden="true" />
                      <span>{item.zone}</span>
                    </span>
                  </div>

                  <h2 className="mt-2 font-display text-lg font-semibold leading-snug text-ink sm:text-xl">
                    {item.title}
                  </h2>

                  {/* Detalle del intercambio propuesto */}
                  <div className="mt-4 rounded-[16px] border border-line/60 bg-paper/70 p-3 text-xs">
                    <span className="font-semibold text-ink block mb-0.5">
                      Busca a cambio:
                    </span>
                    <p className="line-clamp-2 text-[#5A6962] leading-relaxed">
                      {item.wantsInReturn}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
