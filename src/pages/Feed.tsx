import { useMemo, useState, useEffect, useRef } from "react";
import {
  Search,
  Heart,
  MapPin,
  Star,
  SlidersHorizontal,
  Repeat,
  Users,
  Sparkles,
  Laptop,
  Music2,
  Gamepad2,
  Home as HomeIcon,
  Dumbbell,
  MoreHorizontal,
  LayoutGrid,
  HeartHandshake,
  Gavel,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  User,
  Package,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  products,
  mockCommunities,
  mockCauses,
  mockSimulatedAuctions,
  CHIMBOTE_ZONES,
  type Category,
  type Condition,
  type Zone,
  type Product,
} from "../data/mockProducts";
import { APP_CONFIG } from "../config/appConfig";
import { CommunityCard } from "../components/ui/CommunityCard";
import { PublishModal } from "../components/publish/PublishModal";
import { fetchPublications, savePublication } from "../services/publicationService";

type FeedProps = {
  onNavigateToLanding?: () => void;
  onOpenAuth?: (mode?: "login" | "register") => void;
  onSelectProduct?: (product: Product) => void;
};

type FeedSection = "trueques" | "comunidades" | "subastas" | "causas";

const categoryIcons: Record<Category | "Todos", React.ElementType> = {
  Todos: LayoutGrid,
  Tecnología: Laptop,
  Música: Music2,
  Gaming: Gamepad2,
  Hogar: HomeIcon,
  Deportes: Dumbbell,
  Otros: MoreHorizontal,
};

const categoryList: (Category | "Todos")[] = [
  "Todos",
  "Tecnología",
  "Música",
  "Gaming",
  "Hogar",
  "Deportes",
  "Otros",
];

const conditionList: (Condition | "Todas")[] = [
  "Todas",
  "Nuevo",
  "Como nuevo",
  "Buen estado",
  "Usado",
];

