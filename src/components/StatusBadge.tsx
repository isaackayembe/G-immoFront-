import React from 'react';
import { PropertyStatus } from '../types';

/** Pastille de statut d'un bien, identique sur l'accueil et la page Offres. */
export const StatusBadge: React.FC<{ status: PropertyStatus; className?: string }> = ({ status, className = '' }) => (
  <span
    className={`inline-block px-3 py-1 font-sans font-bold text-[10px] tracking-widest uppercase shadow-sm ${
      status === 'Urgent'
        ? 'bg-rose-600 text-white animate-pulse'
        : status === 'Disponible'
        ? 'bg-[#C5A059] text-[#0D0D0D]'
        : status === 'En cours'
        ? 'bg-[#F9F7F2] text-[#0D0D0D] border border-[#8C6D3E]/30'
        : 'bg-[#0D0D0D] text-[#F9F7F2]'
    } ${className}`}
  >
    {status}
  </span>
);

/** « 3 chambres », sinon « 5 pièces », sinon rien (on n'invente pas de valeur). */
export function roomsLabel(p: { bedrooms?: number | null; rooms?: number | null }): string {
  if (p.bedrooms) return `${p.bedrooms} ${p.bedrooms > 1 ? 'chambres' : 'chambre'}`;
  if (p.rooms) return `${p.rooms} ${p.rooms > 1 ? 'pièces' : 'pièce'}`;
  return '';
}

/** Carte grise animée affichée pendant le chargement des biens. */
export const CardSkeleton: React.FC<{ imageClass?: string; className?: string }> = ({
  imageClass = 'aspect-[4/3]',
  className = '',
}) => (
  <div className={`bg-white border border-[#8C6D3E]/20 p-4 flex flex-col gap-4 ${className}`} aria-hidden="true">
    <div className={`w-full bg-[#f0eee9] animate-pulse ${imageClass}`} />
    <div className="h-5 w-2/3 bg-[#f0eee9] animate-pulse" />
    <div className="h-4 w-1/2 bg-[#f0eee9] animate-pulse" />
  </div>
);
