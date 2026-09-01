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

export interface Property {
  id: string;
  title: string;
  price: string;
  numericPrice: number;
  location: string;
  commune: string;
  type: 'Résidentiel' | 'Commercial' | 'Hôtel Particulier' | 'Villa';
  status: 'Disponible' | 'En cours' | 'Vendu' | 'Brouillon' | 'Urgent';
  surface: number; // in m²
  bedrooms?: number;
  rooms?: number;
  tag?: string; // e.g. "EXCLUSIVITÉ"
  imageUrl: string;
  images?: string[];
  description?: string;
  amenities?: string[];
  address?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}
