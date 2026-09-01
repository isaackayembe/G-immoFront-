import React, { useState, useMemo } from 'react';
import { ScreenId, TransitionType, Property } from '../types';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PropertyImageCarousel } from '../components/PropertyImageCarousel';
import { Filter, MapPin, Maximize, ChevronLeft, ChevronRight, X, Image as ImageIcon } from 'lucide-react';

interface OffresScreenProps {
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
  properties: Property[];
}

export const OffresScreen: React.FC<OffresScreenProps> = ({ onNavigate, properties }) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedBudget, setSelectedBudget] = useState<string>('all');
  const [activePropertyModal, setActivePropertyModal] = useState<Property | null>(null);

  // Filter properties (excluding drafts)
  const filteredProperties = useMemo(() => {
    return properties
      .filter((prop) => prop.status !== 'Brouillon')
      .filter((prop) => {
        if (selectedType !== 'all' && prop.type !== selectedType) return false;
        if (selectedLocation !== 'all' && !prop.commune.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
        if (selectedBudget !== 'all') {
          const price = prop.numericPrice;
          if (selectedBudget === '1-5' && (price < 1000000 || price > 5000000)) return false;
          if (selectedBudget === '5-10' && (price < 5000000 || price > 10000000)) return false;
          if (selectedBudget === '10+' && price < 10000000) return false;
        }
        return true;
      });
  }, [properties, selectedType, selectedLocation, selectedBudget]);

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
            <label className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#0D0D0D]">
              Type de bien
            </label>
            <div className="relative w-full border-b border-[#0D0D0D] pb-1 sm:pb-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-transparent outline-none font-sans text-[14px] sm:text-[15px] text-[#0D0D0D] cursor-pointer pr-8"
              >
                <option value="all">Tous les types</option>
                <option value="Résidentiel">Résidentiel Premium</option>
                <option value="Commercial">Espace Commercial</option>
                <option value="Villa">Villa de Luxe</option>
                <option value="Hôtel Particulier">Hôtel Particulier</option>
              </select>
            </div>
          </div>

          {/* Location Filter */}
          <div className="w-full md:w-1/4 flex flex-col gap-2">
            <label className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#0D0D0D]">
              Localisation
            </label>
            <div className="relative w-full border-b border-[#0D0D0D] pb-1 sm:pb-2">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-transparent outline-none font-sans text-[14px] sm:text-[15px] text-[#0D0D0D] cursor-pointer pr-8"
              >
                <option value="all">Toutes localisations</option>
                <option value="Gombe">Gombe</option>
                <option value="Ngaliema">Ngaliema</option>
                <option value="Limete">Limete</option>
              </select>
            </div>
          </div>

          {/* Budget Filter */}
          <div className="w-full md:w-1/4 flex flex-col gap-2">
            <label className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#0D0D0D]">
              Budget
            </label>
            <div className="relative w-full border-b border-[#0D0D0D] pb-1 sm:pb-2">
              <select
                value={selectedBudget}
                onChange={(e) => setSelectedBudget(e.target.value)}
                className="w-full bg-transparent outline-none font-sans text-[14px] sm:text-[15px] text-[#0D0D0D] cursor-pointer pr-8"
              >
                <option value="all">Indifférent</option>
                <option value="1-5">$ 1M - $ 5M</option>
                <option value="5-10">$ 5M - $ 10M</option>
                <option value="10+">&gt; $ 10M</option>
              </select>
            </div>
          </div>

          {/* Reset/Filter Actions */}
          <div className="w-full md:w-1/4 flex justify-stretch md:justify-end gap-3 pt-2 md:pt-0">
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedLocation('all');
                setSelectedBudget('all');
              }}
              className="w-full md:w-auto bg-[#0D0D0D] text-[#F9F7F2] font-sans text-[11px] font-semibold uppercase tracking-widest px-6 py-3 hover:bg-[#8C6D3E] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Filter size={14} />
              <span>Réinitialiser</span>
            </button>
          </div>
        </section>

        {/* Listing Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <article
                key={property.id}
                onClick={() => {
                  setActivePropertyModal(property);
                }}
                className="flex flex-col gap-4 group cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md bg-white p-4 border border-[#8C6D3E]/20"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#F9F7F2]">
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Status Tag */}
                  <div
                    className={`absolute top-4 left-4 px-3 py-1 font-sans font-bold text-[10px] tracking-widest uppercase shadow-sm ${
                      property.status === 'Urgent'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : property.status === 'Disponible'
                        ? 'bg-[#C5A059] text-[#0D0D0D]'
                        : property.status === 'En cours'
                        ? 'bg-[#F9F7F2] text-[#0D0D0D] border border-[#8C6D3E]/30'
                        : 'bg-[#0D0D0D] text-[#F9F7F2]'
                    }`}
                  >
                    {property.status}
                  </div>

                  {/* Multi-photo badge */}
                  {(property.images?.length ?? 1) > 1 && (
                    <div className="absolute bottom-3 right-3 bg-[#0D0D0D]/80 backdrop-blur-sm border border-[#8C6D3E]/40 px-2.5 py-1 text-[#F9F7F2] font-sans text-[10px] font-semibold flex items-center gap-1.5 shadow-sm">
                      <ImageIcon size={12} className="text-[#C5A059]" />
                      <span>{property.images?.length} Photos</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className="font-serif text-[22px] font-bold text-[#0D0D0D] group-hover:text-[#C5A059] transition-colors">
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
              </article>
            ))
          ) : (
            <div className="col-span-1 md:col-span-3 text-center py-16 bg-white border border-[#8C6D3E]/20 shadow-sm">
              <p className="font-serif text-[24px] text-[#0D0D0D] mb-2 font-bold">Aucun bien ne correspond à ces critères.</p>
              <p className="font-sans text-[15px] text-[#747878] mb-6">
                Veuillez modifier vos filtres ou nous contacter directement pour un accompagnement sur-mesure.
              </p>
              <button
                onClick={() => {
                  setSelectedType('all');
                  setSelectedLocation('all');
                  setSelectedBudget('all');
                }}
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

      {/* Property Detail Modal */}
      {activePropertyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white max-w-3xl w-full p-6 md:p-8 relative border border-[#8C6D3E]/20 shadow-xl max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setActivePropertyModal(null)}
              className="absolute top-4 right-4 p-2 text-[#0D0D0D] hover:text-[#C5A059] transition-colors z-20 bg-white/80 rounded-full cursor-pointer"
            >
              <X size={24} />
            </button>

            {/* Carousel with full photos & thumbnails */}
            <div className="mb-6">
              <PropertyImageCarousel
                images={activePropertyModal.images && activePropertyModal.images.length > 0
                  ? activePropertyModal.images
                  : [activePropertyModal.imageUrl]}
                title={activePropertyModal.title}
                aspectRatio="wide"
                showThumbnails={true}
                allowFullscreen={true}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h2 className="font-serif text-[28px] md:text-[32px] text-[#0D0D0D] font-bold">
                {activePropertyModal.title}
              </h2>
              <span className="bg-[#C5A059] text-[#0D0D0D] font-sans font-bold text-[10px] tracking-widest uppercase px-3 py-1">
                {activePropertyModal.status}
              </span>
            </div>

            <p className="font-serif text-[24px] md:text-[28px] text-[#C5A059] font-bold mb-4">
              {activePropertyModal.price}
            </p>

            <p className="font-sans text-[15px] text-[#747878] leading-relaxed mb-6">
              {activePropertyModal.description}
            </p>

            <div className="grid grid-cols-2 gap-4 border-t border-b border-[#f0eee9] py-4 mb-6 font-sans text-[14px]">
              <div>
                <span className="text-[#747878] block text-xs uppercase tracking-wider">Localisation</span>
                <span className="font-semibold text-[#0D0D0D]">{activePropertyModal.location}</span>
              </div>
              <div>
                <span className="text-[#747878] block text-xs uppercase tracking-wider">Surface</span>
                <span className="font-semibold text-[#0D0D0D]">{activePropertyModal.surface} m²</span>
              </div>
              <div>
                <span className="text-[#747878] block text-xs uppercase tracking-wider">Type</span>
                <span className="font-semibold text-[#0D0D0D]">{activePropertyModal.type}</span>
              </div>
              <div>
                <span className="text-[#747878] block text-xs uppercase tracking-wider">Chambres / Pièces</span>
                <span className="font-semibold text-[#0D0D0D]">
                  {activePropertyModal.bedrooms || activePropertyModal.rooms || 4}
                </span>
              </div>
            </div>

            {activePropertyModal.amenities && (
              <div className="mb-6">
                <span className="font-sans text-xs font-bold tracking-widest text-[#0D0D0D] uppercase block mb-2">
                  Prestations Haut de Gamme
                </span>
                <div className="flex flex-wrap gap-2">
                  {activePropertyModal.amenities.map((item, idx) => (
                    <span
                      key={idx}
                      className="bg-[#F9F7F2] text-[#0D0D0D] font-sans text-xs px-3 py-1 border border-[#8C6D3E]/20"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => {
                  setActivePropertyModal(null);
                  onNavigate('contact', 'push');
                }}
                className="flex-1 bg-[#0D0D0D] text-[#F9F7F2] font-sans font-semibold text-xs tracking-widest uppercase py-4 hover:bg-[#8C6D3E] transition-colors text-center cursor-pointer"
              >
                Demander une visite
              </button>
              <button
                onClick={() => setActivePropertyModal(null)}
                className="px-6 py-4 border border-[#0D0D0D] text-[#0D0D0D] font-sans font-semibold text-xs tracking-widest uppercase hover:bg-[#F9F7F2] cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
