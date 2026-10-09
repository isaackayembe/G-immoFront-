import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ScreenId, TransitionType, Property } from '../types';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { HomeHero, pickHeroProperties } from '../components/HomeHero';
import { StatusBadge, CardSkeleton, roomsLabel } from '../components/StatusBadge';
import { pathFor, propertyPath } from '../routes';
import { QuartiersShowcase, Quartier } from '../components/QuartiersShowcase';
import { Testimonials } from '../components/Testimonials';
import { ALL, BUDGET_OPTIONS, TYPE_OPTIONS, communeOptions, offersSearchPath } from '../offerFilters';
import {
  ArrowRight,
  MapPin,
  Maximize,
  Bed,
  Home,
  Building2,
  Handshake,
  ShieldCheck,
  Search,
  Image as ImageIcon,
} from 'lucide-react';

import penthouseVue960 from '../assets/images/hero/penthouse-vue-960.jpg';
import residenceCourbe960 from '../assets/images/hero/residence-courbe-960.jpg';
import salonSignature960 from '../assets/images/hero/salon-signature-960.jpg';

/** Photo d'ambiance d'un quartier tant qu'aucun bien en ligne n'y a de photo. */
const COMMUNE_FALLBACK_IMAGES = [penthouseVue960, residenceCourbe960, salonSignature960];

interface AccueilScreenProps {
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
  properties: Property[];
  loading?: boolean;
}

const selectClass =
  'w-full bg-transparent outline-none font-sans text-[14px] sm:text-[15px] text-[#0D0D0D] cursor-pointer pr-8';
const labelClass = 'font-sans text-[11px] font-bold uppercase tracking-widest text-[#0D0D0D]';

