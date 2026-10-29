import { ShieldCheck, Users, BadgeCheck, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, type ReactNode } from "react";
import { TradeIllustration } from "../illustrations/TradeIllustration";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="min-h-screen flex bg-paper font-sans text-ink antialiased selection:bg-jade-100 selection:text-jade-700">
      {/* 
        PANEL IZQUIERDO:
        Columna vertical que ocupa todo el alto, con padding parejo y distribución justify-between.
        Sin marcos, sin chips y sin animaciones de flotación.
        Oculto en móvil.
      */}
      <aside className="hidden lg:flex lg:w-[46%] xl:w-[44%] flex-col justify-between bg-gradient-to-b from-[#0F6D5F] via-[#0B584D] to-[#08453C] text-white p-8 lg:p-10 xl:p-12 relative overflow-hidden min-h-screen">
        {/* 1. ARRIBA: Logo */}
        <div className="relative z-10 shrink-0">
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-white transition-opacity hover:opacity-90 rounded-md focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-white focus-visible:outline-offset-4"
            aria-label="Truekly Inicio"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 p-2 border border-white/20 shadow-xs">
              <img src="/logo.png" alt="" className="h-full w-full object-contain" />
            </div>
            <span className="text-2xl font-medium tracking-tight text-white">Truekly</span>
          </Link>
        </div>

        {/* 2. TITULAR Y PÁRRAFO CORTO */}
        <div className="relative z-10 space-y-3 shrink-0 my-2">
          <h1 className="text-3xl xl:text-4xl font-normal sm:font-medium tracking-[-0.02em] leading-[1.14] text-white">
            Intercambia lo que tienes por lo que necesitas.
          </h1>
          <p className="text-sm xl:text-[15px] leading-relaxed text-jade-100/90 font-normal max-w-md">
            Truekly es la plataforma para intercambiar objetos entre personas, sin dinero de por medio. Publica lo que ya no usas y encuentra lo que buscas.
          </p>
        </div>

        {/* 3. CENTRO: Ilustración de intercambio grande, centrada y sin marco sobre el fondo verde */}
        <div className="relative z-10 my-auto py-2 flex items-center justify-center shrink-0">
          <div className="w-[82%] max-w-[290px] xl:max-w-[330px] mx-auto flex items-center justify-center">
            {!imgError ? (
              <img
                src="/images/auth/auth-nutrias-piedrita.webp"
                alt="Dos nutrias intercambiando una piedrita de forma amistosa"
                width={330}
                height={330}
                onError={() => setImgError(true)}
                className="w-full h-auto aspect-square object-contain select-none pointer-events-none"
                loading="eager"
                decoding="async"
              />
            ) : (
              <TradeIllustration
                variant="dark"
                className="w-full h-auto aspect-[16/10] object-contain"
              />
            )}
          </div>
        </div>

        {/* 4. ABAJO: 3 Puntos solo con título con buen espacio entre ellos */}
        <div className="relative z-10 space-y-4 pt-2 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/15 text-amber-400 shadow-xs">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-sm font-medium text-white/95 tracking-tight">
              Puntos seguros de intercambio
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/15 text-amber-400 shadow-xs">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-sm font-medium text-white/95 tracking-tight">
              Comunidad verificada
            </span>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/15 text-amber-400 shadow-xs">
              <BadgeCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-sm font-medium text-white/95 tracking-tight">
              Perfiles con identidad validada
            </span>
          </div>
        </div>
      </aside>

      {/* PANEL DERECHO: Tarjeta blanca centrada verticalmente */}
      <main className="flex-1 flex flex-col justify-center p-3 sm:p-5 lg:p-6 overflow-y-auto bg-paper min-h-screen">
        {/* Cabecera superior: botón volver al inicio y logo en móvil */}
        <div className="flex items-center justify-between w-full max-w-[460px] mx-auto mb-2 shrink-0">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-jade-600 hover:text-jade-700 transition-colors focus-visible:outline-2 focus-visible:outline-dashed focus-visible:outline-jade-500 rounded py-1 px-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al inicio</span>
          </Link>

          {/* Logo visible solo en pantallas pequeñas */}
          <Link to="/" className="lg:hidden flex items-center gap-2" aria-label="Truekly Inicio">
            <img src="/logo.png" alt="" className="h-7 w-7 object-contain" />
            <span className="font-medium text-lg text-ink">Truekly</span>
          </Link>
        </div>

        {/* Tarjeta blanca centrada para el formulario */}
        <div className="w-full max-w-[460px] mx-auto my-auto py-1">
          <div className="rounded-[24px] border border-ink/[0.08] bg-white p-5 sm:p-6 shadow-xs">
            <div className="mb-3.5">
              <h1 className="text-xl sm:text-[22px] font-medium tracking-tight text-ink leading-tight">
                {title}
              </h1>
              <p className="mt-1 text-xs text-ink/70 leading-snug">
                {subtitle}
              </p>
            </div>

            {children}
          </div>
        </div>
      </main>
    </div>
  );
}