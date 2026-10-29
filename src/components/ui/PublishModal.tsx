import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import type { TradeItem, CategoryId } from '../../types/trade';
import { CATEGORIES, SAFE_MEETING_POINTS } from '../../data/items';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (item: TradeItem) => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose, onPublish }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('tecnologia');
  const [valuePEN, setValuePEN] = useState<number>(1500);
  const [condition, setCondition] = useState<'Como nuevo' | 'Excelente' | 'Buen estado'>('Excelente');
  const [location, setLocation] = useState('Miraflores, Lima');
  const [seeking, setSeeking] = useState('');
  const [description, setDescription] = useState('');
  const [image] = useState('https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !seeking.trim()) return;

    const newItem: TradeItem = {
      id: `tr-${Date.now()}`,
      title,
      category,
      estimatedValuePEN: Number(valuePEN),
      condition,
      location,
      owner: {
        name: 'José Villanueva',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        reputation: 5.0,
        tradesCompleted: 1,
        verified: true,
        city: location.includes('Arequipa') ? 'Arequipa' : 'Lima',
      },
      image: image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80',
      seeking,
      description: description || 'Artículo verificado listo para intercambio presencial en punto seguro.',
      safeMeetingPoint: SAFE_MEETING_POINTS[0].name,
      tags: ['Trueque Nuevo', 'Comunidad'],
      createdAt: 'Recién publicado',
    };

    onPublish(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1A17]/60 backdrop-blur-xs animate-fadeIn" role="dialog" aria-modal="true">
      <div className="bg-[#FFFFFF] border border-[#E5DFD3] rounded-lg max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-4 border-b border-[#EFEBE1]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C2410C]">
              Comunidad Truekly
            </span>
            <h2 className="font-serif-editorial text-2xl font-semibold text-[#1C1A17] mt-0.5">
              Publicar Artículo para Trueque
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-[#645E56] hover:bg-[#F5F1E8]" aria-label="Cerrar modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1A17] mb-1">
              Nombre o título del artículo
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Teclado Mecánico Keychron Q1 Pro + Switches Gateron"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5DFD3] rounded-md focus:border-[#C2410C] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1A17] mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5DFD3] rounded-md focus:border-[#C2410C] outline-none"
              >
                {CATEGORIES.filter(c => c.id !== 'todos').map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1A17] mb-1">
                Valor Referencial (PEN S/)
              </label>
              <input
                type="number"
                min="50"
                step="50"
                required
                value={valuePEN}
                onChange={(e) => setValuePEN(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5DFD3] rounded-md focus:border-[#C2410C] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1A17] mb-1">
                Condición
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5DFD3] rounded-md focus:border-[#C2410C] outline-none"
              >
                <option value="Como nuevo">Como nuevo</option>
                <option value="Excelente">Excelente</option>
                <option value="Buen estado">Buen estado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1A17] mb-1">
                Distrito / Ciudad
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Miraflores, Lima"
                className="w-full px-3 py-2 text-sm bg-white border border-[#E5DFD3] rounded-md focus:border-[#C2410C] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1A17] mb-1">
              ¿Qué buscas a cambio? (Sé específico)
            </label>
            <input
              type="text"
              required
              value={seeking}
              onChange={(e) => setSeeking(e.target.value)}
              placeholder="Ej: Auriculares Sony WH-1000XM4 o Drone DJI Mini 2"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5DFD3] rounded-md focus:border-[#C2410C] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1A17] mb-1">
              Descripción y estado de conservación
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tiempo de uso, accesorios incluidos, estética..."
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5DFD3] rounded-md focus:border-[#C2410C] outline-none"
            />
          </div>

          <div className="pt-3 border-t border-[#EFEBE1] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#645E56] hover:bg-[#F5F1E8] rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-[#C2410C] text-white text-xs font-semibold hover:bg-[#9A3412]"
            >
              <Plus className="w-4 h-4" />
              Publicar en Truekly
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
