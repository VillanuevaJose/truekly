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
  AlertCircle,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PublishModal } from "../components/publish/PublishModal";

type ProfilePageProps = {
  onBack?: () => void;
  onNavigateToFeed?: () => void;
};

type ProfileTab = "publicaciones" | "trueques" | "seguridad";

/**
 * Censura estilo Yape en Perú:
 * Muestra primer y segundo nombre, y oculta los apellidos con las primeras letras y asteriscos
 * Ej: "Ladi Jose Villanueva Colonia" -> "Ladi Jose Vi*** Co***"
 */
function maskNameYape(
  fullName: string,
  firstName?: string,
  secondName?: string,
  paternalSurname?: string,
  maternalSurname?: string
): string {
  if (firstName && paternalSurname) {
    const s1 = secondName ? ` ${secondName}` : "";
    const p1 =
      paternalSurname.length > 2
        ? `${paternalSurname.slice(0, 2)}***`
        : `${paternalSurname}*`;
    const m1 = maternalSurname
      ? maternalSurname.length > 2
        ? ` ${maternalSurname.slice(0, 2)}***`
        : ` ${maternalSurname}*`
      : "";
    return `${firstName}${s1} ${p1}${m1}`.trim();
  }

  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Usuario";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) {
    const p = parts[1].length > 2 ? `${parts[1].slice(0, 2)}***` : `${parts[1]}*`;
    return `${parts[0]} ${p}`;
  }
  if (parts.length >= 3) {
    const nombres = parts.slice(0, parts.length - 2).join(" ");
    const apP = parts[parts.length - 2];
    const apM = parts[parts.length - 1];
    const pP = apP.length > 2 ? `${apP.slice(0, 2)}***` : `${apP}*`;
    const pM = apM.length > 2 ? `${apM.slice(0, 2)}***` : `${apM}*`;
    return `${nombres} ${pP} ${pM}`;
  }
  return fullName;
}

/**
 * Censura el correo electrónico para proteger la privacidad del usuario
 * Ej: "ramirezpomaerickarturo@gmail.com" -> "ra••••••o@gmail.com"
 */
function maskEmailAddress(email: string): string {
  if (!email || !email.includes("@")) return "•••••••@••••.com";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  const first = local.slice(0, 2);
  const last = local.slice(-1);
  const dots = "•".repeat(Math.min(6, Math.max(3, local.length - 3)));
  return `${first}${dots}${last}@${domain}`;
}

