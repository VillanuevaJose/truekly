import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle } from "lucide-react";
import { compressImageFile } from "./imageCompressor";
import { CATEGORY_OPTIONS, type PublishFormData } from "./publishTypes";
import type { Category } from "../../data/mockProducts";

interface Props {
  data: PublishFormData;
  onChange: (fields: Partial<PublishFormData>) => void;
}

export function PublishPhotosStep({ data, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const remainingSlots = 9 - data.photos.length;
      if (remainingSlots <= 0) {
        setErrorMsg("Ya alcanzaste el máximo de 9 fotos permitidas.");
        setIsProcessing(false);
        return;
      }

      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      const compressedList: string[] = [];

      for (const file of filesToProcess) {
        if (!file.type.startsWith("image/")) continue;
        const compressed = await compressImageFile(file);
        compressedList.push(compressed);
      }

      onChange({ photos: [...data.photos, ...compressedList] });
    } catch {
      setErrorMsg("Ocurrió un error al procesar las imágenes.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (index: number) => {
    const updated = data.photos.filter((_, i) => i !== index);
    onChange({ photos: updated });
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Sección Fotos */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-ink">
            Fotos del objeto <span className="text-amber-600">*</span>
          </label>
          <span
            className={`text-xs font-medium ${
              data.photos.length < 3 ? "text-amber-700" : "text-jade-700"
            }`}
          >
            {data.photos.length} de 9 fotos (mínimo 3)
          </span>
        </div>

        {/* Zona de Arrastrar o Subir */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer rounded-2xl border-2 border-dashed border-line bg-paper/60 p-5 text-center transition hover:border-jade-500 hover:bg-jade-50/30"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label="Subir fotos del objeto"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)}
          />
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xs text-jade-700">
            <Upload className="h-5 w-5" />
          </div>
          <p className="mt-2 text-xs font-semibold text-ink">
            {isProcessing ? "Optimizando fotos..." : "Toca aquí o arrastra tus fotos"}
          </p>
          <p className="mt-0.5 text-[11px] text-sage-500">
            JPG, PNG o WEBP. Optimizadas en tu dispositivo sin consumir datos.
          </p>
        </div>

        {errorMsg && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {errorMsg}
          </p>
        )}

        {/* Grilla de Miniaturas */}
        {data.photos.length > 0 && (
          <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {data.photos.map((src, idx) => (
              <div
                key={idx}
                className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-white shadow-2xs"
              >
                <img src={src} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />
                {idx === 0 && (
                  <span className="absolute left-1 top-1 rounded-md bg-jade-700/90 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                    Portada
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePhoto(idx);
                  }}
                  title="Eliminar foto"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-red-600 focus-visible:outline-none"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Título del Objeto */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="pub-title" className="text-xs font-semibold uppercase tracking-wider text-ink">
            Título del objeto <span className="text-amber-600">*</span>
          </label>
          <span className="text-[11px] text-sage-400">{data.title.length}/80</span>
        </div>
        <input
          id="pub-title"
          type="text"
          maxLength={80}
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Ej: Teclado mecánico Keychron Q1 Pro inalámbrico"
          className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-xs text-ink placeholder:text-sage-400 focus:border-jade-500 focus:outline-none focus:ring-1 focus:ring-jade-500"
        />
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink mb-1.5">
          Categoría <span className="text-amber-600">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORY_OPTIONS.map((cat) => {
            const isSelected = data.category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange({ category: cat.id as Category })}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                  isSelected
                    ? "border-jade-600 bg-jade-50/50 text-jade-800 shadow-2xs"
                    : "border-line bg-white text-sage-600 hover:bg-paper hover:text-ink"
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                <span className="truncate">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
