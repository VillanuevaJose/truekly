import React from 'react';
import { ShieldCheck, Building2 } from 'lucide-react';
import { SAFE_MEETING_POINTS } from '../../data/items';

export const SafePointsSection: React.FC = () => {
  return (
    <section id="puntos-seguros" className="py-16 sm:py-20 border-t border-[#E5DFD3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C2410C]">
            [03 · Seguridad Comunitaria]
          </span>
          <div className="h-[1px] w-12 bg-[#C2410C]/40"></div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="font-serif-editorial text-3xl sm:text-4xl font-medium text-[#1C1A17] tracking-tight">
              Puntos de Intercambio P2P Seguros
            </h2>
            <p className="text-sm text-[#645E56] mt-2 leading-relaxed">
              En Truekly, el trueque se concreta en espacios públicos certificados con alta afluencia, vigilancia permanente y conectividad en Lima y regiones.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#EDF7F2] border border-[#1E4E38]/20 text-xs text-[#1E4E38] font-medium shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>Protocolo anti-fraude activo</span>
          </div>
        </div>

        {/* Grilla de Puntos Certificados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SAFE_MEETING_POINTS.map((point, index) => (
            <div key={index} className="card-craft rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded bg-[#F5F1E8] text-[#C2410C] flex items-center justify-center mb-3">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C2410C]">
                  {point.city} · {point.district}
                </span>
                <h3 className="text-base font-semibold text-[#1C1A17] mt-1 mb-2 leading-snug">
                  {point.name}
                </h3>
                <p className="text-xs text-[#645E56] leading-relaxed mb-4">
                  {point.security}
                </p>
              </div>

              <div className="pt-3 border-t border-[#EFEBE1] flex items-center justify-between text-xs">
                <span className="text-[#1E4E38] font-medium inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {point.rating}
                </span>
                <span className="text-[11px] text-[#645E56]">Punto oficial</span>
              </div>
            </div>
          ))}
        </div>

        {/* Protocolo de Seguridad en 3 pasos */}
        <div id="protocolo" className="mt-12 bg-[#FAF8F4] border border-[#E5DFD3] rounded-lg p-6 sm:p-8">
          <h3 className="font-serif-editorial text-2xl font-semibold text-[#1C1A17] mb-6">
            Protocolo de Trueque Seguro Truekly
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-3">
              <span className="font-serif-editorial text-2xl font-bold text-[#C2410C]">1.</span>
              <div>
                <h4 className="text-sm font-bold text-[#1C1A17]">Inspección Presencial</h4>
                <p className="text-xs text-[#645E56] mt-1 leading-relaxed">
                  Revisen en conjunto el estado físico, número de serie y funcionamiento de ambos artículos con luz natural.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="font-serif-editorial text-2xl font-bold text-[#C2410C]">2.</span>
              <div>
                <h4 className="text-sm font-bold text-[#1C1A17]">Confirmación en Plataforma</h4>
                <p className="text-xs text-[#645E56] mt-1 leading-relaxed">
                  Ambas partes confirman la recepción satisfactoria en la aplicación para liberar la reputación y registrar el trueque.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="font-serif-editorial text-2xl font-bold text-[#C2410C]">3.</span>
              <div>
                <h4 className="text-sm font-bold text-[#1C1A17]">Reputación Inmutable</h4>
                <p className="text-xs text-[#645E56] mt-1 leading-relaxed">
                  Cada intercambio alimenta el historial P2P verificado, protegiendo a la comunidad contra especuladores.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
