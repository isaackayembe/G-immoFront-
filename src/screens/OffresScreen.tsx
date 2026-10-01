import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ScreenId, TransitionType, Property } from '../types';
import { propertyPath } from '../routes';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { StatusBadge, CardSkeleton } from '../components/StatusBadge';
import {
  ALL,
  BUDGET_OPTIONS,
  OfferFilters,
  TYPE_OPTIONS,
  communeOptions,
  filtersFromParams,
  filtersToParams,
  matchesFilters,
} from '../offerFilters';
import { Filter, MapPin, Maximize, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface OffresScreenProps {
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
  properties: Property[];
  loading?: boolean;
}

export const OffresScreen: React.FC<OffresScreenProps> = ({ onNavigate, properties, loading = false }) => {
  // Les filtres vivent dans l'URL (?type=…&commune=…&budget=…) : la recherche de l'accueil arrive déjà filtrée
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromParams(searchParams);
  const { type: selectedType, commune: selectedLocation, budget: selectedBudget } = filters;
  const setFilter = (key: keyof OfferFilters, value: string) =>
    setSearchParams(filtersToParams({ ...filters, [key]: value }), { replace: true });
  const resetFilters = () => setSearchParams(new URLSearchParams(), { replace: true });

  const publicProperties = useMemo(() => properties.filter((prop) => prop.status !== 'Brouillon'), [properties]);
  const communes = useMemo(() => communeOptions(publicProperties), [publicProperties]);

  // Filter properties (excluding drafts)
  const filteredProperties = useMemo(
    () =>
      publicProperties.filter((prop) =>
        matchesFilters(prop, { type: selectedType, commune: selectedLocation, budget: selectedBudget })
      ),
    [publicProperties, selectedType, selectedLocation, selectedBudget]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] text-[#0D0D0D]">
      <Header currentScreen="offres" onNavigate={onNavigate} />

      <main className="flex-grow flex flex-col w-full px-4 sm:px-6 md:px-12 max-w-[1280px] mx-auto py-8 sm:py-12 md:py-20 gap-y-8 sm:gap-y-12">
        {/* Header Section */}
        <section className="flex flex-col gap-3 sm:gap-4 w-full md:w-2/3 lg:w-1/2">
          <h1 className="font-serif text-[28px] sm:text-[36px] md:text-[56px] text-[#0D0D0D] leading-tight font-bold tracking-tight">
            Portefeuille Exclusif
          </h1>
          <p className="font-sans text-[14px] sm:text-[16px] md:text-[18px] text-[#747878] leading-relaxed">
            Découvrez notre sélection rigoureuse de biens immobiliers d'exception. Une curation pensée pour les investisseurs exigeants, alliant prestige, rentabilité et discrétion.
          </p>
        </section>

        {/* Filters Section */}
        <section className="w-full bg-white p-4 sm:p-6 md:p-8 border border-[#8C6D3E]/20 shadow-sm flex flex-col md:flex-row gap-5 sm:gap-6 items-stretch md:items-end">
          {/* Type Filter */}
          <div className="w-full md:w-1/4 flex flex-col gap-2">
            <label htmlFor="filtre-type" className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#0D0D0D]">
              Type de bien
            </label>
            <div className="relative w-full border-b border-[#0D0D0D] pb-1 sm:pb-2">
              <select
                id="filtre-type"
                value={selectedType}
                onChange={(e) => setFilter('type', e.target.value)}
                className="w-full bg-transparent outline-none font-sans text-[14px] sm:text-[15px] text-[#0D0D0D] cursor-pointer pr-8"
              >
                <option value={ALL}>Tous les types</option>
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location Filter */}
          <div className="w-full md:w-1/4 flex flex-col gap-2">
            <label htmlFor="filtre-commune" className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#0D0D0D]">
              Localisation
            </label>
            <div className="relative w-full border-b border-[#0D0D0D] pb-1 sm:pb-2">
              <select
                id="filtre-commune"
                value={selectedLocation}
                onChange={(e) => setFilter('commune', e.target.value)}
                className="w-full bg-transparent outline-none font-sans text-[14px] sm:text-[15px] text-[#0D0D0D] cursor-pointer pr-8"
              >
                <option value={ALL}>Toutes localisations</option>
                {communes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget Filter */}
          <div className="w-full md:w-1/4 flex flex-col gap-2">
            <label htmlFor="filtre-budget" className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#0D0D0D]">
              Budget
            </label>
            <div className="relative w-full border-b border-[#0D0D0D] pb-1 sm:pb-2">
              <select
                id="filtre-budget"
                value={selectedBudget}
                onChange={(e) => setFilter('budget', e.target.value)}
                className="w-full bg-transparent outline-none font-sans text-[14px] sm:text-[15px] text-[#0D0D0D] cursor-pointer pr-8"
              >
                <option value={ALL}>Indifférent</option>
                {BUDGET_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset/Filter Actions */}
          <div className="w-full md:w-1/4 flex justify-stretch md:justify-end gap-3 pt-2 md:pt-0">
            <button
              onClick={resetFilters}
              className="w-full md:w-auto bg-[#0D0D0D] text-[#F9F7F2] font-sans text-[11px] font-semibold uppercase tracking-widest px-6 py-3 hover:bg-[#8C6D3E] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Filter size={14} />
              <span>Réinitialiser</span>
            </button>
          </div>
        </section>

        {/* Listing Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {loading && filteredProperties.length === 0 ? (
            [0, 1, 2].map((k) => <CardSkeleton key={k} />)
          ) : filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <Link
                key={property.id}
                to={propertyPath(property.id)}
                state={{ transition: 'slide_up' }}
                className="flex flex-col gap-4 group cursor-pointer transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md bg-white p-4 border border-[#8C6D3E]/20 transform-gpu"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#f0eee9]">
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    width={600}
                    height={450}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out transform-gpu"
                  />
                  {/* Status Tag */}
                  <StatusBadge status={property.status} className="absolute top-4 left-4" />

                  {/* Multi-photo badge */}
                  {(property.images?.length ?? 1) > 1 && (
                    <div className="absolute bottom-3 right-3 bg-[#0D0D0D]/90 border border-[#8C6D3E]/40 px-2.5 py-1 text-[#F9F7F2] font-sans text-[10px] font-semibold flex items-center gap-1.5 shadow-sm">
                      <ImageIcon size={12} className="text-[#C5A059]" />
                      <span>{property.images?.length} Photos</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className="font-serif text-[22px] font-bold text-[#0D0D0D] group-hover:text-[#8C6D3E] transition-colors">
                      {property.title}
                    </h3>
                    <span className="font-serif text-[20px] font-bold text-[#0D0D0D] shrink-0">
                      {property.price}
                    </span>
                  </div>

                  <ul className="flex gap-3 items-center font-sans text-[14px] text-[#747878] border-t border-[#f0eee9] pt-3 mt-1">
                    <li className="flex items-center gap-1">
                      <MapPin size={15} className="text-[#C5A059]" />
                      <span>{property.commune}</span>
                    </li>
                    <li className="w-1 h-1 bg-[#8C6D3E]/40 rounded-full" />
                    <li className="flex items-center gap-1">
                      <Maximize size={15} />
                      <span>{property.surface} m²</span>
                    </li>
                    <li className="w-1 h-1 bg-[#8C6D3E]/40 rounded-full" />
                    <li>{property.type}</li>
                  </ul>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-16 bg-white border border-[#8C6D3E]/20 shadow-sm">
              <p className="font-serif text-[24px] text-[#0D0D0D] mb-2 font-bold">Aucun bien ne correspond à ces critères.</p>
              <p className="font-sans text-[15px] text-[#747878] mb-6">
                Veuillez modifier vos filtres ou nous contacter directement pour un accompagnement sur-mesure.
              </p>
              <button
                onClick={resetFilters}
                className="bg-[#C5A059] text-[#0D0D0D] font-sans font-semibold text-xs tracking-widest uppercase px-6 py-3 cursor-pointer"
              >
                Voir toutes les offres
              </button>
            </div>
          )}
        </section>

        {/* Minimalist Pagination */}
        <section className="flex justify-center items-center gap-4 mt-8">
          <button className="w-10 h-10 border border-[#8C6D3E]/30 rounded-full flex items-center justify-center text-[#0D0D0D] hover:border-[#C5A059] hover:text-[#C5A059] transition-colors cursor-pointer">
            <ChevronLeft size={18} />
          </button>
          <span className="font-sans text-xs font-bold tracking-widest text-[#0D0D0D]">1 / 1</span>
          <button className="w-10 h-10 border border-[#8C6D3E]/30 rounded-full flex items-center justify-center text-[#0D0D0D] hover:border-[#C5A059] hover:text-[#C5A059] transition-colors cursor-pointer">
            <ChevronRight size={18} />
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
};
