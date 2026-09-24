import React from 'react';
import { ScreenId, TransitionType } from '../types';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface NotFoundScreenProps {
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
}

export const NotFoundScreen: React.FC<NotFoundScreenProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] text-[#0D0D0D]">
      <Header currentScreen="accueil" onNavigate={onNavigate} />

      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 py-24">
        <span className="font-serif text-[72px] md:text-[96px] text-[#C5A059] font-bold leading-none mb-4">404</span>
        <h1 className="font-serif text-[28px] md:text-[36px] font-bold mb-3">Page introuvable</h1>
        <p className="font-sans text-[15px] text-[#747878] max-w-md mb-8">
          L'adresse demandée n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onNavigate('accueil', 'push_back')}
            className="bg-[#0D0D0D] text-[#F9F7F2] font-sans text-[12px] font-semibold uppercase tracking-widest px-8 py-4 hover:bg-[#8C6D3E] transition-colors cursor-pointer"
          >
            Retour à l'accueil
          </button>
          <button
            onClick={() => onNavigate('offres', 'push')}
            className="border border-[#0D0D0D] text-[#0D0D0D] font-sans text-[12px] font-semibold uppercase tracking-widest px-8 py-4 hover:bg-white transition-colors cursor-pointer"
          >
            Voir nos offres
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};
