import React, { useState } from 'react';
import { Scale, CheckCircle2, ArrowRightLeft } from 'lucide-react';

export const ValuationCalculator: React.FC = () => {
  const [valA, setValA] = useState<number>(2400);
  const [nameA, setNameA] = useState<string>('Tu MacBook Air M1');
  const [valB, setValB] = useState<number>(2550);
  const [nameB, setNameB] = useState<string>('Cámara Sony A6400');

  const difference = Math.abs(valA - valB);
  const maxVal = Math.max(valA, valB) || 1;
  const parityPercentage = Math.round((Math.min(valA, valB) / maxVal) * 100);
  const isDirectEquitable = parityPercentage >= 90;

  return (
    <section id="calculadora" className="py-16 sm:py-20 border-t border-[#E5DFD3] bg-[#F5F1E8]/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Detalle de oficio editorial: subtítulo numerado */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C2410C]">
            [02 · Herramienta de Transparencia]
          </span>
          <div className="h-[1px] w-12 bg-[#C2410C]/40"></div>
        </div>

        <div className="max-w-2xl mb-10">
          <h2 className="font-serif-editorial text-3xl sm:text-4xl font-medium text-[#1C1A17] tracking-tight">
            Valuador de Trueque Equitativo
          </h2>
          <p className="text-sm text-[#645E56] mt-2 leading-relaxed">
            Compara valores de mercado referenciales en Soles (PEN) para saber si un intercambio es directo o si requiere una compensación mixta acordada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Lado A: Tu artículo */}
          <div className="md:col-span-5 bg-white border border-[#E5DFD3] rounded-lg p-6 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#645E56]">Lado A · Lo que ofreces</span>
            <input
              type="text"
              value={nameA}
              onChange={(e) => setNameA(e.target.value)}
              className="mt-1 w-full text-base font-medium text-[#1C1A17] border-b border-[#E5DFD3] pb-1 focus:border-[#C2410C] outline-none"
              placeholder="Nombre de tu artículo"
            />
            <div className="mt-4">
              <label className="text-xs text-[#645E56] block mb-1">Valor referencial mercado (PEN S/)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-[#645E56]">S/</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={valA}
                  onChange={(e) => setValA(Number(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-1.5 text-lg font-bold text-[#1C1A17] border border-[#E5DFD3] rounded focus:border-[#C2410C] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Centro: Indicador de Balanza */}
          <div className="md:col-span-2 flex flex-col items-center justify-center py-2">
            <div className="w-12 h-12 rounded-full bg-white border border-[#E5DFD3] shadow-xs flex items-center justify-center text-[#C2410C]">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#1C1A17] mt-2">{parityPercentage}% Equidad</span>
          </div>

          {/* Lado B: Artículo deseado */}
          <div className="md:col-span-5 bg-white border border-[#E5DFD3] rounded-lg p-6 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#645E56]">Lado B · Lo que recibes</span>
            <input
              type="text"
              value={nameB}
              onChange={(e) => setNameB(e.target.value)}
              className="mt-1 w-full text-base font-medium text-[#1C1A17] border-b border-[#E5DFD3] pb-1 focus:border-[#C2410C] outline-none"
              placeholder="Nombre del artículo deseado"
            />
            <div className="mt-4">
              <label className="text-xs text-[#645E56] block mb-1">Valor referencial mercado (PEN S/)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-[#645E56]">S/</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={valB}
                  onChange={(e) => setValB(Number(e.target.value) || 0)}
                  className="w-full pl-8 pr-3 py-1.5 text-lg font-bold text-[#1C1A17] border border-[#E5DFD3] rounded focus:border-[#C2410C] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Veredicto de Valuación */}
        <div className="mt-8 p-5 rounded-lg border bg-white border-[#E5DFD3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            {isDirectEquitable ? (
              <CheckCircle2 className="w-6 h-6 text-[#1E4E38] shrink-0 mt-0.5" />
            ) : (
              <Scale className="w-6 h-6 text-[#C2410C] shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#1C1A17]">
                  {isDirectEquitable 
                    ? 'Recomendación: Trueque Directo 1:1' 
                    : 'Recomendación: Trueque Mixto con Diferencia'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  isDirectEquitable ? 'bg-[#EDF7F2] text-[#1E4E38]' : 'bg-[#FFF7ED] text-[#C2410C]'
                }`}>
                  Brecha: S/ {difference.toLocaleString('es-PE')}
                </span>
              </div>
              <p className="text-xs text-[#645E56] mt-1 max-w-xl">
                {isDirectEquitable
                  ? `La diferencia (${100 - parityPercentage}%) está dentro del margen de equidad aceptable. Ambas partes obtienen valor simétrico sin necesidad de desembolso dinerario.`
                  : valA < valB
                  ? `Para equilibrar el intercambio, el proponente debería ofrecer su artículo más una compensación aproximada de S/ ${difference.toLocaleString('es-PE')}.`
                  : `Tu artículo excede el valor referencial en S/ ${difference.toLocaleString('es-PE')}. Puedes solicitar un artículo complementario o compensación acordada.`}
              </p>
            </div>
          </div>

          <a
            href="#catalogo"
            className="shrink-0 px-4 py-2 text-xs font-semibold rounded-md bg-[#1C1A17] text-white hover:bg-[#C2410C] transition-colors"
          >
            Buscar Coincidencias en Catálogo
          </a>
        </div>
      </div>
    </section>
  );
};
