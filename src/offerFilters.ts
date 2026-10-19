/**
 * Filtres de recherche des offres (type, commune, budget).
 * Partagés entre la recherche rapide de l'accueil, la page Offres et les formulaires de l'admin : les filtres
 * voyagent dans l'URL (/offres?type=Villa&commune=Gombe&budget=100k-250k), on peut donc partager un lien filtré.
 */
import { Property } from './types';
import { SCREEN_PATHS } from './routes';

export interface OfferFilters {
  type: string;
  commune: string;
  budget: string;
}

export const ALL = 'all';

/** Types de biens : `value` est enregistré dans le backend, `label` est affiché dans les filtres. */
export const TYPE_OPTIONS = [
  { value: 'Villa', label: 'Villas' },
  { value: 'Maison', label: 'Maisons' },
  { value: 'Appartement', label: 'Appartements' },
  { value: 'Bureau', label: 'Bureaux' },
  { value: 'Espace commercial', label: 'Espaces commerciaux' },
  { value: 'Terrain', label: 'Terrains' },
];

/** Anciens types encore présents sur des biens déjà publiés → type actuel correspondant (pour les filtres). */
const LEGACY_TYPES: Record<string, string> = {
  Résidentiel: 'Appartement',
  Commercial: 'Espace commercial',
  'Hôtel Particulier': 'Maison',
};

/** Tranches de budget en dollars : de `min` inclus à `max` exclu (`max: null` = sans limite haute). */
export const BUDGET_OPTIONS = [
  { value: '10k-50k', label: '$ 10 000 - $ 50 000', min: 10_000, max: 50_000 },
  { value: '50k-100k', label: '$ 50 000 - $ 100 000', min: 50_000, max: 100_000 },
  { value: '100k-250k', label: '$ 100 000 - $ 250 000', min: 100_000, max: 250_000 },
  { value: '250k-500k', label: '$ 250 000 - $ 500 000', min: 250_000, max: 500_000 },
  { value: '500k-1m', label: '$ 500 000 - $ 1 000 000', min: 500_000, max: 1_000_000 },
  { value: '1m+', label: 'Plus de $ 1 000 000', min: 1_000_000, max: null },
];

/** Les 24 communes de la ville-province de Kinshasa, par ordre alphabétique. */
export const KINSHASA_COMMUNES = [
  'Bandalungwa',
  'Barumbu',
  'Bumbu',
  'Gombe',
  'Kalamu',
  'Kasa-Vubu',
  'Kimbanseke',
  'Kinshasa',
  'Kintambo',
  'Kisenso',
  'Lemba',
  'Limete',
  'Lingwala',
  'Makala',
  'Maluku',
  'Masina',
  'Matete',
  'Mont-Ngafula',
  "N'djili",
  'Ngaba',
  'Ngaliema',
  'Ngiri-Ngiri',
  'Nsele',
  'Selembao',
];

/** Communes mises en avant sur l'accueil (« Nos Quartiers ») même sans bien en ligne. */
export const MAIN_COMMUNES = ['Gombe', 'Ngaliema', 'Limete'];

/** Compare deux noms de commune sans tenir compte des accents, majuscules, tirets ou apostrophes. */
const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

/** Ajoute à une liste de communes celles des biens qui n'y sont pas encore (sans doublon). */
function withPropertyCommunes(base: string[], properties: Property[]): string[] {
  const seen = new Map<string, string>();
  for (const c of [...base, ...properties.map((p) => p.commune?.trim())]) {
    if (c && !seen.has(normalize(c))) seen.set(normalize(c), c);
  }
  return [...seen.values()];
}

/** Communes proposées dans les filtres : toutes celles de Kinshasa (+ une éventuelle commune saisie autrement). */
export function communeOptions(properties: Property[]): string[] {
  return withPropertyCommunes(KINSHASA_COMMUNES, properties);
}

/** Communes affichées dans « Nos Quartiers » : les principales + celles où l'agence a des biens. */
export function showcaseCommunes(properties: Property[]): string[] {
  return withPropertyCommunes(MAIN_COMMUNES, properties);
}

export function sameCommune(a: string | undefined | null, b: string): boolean {
  return !!a && normalize(a) === normalize(b);
}

export function matchesFilters(p: Property, f: OfferFilters): boolean {
  if (f.type !== ALL && (LEGACY_TYPES[p.type] ?? p.type) !== f.type) return false;
  if (f.commune !== ALL && !sameCommune(p.commune, f.commune)) return false;
  const budget = BUDGET_OPTIONS.find((b) => b.value === f.budget);
  if (budget) {
    const price = p.numericPrice;
    if (price < budget.min) return false;
    if (budget.max !== null && price >= budget.max) return false;
  }
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
