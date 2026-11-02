/**
 * Référencement : titre, description, URL canonique et aperçu de partage de chaque page.
 * 👉 Le nom de domaine se change ici (SITE_URL) et dans index.html, public/robots.txt et public/sitemap.xml.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const SITE_URL = 'https://www.g-immobusiness.com';
export const SITE_NAME = 'G Business Immo';
const DEFAULT_TITLE = 'G Business Immo | Immobilier de prestige à Kinshasa';
const DEFAULT_DESCRIPTION =
  "Découvrez G Business Immo, votre agence immobilière de prestige à Kinshasa. Vente et location de villas, maisons, appartements et biens d'exception.";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

interface SeoOptions {
  /** Titre de la page, sans le nom de l'agence (ajouté automatiquement). Vide = titre de l'accueil. */
  title?: string;
  description?: string;
  /** Image de partage (URL absolue). Par défaut : public/og-image.jpg. */
  image?: string;
  /** Pages privées (admin, connexion, 404) : exclues de Google. */
  noindex?: boolean;
}

/** Crée ou met à jour une balise <meta> (par name ou property). */
function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

/** Description courte (Google en affiche ~155 caractères). */
export function shortDescription(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export function useSeo({ title, description, image, noindex = false }: SeoOptions = {}) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    const desc = description || DEFAULT_DESCRIPTION;
    const url = `${SITE_URL}${pathname === '/' ? '/' : pathname.replace(/\/$/, '')}`;
    const img = image || DEFAULT_IMAGE;

    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setCanonical(url);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', img);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', img);
  }, [title, description, image, noindex, pathname]);
}
