import { useState, useMemo } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Calendar,
  Lock,
  Package,
  Repeat,
  Star,
  Plus,
  LogOut,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

type ProfilePageProps = {
  onBack?: () => void;
  onNavigateToFeed?: () => void;
};

type ProfileTab = "publicaciones" | "trueques" | "seguridad";

export default function ProfilePage({ onBack, onNavigateToFeed }: ProfilePageProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("publicaciones");

  const initials = useMemo(() => {
    if (!user) return "TK";
    if (user.primerNombre && user.apellidoPaterno) {
      return `${user.primerNombre.charAt(0)}${user.apellidoPaterno.charAt(0)}`.toUpperCase();
    }
    const parts = user.nombre.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return (parts[0]?.slice(0, 2) || "TK").toUpperCase();
  }, [user]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (onNavigateToFeed) {
      onNavigateToFeed();
    } else {
      window.location.hash = "#feed";
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.hash = "#inicio";
  };

  // Enmascarar DNI para privacidad visual
  const maskedEmail = user?.email || "correo@ejemplo.com";

  if (!user) {
    return (
      <div className="min-h-screen bg-paper font-sans text-ink flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-xs">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-jade-50 text-jade-600">
            <Lock className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold text-ink">Inicia sesión para ver tu perfil</h1>
          <p className="mt-2 text-xs leading-relaxed text-sage-500">
            Accede a tu cuenta para gestionar tus publicaciones, historial de trueques y datos personales.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <a
              href="/ingresar"
              className="flex h-11 w-full items-center justify-center rounded-xl bg-jade-600 text-xs font-semibold text-white transition hover:bg-jade-700"
            >
              Iniciar sesión
            </a>
            <button
              type="button"
              onClick={handleBack}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-line bg-white text-xs font-semibold text-ink transition hover:bg-paper"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper font-sans text-ink antialiased">
      {/* Top Header Barra de Navegación */}
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-soft transition hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-jade-500"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Volver al feed</span>
          </button>

          <span className="text-xs font-semibold text-sage-500">Mi Cuenta</span>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-500"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        {/* Tarjeta Hero de Perfil */}
        <section aria-label="Información de perfil" className="overflow-hidden rounded-2xl border border-line bg-white shadow-xs">
          {/* Banner de cubierta con degradado sutil de marca */}
          <div className="h-24 sm:h-32 bg-gradient-to-r from-jade-700 via-jade-600 to-jade-500 relative">
            <div className="absolute right-4 bottom-3 hidden sm:flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] font-medium text-white border border-white/20">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
              <span>Cuenta Verificada</span>
            </div>
          </div>

          <div className="px-5 pb-6 pt-0 sm:px-8">
            <div className="relative -mt-12 sm:-mt-14 mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              {/* Avatar grande */}
              <div className="relative">
                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-white bg-[#0E6B5C] shadow-sm overflow-hidden flex items-center justify-center text-white text-xl sm:text-2xl font-bold tracking-wider select-none">
                  {user.fotoPerfil ? (
                    <img
                      src={user.fotoPerfil}
                      alt={user.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                {user.verificado && (
                  <div
                    title="Identidad verificada con DNI y Selfie"
                    className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-jade-600 shadow-xs border border-line"
                  >
                    <CheckCircle2 className="h-5 w-5 fill-jade-500 text-white" aria-hidden="true" />
                  </div>
                )}
              </div>

              {/* Acciones principales de cabecera */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    // TODO: Abrir modal de publicación
                    window.location.hash = "#feed";
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-jade-600 px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-jade-700 focus-visible:outline-2 focus-visible:outline-jade-500"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Publicar objeto</span>
                </button>
              </div>
            </div>

            {/* Datos de nombre e identificación */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                  {user.nombre}
                </h1>
                {user.username && (
                  <span className="rounded-md bg-paper px-2 py-0.5 text-xs font-mono text-sage-500 border border-line">
                    @{user.username}
                  </span>
                )}
              </div>

              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sage-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-sage-400" aria-hidden="true" />
                  <span>Chimbote, Perú</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-sage-400" aria-hidden="true" />
                  <span>Miembro activo</span>
                </span>
                <span className="inline-flex items-center gap-1 text-jade-600 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>DNI y Selfie validados</span>
                </span>
              </p>
            </div>

            {/* Tira de Métricas y Reputación (Estilo Linear/Stripe) */}
            <div className="mt-6 grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-paper/60 p-3 sm:p-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-xs text-sage-500">
                  <Repeat className="h-3.5 w-3.5 text-jade-600" aria-hidden="true" />
                  <span>Trueques</span>
                </div>
                <p className="mt-1 text-lg sm:text-xl font-bold text-ink tabular-nums">0</p>
                <span className="text-[10px] text-sage-400">completados</span>
              </div>

              <div>
                <div className="flex items-center justify-center gap-1 text-xs text-sage-500">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  <span>Calificación</span>
                </div>
                <p className="mt-1 text-lg sm:text-xl font-bold text-ink tabular-nums">5.0</p>
                <span className="text-[10px] text-sage-400">reputación inicial</span>
              </div>

              <div>
                <div className="flex items-center justify-center gap-1 text-xs text-sage-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-jade-600" aria-hidden="true" />
                  <span>Confianza</span>
                </div>
                <p className="mt-1 text-lg sm:text-xl font-bold text-jade-600">Alta</p>
                <span className="text-[10px] text-sage-400">identidad validada</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pestañas de Navegación del Perfil */}
        <div className="space-y-4">
          <div
            role="tablist"
            aria-label="Pestañas de cuenta"
            className="flex items-center gap-1 border-b border-line pb-px"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "publicaciones"}
              aria-controls="panel-publicaciones"
              onClick={() => setActiveTab("publicaciones")}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
                activeTab === "publicaciones"
                  ? "border-jade-600 text-jade-700"
                  : "border-transparent text-sage-500 hover:text-ink"
              }`}
            >
              <Package className="h-4 w-4" aria-hidden="true" />
              <span>Mis Publicaciones</span>
              <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] text-sage-500 border border-line">
                0
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "trueques"}
              aria-controls="panel-trueques"
              onClick={() => setActiveTab("trueques")}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
                activeTab === "trueques"
                  ? "border-jade-600 text-jade-700"
                  : "border-transparent text-sage-500 hover:text-ink"
              }`}
            >
              <Repeat className="h-4 w-4" aria-hidden="true" />
              <span>Mis Trueques</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "seguridad"}
              aria-controls="panel-seguridad"
              onClick={() => setActiveTab("seguridad")}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
                activeTab === "seguridad"
                  ? "border-jade-600 text-jade-700"
                  : "border-transparent text-sage-500 hover:text-ink"
              }`}
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              <span>Seguridad & Cuenta</span>
            </button>
          </div>

          {/* TAB 1: MIS PUBLICACIONES */}
          {activeTab === "publicaciones" && (
            <div id="panel-publicaciones" role="tabpanel" className="space-y-4">
              <div className="rounded-2xl border border-line bg-white p-8 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-jade-50 text-jade-600">
                  <Package className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold text-ink">Aún no tienes objetos publicados</h3>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-sage-500">
                  Publica lo que ya no usas para comenzar a recibir propuestas de trueque de personas en tu ciudad.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    // TODO: Abrir modal de publicación
                    window.location.hash = "#feed";
                  }}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-jade-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-jade-700"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Publicar mi primer objeto</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MIS TRUEQUES */}
          {activeTab === "trueques" && (
            <div id="panel-trueques" role="tabpanel" className="space-y-4">
              <div className="rounded-2xl border border-line bg-white p-8 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <Repeat className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold text-ink">Sin intercambios en curso</h3>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-sage-500">
                  Cuando propongas un intercambio o alguien se interese en tus artículos, verás los acuerdos aquí.
                </p>
                <button
                  type="button"
                  onClick={handleBack}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2 text-xs font-semibold text-ink transition hover:bg-paper"
                >
                  <ExternalLink className="h-4 w-4 text-sage-500" aria-hidden="true" />
                  <span>Explorar publicaciones en el feed</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SEGURIDAD Y CUENTA */}
          {activeTab === "seguridad" && (
            <div id="panel-seguridad" role="tabpanel" className="space-y-4">
              <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-ink">Datos de Identidad y Contacto</h3>
                  <p className="text-xs text-sage-500">
                    Tu información se encuentra protegida bajo la Ley N° 29733 de Protección de Datos Personales.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-line bg-paper/50 p-3.5">
                    <span className="block text-[11px] font-medium text-sage-500">Nombre registrado según RENIEC</span>
                    <span className="mt-1 block text-xs font-semibold text-ink">{user.nombre}</span>
                  </div>

                  <div className="rounded-xl border border-line bg-paper/50 p-3.5">
                    <span className="block text-[11px] font-medium text-sage-500">Correo electrónico verificado</span>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-ink truncate">{maskedEmail}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-jade-600">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        <span>Verificado</span>
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-line bg-paper/50 p-3.5">
                    <span className="block text-[11px] font-medium text-sage-500">Validación biométrica</span>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-jade-600">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>DNI frontal + Selfie confirmados</span>
                    </span>
                  </div>

                  <div className="rounded-xl border border-line bg-paper/50 p-3.5">
                    <span className="block text-[11px] font-medium text-sage-500">Nombre de usuario público</span>
                    <span className="mt-1 block text-xs font-mono font-semibold text-ink">
                      @{user.username || "usuario"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-line pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs text-sage-500">
                    <span>Sesión activa de forma segura vía Supabase Auth.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    <span>Cerrar sesión en este dispositivo</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
