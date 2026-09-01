import React from 'react';
import { LOGO_URL } from '../data';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0D0D0D] text-[#F9F7F2] px-6 md:px-12 py-12 border-t border-[#8C6D3E]/20 mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto gap-8">
        <div className="flex items-center gap-4 text-center md:text-left">
          <img
            src={LOGO_URL}
            alt="G Business Immo Logo"
            className="h-12 w-12 rounded-full object-cover border border-[#C5A059]/40"
          />
          <div>
            <span className="font-serif text-[20px] font-bold tracking-tight text-[#F9F7F2] block">
              G BUSINESS IMMO
            </span>
            <span className="font-sans text-[11px] text-[#F9F7F2]/60 uppercase tracking-widest block mt-0.5">
              © 2024 G Business Immo — Tous droits réservés.
            </span>
          </div>
        </div>
        <nav className="flex flex-wrap justify-center gap-6 md:gap-8 font-sans text-[11px] font-semibold uppercase tracking-widest">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-[#F9F7F2]/70 hover:text-[#C5A059] transition-colors"
          >
            Mentions Légales
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-[#F9F7F2]/70 hover:text-[#C5A059] transition-colors"
          >
            Confidentialité
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-[#F9F7F2]/70 hover:text-[#C5A059] transition-colors"
          >
            Carrières
          </a>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-[#F9F7F2]/70 hover:text-[#C5A059] transition-colors"
          >
            Investisseurs
          </a>
        </nav>
      </div>
    </footer>
  );
};
