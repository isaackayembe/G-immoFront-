// --- TYPES COMMONS & ENUMS ---
export type PropertyType = 
  | 'Résidentiel' 
  | 'Commercial' 
  | 'Hôtel Particulier' 
  | 'Villa';

export type PropertyStatus = 
  | 'Disponible' 
  | 'En cours' 
  | 'Vendu' 
  | 'Brouillon' 
  | 'Urgent';

// --- ENTITÉ PROPRIÉTÉ (reçue du backend) ---
export interface Property {
  id: string;
  title: string;
  price: string;               // Ex: "$ 4,250,000"
  numericPrice: number;        // Ex: 4250000 (type number TypeScript)
  location: string;            // Ex: "Kinshasa, Gombe"
  commune: string;             // Ex: "Gombe"
  address?: string | null;     // Ex: "Boulevard du 30 Juin"
  type: PropertyType;
  status: PropertyStatus;
  surface: number;             // En m²
  bedrooms?: number | null;
  rooms?: number | null;
  tag?: string | null;         // Ex: "EXCLUSIVITÉ", "COUP DE COEUR"
  imageUrl: string;            // Image principale (URL absolue)
  images: string[];            // Liste de toutes les URLs des images
  description: string;
  amenities: string[];         // Ex: ["Piscine", "Sécurité 24/7", "Domotique"]
}

// --- PAYLOAD CRÉATION / MODIFICATION BIEN ---
export interface CreatePropertyPayload {
  title: string;
  numericPrice: number;
  commune: string;
  address?: string;
  type: PropertyType | string;
  status?: PropertyStatus | string;
  surface: number;
  bedrooms?: number;
  rooms?: number;
  tag?: string;
  description?: string;
  amenities?: string[];
  images?: string[];
}

// --- STATISTIQUES DASHBOARD ADMIN ---
export interface StatusCounts {
  urgent: number;
  disponible: number;
  enCours: number;
  vendu: number;
  brouillon: number;
}

export interface DashboardStats {
  totalMandateValue: number;
  activeMandateValue: number;
  soldMandateValue: number;
  publishedCount: number;
  avgPrice: number;
  conversionRate: number;
  statusCounts: StatusCounts;
}

// --- AUTHENTIFICATION ---
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isStaff: boolean;
  isSuperuser: boolean;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AdminUser;
}

// --- FORMULAIRE DE CONTACT ---
export interface ContactMessagePayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

export interface ContactMessageItem {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  is_processed: boolean;
  created_at: string;
}