export default function ProfilePage({ onBack, onNavigateToFeed }: ProfilePageProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("publicaciones");
  const [isPublishOpen, setIsPublishOpen] = useState(false);

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

  const yapeMaskedName = useMemo(() => {
    if (!user) return "";
    return maskNameYape(
      user.nombre,
      user.primerNombre,
      user.segundoNombre,
      user.apellidoPaterno,
      user.apellidoMaterno
    );
  }, [user]);

  const maskedEmail = useMemo(() => {
    return maskEmailAddress(user?.email || "");
  }, [user?.email]);

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
              <span>Identidad en revisión</span>
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
                      alt={user.username || "Usuario"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                {user.verificado && (
                  <div
                    title="Registro de identidad enviado"
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
                  onClick={() => setIsPublishOpen(true)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-jade-600 px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-jade-700 focus-visible:outline-2 focus-visible:outline-jade-500"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Publicar objeto</span>
                </button>
              </div>
            </div>

            {/* Datos de nombre e identificación (Protegidos por privacidad) */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Nombre de usuario visible como titular principal para evitar doxxing/búsquedas en redes */}
                <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight font-mono">
                  {user.username ? `@${user.username}` : user.nombre}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-800 border border-amber-200">
                  <ShieldCheck className="h-3 w-3 text-amber-600" aria-hidden="true" />
                  <span>Identidad en revisión</span>
                </span>
              </div>

              <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sage-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-sage-400" aria-hidden="true" />
                  <span>Perú</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-sage-400" aria-hidden="true" />
                  <span>Miembro activo</span>
                </span>
                <span className="inline-flex items-center gap-1 text-sage-500">
                  <EyeOff className="h-3.5 w-3.5 text-sage-400" aria-hidden="true" />
                  <span>Nombre real oculto por privacidad</span>
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
                  <Star className="h-3.5 w-3.5 text-sage-400" aria-hidden="true" />
                  <span>Calificación</span>
                </div>
                <div className="mt-1 flex items-center justify-center py-0.5">
                  <button
                    type="button"
                    onClick={() => setIsPublishOpen(true)}
                    title="Publica algo para comenzar a recibir calificaciones"
                    aria-label="Publicar un artículo para obtener reputación"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 border border-amber-300 hover:bg-amber-500 hover:text-white transition-all shadow-xs"
                  >
                    <Plus className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
                  </button>
                </div>
                <span className="text-[10px] text-sage-500 font-medium">Sin reputación, publica algo</span>
              </div>

              <div>
                <div className="flex items-center justify-center gap-1 text-xs text-sage-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-sage-400" aria-hidden="true" />
                  <span>Confianza</span>
                </div>
                <p className="mt-1 text-xs sm:text-sm font-semibold text-sage-600">Sin confianza todavía</p>
                <span className="text-[10px] text-sage-400">requiere trueques previos</span>
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
                  onClick={() => setIsPublishOpen(true)}
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

          {/* TAB 3: SEGURIDAD Y CUENTA (Privacidad protegida estilo Yape) */}
          {activeTab === "seguridad" && (
            <div id="panel-seguridad" role="tabpanel" className="space-y-4">
              <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-ink">Datos de Identidad (Panel Privado)</h3>
                    <p className="text-xs text-sage-500">
                      Esta sección solo la puedes ver tú. Tus apellidos y correo están protegidos bajo la Ley N° 29733.
                    </p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-sage-500 font-medium bg-paper px-2.5 py-1 rounded-lg border border-line">
                    <Lock className="h-3 w-3 text-sage-400" />
                    <span>Solo visible por ti</span>
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Nombre censurado estilo Yape */}
                  <div className="rounded-xl border border-line bg-paper/50 p-3.5">
                    <span className="block text-[11px] font-medium text-sage-500">
                      Nombre oficial (Censura de privacidad)
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-ink">
                      {yapeMaskedName}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-sage-400">
                      Apellidos protegidos para evitar búsquedas externas
                    </span>
                  </div>

                  {/* Correo censurado */}
                  <div className="rounded-xl border border-line bg-paper/50 p-3.5">
                    <span className="block text-[11px] font-medium text-sage-500">
                      Correo electrónico vinculado
                    </span>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs font-semibold text-ink font-mono">{maskedEmail}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-jade-600">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        <span>Verificado</span>
                      </span>
                    </div>
                    <span className="mt-0.5 block text-[10px] text-sage-400">
                      Tu correo nunca es público en la plataforma
                    </span>
                  </div>

                  {/* Validación biométrica en revisión */}
                  <div className="rounded-xl border border-line bg-paper/50 p-3.5">
                    <span className="block text-[11px] font-medium text-sage-500">
                      Validación de identidad física
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
                      <span>DNI frontal + Selfie (En revisión)</span>
                    </span>
                    <span className="mt-0.5 block text-[10px] text-sage-400">
                      Almacenado de forma privada en servidores encriptados
                    </span>
                  </div>

                  {/* Nombre de usuario público */}
                  <div className="rounded-xl border border-line bg-paper/50 p-3.5">
                    <span className="block text-[11px] font-medium text-sage-500">
                      Identificador visible en el feed
                    </span>
                    <span className="mt-1 block text-xs font-mono font-semibold text-ink">
                      @{user.username || "usuario"}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-sage-400">
                      Este es el único identificador que verán los demás usuarios
                    </span>
                  </div>
                </div>

                <div className="border-t border-line pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs text-sage-500 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-jade-600" />
                    <span>Sesión cifrada y protegida vía Supabase Auth.</span>
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

      <PublishModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        onPublishSuccess={() => {
          if (onNavigateToFeed) {
            onNavigateToFeed();
          } else {
            window.location.hash = "#feed";
          }
        }}
      />
    </div>
  );
}