export const AccueilScreen: React.FC<AccueilScreenProps> = ({ onNavigate, properties, loading = false }) => {
  const navigate = useNavigate();

  // Biens proposés à la vente/location : ni brouillons, ni vendus
  const onSale = useMemo(
    () => properties.filter((p) => p.status !== 'Brouillon' && p.status !== 'Vendu'),
    [properties]
  );

  // Les biens du hero ne sont pas répétés juste en dessous, s'il en reste assez pour remplir la grille
  const { showcase, showingOthers } = useMemo(() => {
    const heroIds = new Set(pickHeroProperties(properties).map((p) => p.id));
    const others = onSale.filter((p) => !heroIds.has(p.id));
    return others.length >= 3 ? { showcase: others, showingOthers: true } : { showcase: onSale, showingOthers: false };
  }, [properties, onSale]);
  const featuredProperty = showcase[0];
  const secondaryProperties = showcase.slice(1, 3);

  // Recherche rapide
  const [searchType, setSearchType] = useState(ALL);
  const [searchCommune, setSearchCommune] = useState(ALL);
  const [searchBudget, setSearchBudget] = useState(ALL);
  const communes = useMemo(() => communeOptions(onSale), [onSale]);
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(offersSearchPath({ type: searchType, commune: searchCommune, budget: searchBudget }), {
      state: { transition: 'push' },
    });
  };

  // Quartiers : tous ceux où l'agence a des biens (+ les principaux), les plus fournis d'abord
  const quartiers = useMemo<Quartier[]>(
    () =>
      communes
        .map((commune, i) => {
          const inCommune = onSale.filter((p) => p.commune?.toLowerCase().includes(commune.toLowerCase()));
          return {
            commune,
            count: inCommune.length,
            image: inCommune.find((p) => p.imageUrl)?.imageUrl || COMMUNE_FALLBACK_IMAGES[i % COMMUNE_FALLBACK_IMAGES.length],
          };
        })
        .sort((a, b) => b.count - a.count),
    [communes, onSale]
  );

  const featuredFacts = featuredProperty ? roomsLabel(featuredProperty) : '';

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] text-[#0D0D0D]">
      <Header currentScreen="accueil" onNavigate={onNavigate} />

      {/* Hero Section */}
      <HomeHero onNavigate={onNavigate} properties={properties} />

      {/* Recherche rapide */}
      <section className="bg-white border-b border-[#8C6D3E]/20">
        <form
          onSubmit={handleSearch}
          className="max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-8 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-[auto_1fr_1fr_1fr_auto] gap-5 lg:gap-8 items-end"
          role="search"
          aria-label="Recherche rapide de biens"
        >
          <div className="sm:col-span-3 lg:col-span-1 lg:pr-8 lg:border-r border-[#8C6D3E]/20 self-center">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-widest text-[#7A5C2E]">Recherche rapide</p>
            <p className="font-serif text-[22px] md:text-[24px] font-bold text-[#0D0D0D] leading-tight">Trouver un bien</p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="rr-type" className={labelClass}>Type de bien</label>
            <div className="border-b border-[#0D0D0D] pb-1 sm:pb-2">
              <select id="rr-type" value={searchType} onChange={(e) => setSearchType(e.target.value)} className={selectClass}>
                <option value={ALL}>Tous les types</option>
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="rr-commune" className={labelClass}>Localisation</label>
            <div className="border-b border-[#0D0D0D] pb-1 sm:pb-2">
              <select id="rr-commune" value={searchCommune} onChange={(e) => setSearchCommune(e.target.value)} className={selectClass}>
                <option value={ALL}>Toutes localisations</option>
                {communes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="rr-budget" className={labelClass}>Budget</label>
            <div className="border-b border-[#0D0D0D] pb-1 sm:pb-2">
              <select id="rr-budget" value={searchBudget} onChange={(e) => setSearchBudget(e.target.value)} className={selectClass}>
                <option value={ALL}>Indifférent</option>
                {BUDGET_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="sm:col-span-3 lg:col-span-1 bg-[#0D0D0D] text-[#F9F7F2] font-sans text-[12px] font-semibold uppercase tracking-widest px-8 py-4 hover:bg-[#8C6D3E] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search size={16} />
            <span>Rechercher</span>
          </button>
        </form>
      </section>

      {/* Dernières Offres Section */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-12 max-w-[1280px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4">
          <div>
            <h2 className="font-serif text-[26px] sm:text-[32px] md:text-[40px] text-[#0D0D0D] mb-2 font-bold">
              {showingOthers ? 'À Découvrir Également' : 'Dernières Offres'}
            </h2>
            <p className="font-sans text-[14px] sm:text-[16px] text-[#747878]">
              Une sélection exclusive de propriétés prestigieuses.
            </p>
          </div>
          <Link
            to={pathFor('offres')}
            state={{ transition: 'push' }}
            className="flex items-center gap-2 font-sans text-[12px] font-semibold uppercase tracking-widest text-[#7A5C2E] hover:text-[#0D0D0D] transition-colors"
          >
            <span>Voir toutes les offres</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Portfolio Staggered Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          {/* Chargement */}
          {loading && !featuredProperty && (
            <>
              <CardSkeleton className="md:col-span-8" imageClass="h-[320px] md:h-[400px]" />
              <div className="md:col-span-4 flex flex-col gap-6">
                <CardSkeleton imageClass="h-[200px]" />
                <CardSkeleton imageClass="h-[200px]" />
              </div>
            </>
          )}

          {/* Featured Property (Spans 8 cols, ou toute la largeur s'il est seul) */}
          {featuredProperty && (
            <Link
              to={propertyPath(featuredProperty.id)}
              state={{ transition: 'slide_up' }}
              className={`col-span-1 ${
                secondaryProperties.length ? 'md:col-span-8' : 'md:col-span-12'
              } group relative overflow-hidden bg-white border border-[#8C6D3E]/20 shadow-sm hover:shadow-md transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 cursor-pointer transform-gpu`}
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
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <StatusBadge status={featuredProperty.status} />
                  {featuredProperty.tag && (
                    <span className="bg-[#0D0D0D] text-[#C5A059] font-sans text-[10px] font-semibold tracking-widest uppercase px-3 py-1 shadow-sm">
                      {featuredProperty.tag}
                    </span>
                  )}
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
                    <h3 className="font-serif text-[24px] md:text-[28px] font-bold text-[#0D0D0D] group-hover:text-[#8C6D3E] transition-colors">
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
                  {featuredProperty.surface > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Maximize size={16} /> {featuredProperty.surface} m²
                    </span>
                  )}
                  {featuredFacts && (
                    <span className="flex items-center gap-1.5">
                      <Bed size={16} /> {featuredFacts}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Home size={16} /> {featuredProperty.type}
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Secondary Properties */}
          {secondaryProperties.length > 0 && (
            <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
              {secondaryProperties.map((prop) => {
                const facts = [prop.surface > 0 ? `${prop.surface} m²` : '', roomsLabel(prop) || prop.type].filter(Boolean);
                return (
                  <Link
                    key={prop.id}
                    to={propertyPath(prop.id)}
                    state={{ transition: 'slide_up' }}
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
                        <StatusBadge status={prop.status} className="absolute top-3 left-3" />
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
                        <h3 className="font-serif text-[20px] font-bold text-[#0D0D0D] mb-1 group-hover:text-[#8C6D3E] transition-colors">
                          {prop.title}
                        </h3>
                        <p className="font-sans text-[14px] text-[#747878] mb-3">{prop.location}</p>
                      </div>
                      <div>
                        <div className="font-serif text-[20px] text-[#0D0D0D] font-bold mb-2">
                          {prop.price}
                        </div>
                        {facts.length > 0 && (
                          <div className="flex gap-3 font-sans text-[#747878] text-[13px] border-t border-[#f0eee9] pt-2">
                            {facts.map((f, i) => (
                              <React.Fragment key={f}>
                                {i > 0 && <span aria-hidden="true">•</span>}
                                <span>{f}</span>
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* CTA Block: Recherche Sur-Mesure */}
          <div className="col-span-1 md:col-span-12 flex flex-col md:flex-row justify-between items-start md:items-center p-8 md:p-12 bg-white border border-[#8C6D3E]/20 shadow-sm mt-4 gap-6">
            <div className="max-w-2xl">
              <div className="w-12 h-12 bg-[#C5A059]/15 rounded-full flex items-center justify-center mb-4 text-[#8C6D3E]">
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

      {/* Nos Quartiers */}
      <QuartiersShowcase quartiers={quartiers} />

      {/* Services Overview */}
      <section className="py-20 md:py-28 bg-[#f0eee9] border-y border-[#8C6D3E]/20">
        <div className="px-6 md:px-12 max-w-[1280px] mx-auto text-center">
          <h2 className="font-serif text-[32px] md:text-[40px] text-[#0D0D0D] mb-16 font-bold">
            Notre Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-[#C5A059]/20 flex items-center justify-center mb-6 text-[#8C6D3E]">
                <Home size={32} />
              </div>
              <h3 className="font-serif text-[22px] text-[#0D0D0D] mb-3 font-bold">
                Transaction Résidentielle
              </h3>
              <p className="font-sans text-[15px] text-[#6B6F6F] leading-relaxed max-w-xs">
                Vente et acquisition de biens immobiliers de prestige avec un accompagnement sur-mesure à chaque étape.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-[#C5A059]/20 flex items-center justify-center mb-6 text-[#8C6D3E]">
                <Building2 size={32} />
              </div>
              <h3 className="font-serif text-[22px] text-[#0D0D0D] mb-3 font-bold">
                Immobilier d'Entreprise
              </h3>
              <p className="font-sans text-[15px] text-[#6B6F6F] leading-relaxed max-w-xs">
                Solutions stratégiques pour les investisseurs institutionnels et l'implantation de sièges sociaux.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-[#C5A059]/20 flex items-center justify-center mb-6 text-[#8C6D3E]">
                <Handshake size={32} />
              </div>
              <h3 className="font-serif text-[22px] text-[#0D0D0D] mb-3 font-bold">
                Gestion de Patrimoine
              </h3>
              <p className="font-sans text-[15px] text-[#6B6F6F] leading-relaxed max-w-xs">
                Conseil en investissement et optimisation fiscale pour valoriser votre portefeuille immobilier.
              </p>
            </div>
          </div>
          <Link
            to={pathFor('services')}
            state={{ transition: 'push' }}
            className="inline-flex items-center gap-2 mt-14 font-sans text-[12px] font-semibold uppercase tracking-widest text-[#0D0D0D] border-b border-[#0D0D0D] pb-1 hover:text-[#7A5C2E] hover:border-[#7A5C2E] transition-colors"
          >
            <span>Découvrir nos services</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Témoignages clients */}
      <Testimonials />

      <Footer />
    </div>
  );
};
