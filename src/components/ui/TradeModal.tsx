import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import type { TradeItem, TradeProposal } from '../../types/trade';
import { SAFE_MEETING_POINTS } from '../../data/items';

interface TradeModalProps {
  item: TradeItem | null;
  onClose: () => void;
  onSubmit: (proposal: TradeProposal) => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({ item, onClose, onSubmit }) => {
  const [offeredTitle, setOfferedTitle] = useState('');
  const [offeredValue, setOfferedValue] = useState<number>(0);
  const [meetingPoint, setMeetingPoint] = useState(SAFE_MEETING_POINTS[0].name);
  const [note, setNote] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!item) return;
    setOfferedValue(Math.round(item.estimatedValuePEN * 0.95));
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  const targetValue = item.estimatedValuePEN;
  const difference = targetValue - offeredValue;
  const ratio = offeredValue > 0 ? (offeredValue / targetValue) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offeredTitle.trim()) return;
    onSubmit({
      targetItemId: item.id,
      offeredTitle,
      offeredValuePEN: offeredValue,
      cashAdjustmentPEN: difference > 0 ? difference : 0,
      meetingPoint,
      note,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1A17]/60 backdrop-blur-xs animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div 
        ref={modalRef}
        className="bg-[#FFFFFF] border border-[#E5DFD3] rounded-lg max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#EFEBE1]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C2410C]">
              Propuesta Formal de Trueque
            </span>
            <h2 id="modal-title" className="font-serif-editorial text-2xl font-semibold text-[#1C1A17] mt-0.5">
              Intercambio por {item.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#645E56] hover:bg-[#F5F1E8] hover:text-[#1C1A17] transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Resumen del artículo objetivo */}
          <div className="flex items-center gap-4 p-3.5 rounded-md bg-[#FAF8F4] border border-[#E5DFD3]">
            <img src={item.image} alt={item.title} className="w-14 h-14 rounded object-cover border border-[#E5DFD3]" />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-[#645E56]">Dueño: {item.owner.name} ({item.owner.reputation} ★)</div>
              <div className="text-sm font-semibold text-[#1C1A17] truncate">{item.title}</div>
              <div className="text-xs font-medium text-[#C2410C]">Valor ref: S/ {targetValue.toLocaleString('es-PE')}</div>
            </div>
          </div>

          {/* Qué ofreces */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1A17] mb-1.5">
              ¿Qué artículo o equipo ofreces a cambio?
            </label>
            <input
              type="text"
              required
              value={offeredTitle}
              onChange={(e) => setOfferedTitle(e.target.value)}
              placeholder="Ej: iPad Air M1 64GB Gris Espacial con funda Smart Folio"
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#E5DFD3] rounded-md focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C] outline-none"
            />
          </div>

          {/* Valor estimado de lo ofrecido */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1C1A17]">
                Valor referencial de tu artículo (PEN S/)
              </label>
              <span className="text-xs text-[#645E56]">Equidad calculada</span>
            </div>
            <input
              type="number"
              min="100"
              step="50"
              value={offeredValue}
              onChange={(e) => setOfferedValue(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#E5DFD3] rounded-md focus:border-[#C2410C] focus:ring-1 focus:ring-[#C2410C] outline-none font-medium"
            />
          </div>

          {/* Indicador de Valuación Equitativa */}
          <div className="p-3.5 rounded-md bg-[#F5F1E8] border border-[#E5DFD3] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#1C1A17]">Balance de Trueque Equitativo</span>
              <span className="font-bold text-[#C2410C]">{ratio.toFixed(0)}% de correspondencia</span>
            </div>
            <div className="w-full bg-[#E5DFD3] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#C2410C] h-full transition-all duration-300"
                style={{ width: `${Math.min(ratio, 100)}%` }}
              />
            </div>
            <p className="text-xs text-[#645E56]">
              {difference === 0 
                ? 'Trueque 1:1 perfectamente balanceado en valor de mercado.'
                : difference > 0
                ? `Brecha de S/ ${difference.toLocaleString('es-PE')} a favor del receptor (se sugiere compensación mixta).`
                : `Tu artículo tiene un valor referencial mayor en S/ ${Math.abs(difference).toLocaleString('es-PE')}.`}
            </p>
          </div>

          {/* Punto seguro de encuentro */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1A17] mb-1.5">
              Punto de Encuentro Seguro Recomendado
            </label>
            <select
              value={meetingPoint}
              onChange={(e) => setMeetingPoint(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5DFD3] rounded-md focus:border-[#C2410C] outline-none"
            >
              {SAFE_MEETING_POINTS.map((pt) => (
                <option key={pt.name} value={pt.name}>
                  {pt.name} ({pt.district})
                </option>
              ))}
            </select>
          </div>

          {/* Nota */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1A17] mb-1.5">
              Mensaje directo para {item.owner.name}
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Detalla el estado de tu artículo, accesorios y disponibilidad para coordinar..."
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5DFD3] rounded-md focus:border-[#C2410C] outline-none"
            />
          </div>

          {/* Footer del Formulario */}
          <div className="pt-3 border-t border-[#EFEBE1] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#645E56] hover:bg-[#F5F1E8] rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-[#C2410C] text-white text-xs font-semibold hover:bg-[#9A3412] active:scale-[0.98] transition-all"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Enviar Propuesta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
