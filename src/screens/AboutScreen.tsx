import React from 'react';
import { ScreenId, TransitionType } from '../types';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LOGO_URL } from '../data';
import { Award, Shield, Users, Compass, CheckCircle2 } from 'lucide-react';

interface AboutScreenProps {
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] text-[#0D0D0D]">
      <Header currentScreen="about" onNavigate={onNavigate} />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-6 md:px-12 py-12 md:py-24">
        {/* Header Hero */}
        <section className="mb-16 md:mb-24 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center mb-6">
            <img
              src={LOGO_URL}
              alt="G Business Immo Logo"
              className="w-20 h-20 rounded-full object-cover border-2 border-[#C5A059] shadow-md"
            />
          </div>
          <h1 className="font-serif text-[36px] md:text-[56px] text-[#0D0D0D] mb-6 font-bold leading-tight">
            À Propos de G Business Immo
          </h1>
          <p className="font-sans text-[18px] text-[#747878] leading-relaxed">
            Une maison d'excellence fondée sur des valeurs de confidentialité, d'intégrité et de haute précision pour concrétiser les investissements immobiliers les plus exigeants.
          </p>
        </section>

        {/* Story & Philosophy */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20 md:mb-28">
          <div className="space-y-6">
            <span className="font-sans text-xs font-bold tracking-widest text-[#C5A059] uppercase block">
              Notre Philosophie
            </span>
            <h2 className="font-serif text-[30px] md:text-[38px] text-[#0D0D0D] font-bold leading-snug">
              Un savoir-faire sur-mesure au service d'une clientèle d'exception
            </h2>
            <p className="font-sans text-[16px] text-[#747878] leading-relaxed">
              Chez G Business Immo, nous concevons l'immobilier comme une relation de confiance pérenne. Forts d'un ancrage local profond et d'un réseau international établi, nous guidons nos clients à travers chaque étape de l'acquisition, de la valorisation et de la gestion de biens de prestige.
            </p>
            <p className="font-sans text-[16px] text-[#747878] leading-relaxed">
              Chaque propriété confiée à notre agence bénéficie d'une attention sur-mesure, associant stratégie de commercialisation ciblée et discrétion absolue.
            </p>
            <div className="pt-4 flex flex-col gap-3">
              <div className="flex items-center gap-3 font-sans text-[15px] text-[#0D0D0D] font-medium">
                <CheckCircle2 size={18} className="text-[#C5A059]" />
                <span>Accès exclusif au marché "Off-Market"</span>
              </div>
              <div className="flex items-center gap-3 font-sans text-[15px] text-[#0D0D0D] font-medium">
                <CheckCircle2 size={18} className="text-[#C5A059]" />
                <span>Accompagnement juridique, fiscal et financier</span>
              </div>
              <div className="flex items-center gap-3 font-sans text-[15px] text-[#0D0D0D] font-medium">
                <CheckCircle2 size={18} className="text-[#C5A059]" />
                <span>Gestion privée de patrimoine immobilier</span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden shadow-md border border-[#8C6D3E]/20 h-[420px]">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
              alt="Intérieur d'exception G Business Immo"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/90 via-transparent to-transparent flex items-end p-8">
              <p className="font-serif text-[#F9F7F2] text-[20px] italic">
                "L'excellence est le résultat d'une attention portée aux plus petits détails."
              </p>
            </div>
          </div>
        </section>

        {/* Pillars / Values */}
        <section className="bg-[#f0eee9] border border-[#8C6D3E]/20 p-8 md:p-16 mb-20">
          <h2 className="font-serif text-[32px] text-[#0D0D0D] text-center mb-12 font-bold">
            Nos Piliers Fondateurs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 border border-[#8C6D3E]/20 shadow-sm flex flex-col items-start">
              <div className="p-3 bg-[#C5A059]/15 text-[#C5A059] rounded-full mb-4">
                <Shield size={24} />
              </div>
              <h3 className="font-serif text-[20px] font-bold text-[#0D0D0D] mb-2">Discrétion</h3>
              <p className="font-sans text-[14px] text-[#747878] leading-relaxed">
                Traitement confidentiel garanti pour l'ensemble des transactions privées et institutionnelles.
              </p>
            </div>

            <div className="bg-white p-6 border border-[#8C6D3E]/20 shadow-sm flex flex-col items-start">
              <div className="p-3 bg-[#C5A059]/15 text-[#C5A059] rounded-full mb-4">
                <Award size={24} />
              </div>
              <h3 className="font-serif text-[20px] font-bold text-[#0D0D0D] mb-2">Excellence</h3>
              <p className="font-sans text-[14px] text-[#747878] leading-relaxed">
                Sélection stricte des emplacements les plus prisés et exigences architecturales maximales.
              </p>
            </div>

            <div className="bg-white p-6 border border-[#8C6D3E]/20 shadow-sm flex flex-col items-start">
              <div className="p-3 bg-[#C5A059]/15 text-[#C5A059] rounded-full mb-4">
                <Users size={24} />
              </div>
              <h3 className="font-serif text-[20px] font-bold text-[#0D0D0D] mb-2">Engagement</h3>
              <p className="font-sans text-[14px] text-[#747878] leading-relaxed">
                Relation partenariale personnalisée et présence dédiée jusqu'à la conclusion de l'opération.
              </p>
            </div>

            <div className="bg-white p-6 border border-[#8C6D3E]/20 shadow-sm flex flex-col items-start">
              <div className="p-3 bg-[#C5A059]/15 text-[#C5A059] rounded-full mb-4">
                <Compass size={24} />
              </div>
              <h3 className="font-serif text-[20px] font-bold text-[#0D0D0D] mb-2">Vision</h3>
              <p className="font-sans text-[14px] text-[#747878] leading-relaxed">
                Analyse prospective du marché immobilier pour maximiser la rentabilité patrimoniale.
              </p>
            </div>
          </div>
        </section>

        {/* Action Banner */}
        <section className="text-center py-8">
          <h3 className="font-serif text-[28px] text-[#0D0D0D] mb-4 font-bold">Un projet d'investissement en vue ?</h3>
          <p className="font-sans text-[16px] text-[#747878] mb-8 max-w-xl mx-auto">
            Rencontrez nos consultants spécialistes pour discuter confidentiellement de vos attentes.
          </p>
          <button
            onClick={() => onNavigate('contact', 'push')}
            className="bg-[#0D0D0D] text-[#F9F7F2] font-sans font-semibold text-xs tracking-widest uppercase px-8 py-4 hover:bg-[#8C6D3E] transition-colors cursor-pointer"
          >
            NOUS CONTACTER
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
};
