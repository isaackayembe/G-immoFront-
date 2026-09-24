import {
  Property,
  CreatePropertyPayload,
  DashboardStats,
  LoginResponse,
  AdminUser,
  ContactMessagePayload,
  ContactResponse,
  ContactMessageItem,
  PropertyStatus,
} from '../types/api';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://fusioncreate.pythonanywhere.com/api';

// URL d'origine du backend (sans le préfixe /api), utilisée pour résoudre les chemins relatifs
export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

// Image de fallback affichée quand une URL est absente ou génère une erreur 404
export const FALLBACK_IMAGE_URL =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';

/**
 * Résout une URL d'image retournée par le backend en URL absolue valide.
 * - URL absolue (http/https) → retournée telle quelle
 * - Chemin relatif (/media/...) → préfixé par BACKEND_ORIGIN
 * - Vide / null / undefined → FALLBACK_IMAGE_URL
 */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return FALLBACK_IMAGE_URL;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  if (url.startsWith('/')) return `${BACKEND_ORIGIN}${url}`;
  return FALLBACK_IMAGE_URL;
}

class ApiService {
  /** Headers JSON standard (avec Content-Type: application/json) */
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  /** Headers sans Content-Type (laisser le navigateur le fixer pour multipart/form-data) */
  private getMultipartAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      ...this.getAuthHeaders(),
      ...(options.headers || {}),
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      // Déconnexion ou rafraîchissement
      localStorage.removeItem('access_token');
      // Redirection login optionnelle
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.message || errorBody.error || `Erreur HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return null as unknown as T;
    }

    return response.json();
  }

  /**
   * Requête multipart/form-data (upload de fichiers binaires).
   * N'ajoute PAS de Content-Type header — le navigateur le fixe automatiquement
   * avec le bon boundary pour FormData.
   */
  private async multipartRequest<T>(endpoint: string, formData: FormData): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getMultipartAuthHeaders(),
      body: formData,
    });

    if (response.status === 401) {
      localStorage.removeItem('access_token');
    }

    if (!response.ok) {
      let errorMsg = `Erreur HTTP ${response.status}`;
      try {
        const errorBody = await response.json();
        errorMsg = errorBody.message || errorBody.error || errorBody.detail || errorMsg;
      } catch {
        // réponse non-JSON
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // ==========================================
  // 🔐 1. AUTHENTIFICATION & SESSION
  // ==========================================

  /**
   * Vérifie si l'utilisateur possède une session active valide.
   * La session reste active tant que l'utilisateur ne clique pas sur Déconnexion.
   */
  isAuthenticated(): boolean {
    const isSessionActive = localStorage.getItem('is_authenticated') === 'true';
    const token = localStorage.getItem('access_token');
    return isSessionActive || !!token;
  }

  async login(credentials: { username: string; password: string }): Promise<LoginResponse> {
    const data = await this.request<LoginResponse>('/auth/token/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('is_authenticated', 'true');
    localStorage.setItem('user_email', credentials.username);
    window.dispatchEvent(new Event('auth-change'));
    return data;
  }

  async refreshToken(): Promise<{ access: string }> {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) throw new Error('Aucun refresh token disponible');
    const data = await this.request<{ access: string }>('/auth/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    });
    localStorage.setItem('access_token', data.access);
    return data;
  }

  async getProfile(): Promise<AdminUser> {
    return this.request<AdminUser>('/auth/profile/', { method: 'GET' });
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('is_authenticated');
    localStorage.removeItem('user_email');
    window.dispatchEvent(new Event('auth-change'));
  }

  // ==========================================
  // 🏠 2. PROPRIÉTÉS (CLIENT & ADMIN)
  // ==========================================

  // Public : Liste filtrée (exclut les brouillons)
  async getProperties(filters?: {
    type?: string;
    commune?: string;
    budget_min?: number;
    budget_max?: number;
    search?: string;
  }): Promise<Property[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.commune) params.append('commune', filters.commune);
    if (filters?.budget_min) params.append('budget_min', filters.budget_min.toString());
    if (filters?.budget_max) params.append('budget_max', filters.budget_max.toString());
    if (filters?.search) params.append('search', filters.search);

    const qs = params.toString();
    return this.request<Property[]>(`/properties/${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  // Admin : Tous les biens (inclus les brouillons)
  async getAdminProperties(filters?: {
    type?: string;
    commune?: string;
    status?: string;
    search?: string;
  }): Promise<Property[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.commune) params.append('commune', filters.commune);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const qs = params.toString();
    return this.request<Property[]>(`/properties/admin-all/${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  // Détail d'une propriété spécifique
  async getPropertyById(id: string): Promise<Property> {
    return this.request<Property>(`/properties/${id}/`, { method: 'GET' });
  }

  // Admin : Créer une offre avec URLs d'images textuelles (Unsplash, etc.)
  async createProperty(payload: CreatePropertyPayload): Promise<Property> {
    return this.request<Property>('/properties/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Admin : Créer une offre avec upload de fichiers images locaux via multipart/form-data.
   *
   * @param payload   - Données textuelles du bien (titre, prix, etc.)
   * @param files     - Fichiers images locaux sélectionnés par l'utilisateur
   * @param urlImages - URLs externes (Unsplash, etc.) à passer en JSON
   *
   * Le backend Django doit accepter `images` comme champ multi-fichier
   * et `image_urls` comme liste JSON d'URLs externes.
   */
  async createPropertyWithFiles(
    payload: CreatePropertyPayload,
    files: File[] = [],
    urlImages: string[] = []
  ): Promise<Property> {
    // Si aucun fichier local, on passe en JSON classique
    if (files.length === 0) {
      return this.createProperty({ ...payload, images: urlImages });
    }

    const formData = new FormData();

    // Champs scalaires (avec support camelCase et snake_case pour Django)
    formData.append('title', payload.title);
    formData.append('numericPrice', String(payload.numericPrice));
    formData.append('numeric_price', String(payload.numericPrice));
    formData.append('commune', payload.commune);
    if (payload.address) formData.append('address', payload.address);
    formData.append('type', payload.type);
    formData.append('property_type', payload.type);
    if (payload.status) formData.append('status', payload.status);
    formData.append('surface', String(payload.surface));
    if (payload.bedrooms != null) formData.append('bedrooms', String(payload.bedrooms));
    if (payload.rooms != null) formData.append('rooms', String(payload.rooms));
    if (payload.tag) formData.append('tag', payload.tag);
    if (payload.description) formData.append('description', payload.description);

    // Amenities (liste → plusieurs valeurs avec la même clé)
    if (payload.amenities) {
      payload.amenities.forEach((a) => formData.append('amenities', a));
    }

    // Fichiers images locaux (champ multi-fichier 'images')
    files.forEach((file) => {
      formData.append('images', file, file.name);
    });

    // URLs externes passées en JSON (le backend les crée comme external_url)
    if (urlImages.length > 0) {
      formData.append('image_urls', JSON.stringify(urlImages));
    }

    console.log(
      `[API] 🚀 multipart/form-data préparé : ${files.length} fichier(s) image inclus sous la clé 'images'`,
      files.map((f) => ({ name: f.name, size: f.size, type: f.type }))
    );

    return this.multipartRequest<Property>('/properties/', formData);
  }

  // Admin : Modifier une offre existante
  async updateProperty(id: string, payload: Partial<CreatePropertyPayload>): Promise<Property> {
    return this.request<Property>(`/properties/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Admin : Mise à jour rapide du statut (ex: 'Vendu', 'Disponible')
  async updatePropertyStatus(
    id: string,
    status: PropertyStatus
  ): Promise<{ id: string; status: PropertyStatus; message: string }> {
    return this.request(`/properties/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Admin : Supprimer un bien ou un brouillon
  async deleteProperty(id: string): Promise<void> {
    return this.request<void>(`/properties/${id}/`, { method: 'DELETE' });
  }

  // Admin : KPIs pour DashboardAdminScreen
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/properties/stats/', { method: 'GET' });
  }

  // ==========================================
  // ✉️ 3. CONTACT
  // ==========================================

  // Public : Soumission formulaire de contact
  async sendContactMessage(payload: ContactMessagePayload): Promise<ContactResponse> {
    return this.request<ContactResponse>('/contact/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Admin : Liste des messages reçus
  async getContactMessages(): Promise<ContactMessageItem[]> {
    return this.request<ContactMessageItem[]>('/contact/', { method: 'GET' });
  }
}

export const api = new ApiService();
export default api;
