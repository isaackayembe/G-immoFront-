export type ScreenId =
  | 'accueil'
  | 'about'
  | 'services'
  | 'offres'
  | 'contact'
  | 'dashboard'
  | 'ajouter_offre'
  | 'login';

export type TransitionType = 'push' | 'push_back' | 'slide_up' | 'none';

// Re-export all API interfaces & enums
export * from './types/api';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}
