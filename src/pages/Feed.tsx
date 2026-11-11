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
  type Community,
  type CauseSocial,
  type SimulatedAuction,
} from "../data/mockProducts";
import { APP_CONFIG } from "../config/appConfig";
import { CommunityCard } from "../components/ui/CommunityCard";
import { CommunityChat } from "../components/community/CommunityChat";
import { CauseCard } from "../components/causes/CauseCard";
import { CauseDetailModal } from "../components/causes/CauseDetailModal";
import { DonateModal } from "../components/causes/DonateModal";
import { AuctionCard } from "../components/auctions/AuctionCard";
import { AuctionDetailModal } from "../components/auctions/AuctionDetailModal";
import { BidModal } from "../components/auctions/BidModal";
import { PublishModal } from "../components/publish/PublishModal";
import { fetchPublications, savePublication, syncLocalPublications } from "../services/publicationService";

type FeedProps = {
  onNavigateToLanding?: () => void;
  onOpenAuth?: (mode?: "login" | "register") => void;
  onSelectProduct?: (product: Product) => void;
  onOpenProfile?: () => void;
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
  onOpenProfile,
}: FeedProps) {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<FeedSection>("trueques");
  const [activeCategory, setActiveCategory] = useState<Category | "Todos">("Todos");
  const [activeCondition, setActiveCondition] = useState<Condition | "Todas">("Todas");
  const [query, setQuery] = useState("");
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  // Estados de filtro específicos para Comunidades
  const [communitySearch, setCommunitySearch] = useState("");
  const [communityCategory, setCommunityCategory] = useState<string>("Todas");
  const [communityZone, setCommunityZone] = useState<string>("Todas");
  const [onlyJoinedCommunities, setOnlyJoinedCommunities] = useState(false);
  const [selectedCommunityForChat, setSelectedCommunityForChat] = useState<Community | null>(null);
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("truekly_joined_communities") || "[]");
    } catch {
      return [];
    }
  });

  // Si se cierra la sesión mientras se exploraba un chat, cerrarlo de inmediato
  useEffect(() => {
    if (!user && selectedCommunityForChat) {
      setSelectedCommunityForChat(null);
    }
  }, [user, selectedCommunityForChat]);

  const toggleJoinCommunity = (id: string) => {
    if (!user) {
      onOpenAuth?.("login");
      return;
    }
    setJoinedCommunityIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("truekly_joined_communities", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const communityCategories = useMemo(() => {
    const set = new Set(mockCommunities.map((c) => c.category));
    return ["Todas", ...Array.from(set)];
  }, []);

  const filteredCommunities = useMemo(() => {
    return mockCommunities.filter((comm) => {
      const q = (communitySearch || (activeSection === "comunidades" ? query : "")).trim().toLowerCase();
      if (q) {
        const matchesName = comm.name.toLowerCase().includes(q);
        const matchesDesc = comm.description.toLowerCase().includes(q);
        const matchesCat = comm.category.toLowerCase().includes(q);
        const matchesZone = comm.zone.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat && !matchesZone) return false;
      }
      if (communityCategory !== "Todas" && comm.category !== communityCategory) {
        return false;
      }
      if (communityZone !== "Todas" && !comm.zone.toLowerCase().includes(communityZone.toLowerCase())) {
        return false;
      }
      if (onlyJoinedCommunities && !joinedCommunityIds.includes(comm.id)) {
        return false;
      }
      return true;
    });
  }, [communitySearch, query, activeSection, communityCategory, communityZone, onlyJoinedCommunities, joinedCommunityIds]);

  // Estados de filtro y modales específicos para Causas Sociales / ONGs
  const [causeSearch, setCauseSearch] = useState("");
  const [causeCategory, setCauseCategory] = useState<string>("Todas");
  const [causeZone, setCauseZone] = useState<string>("Todas");
  const [onlyUrgentCauses, setOnlyUrgentCauses] = useState(false);
  const [selectedCauseForDetail, setSelectedCauseForDetail] = useState<CauseSocial | null>(null);
  const [selectedCauseForDonation, setSelectedCauseForDonation] = useState<CauseSocial | null>(null);

  const causeCategories = useMemo(() => {
    const set = new Set(mockCauses.map((c) => c.category));
    return ["Todas", ...Array.from(set)];
  }, []);

  const filteredCauses = useMemo(() => {
    return mockCauses.filter((cause) => {
      const q = (causeSearch || (activeSection === "causas" ? query : "")).trim().toLowerCase();
      if (q) {
        const matchesName = cause.ongName.toLowerCase().includes(q);
        const matchesObj = cause.objective.toLowerCase().includes(q);
        const matchesItems = cause.acceptedItems.some((item) => item.toLowerCase().includes(q));
        const matchesZone = (cause.zone + " " + cause.city).toLowerCase().includes(q);
        const matchesCategory = cause.category.toLowerCase().includes(q);
        if (!matchesName && !matchesObj && !matchesItems && !matchesZone && !matchesCategory) return false;
      }
      if (causeCategory !== "Todas" && cause.category !== causeCategory) {
        return false;
      }
      if (causeZone !== "Todas" && !(cause.zone + " " + cause.city).toLowerCase().includes(causeZone.toLowerCase())) {
        return false;
      }
      if (onlyUrgentCauses && cause.urgency !== "urgente") {
        return false;
      }
      return true;
    });
  }, [causeSearch, query, activeSection, causeCategory, causeZone, onlyUrgentCauses]);

  // Estados de filtro y modales específicos para Subastas Benéficas Simuladas
  const [auctionList, setAuctionList] = useState<SimulatedAuction[]>(mockSimulatedAuctions);
  const [auctionSearch, setAuctionSearch] = useState("");
  const [auctionCategory, setAuctionCategory] = useState<string>("Todas");
  const [auctionZone, setAuctionZone] = useState<string>("Todas");
  const [onlyBeneficAuctions, setOnlyBeneficAuctions] = useState(false);
  const [selectedAuctionForDetail, setSelectedAuctionForDetail] = useState<SimulatedAuction | null>(null);
  const [selectedAuctionForBid, setSelectedAuctionForBid] = useState<SimulatedAuction | null>(null);

  const handleBidSuccess = (auctionId: string, newAmount: number, bidderName: string) => {
    setAuctionList((prev) =>
      prev.map((auc) => {
        if (auc.id !== auctionId) return auc;
        const newBid = {
          id: `b-${Date.now()}`,
          bidderName,
          bidderZone: "Chimbote",
          amount: newAmount,
          timeAgo: "Ahora mismo",
          isCurrentUser: true,
        };
        return {
          ...auc,
          currentBidSimulated: newAmount,
          bidsCount: auc.bidsCount + 1,
          bidsHistory: [newBid, ...auc.bidsHistory],
        };
      })
    );
  };

  const auctionCategories = useMemo(() => {
    const set = new Set(auctionList.map((a) => a.category));
    return ["Todas", ...Array.from(set)];
  }, [auctionList]);

  const filteredAuctions = useMemo(() => {
    return auctionList.filter((auc) => {
      const q = (auctionSearch || (activeSection === "subastas" ? query : "")).trim().toLowerCase();
      if (q) {
        const matchesTitle = auc.title.toLowerCase().includes(q);
        const matchesDesc = auc.description.toLowerCase().includes(q);
        const matchesSeller = auc.seller.toLowerCase().includes(q);
        const matchesZone = auc.zone.toLowerCase().includes(q);
        const matchesEntity = (auc.beneficEntity || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSeller && !matchesZone && !matchesEntity) return false;
      }
      if (auctionCategory !== "Todas" && auc.category !== auctionCategory) {
        return false;
      }
      if (auctionZone !== "Todas" && !auc.zone.toLowerCase().includes(auctionZone.toLowerCase())) {
        return false;
      }
      if (onlyBeneficAuctions && !auc.isBenefic) {
        return false;
      }
      return true;
    });
  }, [auctionList, auctionSearch, query, activeSection, auctionCategory, auctionZone, onlyBeneficAuctions]);

  const [productList, setProductList] = useState<Product[]>(products);

  useEffect(() => {
    let isMounted = true;
    syncLocalPublications().finally(() => {
      fetchPublications().then((customItems) => {
        if (!isMounted || customItems.length === 0) return;
        const customIds = new Set(customItems.map((c) => c.id));
        const baseMock = products.filter((p) => !customIds.has(p.id));
        setProductList([...customItems, ...baseMock]);
      });
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Toggle "Cerca de mí" (Manual por zona, sin GPS)
  const [nearMeEnabled, setNearMeEnabled] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone>("Casco Urbano");

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
                placeholder={
                  activeSection === "comunidades"
                    ? "Buscar comunidades por nombre, tema o zona..."
                    : activeSection === "causas"
                    ? "Buscar causas, comedores, albergues u objetos solicitados..."
                    : activeSection === "subastas"
                    ? "Buscar artículos singulares, cámaras, instrumentos o causas benéficas..."
                    : "Buscar qué necesitas o qué buscas cambiar..."
                }
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
                          if (onOpenProfile) onOpenProfile();
                          else window.location.hash = "#perfil";
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
                          if (onOpenProfile) onOpenProfile();
                          else window.location.hash = "#perfil";
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
              onClick={() => {
                setActiveSection("trueques");
                setSelectedCommunityForChat(null);
              }}
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
              onClick={() => {
                setActiveSection("comunidades");
                setSelectedCommunityForChat(null);
              }}
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
              onClick={() => {
                setActiveSection("causas");
                setSelectedCommunityForChat(null);
              }}
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
              onClick={() => {
                setActiveSection("subastas");
                setSelectedCommunityForChat(null);
              }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                activeSection === "subastas"
                  ? "bg-amber-500 text-ink shadow-sm"
                  : "border border-amber-500/40 text-amber-600 hover:bg-amber-50"
              }`}
            >
              <Gavel size={14} />
              <span>Subastas</span>
              <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-900">
                {auctionList.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal: Sidebar + Grid */}
      <div className="relative min-h-[600px]">
        <div
          className={`mx-auto flex max-w-7xl gap-8 px-4 transition-all duration-200 ${
            selectedCommunityForChat ? "py-3 sm:py-4" : "py-6 sm:px-8 sm:py-8"
          } ${
            activeSection === "comunidades" && !user
              ? "filter blur-sm select-none pointer-events-none opacity-40"
              : ""
          }`}
        >
        {/* Sidebar izquierdo dinámico según la sección activa (se oculta cuando el chat de comunidad está abierto) */}
        {!(activeSection === "comunidades" && selectedCommunityForChat) && (
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-32 space-y-6 max-h-[calc(100vh-140px)] overflow-y-auto pr-1 no-scrollbar">
            {activeSection === "comunidades" ? (
              <>
                {/* 1. Buscador rápido de comunidades */}
                <div className="rounded-2xl border border-line bg-white p-4">
                  <label htmlFor="search-comm" className="block text-xs font-bold text-ink mb-1.5">
                    Buscar comunidades
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sage-400" />
                    <input
                      id="search-comm"
                      type="text"
                      value={communitySearch}
                      onChange={(e) => setCommunitySearch(e.target.value)}
                      placeholder="Ej. ciclistas, libros..."
                      className="w-full h-9 pl-8 pr-2.5 rounded-xl border border-line bg-paper text-xs text-ink placeholder:text-sage-400 outline-none transition focus:border-jade-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* 2. Filtro por Categoría de Comunidad */}
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-sage-500">
                    Por Temática
                  </p>
                  <nav className="space-y-1 max-h-60 overflow-y-auto pr-1 no-scrollbar">
                    {communityCategories.map((cat) => {
                      const active = communityCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCommunityCategory(cat)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                            active
                              ? "bg-jade-500 text-paper"
                              : "text-ink-soft hover:bg-jade-50 hover:text-jade-700"
                          }`}
                        >
                          <span>{cat}</span>
                          {active && <CheckCircle2 size={13} className="text-paper" />}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* 3. Filtro por Zona de Chimbote */}
                <div className="rounded-2xl border border-line bg-white p-4">
                  <label htmlFor="select-comm-zona" className="flex items-center gap-1.5 text-xs font-bold text-ink mb-2">
                    <MapPin size={14} className="text-jade-500" />
                    Zona / Distrito
                  </label>
                  <select
                    id="select-comm-zona"
                    value={communityZone}
                    onChange={(e) => setCommunityZone(e.target.value)}
                    className="w-full rounded-xl border border-line bg-paper px-2.5 py-2 text-xs text-ink outline-none focus:border-jade-500"
                  >
                    <option value="Todas">Todas las zonas ({mockCommunities.length})</option>
                    <option value="Casco Urbano">Casco Urbano</option>
                    <option value="Nuevo Chimbote">Nuevo Chimbote</option>
                    <option value="Buenos Aires">Buenos Aires</option>
                    <option value="Bellamar">Bellamar</option>
                    <option value="La Caleta">La Caleta</option>
                    <option value="21 de Abril">21 de Abril</option>
                  </select>
                </div>

                {/* 4. Switch "Mis Comunidades" */}
                <div className="rounded-2xl border border-line bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
                      <Users size={14} className="text-jade-500" />
                      Mis comunidades
                    </span>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={onlyJoinedCommunities}
                        onChange={(e) => setOnlyJoinedCommunities(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-5 w-9 rounded-full bg-line after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-jade-500 peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-tight text-sage-500">
                    Mostrar solo las comunidades a las que te has unido ({joinedCommunityIds.length}).
                  </p>
                </div>
              </>
            ) : activeSection === "causas" ? (
              <>
                {/* 1. Buscador rápido de causas y objetos */}
                <div className="rounded-2xl border border-line bg-white p-4">
                  <label htmlFor="search-causes" className="block text-xs font-bold text-ink mb-1.5">
                    Buscar causas u objetos
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sage-400" />
                    <input
                      id="search-causes"
                      type="text"
                      value={causeSearch}
                      onChange={(e) => setCauseSearch(e.target.value)}
                      placeholder="Ej. mantas, ollas, libros..."
                      className="w-full h-9 pl-8 pr-2.5 rounded-xl border border-line bg-paper text-xs text-ink placeholder:text-sage-400 outline-none transition focus:border-jade-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* 2. Filtro por Temática Solidaria */}
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-sage-500">
                    Temática Solidaria
                  </p>
                  <nav className="space-y-1">
                    {causeCategories.map((cat) => {
                      const active = causeCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCauseCategory(cat)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                            active
                              ? "bg-jade-500 text-paper font-semibold"
                              : "text-ink-soft hover:bg-jade-50 hover:text-jade-700"
                          }`}
                        >
                          <span className="truncate">{cat}</span>
                          {active && <CheckCircle2 size={13} className="shrink-0" />}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* 3. Filtro por Zona */}
                <div className="rounded-2xl border border-line bg-white p-4">
                  <label htmlFor="cause-zone-select" className="flex items-center gap-1.5 text-xs font-bold text-ink mb-2">
                    <MapPin size={14} className="text-jade-500" />
                    Zona / Distrito
                  </label>
                  <select
                    id="cause-zone-select"
                    value={causeZone}
                    onChange={(e) => setCauseZone(e.target.value)}
                    className="w-full rounded-xl border border-line bg-paper px-2.5 py-2 text-xs text-ink outline-none focus:border-jade-500"
                  >
                    <option value="Todas">Todas las zonas ({mockCauses.length})</option>
                    <option value="Nuevo Chimbote">Nuevo Chimbote</option>
                    <option value="Casco Urbano">Casco Urbano</option>
                    <option value="Bellamar">Bellamar</option>
                    <option value="La Caleta">La Caleta</option>
                    <option value="27 de Octubre">27 de Octubre</option>
                    <option value="Miraflores">Miraflores</option>
                    <option value="San Pedro">San Pedro</option>
                  </select>
                </div>

                {/* 4. Switch Solo Urgentes */}
                <div className="rounded-2xl border border-line bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
                      <Clock size={14} className="text-rose-500" />
                      Solo causas urgentes
                    </span>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={onlyUrgentCauses}
                        onChange={(e) => setOnlyUrgentCauses(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-5 w-9 rounded-full bg-line after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-rose-500 peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-tight text-sage-500">
                    Muestra causas con necesidades prioritarias inmediatas.
                  </p>
                </div>

                {/* 5. Tarjeta de Confianza y Cero Dinero */}
                <div className="rounded-2xl border border-jade-200/80 bg-jade-50/60 p-4 text-xs">
                  <div className="flex items-center gap-2 text-jade-800 font-bold mb-1">
                    <ShieldCheck size={16} className="text-jade-600" />
                    <span>Garantía Truekly</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-jade-900/80">
                    En Truekly las causas sociales no reciben dinero en efectivo ni donaciones monetarias. Toda colaboración es exclusivamente en bienes útiles entregados en Puntos Seguros autorizados.
                  </p>
                </div>
              </>
            ) : activeSection === "subastas" ? (
              <>
                {/* 1. Buscador rápido de subastas */}
                <div className="rounded-2xl border border-line bg-white p-4">
                  <label htmlFor="search-auctions" className="block text-xs font-bold text-ink mb-1.5">
                    Buscar en subastas
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-sage-400" />
                    <input
                      id="search-auctions"
                      type="text"
                      value={auctionSearch}
                      onChange={(e) => setAuctionSearch(e.target.value)}
                      placeholder="Ej. cámara, telescopio, dron..."
                      className="w-full h-9 pl-8 pr-2.5 rounded-xl border border-line bg-paper text-xs text-ink placeholder:text-sage-400 outline-none transition focus:border-amber-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* 2. Categorías de subasta */}
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-sage-500">
                    Especialidad / Rubro
                  </p>
                  <nav className="space-y-1">
                    {auctionCategories.map((cat) => {
                      const active = auctionCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setAuctionCategory(cat)}
                          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition cursor-pointer ${
                            active
                              ? "bg-amber-500 text-ink font-bold shadow-xs"
                              : "text-ink-soft hover:bg-amber-50 hover:text-amber-800"
                          }`}
                        >
                          <span className="truncate">{cat}</span>
                          {active && <CheckCircle2 size={13} className="shrink-0 text-ink" />}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* 3. Filtro por Zona */}
                <div className="rounded-2xl border border-line bg-white p-4">
                  <label htmlFor="auction-zone-select" className="flex items-center gap-1.5 text-xs font-bold text-ink mb-2">
                    <MapPin size={14} className="text-amber-600" />
                    Zona / Distrito
                  </label>
                  <select
                    id="auction-zone-select"
                    value={auctionZone}
                    onChange={(e) => setAuctionZone(e.target.value)}
                    className="w-full rounded-xl border border-line bg-paper px-2.5 py-2 text-xs text-ink outline-none focus:border-amber-500"
                  >
                    <option value="Todas">Todas las zonas ({auctionList.length})</option>
                    <option value="Nuevo Chimbote">Nuevo Chimbote</option>
                    <option value="Casco Urbano">Casco Urbano</option>
                    <option value="Buenos Aires">Buenos Aires</option>
                    <option value="Bellamar">Bellamar</option>
                    <option value="La Caleta">La Caleta</option>
                  </select>
                </div>

                {/* 4. Switch Solo Benéficas */}
                <div className="rounded-2xl border border-line bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-ink">
                      <Heart size={14} className="text-jade-600 fill-jade-600" />
                      Solo con fin social
                    </span>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={onlyBeneficAuctions}
                        onChange={(e) => setOnlyBeneficAuctions(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-5 w-9 rounded-full bg-line after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-jade-500 peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-tight text-sage-500">
                    Artículos cuya puja apoya a comedores, albergues y bibliotecas de Chimbote.
                  </p>
                </div>

                {/* 5. Tarjeta de Transparencia de Moneda Ficticia */}
                <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-4 text-xs">
                  <div className="flex items-center gap-2 text-amber-900 font-bold mb-1">
                    <Gavel size={15} className="text-amber-700" />
                    <span>Módulo de Pujas Didáctico</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-900/80">
                    Los montos en Soles (S/) son simbólicos para simular pujas en artículos escasos o benéficos. No se debitará dinero de tus cuentas bancarias ni se cobran comisiones.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Categorías de productos */}
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
              </>
            )}
          </div>
        </aside>
        )}

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
            selectedCommunityForChat ? (
              <CommunityChat
                community={selectedCommunityForChat}
                isJoined={joinedCommunityIds.includes(selectedCommunityForChat.id)}
                onToggleJoin={() => toggleJoinCommunity(selectedCommunityForChat.id)}
                onBack={() => setSelectedCommunityForChat(null)}
              />
            ) : (
            <div>
              <div className="mb-6 border-b border-line pb-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-jade-600">
                    Grupos de Barrio & Afición
                  </span>
                  <h1 className="font-display text-2xl font-semibold text-ink">
                    Comunidades de Trueque en {APP_CONFIG.city}
                  </h1>
                  <p className="mt-1 text-xs text-sage-500">
                    Únete a círculos locales por afición para encontrar objetos específicos y personas con intereses comunes.
                  </p>
                </div>

                {/* Contador y reseteador */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-sage-600 font-medium">
                    {filteredCommunities.length} de {mockCommunities.length} comunidades
                  </span>
                  {(communitySearch || communityCategory !== "Todas" || communityZone !== "Todas" || onlyJoinedCommunities) && (
                    <button
                      type="button"
                      onClick={() => {
                        setCommunitySearch("");
                        setCommunityCategory("Todas");
                        setCommunityZone("Todas");
                        setOnlyJoinedCommunities(false);
                      }}
                      className="text-xs font-semibold text-jade-600 hover:underline"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>

              {filteredCommunities.length === 0 ? (
                <div className="rounded-2xl border border-line bg-white p-12 text-center">
                  <Users className="mx-auto h-10 w-10 text-sage-400" />
                  <p className="mt-3 font-display text-base font-semibold text-ink">
                    No se encontraron comunidades con esos criterios
                  </p>
                  <p className="mt-1 text-xs text-sage-500">
                    Prueba cambiando la zona, la temática o borrando los términos de búsqueda.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCommunitySearch("");
                      setCommunityCategory("Todas");
                      setCommunityZone("Todas");
                      setOnlyJoinedCommunities(false);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-jade-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-jade-600"
                  >
                    Ver todas las comunidades
                  </button>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {filteredCommunities.map((comm) => (
                    <CommunityCard
                      key={comm.id}
                      community={comm}
                      isJoined={Boolean(user) && joinedCommunityIds.includes(comm.id)}
                      onToggleJoin={() => toggleJoinCommunity(comm.id)}
                      onOpenChat={() => {
                        if (!user) {
                          onOpenAuth?.("login");
                          return;
                        }
                        setSelectedCommunityForChat(comm);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            )
          )}

          {/* SECCIÓN 3: CAUSAS SOCIALES / ONGS */}
          {activeSection === "causas" && (
            <div>
              <div className="mb-6 border-b border-line pb-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-jade-600">
                    Solidaridad Directa & Transparente
                  </span>
                  <h1 className="font-display text-2xl font-semibold text-ink">
                    Aporte de Objetos a Causas Sociales y ONGs en {APP_CONFIG.city}
                  </h1>
                  <p className="mt-1 text-xs text-sage-500 max-w-2xl leading-relaxed">
                    Donación de bienes útiles directamente a albergues, comedores populares, bibliotecas comunitarias y colectivos ecológicos de Chimbote. Sin intermediarios ni dinero de por medio.
                  </p>
                </div>

                {/* Contador y Limpiador de filtros */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-sage-600 font-medium">
                    {filteredCauses.length} de {mockCauses.length} causas activas
                  </span>
                  {(causeSearch || causeCategory !== "Todas" || causeZone !== "Todas" || onlyUrgentCauses) && (
                    <button
                      type="button"
                      onClick={() => {
                        setCauseSearch("");
                        setCauseCategory("Todas");
                        setCauseZone("Todas");
                        setOnlyUrgentCauses(false);
                      }}
                      className="text-xs font-semibold text-jade-600 hover:underline cursor-pointer"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>

              {/* Listado de tarjetas de causas */}
              {filteredCauses.length === 0 ? (
                <div className="rounded-2xl border border-line bg-white p-12 text-center">
                  <p className="font-display text-base font-bold text-ink">
                    No se encontraron causas con los filtros seleccionados
                  </p>
                  <p className="mt-1 text-xs text-sage-500">
                    Prueba cambiando la zona, la temática o borrando los términos de búsqueda.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCauseSearch("");
                      setCauseCategory("Todas");
                      setCauseZone("Todas");
                      setOnlyUrgentCauses(false);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-jade-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-jade-600 cursor-pointer"
                  >
                    Ver todas las causas
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredCauses.map((cause) => (
                    <CauseCard
                      key={cause.id}
                      cause={cause}
                      onDonate={(c) => setSelectedCauseForDonation(c)}
                      onViewDetails={(c) => setSelectedCauseForDetail(c)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN 4: SUBASTAS SIMULADAS */}
          {activeSection === "subastas" && (
            <div>
              <div className="mb-6 border-b border-line pb-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    Artículos Singulares & Fin Social
                  </span>
                  <h1 className="font-display text-2xl font-semibold text-ink">
                    Subastas Benéficas Simuladas en {APP_CONFIG.city}
                  </h1>
                  <p className="mt-1 text-xs text-sage-500 max-w-2xl leading-relaxed">
                    Pujas didácticas con moneda simulada para artículos de colección, fotografía, ciencia e instrumentos. Los intercambios benéficos apoyan a comedores y albergues locales.
                  </p>
                </div>

                {/* Contador y Limpiador de filtros */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-sage-600 font-medium">
                    {filteredAuctions.length} de {auctionList.length} subastas activas
                  </span>
                  {(auctionSearch || auctionCategory !== "Todas" || auctionZone !== "Todas" || onlyBeneficAuctions) && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuctionSearch("");
                        setAuctionCategory("Todas");
                        setAuctionZone("Todas");
                        setOnlyBeneficAuctions(false);
                      }}
                      className="text-xs font-semibold text-amber-700 hover:underline cursor-pointer"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              </div>

              {/* Advertencia de transparencia y política de moneda ficticia */}
              <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50/70 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-ink shadow-xs">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <h2 className="font-display text-sm sm:text-base font-bold text-ink">
                      Aviso de Transparencia: Moneda Simulada (Sin Cobros Reales)
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                      A diferencia del feed habitual (trueque directo sin dinero), en este módulo experimental los montos indicados en Soles (S/) son <strong>SIMULADOS (dinero ficticio para pujas didácticas)</strong>. Permite acceder a objetos de alta demanda y canalizar aportes solidarios hacia ONGs registradas en Chimbote.
                    </p>
                  </div>
                </div>
              </div>

              {/* Listado de tarjetas de subastas */}
              {filteredAuctions.length === 0 ? (
                <div className="rounded-2xl border border-line bg-white p-12 text-center">
                  <p className="font-display text-base font-bold text-ink">
                    No se encontraron subastas con los filtros seleccionados
                  </p>
                  <p className="mt-1 text-xs text-sage-500">
                    Prueba cambiando el rubro, la zona o borrando los términos de búsqueda.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuctionSearch("");
                      setAuctionCategory("Todas");
                      setAuctionZone("Todas");
                      setOnlyBeneficAuctions(false);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-ink transition hover:bg-amber-600 cursor-pointer"
                  >
                    Ver todas las subastas
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {filteredAuctions.map((auc) => (
                    <AuctionCard
                      key={auc.id}
                      auction={auc}
                      onBid={(a) => setSelectedAuctionForBid(a)}
                      onViewDetails={(a) => setSelectedAuctionForDetail(a)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
        </div>

        {/* Modal / Overlay centrado para invitar a iniciar sesión en Comunidades */}
        {activeSection === "comunidades" && !user && (
          <div className="absolute inset-0 z-30 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-white/20 backdrop-blur-xs">
            <div className="sticky top-44 w-full max-w-md rounded-3xl border border-line bg-white/95 p-7 sm:p-8 text-center shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-jade-50 text-jade-600 border border-jade-100 shadow-xs mb-4">
                <Users size={28} />
              </div>

              <span className="inline-block rounded-full bg-jade-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-jade-700 mb-2">
                Comunidades Locales de Chimbote
              </span>

              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink leading-snug">
                Inicia sesión para acceder a las comunidades
              </h2>

              <p className="mt-2.5 text-xs sm:text-sm text-sage-600 leading-relaxed">
                Únete a grupos por temática en Chimbote, chatea en tiempo real con vecinos verificados y coordina trueques directos sin dinero.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={() => onOpenAuth?.("login")}
                  className="w-full sm:w-auto flex-1 rounded-full bg-jade-500 px-5 py-2.5 text-xs sm:text-sm font-semibold text-paper shadow-sm hover:bg-jade-600 transition focus-visible:outline-2 focus-visible:outline-jade-500 cursor-pointer"
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuth?.("register")}
                  className="w-full sm:w-auto flex-1 rounded-full border border-line bg-white px-5 py-2.5 text-xs sm:text-sm font-semibold text-ink hover:bg-paper hover:border-jade-500 transition focus-visible:outline-2 focus-visible:outline-jade-500 cursor-pointer"
                >
                  Registrarse gratis
                </button>
              </div>

              <p className="mt-4 text-[11px] text-sage-400">
                Solo toma 1 minuto y es 100% gratuito.
              </p>
            </div>
          </div>
        )}
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

      {/* Modales de Solidaridad para Causas Sociales / ONGs */}
      <CauseDetailModal
        cause={selectedCauseForDetail}
        onClose={() => setSelectedCauseForDetail(null)}
        onDonate={(c) => setSelectedCauseForDonation(c)}
      />

      <DonateModal
        cause={selectedCauseForDonation}
        isOpen={Boolean(selectedCauseForDonation)}
        onClose={() => setSelectedCauseForDonation(null)}
        currentUser={user}
        onRequireAuth={onOpenAuth}
      />

      {/* Modales para Subastas Benéficas Simuladas */}
      <AuctionDetailModal
        auction={selectedAuctionForDetail}
        onClose={() => setSelectedAuctionForDetail(null)}
        onBid={(a) => setSelectedAuctionForBid(a)}
      />

      <BidModal
        key={selectedAuctionForBid?.id || "bid-modal"}
        auction={selectedAuctionForBid}
        isOpen={Boolean(selectedAuctionForBid)}
        onClose={() => setSelectedAuctionForBid(null)}
        currentUser={user}
        onRequireAuth={onOpenAuth}
        onBidSuccess={handleBidSuccess}
      />
    </div>
  );
}
