import React from 'react';
import { ArrowLeftRight, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-xl bg-[#C2410C] text-white flex items-center justify-center mx-auto mb-6 shadow-md">
          <ArrowLeftRight className="w-8 h-8" />
        </div>
        <span className="font-serif-editorial text-8xl font-bold text-[#E5DFD3] select-none">404</span>
        <h1 className="font-serif-editorial text-2xl font-semibold text-[#1C1A17] mt-2 mb-3">
          Publicación no encontrada
        </h1>
        <p className="text-sm text-[#645E56] leading-relaxed mb-8">
          El artículo que buscas ya fue intercambiado, fue retirado por su dueño, o el enlace cambió.
          Vuelve al catálogo para explorar los trueques disponibles.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#C2410C] text-white text-sm font-semibold hover:bg-[#9A3412] active:scale-[0.98] transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Catálogo
        </a>
      </div>
    </div>
  );
};
