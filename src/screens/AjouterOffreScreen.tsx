import React, { useState } from 'react';
import { ScreenId, TransitionType, Property } from '../types';
import { LOGO_URL } from '../data';
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
  Image as ImageIcon
} from 'lucide-react';

interface AjouterOffreScreenProps {
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
  onAddProperty: (newProperty: Property) => void;
}

export const AjouterOffreScreen: React.FC<AjouterOffreScreenProps> = ({
  onNavigate,
  onAddProperty,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'Résidentiel' | 'Commercial' | 'Hôtel Particulier' | 'Villa'>('Villa');
  const [price, setPrice] = useState('');
  const [numericPrice, setNumericPrice] = useState<number>(2500000);
  const [commune, setCommune] = useState('Gombe');
  const [address, setAddress] = useState('Avenue des Aviateurs, Kinshasa');
  const [surface, setSurface] = useState<number>(450);
  const [bedrooms, setBedrooms] = useState<number>(4);
  const [rooms, setRooms] = useState<number>(5);
  const [description, setDescription] = useState('');
  const [piscine, setPiscine] = useState(true);
  const [securite, setSecurite] = useState(true);
  const [domotique, setDomotique] = useState(false);
  const [vueFleuve, setVueFleuve] = useState(false);

  // Multi-image list
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [directUrlInput, setDirectUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Handle multiple file upload
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            setImages((prev) => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleAddDirectUrl = () => {
    if (directUrlInput.trim()) {
      setImages((prev) => [...prev, directUrlInput.trim()]);
      setDirectUrlInput('');
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
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

  const handleSaveDraft = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalImages = images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'];

    const formattedPrice = price.trim()
      ? price.startsWith('$') ? price : `$ ${price}`
      : `$ ${numericPrice.toLocaleString()}`;

    const newProp: Property = {
      id: `prop-draft-${Date.now()}`,
      title: title.trim() || 'Brouillon - Bien sans titre',
      price: formattedPrice,
      numericPrice: numericPrice || 2500000,
      location: `Kinshasa, ${commune}`,
      commune: commune,
      type: type,
      status: 'Brouillon',
      surface: surface || 400,
      bedrooms: bedrooms || 4,
      rooms: rooms || 5,
      imageUrl: finalImages[0],
      images: finalImages,
      description: description || 'Brouillon en cours de rédaction.',
      amenities: [
        piscine && 'Piscine',
        securite && 'Sécurité 24/7',
        domotique && 'Domotique',
        vueFleuve && 'Vue Fleuve',
      ].filter(Boolean) as string[],
      address: address,
    };

    onAddProperty(newProp);
    onNavigate('dashboard', 'push_back');
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    const finalImages = images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'];

    const formattedPrice = price.trim()
      ? price.startsWith('$') ? price : `$ ${price}`
      : `$ ${numericPrice.toLocaleString()}`;

    const newProp: Property = {
      id: `prop-${Date.now()}`,
      title: title || 'Propriété d\'Exception',
      price: formattedPrice,
      numericPrice: numericPrice || 2500000,
      location: `Kinshasa, ${commune}`,
      commune: commune,
      type: type,
      status: 'Disponible',
      surface: surface || 400,
      bedrooms: bedrooms || 4,
      rooms: rooms || 5,
      imageUrl: finalImages[0],
      images: finalImages,
      description: description || 'Superbe bien d\'exception idéalement situé, aux prestations haut de gamme et finitions irréprochables.',
      amenities: [
        piscine && 'Piscine',
        securite && 'Sécurité 24/7',
        domotique && 'Domotique',
        vueFleuve && 'Vue Fleuve',
      ].filter(Boolean) as string[],
      address: address,
    };

    onAddProperty(newProp);
    onNavigate('dashboard', 'push_back');
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
              href="#"
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
              href="#"
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
                  Ajouter une propriété
                </h1>
              </div>
              <p className="font-sans text-[12px] sm:text-[13px] text-[#747878] hidden sm:block">
                Détaillez les caractéristiques et téléversez plusieurs images pour le carrousel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex-1 sm:flex-initial border border-[#0D0D0D] text-[#0D0D0D] font-sans text-[11px] sm:text-xs font-bold tracking-wider sm:tracking-widest uppercase px-3 sm:px-5 py-2 sm:py-2.5 hover:bg-[#0D0D0D] hover:text-[#F9F7F2] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileEdit size={14} />
              <span>Brouillon</span>
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="flex-1 sm:flex-initial bg-[#0D0D0D] text-[#F9F7F2] font-sans text-[11px] sm:text-xs font-bold tracking-wider sm:tracking-widest uppercase px-4 sm:px-6 py-2 sm:py-2.5 hover:bg-[#8C6D3E] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>Publier</span>
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
              <div className="bg-white p-6 border border-[#8C6D3E]/20 shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-[#f0eee9] pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={18} className="text-[#C5A059]" />
                    <h2 className="font-serif text-[20px] font-bold text-[#0D0D0D]">
                      Galerie Photos ({images.length})
                    </h2>
                  </div>
                  <span className="font-sans text-[11px] font-bold tracking-wider text-[#C5A059] uppercase">
                    Carrousel Actif
                  </span>
                </div>

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

                {/* List & Reordering of Uploaded Photos */}
                {images.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-sans text-xs font-bold uppercase tracking-wider text-[#0D0D0D]">
                        Photos Enregistrées ({images.length})
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
                              src={imgUrl}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover"
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
                )}
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
