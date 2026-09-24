import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ScreenId, TransitionType, Property } from '../types';
import api from '../services/api';
import { SCREEN_PATHS } from '../routes';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PropertyImageCarousel } from '../components/PropertyImageCarousel';
import { ArrowLeft } from 'lucide-react';

interface PropertyDetailScreenProps {
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
  properties: Property[];
}

export const PropertyDetailScreen: React.FC<PropertyDetailScreenProps> = ({ onNavigate, properties }) => {
  const { id = '' } = useParams();
  const fromList = properties.find((p) => p.id === id);
  const [fetched, setFetched] = useState<Property | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Lien ouvert directement (partage WhatsApp, favori…) : la liste n'est pas encore chargée
  useEffect(() => {
    if (fromList) return;
    let isMounted = true;
    api
      .getPropertyById(id)
      .then((p) => isMounted && setFetched(p))
      .catch(() => isMounted && setNotFound(true));
    return () => {
      isMounted = false;
    };
  }, [id, fromList]);

  const property = fromList || fetched;
  // Un brouillon n'est visible que par l'admin
  const isHidden = property?.status === 'Brouillon' && !api.isAuthenticated();

  useEffect(() => {
    if (property && !isHidden) {
      document.title = `${property.title} — G Business Immo`;
    }
    return () => {
      document.title = 'G Business Immo';
    };
  }, [property, isHidden]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] text-[#0D0D0D]">
      <Header currentScreen="offres" onNavigate={onNavigate} />

      <main className="flex-grow w-full px-4 sm:px-6 md:px-12 max-w-[1080px] mx-auto py-8 sm:py-12">
        <Link
          to={SCREEN_PATHS.offres}
          state={{ transition: 'push_back' }}
          className="inline-flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-widest text-[#0D0D0D] hover:text-[#C5A059] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          <span>Toutes les offres</span>
        </Link>

        {(notFound || isHidden) && (
          <div className="text-center py-16 bg-white border border-[#8C6D3E]/20 shadow-sm">
            <p className="font-serif text-[24px] text-[#0D0D0D] mb-2 font-bold">Ce bien n'est plus disponible.</p>
            <p className="font-sans text-[15px] text-[#747878] mb-6">
              Il a peut-être été vendu ou retiré. Découvrez nos autres offres.
            </p>
            <button
              onClick={() => onNavigate('offres', 'push_back')}
              className="bg-[#C5A059] text-[#0D0D0D] font-sans font-semibold text-xs tracking-widest uppercase px-6 py-3 cursor-pointer"
            >
              Voir toutes les offres
            </button>
          </div>
        )}

        {!property && !notFound && (
          <div className="py-24 text-center font-sans text-[13px] uppercase tracking-widest text-[#747878]">
            Chargement du bien…
          </div>
        )}

        {property && !isHidden && (
          <article className="bg-white p-6 md:p-8 border border-[#8C6D3E]/20 shadow-sm">
            <div className="mb-6">
              <PropertyImageCarousel
                images={property.images && property.images.length > 0 ? property.images : [property.imageUrl]}
                title={property.title}
                aspectRatio="wide"
                showThumbnails={true}
                allowFullscreen={true}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h1 className="font-serif text-[28px] md:text-[36px] text-[#0D0D0D] font-bold">{property.title}</h1>
              <span className="bg-[#C5A059] text-[#0D0D0D] font-sans font-bold text-[10px] tracking-widest uppercase px-3 py-1">
                {property.status}
              </span>
            </div>

            <p className="font-serif text-[24px] md:text-[28px] text-[#C5A059] font-bold mb-4">{property.price}</p>

            <p className="font-sans text-[15px] text-[#747878] leading-relaxed mb-6 whitespace-pre-line">
              {property.description}
            </p>

            <div className="grid grid-cols-2 gap-4 border-t border-b border-[#f0eee9] py-4 mb-6 font-sans text-[14px]">
              <div>
                <span className="text-[#747878] block text-xs uppercase tracking-wider">Localisation</span>
                <span className="font-semibold text-[#0D0D0D]">{property.location}</span>
              </div>
              <div>
                <span className="text-[#747878] block text-xs uppercase tracking-wider">Surface</span>
                <span className="font-semibold text-[#0D0D0D]">{property.surface} m²</span>
              </div>
              <div>
                <span className="text-[#747878] block text-xs uppercase tracking-wider">Type</span>
                <span className="font-semibold text-[#0D0D0D]">{property.type}</span>
              </div>
              <div>
                <span className="text-[#747878] block text-xs uppercase tracking-wider">Chambres / Pièces</span>
                <span className="font-semibold text-[#0D0D0D]">{property.bedrooms || property.rooms || 4}</span>
              </div>
            </div>

            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-6">
                <span className="font-sans text-xs font-bold tracking-widest text-[#0D0D0D] uppercase block mb-2">
                  Prestations Haut de Gamme
                </span>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((item, idx) => (
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

            <button
              onClick={() => onNavigate('contact', 'push')}
              className="w-full bg-[#0D0D0D] text-[#F9F7F2] font-sans font-semibold text-xs tracking-widest uppercase py-4 hover:bg-[#8C6D3E] transition-colors text-center cursor-pointer"
            >
              Demander une visite
            </button>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
};
