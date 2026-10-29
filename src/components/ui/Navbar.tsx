import React, { useState } from 'react';
import { ArrowLeftRight, PlusCircle, ShieldCheck, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenPublish: () => void;
  activeTradesCount: number;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenPublish, activeTradesCount, onOpenAuth }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F4]/95 backdrop-blur-md border-b border-[#E5DFD3] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Marca Editorial */}
          <a href="#" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C]">
            <div className="w-10 h-10 rounded-md bg-[#C2410C] text-white flex items-center justify-center font-bold tracking-tight shadow-sm transition-transform group-hover:scale-105">
              <ArrowLeftRight className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif-editorial text-2xl font-semibold tracking-tight text-[#1C1A17] leading-none">
                TRUEKLY
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#645E56] font-medium mt-0.5">
                Trueque Inteligente · Perú
              </span>
            </div>
          </a>

          {/* Enlaces de Navegación (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#645E56]" aria-label="Navegación principal">
            <a 
              href="#catalogo" 
              className="hover:text-[#1C1A17] transition-colors py-1 hover:border-b-2 hover:border-[#C2410C]"
            >
              Catálogo de Trueques
            </a>
            <a 
              href="#calculadora" 
              className="hover:text-[#1C1A17] transition-colors py-1 hover:border-b-2 hover:border-[#C2410C]"
            >
              Valuador Equitativo
            </a>
            <a 
              href="#puntos-seguros" 
              className="hover:text-[#1C1A17] transition-colors py-1 hover:border-b-2 hover:border-[#C2410C]"
            >
              Puntos Seguros
            </a>
            <a 
              href="#protocolo" 
              className="hover:text-[#1C1A17] transition-colors py-1 hover:border-b-2 hover:border-[#C2410C]"
            >
              Protocolo P2P
            </a>
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F5F1E8] border border-[#E5DFD3] text-xs text-[#645E56]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1E4E38]" />
              <span>{activeTradesCount} disponibles</span>
            </div>

            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                type="button"
                className="px-3.5 py-2 rounded-md border border-[#0F6D5F] text-[#0F6D5F] text-sm font-semibold hover:bg-[#0F6D5F]/5 active:scale-[0.98] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F6D5F]"
              >
                Ingresar
              </button>
            )}

            <button
              onClick={onOpenPublish}
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#C2410C] text-white text-sm font-semibold hover:bg-[#9A3412] active:scale-[0.98] transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C2410C] focus-visible:ring-offset-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publicar Trueque</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md border border-[#E5DFD3] text-[#1C1A17] hover:bg-[#F5F1E8]"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5DFD3] bg-[#FAF8F4] px-4 pt-3 pb-5 space-y-2">
          <a
            href="#catalogo"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-[#1C1A17]"
          >
            Catálogo de Trueques
          </a>
          <a
            href="#calculadora"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-[#1C1A17]"
          >
            Valuador Equitativo
          </a>
          <a
            href="#puntos-seguros"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-[#1C1A17]"
          >
            Puntos Seguros
          </a>
          <a
            href="#protocolo"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-[#1C1A17]"
          >
            Protocolo P2P
          </a>
        </div>
      )}
    </header>
  );
};
