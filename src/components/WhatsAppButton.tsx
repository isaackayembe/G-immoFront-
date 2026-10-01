import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { CONTACT } from '../config';
import { Property } from '../types';

/** Pages où le bouton n'apparaît pas (espace admin, connexion). */
const HIDDEN_PATHS = ['/admin', '/connexion'];

/**
 * Bouton WhatsApp flottant des pages publiques.
 * - Sur une fiche bien, le message pré-rempli cite le bien et son lien.
 * - Sur l'accueil, il n'apparaît qu'après le hero pour ne pas couvrir ses commandes.
 */
export const WhatsAppButton: React.FC<{ properties: Property[] }> = ({ properties }) => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolledPastHero(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  if (HIDDEN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;

  const propertyId = pathname.match(/^\/offres\/([^/]+)$/)?.[1];
  const property = propertyId ? properties.find((p) => p.id === propertyId) : undefined;
  const message = property
    ? `Bonjour G Business Immo, je suis intéressé(e) par le bien « ${property.title} » : ${window.location.href}`
    : 'Bonjour G Business Immo, je souhaite avoir des informations sur vos biens.';
  const visible = !isHome || scrolledPastHero;

  return (
    <a
      href={`${CONTACT.whatsappHref}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nous écrire sur WhatsApp"
      data-no-reveal
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`fixed bottom-5 right-5 md:bottom-8 md:right-8 z-40 flex items-center gap-2.5 bg-[#0D0D0D] text-[#F9F7F2] border border-[#C5A059]/50 rounded-full p-3.5 md:pl-4 md:pr-5 shadow-lg hover:bg-[#1a1a1a] hover:border-[#C5A059] transition-[opacity,transform,background-color,border-color] duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <span className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0">
        <MessageCircle size={16} strokeWidth={2.2} />
      </span>
      <span className="hidden md:inline font-sans text-[12px] font-semibold uppercase tracking-widest">WhatsApp</span>
    </a>
  );
};
