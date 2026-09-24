import React, { useState, useEffect, useRef } from 'react';
import { ScreenId, TransitionType, Property } from '../types';
import { DashboardTab, pathFor } from '../routes';
import api, { resolveImageUrl, FALLBACK_IMAGE_URL } from '../services/api';
import { LOGO_URL } from '../config';
import { PropertyImageCarousel } from '../components/PropertyImageCarousel';
import {
  LayoutDashboard,
  Plus,
  ArrowLeft,
  Upload,
  Check,
  Info,
  MapPin,
  Sparkles,
  FileText,
  FileEdit,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Eye,
  Image as ImageIcon,
  Search,
  X,
} from 'lucide-react';

interface AjouterOffreScreenProps {
  onNavigate: (screen: ScreenId, transition?: TransitionType, tab?: DashboardTab) => void;
  onAddProperty: (newProperty: Property) => void;
  onUpdateProperty?: (updatedProperty: Property) => void;
  propertyToEdit?: Property | null;
  existingProperties?: Property[];
}

interface CatalogPhoto {
  url: string;
  propertyTitle: string;
  propertyId: string;
  commune: string;
}

export const AjouterOffreScreen: React.FC<AjouterOffreScreenProps> = ({
  onNavigate,
  onAddProperty,
  onUpdateProperty,
  propertyToEdit,
  existingProperties,
}) => {
  const isEditing = !!propertyToEdit;

  const [title, setTitle] = useState(propertyToEdit?.title || '');
  const [type, setType] = useState<'Résidentiel' | 'Commercial' | 'Hôtel Particulier' | 'Villa'>(
    propertyToEdit?.type || 'Villa'
  );
  const [price, setPrice] = useState(propertyToEdit?.price || '');
  const [numericPrice, setNumericPrice] = useState<number>(propertyToEdit?.numericPrice || 2500000);
  const [commune, setCommune] = useState(propertyToEdit?.commune || 'Gombe');
  const [address, setAddress] = useState(propertyToEdit?.address || 'Avenue des Aviateurs, Kinshasa');
  const [surface, setSurface] = useState<number>(propertyToEdit?.surface || 450);
  const [bedrooms, setBedrooms] = useState<number>(propertyToEdit?.bedrooms ?? 4);
  const [rooms, setRooms] = useState<number>(propertyToEdit?.rooms ?? 5);
  const [description, setDescription] = useState(propertyToEdit?.description || '');
  const [piscine, setPiscine] = useState(propertyToEdit?.amenities?.includes('Piscine') ?? true);
  const [securite, setSecurite] = useState(propertyToEdit?.amenities?.includes('Sécurité 24/7') ?? true);
  const [domotique, setDomotique] = useState(propertyToEdit?.amenities?.includes('Domotique') ?? false);
  const [vueFleuve, setVueFleuve] = useState(propertyToEdit?.amenities?.includes('Vue Fleuve') ?? false);

  // État des images :
  // Si édition d'une offre : charger ses vraies images
  // Si nouvelle offre : tableau vide [] (pas de fausses photos Unsplash !)
  const [images, setImages] = useState<string[]>(() => {
    if (propertyToEdit) {
      if (propertyToEdit.images && propertyToEdit.images.length > 0) {
        return propertyToEdit.images.map(resolveImageUrl);
      }
      if (propertyToEdit.imageUrl) {
        return [resolveImageUrl(propertyToEdit.imageUrl)];
      }
    }
    return [];
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const blobFileMap = useRef<Map<string, File>>(new Map());

  const [directUrlInput, setDirectUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Photos réelles enregistrées dans les offres du backend
  const [catalogPhotos, setCatalogPhotos] = useState<CatalogPhoto[]>([]);
  const [photoTab, setPhotoTab] = useState<'selected' | 'catalog'>('selected');
  const [catalogSearch, setCatalogSearch] = useState('');

  // Charger dynamiquement les photos réelles depuis les offres du backend
  useEffect(() => {
    const extractCatalogPhotos = (list: Property[]) => {
      const map = new Map<string, CatalogPhoto>();
      list.forEach((prop) => {
        const propImages = [prop.imageUrl, ...(prop.images || [])].filter(Boolean);
        propImages.forEach((rawUrl) => {
          const resolved = resolveImageUrl(rawUrl);
          if (resolved && !map.has(resolved)) {
            map.set(resolved, {
              url: resolved,
              propertyTitle: prop.title,
              propertyId: prop.id,
              commune: prop.commune,
            });
          }
        });
      });
      setCatalogPhotos(Array.from(map.values()));
    };

    if (existingProperties && existingProperties.length > 0) {
      extractCatalogPhotos(existingProperties);
    } else {
      const fetchPromise = api.isAuthenticated()
        ? api.getAdminProperties().catch(() => api.getProperties())
        : api.getProperties();

      fetchPromise
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            extractCatalogPhotos(data);
          }
        })
        .catch((err) => console.warn('Erreur chargement photos réelles backend:', err));
    }
  }, [existingProperties]);

  const filteredCatalogPhotos = catalogPhotos.filter((p) => {
    if (!catalogSearch.trim()) return true;
    const term = catalogSearch.toLowerCase();
    return (
      p.propertyTitle.toLowerCase().includes(term) ||
      p.commune.toLowerCase().includes(term)
    );
  });

  const handleToggleCatalogPhoto = (photoUrl: string) => {
    if (images.includes(photoUrl)) {
      setImages((prev) => prev.filter((u) => u !== photoUrl));
    } else {
      setImages((prev) => [...prev, photoUrl]);
    }
  };

  // Nettoyage des blob URLs à la destruction du composant
  useEffect(() => {
    return () => {
      blobFileMap.current.forEach((_, blobUrl) => URL.revokeObjectURL(blobUrl));
    };
  }, []);

  // Upload fichiers locaux : crée un blob URL pour l'aperçu + conserve le File object
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles: File[] = [];
    const newBlobUrls: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const blobUrl = URL.createObjectURL(file);
        blobFileMap.current.set(blobUrl, file);
        newFiles.push(file);
        newBlobUrls.push(blobUrl);
      }
    });

    if (newFiles.length > 0) {
      setImageFiles((prev) => [...prev, ...newFiles]);
      setImages((prev) => [...prev, ...newBlobUrls]);
    }
  };

  const handleAddDirectUrl = () => {
    if (directUrlInput.trim()) {
      setImages((prev) => [...prev, directUrlInput.trim()]);
      setDirectUrlInput('');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const urlToRemove = images[indexToRemove];
    // Si c'est un blob URL, libérer la mémoire et retirer du imageFiles
    if (urlToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(urlToRemove);
      const file = blobFileMap.current.get(urlToRemove);
      blobFileMap.current.delete(urlToRemove);
      if (file) {
        setImageFiles((prev) => prev.filter((f) => f !== file));
      }
    }
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) => {
      const selected = prev[index];
      const remaining = prev.filter((_, idx) => idx !== index);
      return [selected, ...remaining];
    });
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    setImages((prev) => {
      const updated = [...prev];
      const [item] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, item);
      return updated;
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveDraft = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const urlImages = images.filter((u) => !u.startsWith('blob:'));
    const finalFallback = FALLBACK_IMAGE_URL;

    // Extraire tous les vrais objets File ordonnés selon la galerie
    const filesToSend: File[] = [];
    images.forEach((imgUrl) => {
      const file = blobFileMap.current.get(imgUrl);
      if (file) filesToSend.push(file);
    });
    imageFiles.forEach((f) => {
      if (!filesToSend.includes(f)) filesToSend.push(f);
    });

    const formattedPrice = price.trim()
      ? price.startsWith('$') ? price : `$ ${price}`
      : `$ ${numericPrice.toLocaleString()}`;

    const payload = {
      title: title.trim() || (isEditing ? propertyToEdit!.title : 'Brouillon - Bien sans titre'),
      numericPrice: numericPrice || 2500000,
      commune: commune,
      address: address,
      type: type,
      status: 'Brouillon' as const,
      surface: surface || 400,
      bedrooms: bedrooms || 4,
      rooms: rooms || 5,
      description: description || 'Brouillon en cours de rédaction.',
      amenities: [
        piscine && 'Piscine',
        securite && 'Sécurité 24/7',
        domotique && 'Domotique',
        vueFleuve && 'Vue Fleuve',
      ].filter(Boolean) as string[],
    };

    if (isEditing && propertyToEdit) {
      const updated: Property = {
        ...propertyToEdit,
        title: payload.title,
        price: formattedPrice,
        numericPrice: payload.numericPrice,
        commune: payload.commune,
        address: payload.address,
        location: `Kinshasa, ${payload.commune}`,
        type: payload.type,
        status: 'Brouillon',
        surface: payload.surface,
        bedrooms: payload.bedrooms,
        rooms: payload.rooms,
        description: payload.description,
        amenities: payload.amenities,
        imageUrl: images[0] ? resolveImageUrl(images[0]) : resolveImageUrl(propertyToEdit.imageUrl),
        images: images.length > 0 ? images.map(resolveImageUrl) : [finalFallback],
      };

      if (onUpdateProperty) {
        onUpdateProperty(updated);
      }

      try {
        await api.updateProperty(propertyToEdit.id, {
          title: updated.title,
          numericPrice: updated.numericPrice,
          commune: updated.commune,
          address: updated.address || undefined,
          type: updated.type,
          status: updated.status,
          surface: updated.surface,
          bedrooms: updated.bedrooms ?? undefined,
          rooms: updated.rooms ?? undefined,
          description: updated.description,
          amenities: updated.amenities,
          images: urlImages,
        });
      } catch (err) {
        console.warn('Erreur mise à jour brouillon backend:', err);
      } finally {
        setIsSubmitting(false);
        onNavigate('dashboard', 'push_back', 'brouillons');
      }
      return;
    }

    try {
      const created = await api.createPropertyWithFiles(payload, filesToSend, urlImages);
      // Résoudre les URLs retournées par le backend
      const resolvedImages = (created.images || []).map(resolveImageUrl);
      onAddProperty({
        ...created,
        imageUrl: resolveImageUrl(created.imageUrl),
        images: resolvedImages,
      });
    } catch (err) {
      console.warn('Backend API non disponible lors de la création du brouillon, enregistrement local:', err);
      // Fallback local : utiliser les aperçus blob ou URLs externes
      const previewImages = images.length > 0 ? images : [finalFallback];
      const fallbackProp: Property = {
        id: `prop-draft-${Date.now()}`,
        title: payload.title,
        price: formattedPrice,
        numericPrice: payload.numericPrice,
        location: `Kinshasa, ${commune}`,
        commune: commune,
        type: type,
        status: 'Brouillon',
        surface: payload.surface,
        bedrooms: payload.bedrooms,
        rooms: payload.rooms,
        imageUrl: previewImages[0],
        images: previewImages,
        description: payload.description,
        amenities: payload.amenities,
        address: address,
      };
      onAddProperty(fallbackProp);
    } finally {
      setIsSubmitting(false);
      onNavigate('dashboard', 'push_back', 'brouillons');
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const urlImages = images.filter((u) => !u.startsWith('blob:'));
    const finalFallback = FALLBACK_IMAGE_URL;

    // Extraire tous les vrais objets File ordonnés selon la galerie
    const filesToSend: File[] = [];
    images.forEach((imgUrl) => {
      const file = blobFileMap.current.get(imgUrl);
      if (file) filesToSend.push(file);
    });
    imageFiles.forEach((f) => {
      if (!filesToSend.includes(f)) filesToSend.push(f);
    });

    const formattedPrice = price.trim()
      ? price.startsWith('$') ? price : `$ ${price}`
      : `$ ${numericPrice.toLocaleString()}`;

    const payload = {
      title: title || (isEditing ? propertyToEdit!.title : 'Propriété d\'Exception'),
      numericPrice: numericPrice || 2500000,
      commune: commune,
      address: address,
      type: type,
      status: 'Disponible' as const,
      surface: surface || 400,
      bedrooms: bedrooms || 4,
      rooms: rooms || 5,
      description: description || 'Superbe bien d\'exception idéalement situé, aux prestations haut de gamme et finitions irréprochables.',
      amenities: [
        piscine && 'Piscine',
        securite && 'Sécurité 24/7',
        domotique && 'Domotique',
        vueFleuve && 'Vue Fleuve',
      ].filter(Boolean) as string[],
    };

    if (isEditing && propertyToEdit) {
      const updated: Property = {
        ...propertyToEdit,
        title: payload.title,
        price: formattedPrice,
        numericPrice: payload.numericPrice,
        commune: payload.commune,
        address: payload.address,
        location: `Kinshasa, ${payload.commune}`,
        type: payload.type,
        status: 'Disponible',
        surface: payload.surface,
        bedrooms: payload.bedrooms,
        rooms: payload.rooms,
        description: payload.description,
        amenities: payload.amenities,
        imageUrl: images[0] ? resolveImageUrl(images[0]) : resolveImageUrl(propertyToEdit.imageUrl),
        images: images.length > 0 ? images.map(resolveImageUrl) : [finalFallback],
      };

      if (onUpdateProperty) {
        onUpdateProperty(updated);
      }

      try {
        await api.updateProperty(propertyToEdit.id, {
          title: updated.title,
          numericPrice: updated.numericPrice,
          commune: updated.commune,
          address: updated.address || undefined,
          type: updated.type,
          status: updated.status,
          surface: updated.surface,
          bedrooms: updated.bedrooms ?? undefined,
          rooms: updated.rooms ?? undefined,
          description: updated.description,
          amenities: updated.amenities,
          images: urlImages,
        });
      } catch (err) {
        console.warn('Erreur mise à jour publication backend:', err);
      } finally {
        setIsSubmitting(false);
        onNavigate('dashboard', 'push_back');
      }
      return;
    }

    try {
      const created = await api.createPropertyWithFiles(payload, filesToSend, urlImages);
      // Résoudre les URLs retournées par le backend
      const resolvedImages = (created.images || []).map(resolveImageUrl);
      onAddProperty({
        ...created,
        imageUrl: resolveImageUrl(created.imageUrl),
        images: resolvedImages,
      });
    } catch (err) {
      console.warn('Backend API non disponible lors de la publication, enregistrement local:', err);
      // Fallback local : les blob URLs resteront valides jusqu'au rechargement de la page
      const previewImages = images.length > 0 ? images : [finalFallback];
      const fallbackProp: Property = {
        id: `prop-${Date.now()}`,
        title: payload.title,
        price: formattedPrice,
        numericPrice: payload.numericPrice,
        location: `Kinshasa, ${commune}`,
        commune: commune,
        type: type,
        status: 'Disponible',
        surface: payload.surface,
        bedrooms: payload.bedrooms,
        rooms: payload.rooms,
        imageUrl: previewImages[0],
        images: previewImages,
        description: payload.description,
        amenities: payload.amenities,
        address: address,
      };
      onAddProperty(fallbackProp);
    } finally {
      setIsSubmitting(false);
      onNavigate('dashboard', 'push_back');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0D0D0D] text-[#0D0D0D]">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0D0D0D] border-r border-[#8C6D3E]/30 text-[#F9F7F2] flex flex-col justify-between p-6 shrink-0 hidden md:flex">
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-[#8C6D3E]/30 pb-6">
            <img
              src={LOGO_URL}
              alt="G Business Immo"
              className="w-10 h-10 rounded-full object-cover border border-[#C5A059]"
            />
            <div>
              <span className="font-serif text-[18px] font-bold block text-white">Admin Panel</span>
              <span className="font-sans text-[11px] text-[#C5A059] uppercase tracking-wider">
                G Business Immo
              </span>
            </div>
          </div>

          <nav className="space-y-2">
            <a
              href={pathFor('dashboard')}
              onClick={(e) => {
                e.preventDefault();
                onNavigate('dashboard', 'push_back');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 font-sans text-[13px] text-[#747878] hover:text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            >
              <LayoutDashboard size={18} />
              <span>Gestion Offres</span>
            </a>

            <a
              href={pathFor('dashboard')}
              onClick={(e) => {
                e.preventDefault();
                onNavigate('dashboard', 'push_back');
              }}
              className="w-full flex items-center gap-3 px-4 py-3 font-sans text-[13px] text-[#747878] hover:text-white hover:bg-[#1a1a1a] transition-colors cursor-pointer"
            >
              <FileEdit size={18} />
              <span>Brouillons</span>
            </a>

            <div className="w-full flex items-center gap-3 px-4 py-3 bg-[#C5A059] text-[#0D0D0D] font-sans text-xs font-bold tracking-widest uppercase">
              <Plus size={16} />
              <span>Ajouter un bien</span>
            </div>
          </nav>
        </div>

        <div className="border-t border-[#8C6D3E]/30 pt-4">
          <button
            onClick={() => onNavigate('dashboard', 'push_back')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[#747878] hover:text-white font-sans text-[13px] transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Retour au Dashboard</span>
          </button>
        </div>
      </aside>

      {/* Main Form Area */}
      <div className="flex-1 bg-[#F9F7F2] flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Bar with actions */}
        <header className="border-b border-[#8C6D3E]/20 bg-white px-4 sm:px-6 md:px-10 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard', 'push_back')}
                  className="md:hidden text-[#747878] hover:text-[#0D0D0D] mr-1 p-1"
                >
                  <ArrowLeft size={18} />
                </button>
                <h1 className="font-serif text-[20px] sm:text-[24px] md:text-[28px] font-bold text-[#0D0D0D]">
                  {isEditing ? `Modifier l'offre` : 'Ajouter une propriété'}
                </h1>
              </div>
              <p className="font-sans text-[12px] sm:text-[13px] text-[#747878] hidden sm:block">
                {isEditing
                  ? `Mise à jour des informations pour : ${propertyToEdit?.title}`
                  : 'Détaillez les caractéristiques et téléversez plusieurs images pour le carrousel.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveDraft}
              className="flex-1 sm:flex-initial border border-[#0D0D0D] text-[#0D0D0D] font-sans text-[11px] sm:text-xs font-bold tracking-wider sm:tracking-widest uppercase px-3 sm:px-5 py-2 sm:py-2.5 hover:bg-[#0D0D0D] hover:text-[#F9F7F2] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileEdit size={14} />
              <span>{isSubmitting ? 'Enregistrement...' : (isEditing ? 'Enregistrer Brouillon' : 'Brouillon')}</span>
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePublish}
              className="flex-1 sm:flex-initial bg-[#0D0D0D] text-[#F9F7F2] font-sans text-[11px] sm:text-xs font-bold tracking-wider sm:tracking-widest uppercase px-4 sm:px-6 py-2 sm:py-2.5 hover:bg-[#8C6D3E] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? 'Enregistrement...' : (isEditing ? 'Mettre à jour' : 'Publier')}</span>
              <Check size={14} />
            </button>
          </div>
        </header>

        {/* Form Body */}
        <main className="p-4 sm:p-6 md:p-10 flex-grow max-w-[1440px] w-full mx-auto">
          <form onSubmit={handlePublish} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (Details) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Informations Générales */}
              <div className="bg-white p-6 md:p-8 border border-[#8C6D3E]/20 shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-[#f0eee9] pb-4">
                  <Info size={18} className="text-[#C5A059]" />
                  <h2 className="font-serif text-[20px] font-bold text-[#0D0D0D]">
                    Informations Générales
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="font-sans text-xs font-bold tracking-widest text-[#747878] uppercase block mb-1">
                      Titre de l'annonce
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="ex: Penthouse Panoramique avec Vue Fleuve"
                      className="minimal-input text-[16px] text-[#0D0D0D] w-full"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="font-sans text-xs font-bold tracking-widest text-[#747878] uppercase block mb-1">
                        Type de propriété
                      </label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full bg-transparent border-b border-[#0D0D0D] py-2 font-sans text-[15px] outline-none text-[#0D0D0D] cursor-pointer"
                      >
                        <option value="Villa">Villa</option>
                        <option value="Résidentiel">Résidentiel Premium</option>
                        <option value="Commercial">Espace Commercial</option>
                        <option value="Hôtel Particulier">Hôtel Particulier</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-sans text-xs font-bold tracking-widest text-[#747878] uppercase block mb-1">
                        Prix (USD)
                      </label>
                      <div className="flex items-center">
                        <span className="font-serif text-[18px] mr-2 text-[#0D0D0D]">$</span>
                        <input
                          type="text"
                          value={price}
                          onChange={(e) => {
                            setPrice(e.target.value);
                            const parsed = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                            if (!isNaN(parsed)) setNumericPrice(parsed);
                          }}
                          placeholder="ex: 2 500 000"
                          className="minimal-input text-[16px] text-[#0D0D0D] w-full"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Localisation */}
              <div className="bg-white p-6 md:p-8 border border-[#8C6D3E]/20 shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-[#f0eee9] pb-4">
                  <MapPin size={18} className="text-[#C5A059]" />
                  <h2 className="font-serif text-[20px] font-bold text-[#0D0D0D]">
                    Localisation
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="font-sans text-xs font-bold tracking-widest text-[#747878] uppercase block mb-1">
                      Commune / Quartier
                    </label>
                    <select
                      value={commune}
                      onChange={(e) => setCommune(e.target.value)}
                      className="w-full bg-transparent border-b border-[#0D0D0D] py-2 font-sans text-[15px] outline-none text-[#0D0D0D] cursor-pointer"
                    >
                      <option value="Gombe">Gombe</option>
                      <option value="Ngaliema">Ngaliema</option>
                      <option value="Limete">Limete</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-sans text-xs font-bold tracking-widest text-[#747878] uppercase block mb-1">
                      Adresse complète
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Avenue des Aviateurs..."
                      className="minimal-input text-[16px] text-[#0D0D0D] w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Caractéristiques */}
              <div className="bg-white p-6 md:p-8 border border-[#8C6D3E]/20 shadow-sm space-y-6">
                <div className="flex items-center gap-2 border-b border-[#f0eee9] pb-4">
                  <Sparkles size={18} className="text-[#C5A059]" />
                  <h2 className="font-serif text-[20px] font-bold text-[#0D0D0D]">
                    Caractéristiques & Surfaces
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <label className="font-sans text-xs font-bold tracking-widest text-[#747878] uppercase block mb-1">
                      Surface (m²)
                    </label>
                    <input
                      type="number"
                      value={surface}
                      onChange={(e) => setSurface(parseInt(e.target.value, 10))}
                      placeholder="ex: 450"
                      className="minimal-input text-[16px] text-[#0D0D0D] w-full"
                    />
                  </div>

                  <div>
                    <label className="font-sans text-xs font-bold tracking-widest text-[#747878] uppercase block mb-1">
                      Chambres
                    </label>
                    <input
                      type="number"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(parseInt(e.target.value, 10))}
                      placeholder="ex: 4"
                      className="minimal-input text-[16px] text-[#0D0D0D] w-full"
                    />
                  </div>

                  <div>
                    <label className="font-sans text-xs font-bold tracking-widest text-[#747878] uppercase block mb-1">
                      Salles de bain / Pièces
                    </label>
                    <input
                      type="number"
                      value={rooms}
                      onChange={(e) => setRooms(parseInt(e.target.value, 10))}
                      placeholder="ex: 5"
                      className="minimal-input text-[16px] text-[#0D0D0D] w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-sans text-xs font-bold tracking-widest text-[#747878] uppercase block mb-3">
                    Prestations exclusives
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-sans">
                    <label className="flex items-center gap-2 cursor-pointer text-[14px]">
                      <input
                        type="checkbox"
                        checked={piscine}
                        onChange={(e) => setPiscine(e.target.checked)}
                        className="accent-[#C5A059]"
                      />
                      <span className="text-[#0D0D0D]">Piscine</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[14px]">
                      <input
                        type="checkbox"
                        checked={securite}
                        onChange={(e) => setSecurite(e.target.checked)}
                        className="accent-[#C5A059]"
                      />
                      <span className="text-[#0D0D0D]">Sécurité 24/7</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[14px]">
                      <input
                        type="checkbox"
                        checked={domotique}
                        onChange={(e) => setDomotique(e.target.checked)}
                        className="accent-[#C5A059]"
                      />
                      <span className="text-[#0D0D0D]">Domotique</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-[14px]">
                      <input
                        type="checkbox"
                        checked={vueFleuve}
                        onChange={(e) => setVueFleuve(e.target.checked)}
                        className="accent-[#C5A059]"
                      />
                      <span className="text-[#0D0D0D]">Vue Fleuve</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white p-6 md:p-8 border border-[#8C6D3E]/20 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-[#f0eee9] pb-4">
                  <FileText size={18} className="text-[#C5A059]" />
                  <h2 className="font-serif text-[20px] font-bold text-[#0D0D0D]">Description</h2>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Rédigez un texte élégant soulignant le prestige, la vue et l'emplacement du bien..."
                  className="minimal-input text-[15px] text-[#0D0D0D] w-full resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Right Column (Multi-Image Upload & Live Carousel Preview) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Multi-Photo Upload Area */}
              {/* Multi-Photo Upload & Real Catalog Gallery Area */}
              <div className="bg-white border border-[#8C6D3E]/20 shadow-sm overflow-hidden">
                {/* Tab Navigation: Photos de l'offre VS Photos enregistrées réelles */}
                <div className="flex border-b border-[#8C6D3E]/20 bg-[#F9F7F2]">
                  <button
                    type="button"
                    onClick={() => setPhotoTab('selected')}
                    className={`flex-1 py-3 px-3 font-sans text-xs font-bold uppercase tracking-wider text-center transition-colors border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
                      photoTab === 'selected'
                        ? 'border-[#C5A059] bg-white text-[#0D0D0D]'
                        : 'border-transparent text-[#747878] hover:text-[#0D0D0D]'
                    }`}
                  >
                    <ImageIcon size={15} className={photoTab === 'selected' ? 'text-[#C5A059]' : ''} />
                    <span>Photos de l'offre ({images.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoTab('catalog')}
                    className={`flex-1 py-3 px-3 font-sans text-xs font-bold uppercase tracking-wider text-center transition-colors border-b-2 cursor-pointer flex items-center justify-center gap-1.5 ${
                      photoTab === 'catalog'
                        ? 'border-[#C5A059] bg-white text-[#0D0D0D]'
                        : 'border-transparent text-[#747878] hover:text-[#0D0D0D]'
                    }`}
                  >
                    <Sparkles size={15} className={photoTab === 'catalog' ? 'text-[#C5A059]' : ''} />
                    <span>Photos enregistrées</span>
                    <span className="bg-[#C5A059] text-[#0D0D0D] text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                      {catalogPhotos.length}
                    </span>
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {photoTab === 'selected' && (
                    <>
                      {/* Drag & Drop Multi-file Dropzone */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          handleFiles(e.dataTransfer.files);
                        }}
                        className={`border-2 border-dashed p-6 flex flex-col items-center justify-center text-center transition-all ${
                          isDragging
                            ? 'border-[#C5A059] bg-[#C5A059]/10'
                            : 'border-[#C5A059]/50 bg-[#F9F7F2]'
                        } space-y-3`}
                      >
                        <Upload size={32} className="text-[#C5A059]" />
                        <div>
                          <p className="font-sans text-[13px] font-semibold text-[#0D0D0D]">
                            Glissez et déposez plusieurs photos ici
                          </p>
                          <p className="font-sans text-[11px] text-[#747878] mt-0.5">
                            Sélection multiple supportée (JPG, PNG, WebP)
                          </p>
                        </div>

                        <label className="bg-[#0D0D0D] text-[#F9F7F2] font-sans font-bold text-[11px] uppercase tracking-widest px-5 py-2.5 cursor-pointer hover:bg-[#8C6D3E] transition-colors inline-block shadow-sm">
                          Ajouter des fichiers
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleFiles(e.target.files)}
                          />
                        </label>
                      </div>

                      {/* Add Direct URL input */}
                      <div className="space-y-1.5 pt-1">
                        <label className="font-sans text-[11px] uppercase tracking-wider text-[#747878] block">
                          Ajouter une photo par lien URL :
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={directUrlInput}
                            onChange={(e) => setDirectUrlInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddDirectUrl();
                              }
                            }}
                            placeholder="https://images.unsplash.com/..."
                            className="minimal-input text-[13px] text-[#0D0D0D] flex-1"
                          />
                          <button
                            type="button"
                            onClick={handleAddDirectUrl}
                            className="bg-[#0D0D0D] text-[#F9F7F2] px-3.5 py-2 font-sans text-xs font-bold uppercase tracking-wider hover:bg-[#8C6D3E] transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                          >
                            <PlusCircle size={14} />
                            <span>Ajouter</span>
                          </button>
                        </div>
                      </div>

                      {/* List & Reordering of Selected Photos */}
                      {images.length > 0 ? (
                        <div className="space-y-3 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#0D0D0D]">
                              Photos sélectionnées ({images.length})
                            </span>
                            <span className="font-sans text-[11px] text-[#747878]">
                              ★ Photo #1 = Couverture
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
                            {images.map((imgUrl, index) => (
                              <div
                                key={index}
                                className={`relative border p-2 bg-[#F9F7F2] flex flex-col gap-2 transition-all ${
                                  index === 0
                                    ? 'border-[#C5A059] shadow-sm ring-1 ring-[#C5A059]'
                                    : 'border-[#8C6D3E]/20'
                                }`}
                              >
                                <div className="relative h-28 w-full overflow-hidden bg-[#0D0D0D]">
                                  <img
                                    src={resolveImageUrl(imgUrl)}
                                    alt={`Photo ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE_URL;
                                    }}
                                  />
                                  {index === 0 ? (
                                    <span className="absolute top-1.5 left-1.5 bg-[#C5A059] text-[#0D0D0D] font-sans text-[9px] font-bold uppercase px-2 py-0.5 shadow-sm flex items-center gap-1">
                                      <Star size={10} className="fill-[#0D0D0D]" />
                                      Couverture
                                    </span>
                                  ) : (
                                    <span className="absolute top-1.5 left-1.5 bg-[#0D0D0D]/80 text-[#F9F7F2] font-sans text-[9px] px-1.5 py-0.5">
                                      #{index + 1}
                                    </span>
                                  )}
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-between gap-1 pt-1 font-sans text-[11px]">
                                  <div>
                                    {index > 0 && (
                                      <button
                                        type="button"
                                        title="Définir comme photo principale"
                                        onClick={() => handleSetPrimaryImage(index)}
                                        className="text-[10px] text-[#C5A059] hover:text-[#8C6D3E] font-bold cursor-pointer"
                                      >
                                        ★ Définir Principale
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1 ml-auto">
                                    <button
                                      type="button"
                                      title="Déplacer vers la gauche"
                                      disabled={index === 0}
                                      onClick={() => handleMoveImage(index, index - 1)}
                                      className="p-1 text-[#0D0D0D] hover:text-[#C5A059] disabled:opacity-25 cursor-pointer"
                                    >
                                      <ChevronLeft size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      title="Déplacer vers la droite"
                                      disabled={index === images.length - 1}
                                      onClick={() => handleMoveImage(index, index + 1)}
                                      className="p-1 text-[#0D0D0D] hover:text-[#C5A059] disabled:opacity-25 cursor-pointer"
                                    >
                                      <ChevronRight size={14} />
                                    </button>
                                    <button
                                      type="button"
                                      title="Supprimer cette photo"
                                      onClick={() => handleRemoveImage(index)}
                                      className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="border border-dashed border-[#8C6D3E]/30 p-5 bg-[#F9F7F2] text-center space-y-3">
                          <ImageIcon size={28} className="mx-auto text-[#C5A059]" />
                          <p className="font-sans text-[13px] text-[#747878]">
                            Aucune photo sélectionnée pour cette annonce.
                          </p>
                          {catalogPhotos.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setPhotoTab('catalog')}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C6D3E] hover:text-[#0D0D0D] uppercase tracking-wider cursor-pointer border border-[#8C6D3E]/40 px-3 py-1.5 bg-white hover:bg-[#F9F7F2] transition-colors"
                            >
                              <Sparkles size={13} className="text-[#C5A059]" />
                              <span>Choisir parmi les {catalogPhotos.length} photos réelles du catalogue</span>
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {photoTab === 'catalog' && (
                    <div className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#0D0D0D]">
                            Photos Réelles des Offres ({catalogPhotos.length})
                          </span>
                          <span className="font-sans text-[11px] text-[#C5A059] font-bold">
                            {images.length} sélectionnée(s)
                          </span>
                        </div>
                        <p className="font-sans text-[12px] text-[#747878]">
                          Photos enregistrées et renvoyées par le backend pour les offres existantes. Cliquez pour les ajouter directement à cette annonce.
                        </p>
                      </div>

                      {/* Search / Filter input */}
                      <div className="relative">
                        <input
                          type="text"
                          value={catalogSearch}
                          onChange={(e) => setCatalogSearch(e.target.value)}
                          placeholder="Rechercher par titre de bien ou commune..."
                          className="minimal-input text-[13px] text-[#0D0D0D] w-full pl-8 pr-8"
                        />
                        <Search size={14} className="absolute left-2.5 top-2.5 text-[#747878]" />
                        {catalogSearch && (
                          <button
                            type="button"
                            onClick={() => setCatalogSearch('')}
                            className="absolute right-2.5 top-2.5 text-[#747878] hover:text-[#0D0D0D] cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      {/* Catalog Photos Grid */}
                      {filteredCatalogPhotos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                          {filteredCatalogPhotos.map((item, idx) => {
                            const isSelected = images.includes(item.url);
                            return (
                              <div
                                key={idx}
                                onClick={() => handleToggleCatalogPhoto(item.url)}
                                className={`relative border p-2 bg-[#F9F7F2] flex flex-col gap-2 transition-all cursor-pointer hover:shadow-md ${
                                  isSelected
                                    ? 'border-[#C5A059] shadow-sm ring-2 ring-[#C5A059] bg-[#C5A059]/5'
                                    : 'border-[#8C6D3E]/20 hover:border-[#C5A059]/60'
                                }`}
                              >
                                <div className="relative h-28 w-full overflow-hidden bg-[#0D0D0D]">
                                  <img
                                    src={resolveImageUrl(item.url)}
                                    alt={item.propertyTitle}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE_URL;
                                    }}
                                  />
                                  {isSelected && (
                                    <span className="absolute top-1.5 left-1.5 bg-[#C5A059] text-[#0D0D0D] font-sans text-[9px] font-bold uppercase px-2 py-0.5 shadow-sm flex items-center gap-1">
                                      <Check size={10} />
                                      Sélectionnée
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-0.5">
                                  <p className="font-serif text-[12px] font-bold text-[#0D0D0D] line-clamp-1">
                                    {item.propertyTitle}
                                  </p>
                                  <p className="font-sans text-[10px] text-[#747878] truncate">
                                    {item.commune}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleCatalogPhoto(item.url);
                                  }}
                                  className={`w-full py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                      : 'bg-[#0D0D0D] text-[#F9F7F2] hover:bg-[#8C6D3E]'
                                  }`}
                                >
                                  {isSelected ? (
                                    <>
                                      <Trash2 size={11} />
                                      <span>Retirer de l'offre</span>
                                    </>
                                  ) : (
                                    <>
                                      <PlusCircle size={11} />
                                      <span>+ Utiliser cette photo</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="border border-dashed border-[#8C6D3E]/30 p-8 text-center bg-[#F9F7F2] space-y-2">
                          <ImageIcon size={24} className="mx-auto text-[#747878]" />
                          <p className="font-sans text-[13px] text-[#747878]">
                            {catalogSearch
                              ? `Aucune photo ne correspond à "${catalogSearch}"`
                              : 'Aucune photo trouvée dans les publications actuelles du backend.'}
                          </p>
                        </div>
                      )}

                      <div className="pt-2 flex justify-between items-center border-t border-[#f0eee9]">
                        <span className="font-sans text-[11px] text-[#747878]">
                          {images.length} photo(s) sélectionnée(s)
                        </span>
                        <button
                          type="button"
                          onClick={() => setPhotoTab('selected')}
                          className="text-xs font-bold text-[#C5A059] hover:text-[#8C6D3E] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          <span>Voir la sélection</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Interactive Carousel Preview */}
              <div className="bg-white p-6 border border-[#8C6D3E]/20 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye size={18} className="text-[#C5A059]" />
                    <h3 className="font-serif text-[18px] font-bold text-[#0D0D0D]">
                      Aperçu Live du Carrousel
                    </h3>
                  </div>
                  <span className="font-sans text-[11px] text-[#747878]">
                    Expérience Client
                  </span>
                </div>

                <div className="border border-[#8C6D3E]/20 p-2 bg-[#F9F7F2]">
                  <PropertyImageCarousel
                    images={images}
                    title={title || 'Aperçu de la Propriété'}
                    aspectRatio="wide"
                    showThumbnails={true}
                    allowFullscreen={true}
                  />
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};
