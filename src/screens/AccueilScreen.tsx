import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenId, TransitionType, Property } from '../types';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { pathFor, propertyPath } from '../routes';
import {
  ArrowRight,
  MapPin,
  Maximize,
  Bed,
  Home,
  Building2,
  Handshake,
  ShieldCheck,
  Image as ImageIcon,
} from 'lucide-react';

interface AccueilScreenProps {
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
  properties: Property[];
}

export const AccueilScreen: React.FC<AccueilScreenProps> = ({ onNavigate, properties }) => {
  const navigate = useNavigate();
  const openProperty = (prop: Property) => navigate(propertyPath(prop.id), { state: { transition: 'slide_up' } });
  const publicProperties = properties.filter((p) => p.status !== 'Brouillon');
  const featuredProperty = publicProperties[0] || properties[0];
  const secondaryProperties = publicProperties.slice(1, 3);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] text-[#0D0D0D]">
      <Header currentScreen="accueil" onNavigate={onNavigate} />

      {/* Hero Section */}
      <section className="relative min-h-[520px] md:min-h-[580px] lg:h-[80vh] flex items-center justify-center overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 z-0">
          <div
            className="bg-cover bg-center w-full h-full transform scale-105 transition-transform duration-1000"
            style={{
              backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCnUQi8GVMVk20B43bGBIio3mvZGxfDI7fnCzli1xxZ5mlQ_Ojx5rTSyfT8Cka-xJbKTNyZ4hZ86zXP1X0qpMeoAKNeQ3V3Xmuw0pdAyIjy4ZWuZCsxogLTdhIM1khmUmfrZkuJyhcOD3wOd8FQeKZ-rJeNBbC0qWG-h4LJnjCAtNgaHXRBYxMn7zK6bijiPHGDup80ilZCVMtEhquIV8apWo7CJT1743ztCZdgwPGWSl40I-AgvbhW2Im4xGkHKqZJbgdHe3HIr1N8rg")`,
            }}
          />
          <div className="absolute inset-0 bg-[#0D0D0D]/80" />
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 md:px-12 max-w-[1280px] mx-auto flex flex-col items-center">
          <h1 className="font-serif text-[28px] sm:text-[38px] md:text-[56px] lg:text-[68px] leading-[1.15] text-[#F9F7F2] mb-4 sm:mb-6 max-w-4xl tracking-tight">
            Expertise et Engagement pour votre projet immobilier
          </h1>
          <p className="font-sans text-[14px] sm:text-[16px] md:text-[18px] text-[#F9F7F2]/80 max-w-2xl mb-8 sm:mb-10 leading-relaxed font-light">
            L'excellence au service de vos ambitions. Des biens d'exception sélectionnés avec la plus grande discrétion.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('offres', 'push')}
              className="bg-[#C5A059] text-[#0D0D0D] font-sans text-[12px] font-semibold tracking-widest uppercase px-6 sm:px-8 py-3.5 sm:py-4 hover:bg-[#8C6D3E] hover:text-[#F9F7F2] transition-colors shadow-sm cursor-pointer w-full sm:w-auto"
            >
              DÉCOUVRIR NOS OFFRES
            </button>
            <button
              onClick={() => onNavigate('contact', 'push')}
              className="border border-[#F9F7F2]/40 text-[#F9F7F2] font-sans text-[12px] font-semibold tracking-widest uppercase px-6 sm:px-8 py-3.5 sm:py-4 hover:bg-white/10 transition-colors cursor-pointer w-full sm:w-auto"
            >
              ESTIMER MON BIEN
            </button>
          </div>
        </div>
      </section>

      {/* Dernières Offres Section */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-12 max-w-[1280px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4">
          <div>
            <h2 className="font-serif text-[26px] sm:text-[32px] md:text-[40px] text-[#0D0D0D] mb-2 font-bold">
              Dernières Offres
            </h2>
            <p className="font-sans text-[14px] sm:text-[16px] text-[#747878]">
              Une sélection exclusive de propriétés prestigieuses.
            </p>
          </div>
          <a
            href={pathFor('offres')}
            onClick={(e) => {
              e.preventDefault();
              onNavigate('offres', 'push');
            }}
            className="flex items-center gap-2 font-sans text-[11px] sm:text-[12px] font-semibold uppercase tracking-widest text-[#C5A059] hover:text-[#8C6D3E] transition-colors"
          >
            <span>VOIR TOUTES LES OFFRES</span>
            <ArrowRight size={16} />
          </a>
        </div>

        {/* Portfolio Staggered Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {/* Featured Property (Spans 8 cols) */}
          {featuredProperty && (
            <div
              onClick={() => openProperty(featuredProperty)}
              className="col-span-1 md:col-span-8 group relative overflow-hidden bg-white border border-[#8C6D3E]/20 shadow-sm hover:shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 cursor-pointer transform-gpu"
            >
              <div className="relative h-[320px] md:h-[400px] w-full overflow-hidden bg-[#f0eee9]">
                <img
                  src={featuredProperty.imageUrl}
                  alt={featuredProperty.title}
                  width={800}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out transform-gpu"
                />
                <div className="absolute top-4 left-4 bg-[#C5A059] text-[#0D0D0D] font-sans text-[10px] font-semibold tracking-widest uppercase px-3 py-1 shadow-sm">
                  {featuredProperty.tag || 'EXCLUSIVITÉ'}
                </div>

                {/* Multi-photo badge */}
                {(featuredProperty.images?.length ?? 1) > 1 && (
                  <div className="absolute bottom-4 right-4 bg-[#0D0D0D]/90 border border-[#8C6D3E]/40 px-3 py-1.5 text-[#F9F7F2] font-sans text-[11px] font-semibold flex items-center gap-1.5 shadow-sm">
                    <ImageIcon size={13} className="text-[#C5A059]" />
                    <span>{featuredProperty.images?.length} Photos</span>
                  </div>
                )}
              </div>
              <div className="p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                  <div>
                    <h3 className="font-serif text-[24px] md:text-[28px] font-bold text-[#0D0D0D] group-hover:text-[#C5A059] transition-colors">
                      {featuredProperty.title}
                    </h3>
                    <p className="font-sans text-[15px] text-[#747878] flex items-center gap-1.5 mt-1">
                      <MapPin size={16} className="text-[#C5A059]" />
                      <span>{featuredProperty.location}</span>
                    </p>
                  </div>
                  <span className="font-serif text-[24px] md:text-[28px] text-[#0D0D0D] font-bold">
                    {featuredProperty.price}
                  </span>
                </div>
                <div className="flex flex-wrap gap-6 font-sans text-[#747878] text-[14px] border-t border-[#f0eee9] pt-4">
                  <span className="flex items-center gap-1.5">
                    <Maximize size={16} /> {featuredProperty.surface} m²
                  </span>
                  {featuredProperty.bedrooms && (
                    <span className="flex items-center gap-1.5">
                      <Bed size={16} /> {featuredProperty.bedrooms} Chambres
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Home size={16} /> Terrasse
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Secondary Properties */}
          <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
            {secondaryProperties.map((prop) => (
              <div
                key={prop.id}
                onClick={() => openProperty(prop)}
                className="group relative overflow-hidden bg-white border border-[#8C6D3E]/20 shadow-sm hover:shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col h-full transform-gpu"
              >
                <div className="relative h-[200px] w-full overflow-hidden bg-[#f0eee9]">
                  <img
                    src={prop.imageUrl}
                    alt={prop.title}
                    width={400}
                    height={200}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out transform-gpu"
                  />
                  {prop.status !== 'Disponible' && (
                    <div className="absolute top-3 left-3 bg-[#0D0D0D] text-[#F9F7F2] font-sans text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1">
                      {prop.status}
                    </div>
                  )}

                  {(prop.images?.length ?? 1) > 1 && (
                    <div className="absolute bottom-3 right-3 bg-[#0D0D0D]/90 border border-[#8C6D3E]/40 px-2 py-0.5 text-[#F9F7F2] font-sans text-[10px] font-semibold flex items-center gap-1 shadow-sm">
                      <ImageIcon size={11} className="text-[#C5A059]" />
                      <span>{prop.images?.length} Photos</span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-[20px] font-bold text-[#0D0D0D] mb-1 group-hover:text-[#C5A059] transition-colors">
                      {prop.title}
                    </h3>
                    <p className="font-sans text-[14px] text-[#747878] mb-3">{prop.location}</p>
                  </div>
                  <div>
                    <div className="font-serif text-[20px] text-[#0D0D0D] font-bold mb-2">
                      {prop.price}
                    </div>
                    <div className="flex gap-3 font-sans text-[#747878] text-[13px] border-t border-[#f0eee9] pt-2">
                      <span>{prop.surface} m²</span>
                      <span>•</span>
                      <span>{prop.bedrooms ? `${prop.bedrooms} Chambres` : `${prop.rooms || 4} Pièces`}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Block: Recherche Sur-Mesure */}
          <div className="col-span-1 md:col-span-12 flex flex-col md:flex-row justify-between items-start md:items-center p-8 md:p-12 bg-white border border-[#8C6D3E]/20 shadow-sm mt-4 gap-6">
            <div className="max-w-2xl">
              <div className="w-12 h-12 bg-[#C5A059]/15 rounded-full flex items-center justify-center mb-4 text-[#C5A059]">
                <ShieldCheck size={28} />
              </div>
              <h3 className="font-serif text-[28px] md:text-[32px] text-[#0D0D0D] mb-3 font-bold">
                Recherche Sur-Mesure
              </h3>
              <p className="font-sans text-[16px] text-[#747878] leading-relaxed">
                Vous ne trouvez pas le bien idéal parmi nos offres publiques ? Notre service de chasse immobilière accède au marché "off-market" pour dénicher la perle rare, en toute confidentialité.
              </p>
            </div>
            <button
              onClick={() => onNavigate('contact', 'push')}
              className="bg-[#0D0D0D] text-[#F9F7F2] font-sans text-[12px] font-semibold uppercase tracking-widest px-8 py-4 hover:bg-[#8C6D3E] transition-colors shrink-0 cursor-pointer"
            >
              CONFIER UN MANDAT DE RECHERCHE
            </button>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 md:py-28 bg-[#f0eee9] border-y border-[#8C6D3E]/20">
        <div className="px-6 md:px-12 max-w-[1280px] mx-auto text-center">
          <h2 className="font-serif text-[32px] md:text-[40px] text-[#0D0D0D] mb-16 font-bold">
            Notre Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-[#C5A059]/20 flex items-center justify-center mb-6 text-[#C5A059]">
                <Home size={32} />
              </div>
              <h3 className="font-serif text-[22px] text-[#0D0D0D] mb-3 font-bold">
                Transaction Résidentielle
              </h3>
              <p className="font-sans text-[15px] text-[#747878] leading-relaxed max-w-xs">
                Vente et acquisition de biens immobiliers de prestige avec un accompagnement sur-mesure à chaque étape.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-[#C5A059]/20 flex items-center justify-center mb-6 text-[#C5A059]">
                <Building2 size={32} />
              </div>
              <h3 className="font-serif text-[22px] text-[#0D0D0D] mb-3 font-bold">
                Immobilier d'Entreprise
              </h3>
              <p className="font-sans text-[15px] text-[#747878] leading-relaxed max-w-xs">
                Solutions stratégiques pour les investisseurs institutionnels et l'implantation de sièges sociaux.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-[#C5A059]/20 flex items-center justify-center mb-6 text-[#C5A059]">
                <Handshake size={32} />
              </div>
              <h3 className="font-serif text-[22px] text-[#0D0D0D] mb-3 font-bold">
                Gestion de Patrimoine
              </h3>
              <p className="font-sans text-[15px] text-[#747878] leading-relaxed max-w-xs">
                Conseil en investissement et optimisation fiscale pour valoriser votre portefeuille immobilier.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
