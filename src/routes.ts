/**
 * Table centrale des URLs du site.
 * 👉 Pour renommer une adresse (ex: /a-propos → /agence), c'est ici et nulle part ailleurs.
 */
import { ScreenId } from './types';

export type DashboardTab = 'offres' | 'brouillons' | 'analytics' | 'equipe' | 'parametres';

export const DASHBOARD_TABS: DashboardTab[] = ['offres', 'brouillons', 'analytics', 'equipe', 'parametres'];

export const SCREEN_PATHS: Record<ScreenId, string> = {
  accueil: '/',
  services: '/services',
  about: '/a-propos',
  offres: '/offres',
  contact: '/contact',
  dashboard: '/admin',
  ajouter_offre: '/admin/ajouter',
  login: '/connexion',
};

/** URL d'un écran, avec l'onglet du dashboard en paramètre (?onglet=brouillons). */
export function pathFor(screen: ScreenId, tab?: DashboardTab): string {
  const path = SCREEN_PATHS[screen];
  return screen === 'dashboard' && tab && tab !== 'offres' ? `${path}?onglet=${tab}` : path;
}

/** Page publique de détail d'un bien. */
export const propertyPath = (id: string) => `/offres/${id}`;

/** Formulaire de modification d'un bien (admin). */
export const editPropertyPath = (id: string) => `/admin/offres/${id}/modifier`;
