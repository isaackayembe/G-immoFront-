import React from 'react';
import { ScreenId, TransitionType } from '../types';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ArrowRight, Home, Key, Building2, TrendingUp } from 'lucide-react';

interface ServicesScreenProps {
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
}

export const ServicesScreen: React.FC<ServicesScreenProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] text-[#0D0D0D]">
      <Header currentScreen="services" onNavigate={onNavigate} />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-6 md:px-12 py-12 md:py-24">
        {/* Hero Section */}
        <section className="mb-20 md:mb-28 text-center max-w-3xl mx-auto">
          <h1 className="font-serif text-[36px] md:text-[60px] leading-[1.15] text-[#0D0D0D] mb-6 font-bold">
            L'Excellence Immobilière
          </h1>
          <p className="font-sans text-[18px] text-[#747878] leading-relaxed">
            Notre expertise à votre service pour concrétiser vos projets immobiliers les plus ambitieux.
            Découvrez nos pôles d'excellence dédiés à l'achat, la vente, la location et l'investissement.
          </p>
        </section>

        {/* Services Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Vente */}
          <div className="bg-white border border-[#8C6D3E]/20 shadow-sm p-8 md:p-12 flex flex-col items-start relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-6 p-4 bg-[#C5A059]/15 rounded-full text-[#C5A059]">
              <Home size={32} />
            </div>
            <h3 className="font-serif text-[28px] text-[#0D0D0D] mb-4 font-bold">Vente</h3>
            <p className="font-sans text-[16px] text-[#747878] mb-8 flex-grow leading-relaxed">
              Valorisation optimale de votre patrimoine. Nous assurons une mise en marché discrète et ciblée pour atteindre une clientèle qualifiée.
            </p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('offres', 'none');
              }}
              className="inline-flex items-center gap-2 font-sans text-xs font-bold tracking-widest uppercase text-[#0D0D0D] group-hover:text-[#C5A059] transition-colors"
            >
              <span>DÉCOUVRIR</span>
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Achat */}
          <div className="bg-white border border-[#8C6D3E]/20 shadow-sm p-8 md:p-12 flex flex-col items-start relative overflow-hidden group md:mt-8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-6 p-4 bg-[#C5A059]/15 rounded-full text-[#C5A059]">
              <Key size={32} />
            </div>
            <h3 className="font-serif text-[28px] text-[#0D0D0D] mb-4 font-bold">Achat</h3>
            <p className="font-sans text-[16px] text-[#747878] mb-8 flex-grow leading-relaxed">
              Un accompagnement sur-mesure pour trouver la propriété d'exception correspondant parfaitement à vos exigences et votre style de vie.
            </p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('offres', 'none');
              }}
              className="inline-flex items-center gap-2 font-sans text-xs font-bold tracking-widest uppercase text-[#0D0D0D] group-hover:text-[#C5A059] transition-colors"
            >
              <span>DÉCOUVRIR</span>
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Location */}
          <div className="bg-white border border-[#8C6D3E]/20 shadow-sm p-8 md:p-12 flex flex-col items-start relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-6 p-4 bg-[#C5A059]/15 rounded-full text-[#C5A059]">
              <Building2 size={32} />
            </div>
            <h3 className="font-serif text-[28px] text-[#0D0D0D] mb-4 font-bold">Location</h3>
            <p className="font-sans text-[16px] text-[#747878] mb-8 flex-grow leading-relaxed">
              Gestion locative haut de gamme. Nous sélectionnons des biens de prestige et des locataires fiables pour une sérénité absolue.
            </p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('offres', 'none');
              }}
              className="inline-flex items-center gap-2 font-sans text-xs font-bold tracking-widest uppercase text-[#0D0D0D] group-hover:text-[#C5A059] transition-colors"
            >
              <span>DÉCOUVRIR</span>
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Investissement */}
          <div className="bg-white border border-[#8C6D3E]/20 shadow-sm p-8 md:p-12 flex flex-col items-start relative overflow-hidden group md:mt-8 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-6 p-4 bg-[#C5A059]/15 rounded-full text-[#C5A059]">
              <TrendingUp size={32} />
            </div>
            <h3 className="font-serif text-[28px] text-[#0D0D0D] mb-4 font-bold">Investissement</h3>
            <p className="font-sans text-[16px] text-[#747878] mb-8 flex-grow leading-relaxed">
              Conseil stratégique pour bâtir ou optimiser votre portefeuille immobilier. Des opportunités sélectionnées pour leur rendement et leur potentiel de valorisation.
            </p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('offres', 'none');
              }}
              className="inline-flex items-center gap-2 font-sans text-xs font-bold tracking-widest uppercase text-[#0D0D0D] group-hover:text-[#C5A059] transition-colors"
            >
              <span>DÉCOUVRIR</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-20 md:mt-28 text-center">
          <button
            onClick={() => onNavigate('contact', 'push')}
            className="px-10 py-5 bg-[#0D0D0D] text-[#F9F7F2] font-sans font-semibold text-xs tracking-widest uppercase hover:bg-[#8C6D3E] transition-colors cursor-pointer"
          >
            PRENDRE RENDEZ-VOUS
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
};
