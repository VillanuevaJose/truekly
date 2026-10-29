import React from 'react';
import { ArrowLeftRight, Shield, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1C1A17] text-[#EDE8DF] border-t border-[#38342F] pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#38342F]">
          
          {/* Columna Marca & Propósito */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-[#C2410C] flex items-center justify-center text-white">
                <ArrowLeftRight className="w-4 h-4" />
              </div>
              <span className="font-serif-editorial text-2xl font-semibold tracking-tight text-white">
                TRUEKLY
              </span>
            </div>
            <p className="text-xs text-[#A8A29E] leading-relaxed max-w-sm">
              Plataforma P2P peruana de economía colaborativa y circular. Fomentamos el intercambio justo, sostenible e inteligente de bienes de valor, eliminando la especulación.
            </p>
            <div className="text-[11px] text-[#78716C]">
              Diseñado con arquitectura de alto rendimiento · Hecho en Lima, Perú.
            </div>
          </div>

          {/* Columna Enlaces */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Explorar Plataforma
            </h4>
            <ul className="space-y-2 text-xs text-[#A8A29E]">
              <li><a href="#catalogo" className="hover:text-white transition-colors">Catálogo Activo</a></li>
              <li><a href="#calculadora" className="hover:text-white transition-colors">Valuador Equitativo</a></li>
              <li><a href="#puntos-seguros" className="hover:text-white transition-colors">Puntos de Encuentro Seguros</a></li>
              <li><a href="#protocolo" className="hover:text-white transition-colors">Guía de Seguridad P2P</a></li>
            </ul>
          </div>

          {/* Columna Legal y Protección */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Marco Legal & Transparencia
            </h4>
            <p className="text-xs text-[#A8A29E] leading-relaxed">
              Cumplimiento estricto con la <strong className="text-white font-medium">Ley N° 29733</strong> (Protección de Datos Personales del Perú). Cero venta de información a terceros.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a 
                href="#reclamaciones" 
                onClick={(e) => { e.preventDefault(); alert('Libro de Reclamaciones Virtual Truekly disponible según normativa INDECOPI.'); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#57534E] text-[11px] font-medium text-[#D6D3D1] hover:bg-[#292524] transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#C2410C]" />
                <span>Libro de Reclamaciones</span>
              </a>
              <span className="text-[11px] text-[#78716C] flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-[#1E4E38]" /> P2P Verificado
              </span>
            </div>
          </div>

        </div>

        {/* Cierre inferior */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716C] gap-4">
          <div>
            © 2026 Truekly Perú. Todos los derechos reservados.
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#A8A29E]">Términos de Intercambio</a>
            <a href="#" className="hover:text-[#A8A29E]">Política de Privacidad</a>
            <a href="#" className="hover:text-[#A8A29E]">Economía Circular</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
