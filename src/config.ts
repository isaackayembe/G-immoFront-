/**
 * Configuration globale de l'application G Business Immo.
 * Ce fichier centralise les constantes statiques (logo, branding, etc.)
 * sans aucune fake data — toutes les données viennent de l'API backend.
 */

/**
 * Logo de l'application.
 * 👉 Pour changer le logo : remplace le fichier dans src/assets/images/
 *    puis mets à jour le chemin d'import ici (un seul endroit à modifier).
 *
 * Formats supportés : .svg · .png · .jpg · .webp
 * Exemple PNG : import logoUrl from './assets/images/logo.png';
 */
import logoUrl from './assets/images/G-Business_Immo_Icon_256x256.png';
export const LOGO_URL: string = logoUrl;

/**
 * Coordonnées officielles de l'agence.
 * 👉 Un seul endroit à modifier : la page Contact et le pied de page lisent ces valeurs.
 */
export const CONTACT = {
  phoneDisplay: '+243 899 350 134',
  phoneHref: 'tel:+243899350134',
  whatsappDisplay: '+243 899 350 134',
  whatsappHref: 'https://wa.me/243899350134',
  email: 'contact@gbusinessimmo.cd',
  addressLine1: '75A Ngongo Lutete',
  addressLine2: 'Gombe, Kinshasa, RDC',
  addressFull: '75A Ngongo Lutete, Gombe, Kinshasa, République démocratique du Congo',
  mapsHref:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('75A Ngongo Lutete, Gombe, Kinshasa, Democratic Republic of the Congo'),
  hours: [
    { days: 'Lun – Ven', time: '8h00 – 17h30' },
    { days: 'Sam', time: '9h00 – 13h00' },
  ],
} as const;

/** Réseaux sociaux officiels. */
export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/gbusinessimmo/?locale=fr_FR',
  instagram: 'https://www.instagram.com/g_business_immo/',
  tiktok: 'https://www.tiktok.com/@gbusinessimmo',
} as const;

/**
 * Direction de l'agence (page À propos).
 * 👉 Pour changer la photo : remplace src/assets/images/dg.jpg (même nom) ou modifie l'import.
 */
import dgPhotoUrl from './assets/images/dg.jpg';
export const DIRECTOR = {
  name: 'Gaël Panzu',
  role: 'Directeur Général',
  photo: dgPhotoUrl as string,
} as const;

/** Chiffres clés (page À propos). */
export const KEY_FIGURES: { value: string; label: string }[] = [
  { value: '15 ans', label: "d'expérience dans l'immobilier" },
  { value: '100+', label: 'clients accompagnés' },
  { value: '95 %', label: 'de clients satisfaits' }, // estimation, à ajuster si l'agence a un chiffre mesuré
];

/**
 * Témoignages clients (page d'accueil). La section est masquée si la liste est vide.
 * ⚠️ EXEMPLES À REMPLACER par de vrais avis, avec l'accord des clients, avant la mise en ligne.
 * - rating : note sur 5 (optionnelle)
 * - context : ce que l'agence a fait pour le client (achat, location…), affiché sous le nom
 */
export const TESTIMONIALS: { quote: string; name: string; context: string; rating?: number }[] = [
  {
    quote:
      "Une équipe à l'écoute du début à la fin. Ils ont trouvé l'appartement qui correspondait exactement à nos critères à la Gombe, et se sont occupés de toutes les démarches.",
    name: 'Client A.',
    context: 'Achat · Gombe',
    rating: 5,
  },
  {
    quote:
      'Je vis à l’étranger et je cherchais à louer mon bien en toute confiance. Visites, sélection des locataires, suivi : tout a été géré avec sérieux et transparence.',
    name: 'Client B.',
    context: 'Mise en location · Ngaliema',
    rating: 5,
  },
  {
    quote:
      "Des conseils clairs et honnêtes sur le prix et le quartier. Notre bureau a été trouvé en quelques semaines, dans les délais annoncés.",
    name: 'Client C.',
    context: 'Location de bureaux · Gombe',
    rating: 5,
  },
];

