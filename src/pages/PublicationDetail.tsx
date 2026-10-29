import React, { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Star,
  Repeat,
  Heart,
  Share2,
  Calendar,
  MessageCircle,
  Info,
  Shield,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { type Product } from "../data/mockProducts";
import { useAuth } from "../context/AuthContext";
import { DeleteConfirmModal } from "../components/publish/DeleteConfirmModal";

interface PublicationDetailProps {
  product: Product;
  relatedProducts: Product[];
  onBack: () => void;
  onSelectProduct: (p: Product) => void;
  onOpenAuth: (mode?: "login" | "register") => void;
  onDeleteProduct?: (id: string) => Promise<void> | void;
}

export const PublicationDetail: React.FC<PublicationDetailProps> = ({
  product,
  relatedProducts,
  onBack,
  onSelectProduct,
  onOpenAuth,
  onDeleteProduct,
}) => {
  const { user } = useAuth();
  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const [selectedImage, setSelectedImage] = useState<string>(images[0]);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = Boolean(
    user &&
    ((product.userId && product.userId === user.id) ||
      product.owner.name === `@${user.username}` ||
      (user.username && product.owner.name.includes(user.username)) ||
      product.owner.name === user.nombre)
  );

  React.useEffect(() => {
    const newImages = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
    setSelectedImage(newImages[0]);
  }, [product]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F6] text-[#16201C] antialiased">
      {/* Barra de navegación superior fija */}
      <header className="sticky top-0 z-30 border-b border-[#E5DFD3] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F6D5F] hover:text-[#0c574c] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6D5F] rounded-md px-2 py-1 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al feed</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              aria-label="Compartir publicación"
              className="p-2 text-[#6B7A72] hover:text-[#16201C] rounded-full hover:bg-black/5 transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsSaved(!isSaved)}
              aria-label={isSaved ? "Quitar de favoritos" : "Guardar en favoritos"}
              className="p-2 text-[#6B7A72] hover:text-red-500 rounded-full hover:bg-black/5 transition-colors"
            >
              <Heart className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {copiedNotification && (
        <div role="status" className="fixed top-16 right-6 z-50 rounded-lg bg-[#16201C] text-white px-3 py-1.5 text-xs font-medium shadow-lg animate-fade-in">
          Enlace copiado al portapapeles
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          
          {/* COLUMNA IZQUIERDA: Galería de imágenes y mapa seguro (7 cols) */}
          <div className="space-y-6 lg:col-span-7">
            
            {/* Imagen principal */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#E5DFD3] bg-white shadow-sm">
              <img
                src={selectedImage}
                alt={product.title}
                className="h-full w-full object-cover transition-all duration-300"
              />
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-[#16201C]/80 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5 text-[#0F6D5F]" />
                <span>{product.zone}</span>
                {product.distanceKm && <span className="opacity-80">· {product.distanceKm} km</span>}
              </span>
            </div>

            {/* Miniaturas de la galería */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Miniaturas de la publicación">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      selectedImage === img
                        ? "border-[#0F6D5F] ring-2 ring-[#0F6D5F]/20"
                        : "border-[#E5DFD3] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Punto seguro recomendado para intercambio */}
            <div className="rounded-2xl border border-[#E5DFD3] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-[#16201C]">
                <Shield className="h-4 w-4 text-[#0F6D5F]" />
                <span>Punto seguro recomendado para el trato</span>
              </div>
              <p className="mt-1 text-xs text-[#6B7A72]">
                Por tu seguridad física y de acuerdo al protocolo Truekly, sugerimos acordar el intercambio en un punto con vigilancia ciudadana.
              </p>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-[#F7F8F6] p-3.5 border border-[#E5DFD3]">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0F6D5F]/10 text-[#0F6D5F]">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#16201C] block">
                      {product.safePointRecommended || "Plaza de Armas de Chimbote"}
                    </span>
                    <span className="text-[11px] text-[#6B7A72]">
                      Zona céntrica, cámaras de seguridad 24/7 y tránsito peatonal.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reseñas del propietario */}
            <div className="rounded-2xl border border-[#E5DFD3] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-[#16201C]">
                  Reseñas del miembro ({product.owner.reviews?.length || 0})
                </h2>
                {product.owner.reviews && product.owner.reviews.length > 0 ? (
                  <div className="flex items-center gap-1 text-xs text-[#6B7A72]">
                    <Star className="h-3.5 w-3.5 fill-[#E8A33D] text-[#E8A33D]" />
                    <span className="font-semibold text-[#16201C]">{product.rating}</span> de 5
                  </div>
                ) : (
                  <span className="text-[11px] font-medium text-[#6B7A72]">Sin calificaciones</span>
                )}
              </div>

              {product.owner.reviews && product.owner.reviews.length > 0 ? (
                <div className="space-y-3">
                  {product.owner.reviews.map((rev, i) => (
                    <div key={i} className="border-t border-[#E5DFD3] pt-3 first:border-none first:pt-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#16201C]">{rev.reviewer}</span>
                        <div className="flex items-center text-[#E8A33D]">
                          {"★".repeat(Math.round(rev.rating))}
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-[#6B7A72] leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-[#F7F8F6] p-3.5 text-center border border-[#E5DFD3]">
                  <p className="text-xs text-[#6B7A72]">Aún no tiene reseñas ni comentarios</p>
                  <p className="mt-0.5 text-[11px] text-[#6B7A72]/80">
                    Las calificaciones se obtienen al completar trueques presenciales con éxito.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* COLUMNA DERECHA: Datos del trueque, oferta requerida y contacto (5 cols) */}
          <div className="space-y-6 lg:col-span-5">
            
            {/* Cabecera del producto */}
            <div>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-[#0F6D5F]/10 px-2.5 py-0.5 font-semibold text-[#0F6D5F]">
                  {product.category}
                </span>
                <span className="rounded-full bg-[#E8A33D]/15 px-2.5 py-0.5 font-semibold text-[#B87A1E]">
                  {product.condition}
                </span>
                <span className="text-[#6B7A72]">·</span>
                <span className="text-xs text-[#6B7A72] flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {product.zone}
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#16201C] sm:text-3xl leading-snug">
                {product.title}
              </h1>
            </div>

            {/* Bloque: QUÉ SE BUSCA A CAMBIO (Core de Truekly) */}
            <div className="rounded-2xl border-2 border-[#0F6D5F]/30 bg-[#0F6D5F]/5 p-5">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0F6D5F]">
                <Repeat className="h-4 w-4" />
                Busca a cambio (Trueque libre)
              </span>
              <p className="mt-2 text-sm font-semibold text-[#16201C] leading-relaxed">
                {product.wantsInReturn}
              </p>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-[#6B7A72]">
                <Info className="h-3.5 w-3.5 text-[#0F6D5F]" />
                <span>En Truekly no hay dinero obligatorio: proponle un objeto equivalente.</span>
              </div>
            </div>

            {/* Descripción detallada */}
            <div className="rounded-2xl border border-[#E5DFD3] bg-white p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7A72] mb-2">
                Descripción del artículo
              </h2>
              <p className="text-sm text-[#16201C] leading-relaxed whitespace-pre-line">
                {product.description || "Artículo en perfecto estado de conservación. Listo para coordinar intercambio en punto seguro de Chimbote."}
              </p>
            </div>

            {/* Tarjeta del Propietario Verificado */}
            <div className="rounded-2xl border border-[#0F6D5F]/40 bg-white p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5DFD3]">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F6D5F]">
                  <ShieldCheck className="h-4 w-4" />
                  Perfil Verificado Truekly
                </span>
                <span className="text-[11px] text-[#6B7A72]">
                  DNI y selfie validados
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3.5">
                <img
                  src={product.owner.avatar}
                  alt={product.owner.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-[#0F6D5F]/20"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[#16201C] truncate">
                    {product.owner.name}
                  </h3>
                  <p className="text-xs text-[#6B7A72] flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Miembro desde {product.owner.memberSince || "Enero 2025"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-xl bg-[#F7F8F6] p-2.5 border border-[#E5DFD3]">
                  <span className="block font-bold text-[#16201C] text-sm">
                    {product.rating} ★
                  </span>
                  <span className="text-[10px] text-[#6B7A72]">Nivel de confianza</span>
                </div>
                <div className="rounded-xl bg-[#F7F8F6] p-2.5 border border-[#E5DFD3]">
                  <span className="block font-bold text-[#16201C] text-sm">
                    {product.exchangesCount}
                  </span>
                  <span className="text-[10px] text-[#6B7A72]">Trueques completados</span>
                </div>
              </div>

              {/* Botón CTA o Gestión de Propietario */}
              {isOwner ? (
                <div className="mt-5 space-y-3">
                  <div className="rounded-xl border border-jade-300 bg-jade-50/70 p-3 text-center">
                    <span className="text-xs font-semibold text-jade-800">
                      Esta es tu publicación activa
                    </span>
                    <p className="mt-0.5 text-[11px] text-[#6B7A72]">
                      Visible en el feed para toda la comunidad.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/70 px-4 py-2.5 text-xs font-bold text-red-600 shadow-2xs hover:bg-red-100 hover:border-red-300 active:scale-[0.98] transition-all focus-visible:outline-2 focus-visible:outline-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Eliminar mi publicación</span>
                  </button>
                </div>
              ) : (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => onOpenAuth("login")}
                    className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-[#0F6D5F] px-4 py-3 text-sm font-bold text-white shadow-md hover:bg-[#0c574c] active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6D5F]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Iniciar sesión para proponer trueque</span>
                  </button>
                  <p className="mt-2 text-center text-[11px] text-[#6B7A72]">
                    Al contactar, aceptas respetar los puntos seguros recomendados.
                  </p>
                </div>
              )}
            </div>

            {/* Productos relacionados de la misma categoría */}
            {relatedProducts.length > 0 && (
              <div className="rounded-2xl border border-[#E5DFD3] bg-white p-5 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7A72] mb-3">
                  Otros trueques en {product.category}
                </h3>
                <div className="space-y-3">
                  {relatedProducts.slice(0, 3).map((rel) => (
                    <button
                      key={rel.id}
                      type="button"
                      onClick={() => onSelectProduct(rel)}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#F7F8F6] transition-colors text-left group"
                    >
                      <img
                        src={rel.image}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-[#16201C] truncate group-hover:text-[#0F6D5F]">
                          {rel.title}
                        </h4>
                        <p className="text-[11px] text-[#6B7A72] truncate">
                          Busca: {rel.wantsInReturn}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#6B7A72] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        isDeleting={isDeleting}
        itemTitle={product.title}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          setIsDeleting(true);
          try {
            if (onDeleteProduct) {
              await onDeleteProduct(product.id);
            }
            onBack();
          } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
          }
        }}
      />
    </div>
  );
};
