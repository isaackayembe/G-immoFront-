/**
 * Filtres de recherche des offres (type, commune, budget).
 * Partagés entre la recherche rapide de l'accueil et la page Offres : les filtres voyagent
 * dans l'URL (/offres?type=Villa&commune=Gombe&budget=1-5), on peut donc partager un lien filtré.
 */
import { Property } from './types';
import { SCREEN_PATHS } from './routes';

export interface OfferFilters {
  type: string;
  commune: string;
  budget: string;
}

export const ALL = 'all';

export const TYPE_OPTIONS = [
  { value: 'Résidentiel', label: 'Résidentiel Premium' },
  { value: 'Commercial', label: 'Espace Commercial' },
  { value: 'Villa', label: 'Villa de Luxe' },
  { value: 'Hôtel Particulier', label: 'Hôtel Particulier' },
];

export const BUDGET_OPTIONS = [
  { value: '1-5', label: '$ 1M - $ 5M' },
  { value: '5-10', label: '$ 5M - $ 10M' },
  { value: '10+', label: '> $ 10M' },
];

/** Communes toujours proposées, complétées par celles des biens en ligne. */
export const MAIN_COMMUNES = ['Gombe', 'Ngaliema', 'Limete'];

export function communeOptions(properties: Property[]): string[] {
  const seen = new Map<string, string>();
  for (const c of [...MAIN_COMMUNES, ...properties.map((p) => p.commune?.trim())]) {
    if (c && !seen.has(c.toLowerCase())) seen.set(c.toLowerCase(), c);
  }
  return [...seen.values()];
}

export function matchesFilters(p: Property, f: OfferFilters): boolean {
  if (f.type !== ALL && p.type !== f.type) return false;
  if (f.commune !== ALL && !p.commune?.toLowerCase().includes(f.commune.toLowerCase())) return false;
  const price = p.numericPrice;
  if (f.budget === '1-5' && (price < 1000000 || price > 5000000)) return false;
  if (f.budget === '5-10' && (price < 5000000 || price > 10000000)) return false;
  if (f.budget === '10+' && price < 10000000) return false;
  return true;
}

/** Lit les filtres depuis l'URL ; toute valeur absente vaut « tous ». */
export function filtersFromParams(params: URLSearchParams): OfferFilters {
  return {
    type: params.get('type') || ALL,
    commune: params.get('commune') || ALL,
    budget: params.get('budget') || ALL,
  };
}

/** Paramètres d'URL correspondant aux filtres (les valeurs « tous » sont omises). */
export function filtersToParams(f: Partial<OfferFilters>): URLSearchParams {
  const params = new URLSearchParams();
  (['type', 'commune', 'budget'] as const).forEach((k) => {
    const v = f[k];
    if (v && v !== ALL) params.set(k, v);
  });
  return params;
}

/** URL de la page Offres avec des filtres déjà appliqués. */
export function offersSearchPath(f: Partial<OfferFilters>): string {
  const qs = filtersToParams(f).toString();
  return qs ? `${SCREEN_PATHS.offres}?${qs}` : SCREEN_PATHS.offres;
}
