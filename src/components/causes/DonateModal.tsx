import { useState, useEffect } from "react";
import {
  X,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Lock,
} from "lucide-react";
import type { CauseSocial } from "../../data/mockCauses";

type DonateModalProps = {
  cause: CauseSocial | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    nombre?: string;
    primerNombre?: string;
  } | null;
  onRequireAuth?: (mode?: "login" | "register") => void;
};

const CHIMBOTE_SAFE_POINTS = [
  "Plaza Mayor de Nuevo Chimbote (Frente a la Catedral)",
  "MegaPlaza Chimbote (Ingreso Principal Av. Víctor Raúl)",
  "Malecón Grau (Frente a Plaza 28 de Julio)",
  "Vivero Forestal de Chimbote (Puerta 1)",
  "Plaza Mayor San Pedro (Chimbote Norte)",
  "Coordinar retiro con la ONG (Bienes pesados / mobiliario)",
];

export function DonateModal({
  cause,
  isOpen,
  onClose,
  currentUser,
  onRequireAuth,
}: DonateModalProps) {
  const [selectedItem, setSelectedItem] = useState("");
  const [itemCondition, setItemCondition] = useState<"Nuevo" | "Como nuevo" | "Buen estado">("Buen estado");
  const [safePoint, setSafePoint] = useState(CHIMBOTE_SAFE_POINTS[0]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");

  const handleClose = () => {
    setIsSuccess(false);
    setSelectedItem("");
    setNote("");
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !cause) return null;

  // Si el usuario no está autenticado, invitar a iniciar sesión
  if (!currentUser) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full max-w-md rounded-3xl border border-line bg-white p-7 text-center shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-jade-50 text-jade-600 border border-jade-100 shadow-xs mb-4">
            <HeartHandshake size={28} />
          </div>
          <h2 className="font-display text-xl font-bold text-ink">
            Inicia sesión para aportar a esta causa
          </h2>
          <p className="mt-2 text-xs text-sage-600 leading-relaxed">
            Para coordinar la entrega segura de tu donación con <strong>{cause.ongName}</strong> necesitas tener una cuenta en Truekly.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequireAuth?.("login");
              }}
              className="w-full rounded-full bg-jade-500 py-2.5 text-xs font-semibold text-paper hover:bg-jade-600 transition"
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequireAuth?.("register");
              }}
              className="w-full rounded-full border border-line bg-white py-2.5 text-xs font-semibold text-ink hover:bg-paper transition"
            >
              Registrarse gratis
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-1 text-xs text-sage-500 hover:underline"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem.trim()) return;

    setIsSubmitting(true);
    // Simular guardado seguro y generación de código de entrega
    setTimeout(() => {
      const code = `TRK-${Math.floor(1000 + Math.random() * 9000)}-ONG`;
      setConfirmationCode(code);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) handleClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-line bg-white shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-paper/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl overflow-hidden bg-jade-100 border border-jade-200 shrink-0">
              <img
                src={cause.image}
                alt={cause.ongName}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-jade-700">
                Aporte Solidario Directo
              </span>
              <h2 className="font-display text-sm font-bold text-ink truncate leading-tight">
                {cause.ongName}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-sage-500 hover:bg-paper hover:text-ink transition"
            aria-label="Cerrar ventana"
          >
            <X size={16} />
          </button>
        </div>

        {/* Estado de Éxito */}
        {isSuccess ? (
          <div className="p-7 text-center animate-in fade-in duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-jade-50 text-jade-600 border border-jade-200 mb-4">
              <CheckCircle2 size={36} />
            </div>

            <span className="inline-block rounded-full bg-jade-100 text-jade-800 px-3 py-1 text-xs font-bold font-mono tracking-wider mb-2">
              Código de Aporte: {confirmationCode}
            </span>

            <h3 className="font-display text-xl font-bold text-ink">
              ¡Aporte registrado con éxito!
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-sage-600 leading-relaxed max-w-sm mx-auto">
              Hemos notificado a <strong>{cause.coordinator}</strong> de tu intención de donar <strong>{selectedItem}</strong>.
            </p>

            <div className="mt-5 rounded-2xl border border-line bg-paper/70 p-4 text-left text-xs space-y-2">
              <div className="flex items-start gap-2">
                <MapPin size={15} className="text-jade-600 shrink-0 mt-0.5" />
                <p className="text-ink">
                  <strong>Punto de entrega acordado:</strong> {safePoint}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck size={15} className="text-jade-600 shrink-0 mt-0.5" />
                <p className="text-sage-500 text-[11px]">
                  Recuerda que en Truekly no hay transferencias de dinero ni comisiones. Todo el intercambio es transparente y en especie.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="mt-6 w-full rounded-full bg-jade-500 py-3 text-xs font-semibold text-paper hover:bg-jade-600 transition shadow-xs cursor-pointer"
            >
              Listo, volver al catálogo de causas
            </button>
          </div>
        ) : (
          /* Formulario de registro de aporte */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {/* Paso 1: Seleccionar o escribir objeto */}
            <div>
              <label htmlFor="item-input" className="block font-bold text-ink mb-1">
                ¿Qué objeto o material deseas aportar? *
              </label>
              <input
                id="item-input"
                type="text"
                required
                maxLength={100}
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                placeholder="Ej. 2 mantas limpias, ollas de aluminio, libros escolares..."
                className="w-full h-10 px-3.5 rounded-xl border border-line bg-paper text-ink placeholder:text-sage-400 outline-none transition focus:border-jade-500 focus:bg-white text-xs"
              />

              {/* Sugerencias de la ONG */}
              <div className="mt-2">
                <span className="block text-[11px] text-sage-500 mb-1">
                  O haz clic en una de sus necesidades actuales:
                </span>
                <div className="flex flex-wrap gap-1">
                  {cause.acceptedItems.slice(0, 4).map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="rounded-full border border-line bg-white px-2 py-0.5 text-[11px] text-sage-600 hover:border-jade-500 hover:text-jade-700 hover:bg-jade-50/50 transition cursor-pointer"
                    >
                      + {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Paso 2: Estado del objeto */}
            <div>
              <span className="block font-bold text-ink mb-1.5">
                Estado del objeto
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(["Nuevo", "Como nuevo", "Buen estado"] as const).map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setItemCondition(cond)}
                    className={`rounded-xl border py-2 text-center text-xs font-medium transition cursor-pointer ${
                      itemCondition === cond
                        ? "border-jade-500 bg-jade-50 text-jade-700 font-semibold"
                        : "border-line bg-white text-ink hover:bg-paper"
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {/* Paso 3: Punto Seguro de entrega */}
            <div>
              <label htmlFor="safe-point-select" className="block font-bold text-ink mb-1">
                Punto Seguro en Chimbote para la entrega
              </label>
              <select
                id="safe-point-select"
                value={safePoint}
                onChange={(e) => setSafePoint(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-line bg-white text-ink outline-none transition focus:border-jade-500 text-xs"
              >
                {CHIMBOTE_SAFE_POINTS.map((sp, idx) => (
                  <option key={idx} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
            </div>

            {/* Paso 4: Nota opcional */}
            <div>
              <label htmlFor="note-input" className="block font-bold text-ink mb-1">
                Nota o mensaje para el coordinador (Opcional)
              </label>
              <textarea
                id="note-input"
                rows={2}
                maxLength={200}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej. Puedo entregarlo los sábados por la tarde en la Plaza Mayor..."
                className="w-full p-2.5 rounded-xl border border-line bg-paper text-ink placeholder:text-sage-400 outline-none transition focus:border-jade-500 focus:bg-white text-xs resize-none"
              />
            </div>

            {/* Banner de Seguridad Zero-Money */}
            <div className="rounded-xl border border-line bg-jade-50/60 p-3 flex items-start gap-2.5">
              <Lock size={15} className="text-jade-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-jade-800 leading-relaxed">
                <strong>Solidaridad 100% libre de dinero:</strong> La entrega se realiza de forma física en el Punto Seguro acordado. Nunca realices pagos ni transferencias.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-ink hover:bg-paper transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!selectedItem.trim() || isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-full bg-jade-500 px-5 py-2 text-xs font-semibold text-paper shadow-sm hover:bg-jade-600 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Registrando...</span>
                ) : (
                  <>
                    <HeartHandshake size={15} />
                    <span>Confirmar aporte</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