function ProductCard({
  product,
  onSelect,
}: {
  product: Product;
  onSelect?: (p: Product) => void;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <article
      onClick={() => onSelect?.(product)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-jade-400 hover:shadow-[0_16px_32px_-16px_rgba(15,109,95,0.25)] cursor-pointer"
    >
      {/* Imagen completa con metadatos contextuales */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper">
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {product.isFeatured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-ink shadow-sm">
            <Sparkles size={12} /> Destacado
          </span>
        )}

        <button
          type="button"
          onClick={() => setSaved((s) => !s)}
          aria-pressed={saved}
          aria-label={saved ? "Quitar de favoritos" : "Guardar en favoritos"}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-ink-soft shadow-sm transition hover:scale-110 hover:text-jade-500"
        >
          <Heart
            size={16}
            className={saved ? "fill-jade-500 text-jade-500" : "currentColor"}
          />
        </button>

        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-ink/75 px-2.5 py-1 text-xs font-medium text-paper backdrop-blur-sm">
          <MapPin size={12} className="text-jade-400" />
          <span>{product.zone}</span>
        </span>
      </div>

      {/* Contenido descriptivo del trueque */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center gap-2 text-xs font-medium text-jade-600">
          <span>{product.category}</span>
          <span className="text-line">·</span>
          <span className="rounded-full bg-jade-50 px-2 py-0.5 text-[11px] font-semibold text-jade-700">
            {product.condition}
          </span>
        </div>

        <h3 className="mt-2 font-display text-base font-semibold leading-snug text-ink group-hover:text-jade-600">
          {product.title}
        </h3>

        <div className="mt-2.5 rounded-xl border border-line bg-paper/60 p-2.5">
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-sage-500">
            <Repeat size={12} className="text-jade-500" />
            Busca a cambio:
          </span>
          <p className="mt-1 line-clamp-2 text-xs font-medium leading-relaxed text-ink">
            {product.wantsInReturn}
          </p>
        </div>

        {/* Propietario y métricas de confianza */}
        <div className="mt-auto border-t border-line pt-3.5 mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={product.owner.avatar}
              alt={product.owner.name}
              className="h-7 w-7 rounded-full object-cover ring-1 ring-line"
            />
            <span className="text-xs font-medium text-ink">{product.owner.name}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-sage-500">
            <Star size={13} className="fill-amber-500 text-amber-500" />
            <span className="font-semibold text-ink">{product.rating}</span>
            <span className="text-line">·</span>
            <span>{product.exchangesCount} tratos</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Feed({
  onNavigateToLanding,
  onOpenAuth,
  onSelectProduct,
}: FeedProps) {
  const [activeSection, setActiveSection] = useState<FeedSection>("trueques");
  const [activeCategory, setActiveCategory] = useState<Category | "Todos">("Todos");
  const [activeCondition, setActiveCondition] = useState<Condition | "Todas">("Todas");
  const [query, setQuery] = useState("");
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [productList, setProductList] = useState<Product[]>(products);

  useEffect(() => {
    let isMounted = true;
    fetchPublications().then((customItems) => {
      if (!isMounted || customItems.length === 0) return;
      const customIds = new Set(customItems.map((c) => c.id));
      const baseMock = products.filter((p) => !customIds.has(p.id));
      setProductList([...customItems, ...baseMock]);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Toggle "Cerca de mí" (Manual por zona, sin GPS)
  const [nearMeEnabled, setNearMeEnabled] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone>("Casco Urbano");

  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const userInitials = useMemo(() => {
    if (!user) return "";
    if (user.primerNombre && user.apellidoPaterno) {
      return `${user.primerNombre.charAt(0)}${user.apellidoPaterno.charAt(0)}`.toUpperCase();
    }
    const parts = user.nombre.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    if (parts.length === 1 && parts[0].length >= 2) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0]?.charAt(0) || "U").toUpperCase();
  }, [user]);

  const filteredProducts = useMemo(() => {
    return productList
      .filter((p) => (activeCategory === "Todos" ? true : p.category === activeCategory))
      .filter((p) => (activeCondition === "Todas" ? true : p.condition === activeCondition))
      .filter((p) => {
        if (!nearMeEnabled || selectedZone === "Todas") return true;
        return p.zone.toLowerCase().includes(selectedZone.toLowerCase());
      })
      .filter((p) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          p.title.toLowerCase().includes(q) ||
          p.wantsInReturn.toLowerCase().includes(q) ||
          p.zone.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  }, [productList, activeCategory, activeCondition, nearMeEnabled, selectedZone, query]);

  const handleLandingClick = (e: React.MouseEvent) => {
    if (onNavigateToLanding) {
      e.preventDefault();
      onNavigateToLanding();
    } else {
      window.location.hash = "#inicio";
    }
  };

  return (
    <div className="min-h-screen bg-paper font-body text-ink antialiased">
      {/* Header principal y barra de navegación por módulos sticky */}
      <div className="sticky top-0 z-30 bg-white">
        <header className="border-b border-line bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-8">
            <a
              href="#inicio"
              onClick={handleLandingClick}
              aria-label="Ir al inicio de Truekly"
              className="flex shrink-0 items-center gap-2.5 transition hover:opacity-90"
            >
              <img
                src="/logo.png"
                alt="Truekly"
                className="h-10 w-10 shrink-0 object-contain"
              />
              <span className="hidden sm:inline font-display text-xl font-bold leading-none text-ink">
                Truekly
              </span>
            </a>

            {/* Buscador libre */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sage-500"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Buscar qué necesitas o qué buscas cambiar..."
                className="w-full rounded-full border border-line bg-paper py-2 pl-9 pr-4 text-xs sm:text-sm text-ink outline-none transition placeholder:text-sage-500/80 focus:border-jade-500 focus:bg-white"
              />
            </div>

            {/* Accesos rápidos / Estado de autenticación */}
            {user ? (
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                {/* Botón Publicar (circular 44px, fondo naranja, ícono verde oscuro) */}
                <button
                  type="button"
                  onClick={() => setIsPublishOpen(true)}
                  aria-label="Publicar un objeto"
                  title="Publicar"
                  className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-[#F39200] text-[#0E4F45] shadow-xs transition-transform duration-150 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade-500"
                >
                  <Plus size={22} strokeWidth={2.5} />
                </button>

                {/* Avatar circular 40px y Menú Desplegable */}
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    aria-expanded={isMenuOpen}
                    aria-haspopup="true"
                    aria-label="Menú de cuenta de usuario"
                    className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade-500"
                  >
                    {user.fotoPerfil ? (
                      <img
                        src={user.fotoPerfil}
                        alt={user.nombre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#0E6B5C] text-xs font-semibold uppercase tracking-wider text-white select-none">
                        {userInitials}
                      </div>
                    )}
                  </button>

                  {/* Menú de cuenta desplegable */}
                  {isMenuOpen && (
                    <div
                      role="menu"
                      aria-orientation="vertical"
                      className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-line bg-white p-2 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="px-3 py-2">
                        <p className="truncate text-xs font-semibold text-ink">
                          {user.nombre}
                        </p>
                        <p className="truncate text-[11px] text-sage-600">
                          {user.email}
                        </p>
                      </div>

                      <div className="my-1.5 border-t border-line" />

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setIsMenuOpen(false);
                          window.location.hash = "#perfil";
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-ink transition hover:bg-paper focus-visible:outline-2 focus-visible:outline-jade-500"
                      >
                        <User size={15} className="text-sage-500" />
                        <span>Mi perfil</span>
                      </button>

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setIsMenuOpen(false);
                          window.location.hash = "#perfil";
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-ink transition hover:bg-paper focus-visible:outline-2 focus-visible:outline-jade-500"
                      >
                        <Package size={15} className="text-sage-500" />
                        <span>Mis publicaciones</span>
                      </button>

                      <div className="my-1.5 border-t border-line" />

                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setIsMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-500"
                      >
                        <LogOut size={15} className="text-red-500" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => onOpenAuth?.("login")}
                  className="hidden rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-ink transition hover:border-jade-500 hover:text-jade-600 sm:block"
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth?.("register")}
                  className="rounded-full border border-[#1F7A6B] bg-[#1F7A6B] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1F7A6B]/90"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Navegación por módulos (Tabs superiores móviles y desktop) */}
        <div className="border-b border-line bg-white shadow-sm">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2 sm:px-8">
            <button
              type="button"
              onClick={() => setActiveSection("trueques")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeSection === "trueques"
                  ? "bg-jade-500 text-paper"
                  : "text-ink-soft hover:bg-jade-50 hover:text-jade-700"
              }`}
            >
              <Repeat size={14} />
              <span>Trueque Libre</span>
              <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                {productList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("comunidades")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeSection === "comunidades"
                  ? "bg-jade-500 text-paper"
                  : "text-ink-soft hover:bg-jade-50 hover:text-jade-700"
              }`}
            >
              <Users size={14} />
              <span>Comunidades locales</span>
              <span className="rounded-full bg-jade-100 px-1.5 py-0.2 text-[10px] text-jade-700">
                {mockCommunities.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("causas")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeSection === "causas"
                  ? "bg-jade-500 text-paper"
                  : "text-ink-soft hover:bg-jade-50 hover:text-jade-700"
              }`}
            >
              <HeartHandshake size={14} />
              <span>Causas sociales / ONGs</span>
              <span className="rounded-full bg-jade-100 px-1.5 py-0.2 text-[10px] text-jade-700">
                {mockCauses.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection("subastas")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeSection === "subastas"
                  ? "bg-amber-500 text-ink shadow-sm"
                  : "border border-amber-500/40 text-amber-600 hover:bg-amber-50"
              }`}
            >
              <Gavel size={14} />
              <span>Subastas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal: Sidebar + Grid */}
      <div className="mx-auto flex max-w-7xl gap-8 px-4 py-6 sm:px-8 sm:py-8">
        {/* Sidebar izquierdo */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 space-y-6">
            {/* Categorías */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-sage-500">
                Categorías
              </p>
              <nav className="space-y-1">
                {categoryList.map((cat) => {
                  const Icon = categoryIcons[cat];
                  const active = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat);
                        setActiveSection("trueques");
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                        active
                          ? "bg-jade-500 text-paper"
                          : "text-ink-soft hover:bg-jade-50 hover:text-jade-700"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon size={15} />
                        {cat}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Toggle Cerca de Mí (Manual por zona, sin GPS) */}
            <div className="rounded-2xl border border-line bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
                  <MapPin size={14} className="text-jade-500" />
                  Cerca de mí
                </span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={nearMeEnabled}
                    onChange={(e) => setNearMeEnabled(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-5 w-9 rounded-full bg-line after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-jade-500 peer-checked:after:translate-x-full" />
                </label>
              </div>

              <p className="mt-1.5 text-[11px] leading-tight text-sage-500">
                Filtro manual por zona (cero GPS por privacidad).
              </p>

              {nearMeEnabled && (
                <div className="mt-3 border-t border-line pt-3">
                  <label htmlFor="select-zona" className="block text-[11px] font-semibold text-ink">
                    Selecciona tu sector:
                  </label>
                  <select
                    id="select-zona"
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value as Zone)}
                    className="mt-1 w-full rounded-lg border border-line bg-paper px-2.5 py-1.5 text-xs text-ink outline-none focus:border-jade-500"
                  >
                    {CHIMBOTE_ZONES.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Filtro por Estado del Producto */}
            <div className="rounded-2xl border border-line bg-white p-4">
              <p className="flex items-center gap-1.5 text-xs font-bold text-ink">
                <SlidersHorizontal size={13} className="text-jade-500" />
                Estado del producto
              </p>
              <div className="mt-2.5 space-y-1">
                {conditionList.map((cond) => {
                  const active = activeCondition === cond;
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => {
                        setActiveCondition(cond);
                        setActiveSection("trueques");
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${
                        active
                          ? "bg-jade-50 font-semibold text-jade-700"
                          : "text-ink-soft hover:bg-paper"
                      }`}
                    >
                      <span>{cond}</span>
                      {active && <CheckCircle2 size={13} className="text-jade-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Respaldo Comunitario */}
            <div className="rounded-2xl border border-line bg-jade-50/50 p-4 text-xs text-jade-700">
              <div className="flex items-center gap-2 font-bold text-jade-700">
                <ShieldCheck size={16} />
                <span>Trueque 100% libre</span>
              </div>
              <p className="mt-1.5 leading-relaxed text-ink-soft text-[11px]">
                En Truekly negocias sin dinero ni tasas fijas. Acuerda con la otra persona
                y elijan un punto seguro de su zona.
              </p>
            </div>
          </div>
        </aside>

        {/* Área central conmutada según la sección seleccionada */}
        <main className="flex-1">
          {/* SECCIÓN 1: TRUEQUE LIBRE (Default) */}
          {activeSection === "trueques" && (
            <div>
              {/* Barra de estado del filtro */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                <div>
                  <h1 className="font-display text-xl font-semibold text-ink">
                    Trueque
                  </h1>
                  <p className="mt-0.5 text-xs text-sage-500">
                    Mostrando{" "}
                    <strong className="text-ink">{filteredProducts.length}</strong>{" "}
                    artículos en {APP_CONFIG.city}
                    {nearMeEnabled && selectedZone !== "Todas" ? ` · Cerca de ${selectedZone}` : ""}
                    {activeCategory !== "Todos" ? ` · Categoría: ${activeCategory}` : ""}
                    {activeCondition !== "Todas" ? ` · Estado: ${activeCondition}` : ""}
                  </p>
                </div>

                {(activeCategory !== "Todos" ||
                  activeCondition !== "Todas" ||
                  nearMeEnabled ||
                  query) && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("Todos");
                      setActiveCondition("Todas");
                      setNearMeEnabled(false);
                      setQuery("");
                    }}
                    className="text-xs font-semibold text-jade-600 hover:text-jade-700"
                  >
                    Restablecer filtros
                  </button>
                )}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-line bg-white py-16 text-center">
                  <p className="font-display text-base font-semibold text-ink">
                    No se encontraron artículos con estos criterios
                  </p>
                  <p className="mx-auto mt-1 max-w-sm text-xs text-sage-500">
                    Prueba cambiando de categoría, desactivando el filtro de zona o
                    buscando términos más amplios.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={onSelectProduct}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN 2: COMUNIDADES LOCALES */}
          {activeSection === "comunidades" && (
            <div>
              <div className="mb-6 border-b border-line pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-jade-600">
                  Grupos de Barrio
                </span>
                <h1 className="font-display text-2xl font-semibold text-ink">
                  Comunidades de Trueque en {APP_CONFIG.city}
                </h1>
                <p className="mt-1 text-xs text-sage-500">
                  Únete a círculos locales por afición para encontrar objetos específicos y personas con intereses comunes.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {mockCommunities.map((comm) => (
                  <CommunityCard key={comm.id} community={comm} />
                ))}
              </div>
            </div>
          )}

          {/* SECCIÓN 3: CAUSAS SOCIALES / ONGS */}
          {activeSection === "causas" && (
            <div>
              <div className="mb-6 border-b border-line pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-jade-600">
                  Solidaridad Directa
                </span>
                <h1 className="font-display text-2xl font-semibold text-ink">
                  Aporte de Objetos a Causas Sociales y ONGs
                </h1>
                <p className="mt-1 text-xs text-sage-500">
                  Donación de bienes útiles directamente a comedores, albergues y bibliotecas populares locales. Sin dinero de por medio.
                </p>
              </div>

              <div className="space-y-4">
                {mockCauses.map((cause) => (
                  <article
                    key={cause.id}
                    className="rounded-2xl border border-line bg-white p-5 transition hover:border-jade-400 sm:p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-lg font-bold text-ink">
                          {cause.ongName}
                        </h3>
                        {cause.verified && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-jade-50 px-2 py-0.5 text-[11px] font-semibold text-jade-700">
                            <ShieldCheck size={12} /> ONG Verificada
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-sage-500">{cause.city}</span>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-ink-soft sm:text-sm">
                      {cause.objective}
                    </p>

                    <div className="mt-4 rounded-xl border border-line bg-paper/60 p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-sage-500">
                        Objetos que necesitan actualmente:
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {cause.acceptedItems.map((item, idx) => (
                          <span
                            key={idx}
                            className="rounded-full border border-line bg-white px-2.5 py-0.5 text-xs text-ink"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between pt-2">
                      <span className="text-xs text-sage-500">{cause.contact}</span>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-full bg-jade-500 px-4 py-1.5 text-xs font-semibold text-paper hover:bg-jade-600"
                      >
                        <HeartHandshake size={14} />
                        <span>Aportar un objeto</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* SECCIÓN 4: SUBASTAS SIMULADAS (Diferenciada visualmente y con advertencia explícita) */}
          {activeSection === "subastas" && (
            <div>
              {/* Advertencia obligatoria sobre dinero simulado */}
              <div className="mb-6 rounded-2xl border-2 border-amber-500/40 bg-amber-50/70 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-ink">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-ink">
                      Módulo Especial: Subastas Benéficas Simuladas
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      <strong>Aviso de transparencia:</strong> A diferencia del resto de Truekly (donde el trueque es 100% libre y sin dinero), en este módulo experimental los montos indicados en Soles (S/) son <strong>SIMULADOS (dinero ficticio)</strong>. Reservado a usuarios con alto nivel de confianza para apoyar causas benéficas de la comunidad o artículos singulares.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {mockSimulatedAuctions.map((auc) => (
                  <article
                    key={auc.id}
                    className="flex flex-col overflow-hidden rounded-2xl border-2 border-amber-500/30 bg-white shadow-sm"
                  >
                    <div className="relative aspect-[16/9] w-full bg-paper">
                      <img
                        src={auc.image}
                        alt={auc.title}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-ink">
                        <Gavel size={12} /> Subasta Simulada
                      </span>
                      <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-ink/75 px-2.5 py-1 text-xs text-paper backdrop-blur-sm">
                        <Clock size={12} className="text-amber-400" />
                        {auc.hoursRemaining}h restantes
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-display text-base font-bold text-ink">
                        {auc.title}
                      </h3>

                      <p className="mt-1 text-xs text-sage-500">
                        Vendedor: <strong className="text-ink">{auc.seller}</strong> (Confianza: {auc.trustScore}★)
                      </p>

                      {auc.isBenefic && auc.beneficEntity && (
                        <div className="mt-2.5 rounded-lg bg-jade-50 px-2.5 py-1 text-[11px] font-semibold text-jade-700">
                          {auc.beneficEntity}
                        </div>
                      )}

                      {/* Recuadro de Puja Simulada en Soles Ficticios */}
                      <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-50/50 p-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-sage-500">Puja actual (Simulada):</span>
                          <span className="font-display text-lg font-bold text-ink">
                            S/ {auc.currentBidSimulated}.00
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-sage-500">
                          <span>Base simulada: S/ {auc.initialBidSimulated}</span>
                          <span>{auc.bidsCount} pujas simuladas</span>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-line pt-3">
                        <button
                          type="button"
                          className="w-full rounded-full bg-amber-500 py-2.5 text-xs font-bold text-ink shadow-sm transition hover:bg-amber-600"
                        >
                          Realizar puja simulada
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <PublishModal
        isOpen={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        onPublishSuccess={async (newProduct) => {
          const saved = await savePublication(newProduct, user?.id);
          setProductList((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
        }}
        onRequireAuth={onOpenAuth}
      />
    </div>
  );
}
