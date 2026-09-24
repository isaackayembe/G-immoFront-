import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScreenId, TransitionType, Property, PropertyStatus, DashboardStats } from '../types';
import { DashboardTab, DASHBOARD_TABS } from '../routes';
import { LOGO_URL } from '../config';
import api, { resolveImageUrl, FALLBACK_IMAGE_URL } from '../services/api';
import { PropertyImageCarousel } from '../components/PropertyImageCarousel';
import {
  LayoutDashboard,
  Plus,
  Settings,
  Users,
  BarChart3,
  LogOut,
  ArrowLeft,
  FileEdit,
  Globe,
  Eye,
  Trash2,
  CheckCircle2,
  MapPin,
  Maximize,
  Bed,
  Image as ImageIcon,
  X,
  Sparkles,
  Send,
  AlertCircle,
  Edit3,
  RefreshCw,
  Save,
  ExternalLink,
} from 'lucide-react';

interface DashboardAdminScreenProps {
  onNavigate: (screen: ScreenId, transition?: TransitionType, tab?: DashboardTab) => void;
  properties: Property[];
  onUpdateStatus: (propertyId: string, newStatus: PropertyStatus) => void;
  onDeleteProperty?: (propertyId: string) => void;
  onUpdateProperty?: (updatedProperty: Property) => void;
  onRefreshProperties?: () => Promise<void> | void;
  onEditProperty?: (property: Property) => void;
}

export const DashboardAdminScreen: React.FC<DashboardAdminScreenProps> = ({
  onNavigate,
  properties,
  onUpdateStatus,
  onDeleteProperty,
  onUpdateProperty,
  onRefreshProperties,
  onEditProperty,
}) => {
  // L'onglet actif vit dans l'URL (/admin?onglet=brouillons) : il survit au rafraîchissement
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('onglet') as DashboardTab | null;
  const activeTab: DashboardTab = tabParam && DASHBOARD_TABS.includes(tabParam) ? tabParam : 'offres';
  const setActiveTab = (tab: DashboardTab) =>
    setSearchParams(tab === 'offres' ? {} : { onglet: tab }, { replace: true, state: { transition: 'none' } });
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const urgent = properties.filter((p) => p.status === 'Urgent');
  const disponible = properties.filter((p) => p.status === 'Disponible');
  const enCours = properties.filter((p) => p.status === 'En cours');
  const vendu = properties.filter((p) => p.status === 'Vendu');
  const brouillons = properties.filter((p) => p.status === 'Brouillon');

  // ⚡ Calculs 100% dynamiques et réactifs au millième de seconde
  const totalMandateValue = properties.reduce((acc, p) => acc + (p.numericPrice || 0), 0);
  const activeMandateValue = [...urgent, ...disponible, ...enCours].reduce((acc, p) => acc + (p.numericPrice || 0), 0);
  const soldMandateValue = vendu.reduce((acc, p) => acc + (p.numericPrice || 0), 0);
  const publishedCount = urgent.length + disponible.length + enCours.length;
  const avgPrice = publishedCount > 0 ? Math.round(activeMandateValue / publishedCount) : 0;
  const activeOrClosedCount = properties.filter((p) => p.status !== 'Brouillon').length;
  const conversionRate = activeOrClosedCount > 0 
    ? Math.round(((vendu.length + enCours.length) / activeOrClosedCount) * 100)
    : 0;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const handleStatusChange = (prop: Property, newStatus: PropertyStatus) => {
    onUpdateStatus(prop.id, newStatus);
    showNotification(`⚡ Le bien "${prop.title}" a été déplacé vers "${newStatus}" !`);
  };

  const handleDeleteItem = (propId: string, title: string) => {
    if (window.confirm(`Confirmez-vous la suppression de "${title}" ?`)) {
      if (onDeleteProperty) {
        onDeleteProperty(propId);
      }
      showNotification(`🗑️ Le bien "${title}" a été supprimé.`);
    }
  };

  const handlePublishDraft = async (prop: Property) => {
    onUpdateStatus(prop.id, 'Disponible');
    showNotification(`L'offre "${prop.title}" a été publiée avec succès !`);
    try {
      await api.updatePropertyStatus(prop.id, 'Disponible');
    } catch (err) {
      console.warn('Erreur mise à jour statut API backend:', err);
    }
  };

  const handleDeleteDraft = async (propId: string, title: string) => {
    if (onDeleteProperty) {
      onDeleteProperty(propId);
      showNotification(`Le brouillon "${title}" a été supprimé.`);
    }
    try {
      await api.deleteProperty(propId);
    } catch (err) {
      console.warn('Erreur suppression API backend:', err);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    const formattedPrice = editingProperty.price?.trim().startsWith('$')
      ? editingProperty.price
      : `$ ${Number(editingProperty.numericPrice || 0).toLocaleString()}`;
    const updated: Property = {
      ...editingProperty,
      price: formattedPrice,
      imageUrl: resolveImageUrl(editingProperty.imageUrl),
    };
    if (onUpdateProperty) {
      onUpdateProperty(updated);
    }
    showNotification(`✅ L'offre "${updated.title}" a été modifiée avec succès.`);
    setEditingProperty(null);

    try {
      await api.updateProperty(updated.id, {
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
        images: updated.images,
      });
    } catch (err) {
      console.warn('Erreur mise à jour API backend:', err);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefreshProperties) {
      await onRefreshProperties();
    }
    showNotification('🔄 Données synchronisées avec succès !');
    setIsRefreshing(false);
  };

  const renderKanbanCard = (prop: Property, borderColor: string, badgeBg: string, badgeText: string) => (
    <div
      key={prop.id}
      className={`bg-white p-4 border ${borderColor} shadow-sm hover:shadow-md transition-all flex flex-col gap-3 group`}
    >
      <div className="relative h-36 overflow-hidden bg-[#0D0D0D]">
        <img
          src={prop.imageUrl}
          alt={prop.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className={`absolute top-2 left-2 ${badgeBg} ${badgeText} font-sans text-[10px] font-bold uppercase px-2 py-0.5 shadow-sm`}>
          {prop.status}
        </span>
        {(prop.images?.length ?? 1) > 1 && (
          <span className="absolute bottom-2 right-2 bg-[#0D0D0D]/80 text-white text-[10px] px-2 py-0.5 font-sans flex items-center gap-1">
            <ImageIcon size={10} className="text-[#C5A059]" />
            {prop.images?.length} Photos
          </span>
        )}
      </div>
      <div>
        <h3 className="font-serif text-[17px] font-bold text-[#0D0D0D] line-clamp-1">{prop.title}</h3>
        <p className="font-sans text-[13px] text-[#747878] truncate">{prop.location}</p>
        <p className="font-serif text-[16px] font-bold text-[#8C6D3E] mt-1">{prop.price}</p>
      </div>

      {/* Quick Status Selector + Action Buttons */}
      <div className="border-t border-[#f0eee9] pt-3 space-y-2">
        <div className="flex items-center justify-between font-sans text-[12px]">
          <span className="text-[#747878] text-[11px] font-semibold uppercase">Statut :</span>
          <select
            value={prop.status}
            onChange={(e) => handleStatusChange(prop, e.target.value as any)}
            className="bg-[#F9F7F2] px-2 py-1 border border-[#8C6D3E]/30 outline-none text-[#0D0D0D] font-medium cursor-pointer text-[12px]"
          >
            <option value="Urgent">Urgent</option>
            <option value="Disponible">Disponible</option>
            <option value="En cours">En cours</option>
            <option value="Vendu">Vendu</option>
            <option value="Brouillon">Brouillon</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-1.5 pt-1">
          <button
            onClick={() => setPreviewProperty(prop)}
            title="Aperçu carrousel"
            className="p-1.5 border border-[#8C6D3E]/30 text-[#0D0D0D] hover:bg-[#F9F7F2] transition-colors rounded cursor-pointer"
          >
            <Eye size={13} className="text-[#C5A059]" />
          </button>
          <button
            onClick={() => setEditingProperty(prop)}
            title="Modifier ce bien"
            className="p-1.5 border border-[#8C6D3E]/30 text-[#0D0D0D] hover:bg-[#F9F7F2] transition-colors rounded cursor-pointer"
          >
            <Edit3 size={13} className="text-[#8C6D3E]" />
          </button>
          <button
            onClick={() => handleDeleteItem(prop.id, prop.title)}
            title="Supprimer définitivement"
            className="p-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors rounded cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#0D0D0D] text-[#0D0D0D]">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0D0D0D] border-r border-[#8C6D3E]/30 text-[#F9F7F2] flex flex-col justify-between p-6 shrink-0 hidden md:flex">
        <div className="space-y-8">
          {/* Logo & Brand */}
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

          {/* Navigation Links */}
          <nav className="space-y-2">
            <button
              onClick={() => onNavigate('ajouter_offre', 'slide_up')}
              className="w-full flex items-center gap-3 px-4 py-3 bg-[#C5A059] text-[#0D0D0D] font-sans text-xs font-bold tracking-widest uppercase hover:bg-[#8C6D3E] hover:text-[#F9F7F2] transition-colors mb-4 cursor-pointer"
            >
              <Plus size={16} />
              <span>Ajouter un bien</span>
            </button>

            {/* Gestion Offres */}
            <button
              onClick={() => setActiveTab('offres')}
              className={`w-full flex items-center justify-between px-4 py-3 font-sans text-[13px] transition-colors cursor-pointer ${
                activeTab === 'offres'
                  ? 'bg-[#C5A059]/20 text-[#C5A059] border-l-2 border-[#C5A059]'
                  : 'text-[#747878] hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard size={18} />
                <span>Gestion Offres</span>
              </div>
              <span className="bg-white/10 text-[#F9F7F2] text-[11px] font-bold px-2 py-0.5 rounded">
                {urgent.length + disponible.length + enCours.length + vendu.length}
              </span>
            </button>

            {/* Option Brouillon en dessous de Gestion Offres */}
            <button
              onClick={() => setActiveTab('brouillons')}
              className={`w-full flex items-center justify-between px-4 py-3 font-sans text-[13px] transition-colors cursor-pointer ${
                activeTab === 'brouillons'
                  ? 'bg-[#C5A059]/20 text-[#C5A059] border-l-2 border-[#C5A059]'
                  : 'text-[#747878] hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileEdit size={18} />
                <span>Brouillons</span>
              </div>
              {brouillons.length > 0 && (
                <span className="bg-[#C5A059] text-[#0D0D0D] text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {brouillons.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 font-sans text-[13px] transition-colors cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-[#C5A059]/20 text-[#C5A059] border-l-2 border-[#C5A059]'
                  : 'text-[#747878] hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <BarChart3 size={18} />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('equipe')}
              className={`w-full flex items-center gap-3 px-4 py-3 font-sans text-[13px] transition-colors cursor-pointer ${
                activeTab === 'equipe'
                  ? 'bg-[#C5A059]/20 text-[#C5A059] border-l-2 border-[#C5A059]'
                  : 'text-[#747878] hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <Users size={18} />
              <span>Équipe</span>
            </button>

            <button
              onClick={() => setActiveTab('parametres')}
              className={`w-full flex items-center gap-3 px-4 py-3 font-sans text-[13px] transition-colors cursor-pointer ${
                activeTab === 'parametres'
                  ? 'bg-[#C5A059]/20 text-[#C5A059] border-l-2 border-[#C5A059]'
                  : 'text-[#747878] hover:text-white hover:bg-[#1a1a1a]'
              }`}
            >
              <Settings size={18} />
              <span>Paramètres</span>
            </button>
          </nav>
        </div>

        {/* Logout / Public Site */}
        <div className="border-t border-[#8C6D3E]/30 pt-4 space-y-2">
          <button
            onClick={() => onNavigate('accueil', 'push_back')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[#747878] hover:text-white font-sans text-[13px] transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Retour au site public</span>
          </button>
          <button
            onClick={() => {
              api.logout();
              onNavigate('accueil', 'push_back');
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-rose-400 hover:text-rose-300 font-sans text-[13px] transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 bg-[#F9F7F2] flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="border-b border-[#8C6D3E]/20 bg-white px-4 sm:px-6 md:px-10 py-3 sm:py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-3 sticky top-0 z-30 shadow-xs">
          <div className="flex justify-between items-center w-full md:w-auto">
            <div>
              <div className="flex items-center gap-2">
                <span className="md:hidden font-serif text-[18px] font-bold text-[#C5A059]">Admin</span>
                <h1 className="font-serif text-[20px] sm:text-[24px] md:text-[28px] font-bold text-[#0D0D0D] leading-tight">
                  {activeTab === 'offres' && 'Gestion des Offres'}
                  {activeTab === 'brouillons' && 'Offres en Brouillon'}
                  {activeTab === 'analytics' && 'Analytics & Performance'}
                  {activeTab === 'equipe' && 'Gestion de l\'Équipe'}
                  {activeTab === 'parametres' && 'Paramètres'}
                </h1>
              </div>
              <p className="font-sans text-[12px] sm:text-[13px] text-[#747878] hidden sm:block">
                {activeTab === 'offres' && 'Gérez le statut de vos biens immobiliers par sélection rapide.'}
                {activeTab === 'brouillons' && 'Consultez vos annonces en préparation, vérifiez et publiez-les.'}
                {activeTab === 'analytics' && 'Visualisez la valeur sous mandat et les indicateurs clés du portefeuille.'}
                {activeTab === 'equipe' && 'Gérez les conseillers et administrateurs autorisés.'}
                {activeTab === 'parametres' && 'Configuration de la plateforme et préférences.'}
              </p>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => onNavigate('ajouter_offre', 'slide_up')}
                className="bg-[#0D0D0D] text-[#F9F7F2] font-sans text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 hover:bg-[#8C6D3E] transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <Plus size={14} />
                <span>Ajouter</span>
              </button>
              <button
                onClick={() => onNavigate('accueil', 'push_back')}
                className="text-[#0D0D0D] font-sans text-xs font-semibold px-2 py-1 border border-black/15 bg-stone-50"
              >
                Site
              </button>
              <button
                onClick={() => {
                  api.logout();
                  onNavigate('accueil', 'push_back');
                }}
                className="text-rose-600 font-sans text-xs font-semibold px-2 py-1 border border-rose-200 bg-rose-50 flex items-center"
                title="Déconnexion"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-between md:justify-end w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Mobile Tab Quick Switchers */}
            <div className="flex md:hidden gap-1 bg-[#f0eee9] p-1 border border-[#8C6D3E]/20 w-full justify-between">
              <button
                onClick={() => setActiveTab('offres')}
                className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider text-center ${
                  activeTab === 'offres' ? 'bg-[#0D0D0D] text-white shadow-xs' : 'text-[#747878]'
                }`}
              >
                Offres
              </button>
              <button
                onClick={() => setActiveTab('brouillons')}
                className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1 ${
                  activeTab === 'brouillons' ? 'bg-[#0D0D0D] text-white shadow-xs' : 'text-[#747878]'
                }`}
              >
                <span>Brouillons</span>
                {brouillons.length > 0 && (
                  <span className="bg-[#C5A059] text-[#0D0D0D] px-1 rounded-full text-[9px]">
                    {brouillons.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 py-1.5 text-[11px] font-bold uppercase tracking-wider text-center ${
                  activeTab === 'analytics' ? 'bg-[#0D0D0D] text-white shadow-xs' : 'text-[#747878]'
                }`}
              >
                Stats
              </button>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Synchroniser avec le serveur backend"
              className="bg-white border border-[#8C6D3E]/30 text-[#0D0D0D] font-sans text-xs font-semibold uppercase tracking-wider px-3.5 py-2.5 hover:bg-[#F9F7F2] transition-colors flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#C5A059]' : 'text-[#8C6D3E]'} />
              <span className="hidden sm:inline">{isRefreshing ? 'Sync...' : 'Actualiser'}</span>
            </button>
            <button
              onClick={() => onNavigate('ajouter_offre', 'slide_up')}
              className="hidden md:flex bg-[#0D0D0D] text-[#F9F7F2] font-sans text-xs font-bold tracking-widest uppercase px-5 py-2.5 hover:bg-[#8C6D3E] transition-colors items-center gap-2 cursor-pointer shadow-sm shrink-0"
            >
              <Plus size={16} />
              <span>Ajouter un bien</span>
            </button>
          </div>
        </header>

        {/* Global Notification Banner */}
        {notification && (
          <div className="bg-[#0D0D0D] text-[#F9F7F2] px-6 py-3 border-b border-[#C5A059] flex items-center justify-between animate-fade-in sticky top-[65px] z-20 shadow-md">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-[#C5A059]" />
              <span className="font-sans text-[14px] font-medium">{notification}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-[#747878] hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Admin Content Area */}
        <main className="p-6 md:p-10 flex-1">
          {/* TAB 1: GESTION OFFRES */}
          {activeTab === 'offres' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Column 1: Urgent */}
              <div className="bg-[#fff5f5] p-4 border border-rose-300 flex flex-col gap-4 min-h-[600px]">
                <div className="flex justify-between items-center pb-2 border-b border-rose-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                    <h2 className="font-sans text-[14px] font-bold text-rose-800 uppercase tracking-wider">
                      Urgent
                    </h2>
                  </div>
                  <span className="bg-white px-2.5 py-0.5 font-sans text-[12px] font-bold text-rose-700 border border-rose-200">
                    {urgent.length}
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {urgent.map((prop) => renderKanbanCard(prop, 'border-rose-300', 'bg-rose-600', 'text-white'))}
                  {urgent.length === 0 && (
                    <div className="text-center py-8 text-[#747878] font-sans text-xs italic">
                      Aucune offre urgente.
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: Disponible */}
              <div className="bg-[#f0eee9] p-4 border border-[#8C6D3E]/20 flex flex-col gap-4 min-h-[600px]">
                <div className="flex justify-between items-center pb-2 border-b border-[#8C6D3E]/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059]" />
                    <h2 className="font-sans text-[14px] font-bold text-[#0D0D0D] uppercase tracking-wider">
                      Disponible
                    </h2>
                  </div>
                  <span className="bg-white px-2.5 py-0.5 font-sans text-[12px] font-bold text-[#0D0D0D] border border-[#8C6D3E]/20">
                    {disponible.length}
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {disponible.map((prop) => renderKanbanCard(prop, 'border-[#8C6D3E]/20', 'bg-[#C5A059]', 'text-[#0D0D0D]'))}
                  {disponible.length === 0 && (
                    <div className="text-center py-8 text-[#747878] font-sans text-xs italic">
                      Aucun bien disponible actuellement.
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3: En cours */}
              <div className="bg-[#f0eee9] p-4 border border-[#8C6D3E]/20 flex flex-col gap-4 min-h-[600px]">
                <div className="flex justify-between items-center pb-2 border-b border-[#8C6D3E]/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8C6D3E]" />
                    <h2 className="font-sans text-[14px] font-bold text-[#0D0D0D] uppercase tracking-wider">
                      En cours
                    </h2>
                  </div>
                  <span className="bg-white px-2.5 py-0.5 font-sans text-[12px] font-bold text-[#0D0D0D] border border-[#8C6D3E]/20">
                    {enCours.length}
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {enCours.map((prop) => renderKanbanCard(prop, 'border-[#8C6D3E]/20', 'bg-[#8C6D3E]', 'text-white'))}
                  {enCours.length === 0 && (
                    <div className="text-center py-8 text-[#747878] font-sans text-xs italic">
                      Aucune transaction en cours actuellement.
                    </div>
                  )}
                </div>
              </div>

              {/* Column 4: Vendu */}
              <div className="bg-[#f0eee9] p-4 border border-[#8C6D3E]/20 flex flex-col gap-4 min-h-[600px]">
                <div className="flex justify-between items-center pb-2 border-b border-[#8C6D3E]/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0D0D0D]" />
                    <h2 className="font-sans text-[14px] font-bold text-[#0D0D0D] uppercase tracking-wider">
                      Vendu
                    </h2>
                  </div>
                  <span className="bg-white px-2.5 py-0.5 font-sans text-[12px] font-bold text-[#0D0D0D] border border-[#8C6D3E]/20">
                    {vendu.length}
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  {vendu.map((prop) => renderKanbanCard(prop, 'border-[#8C6D3E]/20', 'bg-[#0D0D0D]', 'text-white'))}
                  {vendu.length === 0 && (
                    <div className="text-center py-8 text-[#747878] font-sans text-xs italic">
                      Aucun bien classé en vendu.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BROUILLONS (THE NEW REQUESTED TAB) */}
          {activeTab === 'brouillons' && (
            <div className="space-y-8">
              {/* Summary Bar */}
              <div className="bg-white p-6 md:p-8 border border-[#8C6D3E]/20 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FileEdit size={20} className="text-[#C5A059]" />
                    <h2 className="font-serif text-[22px] font-bold text-[#0D0D0D]">
                      Catalogue des Brouillons ({brouillons.length})
                    </h2>
                  </div>
                  <p className="font-sans text-[14px] text-[#747878] mt-1">
                    Ces offres ne sont pas encore visibles pour les clients sur le site public. Vous pouvez les vérifier et les publier en 1 clic.
                  </p>
                </div>

                <button
                  onClick={() => onNavigate('ajouter_offre', 'slide_up')}
                  className="bg-[#0D0D0D] text-[#F9F7F2] font-sans text-xs font-bold tracking-widest uppercase px-5 py-3 hover:bg-[#8C6D3E] transition-colors flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Plus size={15} />
                  <span>Nouveau Brouillon</span>
                </button>
              </div>

              {/* Draft List */}
              {brouillons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {brouillons.map((draft) => (
                    <div
                      key={draft.id}
                      className="bg-white border border-[#8C6D3E]/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                    >
                      {/* Image & Badges */}
                      <div className="relative h-48 w-full bg-[#0D0D0D] overflow-hidden">
                        <img
                          src={draft.imageUrl}
                          alt={draft.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-[#0D0D0D]/90 border border-[#C5A059]/40 text-[#C5A059] font-sans text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 shadow-sm flex items-center gap-1.5">
                          <FileEdit size={12} />
                          <span>Brouillon</span>
                        </div>

                        <div className="absolute top-3 right-3 bg-[#0D0D0D]/80 text-[#F9F7F2] font-sans text-[10px] font-bold uppercase px-2 py-0.5">
                          {draft.type}
                        </div>

                        {/* Photo Count */}
                        {(draft.images?.length ?? 1) > 1 && (
                          <div className="absolute bottom-3 right-3 bg-[#0D0D0D]/90 text-white font-sans text-[11px] font-semibold px-2.5 py-1 flex items-center gap-1.5 border border-[#8C6D3E]/40">
                            <ImageIcon size={12} className="text-[#C5A059]" />
                            <span>{draft.images?.length} Photos</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-grow flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-baseline gap-2">
                            <h3 className="font-serif text-[19px] font-bold text-[#0D0D0D] leading-snug">
                              {draft.title}
                            </h3>
                          </div>
                          <p className="font-serif text-[18px] font-bold text-[#C5A059]">
                            {draft.price}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 font-sans text-[13px] text-[#747878] pt-1">
                            <span className="flex items-center gap-1">
                              <MapPin size={14} className="text-[#C5A059]" />
                              {draft.commune}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Maximize size={14} />
                              {draft.surface} m²
                            </span>
                            {draft.bedrooms && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Bed size={14} />
                                  {draft.bedrooms} ch.
                                </span>
                              </>
                            )}
                          </div>

                          <p className="font-sans text-[13px] text-[#747878] line-clamp-2 leading-relaxed pt-1">
                            {draft.description}
                          </p>

                          {draft.amenities && draft.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {draft.amenities.slice(0, 3).map((am, i) => (
                                <span
                                  key={i}
                                  className="bg-[#F9F7F2] text-[#0D0D0D] font-sans text-[10px] px-2 py-0.5 border border-[#8C6D3E]/20"
                                >
                                  {am}
                                </span>
                              ))}
                              {draft.amenities.length > 3 && (
                                <span className="text-[10px] text-[#747878] font-sans self-center">
                                  +{draft.amenities.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 pt-3 border-t border-[#f0eee9]">
                          {/* Publish button */}
                          <button
                            onClick={() => handlePublishDraft(draft)}
                            className="w-full bg-[#0D0D0D] text-[#F9F7F2] hover:bg-[#C5A059] hover:text-[#0D0D0D] font-sans text-xs font-bold tracking-widest uppercase py-3 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                          >
                            <Send size={14} />
                            <span>Publier cette offre</span>
                          </button>

                          <div className="grid grid-cols-3 gap-2">
                            {/* Edit draft → AjouterOffreScreen complet */}
                            <button
                              onClick={() => onEditProperty ? onEditProperty(draft) : setEditingProperty(draft)}
                              className="border border-[#8C6D3E]/40 text-[#8C6D3E] hover:bg-[#C5A059] hover:text-[#0D0D0D] font-sans text-[11px] font-semibold py-2 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              title="Modifier ce brouillon (formulaire complet)"
                            >
                              <Edit3 size={13} />
                              <span>Modifier</span>
                            </button>

                            {/* Preview with Carousel */}
                            <button
                              onClick={() => setPreviewProperty(draft)}
                              className="border border-[#8C6D3E]/30 text-[#0D0D0D] hover:bg-[#F9F7F2] font-sans text-[11px] font-semibold py-2 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              title="Aperçu carrousel"
                            >
                              <Eye size={13} className="text-[#C5A059]" />
                              <span>Aperçu</span>
                            </button>

                            {/* Delete draft */}
                            <button
                              onClick={() => handleDeleteDraft(draft.id, draft.title)}
                              className="border border-rose-200 text-rose-600 hover:bg-rose-50 font-sans text-[11px] font-semibold py-2 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                              title="Supprimer définitivement"
                            >
                              <Trash2 size={13} />
                              <span>Supprimer</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 border border-[#8C6D3E]/20 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-[#F9F7F2] border border-[#8C6D3E]/30 flex items-center justify-center mx-auto text-[#C5A059]">
                    <FileEdit size={28} />
                  </div>
                  <h3 className="font-serif text-[22px] font-bold text-[#0D0D0D]">
                    Aucun brouillon pour le moment
                  </h3>
                  <p className="font-sans text-[14px] text-[#747878] leading-relaxed max-w-md mx-auto">
                    Toutes vos annonces sont actuellement publiées sur le site ou en cours de transaction. Vous pouvez créer un nouveau bien et l'enregistrer en brouillon à tout moment.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate('ajouter_offre', 'slide_up')}
                      className="bg-[#C5A059] text-[#0D0D0D] font-sans text-xs font-bold tracking-widest uppercase px-6 py-3.5 hover:bg-[#8C6D3E] hover:text-white transition-colors cursor-pointer"
                    >
                      Créer un nouveau bien
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="bg-white p-8 border border-[#8C6D3E]/20 shadow-sm space-y-8">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 size={22} className="text-[#C5A059]" />
                  <h2 className="font-serif text-[24px] font-bold text-[#0D0D0D]">Statistiques du Portefeuille en Temps Réel</h2>
                </div>
                <p className="font-sans text-[13px] text-[#747878] mt-1">
                  Les métriques ci-dessous sont recalculées instantanément à chaque ajout, modification de statut ou suppression de bien.
                </p>
              </div>

              {/* Top Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-5 bg-[#F9F7F2] border border-[#8C6D3E]/20">
                  <span className="font-sans text-[11px] text-[#747878] uppercase tracking-wider block mb-1">Valeur Totale Sous Mandat</span>
                  <p className="font-serif text-[24px] md:text-[26px] font-bold text-[#0D0D0D]">
                    $ {totalMandateValue.toLocaleString()}
                  </p>
                  <span className="font-sans text-[11px] text-[#747878] mt-1 block">
                    Tous statuts confondus ({properties.length} biens)
                  </span>
                </div>

                <div className="p-5 bg-[#F9F7F2] border border-[#8C6D3E]/20">
                  <span className="font-sans text-[11px] text-[#747878] uppercase tracking-wider block mb-1">Valeur Biens Actifs</span>
                  <p className="font-serif text-[24px] md:text-[26px] font-bold text-[#C5A059]">
                    $ {activeMandateValue.toLocaleString()}
                  </p>
                  <span className="font-sans text-[11px] text-[#747878] mt-1 block">
                    {publishedCount} offres disponibles & en cours
                  </span>
                </div>

                <div className="p-5 bg-[#F9F7F2] border border-[#8C6D3E]/20">
                  <span className="font-sans text-[11px] text-[#747878] uppercase tracking-wider block mb-1">Prix Moyen Actif</span>
                  <p className="font-serif text-[24px] md:text-[26px] font-bold text-[#0D0D0D]">
                    $ {avgPrice.toLocaleString()}
                  </p>
                  <span className="font-sans text-[11px] text-[#747878] mt-1 block">
                    Par bien publié sur le marché
                  </span>
                </div>

                <div className="p-5 bg-[#F9F7F2] border border-[#8C6D3E]/20">
                  <span className="font-sans text-[11px] text-[#747878] uppercase tracking-wider block mb-1">Taux de Réalisation</span>
                  <p className="font-serif text-[24px] md:text-[26px] font-bold text-[#0D0D0D]">
                    {conversionRate}%
                  </p>
                  <span className="font-sans text-[11px] text-[#747878] mt-1 block">
                    {vendu.length} vendus & {enCours.length} sous offre
                  </span>
                </div>
              </div>

              {/* Status Breakdown Table */}
              <div className="border border-[#8C6D3E]/20 p-6 bg-[#faf9f6]">
                <h3 className="font-serif text-[18px] font-bold text-[#0D0D0D] mb-4">
                  Répartition du Portefeuille par Statut
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 font-sans text-[13px]">
                  <div className="bg-white p-3 border border-rose-200">
                    <span className="text-rose-700 font-semibold block text-[11px] uppercase">Urgents</span>
                    <span className="font-serif text-[20px] font-bold text-rose-700">{urgent.length}</span>
                  </div>
                  <div className="bg-white p-3 border border-[#8C6D3E]/10">
                    <span className="text-[#747878] block text-[11px] uppercase">Disponibles</span>
                    <span className="font-serif text-[20px] font-bold text-[#0D0D0D]">{disponible.length}</span>
                  </div>
                  <div className="bg-white p-3 border border-[#8C6D3E]/10">
                    <span className="text-[#747878] block text-[11px] uppercase">En cours / Offre</span>
                    <span className="font-serif text-[20px] font-bold text-[#8C6D3E]">{enCours.length}</span>
                  </div>
                  <div className="bg-white p-3 border border-[#8C6D3E]/10">
                    <span className="text-[#747878] block text-[11px] uppercase">Vendus</span>
                    <span className="font-serif text-[20px] font-bold text-[#0D0D0D]">{vendu.length}</span>
                  </div>
                  <div className="bg-white p-3 border border-[#8C6D3E]/10">
                    <span className="text-[#747878] block text-[11px] uppercase">Brouillons</span>
                    <span className="font-serif text-[20px] font-bold text-[#C5A059]">{brouillons.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EQUIPE */}
          {activeTab === 'equipe' && (
            <div className="bg-white p-8 border border-[#8C6D3E]/20 shadow-sm space-y-4">
              <h2 className="font-serif text-[24px] font-bold text-[#0D0D0D]">Équipe d'Administration</h2>
              <p className="font-sans text-[14px] text-[#747878]">Membres autorisés à gérer le catalogue, créer des brouillons et publier les mandats.</p>
              <div className="divide-y divide-[#f0eee9]">
                <div className="py-3 flex justify-between items-center font-sans text-[14px]">
                  <div>
                    <span className="font-semibold text-[#0D0D0D]">Direction Générale</span>
                    <span className="block text-[12px] text-[#747878]">admin@gbusinessimmo.com</span>
                  </div>
                  <span className="bg-[#C5A059]/20 text-[#8C6D3E] font-bold text-[11px] px-2.5 py-1 uppercase tracking-wider">Super Admin</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PARAMETRES */}
          {activeTab === 'parametres' && (
            <div className="bg-white p-8 border border-[#8C6D3E]/20 shadow-sm space-y-4">
              <h2 className="font-serif text-[24px] font-bold text-[#0D0D0D]">Paramètres de l'Espace Admin</h2>
              <p className="font-sans text-[14px] text-[#747878]">Ajustez les notifications, les devises ($ USD) et les accès sécurisés.</p>
            </div>
          )}
        </main>
      </div>

      {/* Property / Draft Carousel Preview Modal */}
      {previewProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white max-w-3xl w-full p-6 md:p-8 relative border border-[#8C6D3E]/20 shadow-2xl max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setPreviewProperty(null)}
              className="absolute top-4 right-4 p-2 text-[#0D0D0D] hover:text-[#C5A059] transition-colors z-20 bg-white/90 rounded-full cursor-pointer shadow-sm"
            >
              <X size={24} />
            </button>

            {/* Carousel */}
            <div className="mb-6">
              <PropertyImageCarousel
                images={
                  previewProperty.images && previewProperty.images.length > 0
                    ? previewProperty.images
                    : [previewProperty.imageUrl]
                }
                title={previewProperty.title}
                aspectRatio="wide"
                showThumbnails={true}
                allowFullscreen={true}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h2 className="font-serif text-[26px] md:text-[30px] text-[#0D0D0D] font-bold">
                {previewProperty.title}
              </h2>
              <span className="bg-[#0D0D0D] text-[#C5A059] border border-[#C5A059]/40 font-sans font-bold text-[10px] tracking-widest uppercase px-3 py-1">
                {previewProperty.status}
              </span>
            </div>

            <p className="font-serif text-[24px] md:text-[28px] text-[#C5A059] font-bold mb-4">
              {previewProperty.price}
            </p>

            <p className="font-sans text-[15px] text-[#747878] leading-relaxed mb-6">
              {previewProperty.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-b border-[#f0eee9] py-4 mb-6 font-sans text-[14px]">
              <div>
                <span className="text-[#747878] block text-xs uppercase tracking-wider">Localisation</span>
                <span className="font-semibold text-[#0D0D0D]">{previewProperty.location}</span>
              </div>
              <div>
                <span className="text-[#747878] block text-xs uppercase tracking-wider">Surface</span>
                <span className="font-semibold text-[#0D0D0D]">{previewProperty.surface} m²</span>
              </div>
              <div>
                <span className="text-[#747878] block text-xs uppercase tracking-wider">Type</span>
                <span className="font-semibold text-[#0D0D0D]">{previewProperty.type}</span>
              </div>
              <div>
                <span className="text-[#747878] block text-xs uppercase tracking-wider">Chambres</span>
                <span className="font-semibold text-[#0D0D0D]">
                  {previewProperty.bedrooms || previewProperty.rooms || 4}
                </span>
              </div>
            </div>

            {previewProperty.amenities && (
              <div className="mb-6">
                <span className="font-sans text-xs font-bold tracking-widest text-[#0D0D0D] uppercase block mb-2">
                  Prestations
                </span>
                <div className="flex flex-wrap gap-2">
                  {previewProperty.amenities.map((item, idx) => (
                    <span
                      key={idx}
                      className="bg-[#F9F7F2] text-[#0D0D0D] font-sans text-xs px-3 py-1 border border-[#8C6D3E]/20"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {previewProperty.status === 'Brouillon' && (
                <button
                  onClick={() => {
                    handlePublishDraft(previewProperty);
                    setPreviewProperty(null);
                  }}
                  className="flex-1 bg-[#C5A059] text-[#0D0D0D] hover:bg-[#8C6D3E] hover:text-white font-sans font-bold text-xs tracking-widest uppercase py-4 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Send size={16} />
                  <span>Publier cette offre maintenant</span>
                </button>
              )}
              <button
                onClick={() => setPreviewProperty(null)}
                className="px-6 py-4 border border-[#0D0D0D] text-[#0D0D0D] font-sans font-semibold text-xs tracking-widest uppercase hover:bg-[#F9F7F2] cursor-pointer"
              >
                Fermer l'aperçu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property / Draft Edit Modal */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white max-w-2xl w-full p-6 md:p-8 relative border border-[#8C6D3E]/30 shadow-2xl max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setEditingProperty(null)}
              className="absolute top-4 right-4 p-2 text-[#0D0D0D] hover:text-[#C5A059] transition-colors z-20 bg-white/90 rounded-full cursor-pointer shadow-sm"
              title="Fermer"
            >
              <X size={22} />
            </button>

            <div className="flex items-center gap-2.5 border-b border-[#f0eee9] pb-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#C5A059]/15 flex items-center justify-center text-[#8C6D3E]">
                <Edit3 size={20} />
              </div>
              <div>
                <h2 className="font-serif text-[22px] md:text-[24px] font-bold text-[#0D0D0D] leading-tight">
                  Modifier l'offre
                </h2>
                <p className="font-sans text-[12px] text-[#747878]">
                  {editingProperty.status === 'Brouillon' ? 'Brouillon en cours' : 'Offre enregistrée'} • Réf: {editingProperty.id}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="font-sans text-[11px] font-bold tracking-widest text-[#747878] uppercase block mb-1">
                  Titre de l'annonce
                </label>
                <input
                  type="text"
                  value={editingProperty.title}
                  onChange={(e) => setEditingProperty({ ...editingProperty, title: e.target.value })}
                  className="minimal-input text-[15px] text-[#0D0D0D] w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-sans text-[11px] font-bold tracking-widest text-[#747878] uppercase block mb-1">
                    Statut
                  </label>
                  <select
                    value={editingProperty.status}
                    onChange={(e) => setEditingProperty({ ...editingProperty, status: e.target.value as PropertyStatus })}
                    className="w-full bg-[#F9F7F2] border border-[#8C6D3E]/30 p-2 font-sans text-[13px] outline-none text-[#0D0D0D] cursor-pointer"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="Disponible">Disponible</option>
                    <option value="En cours">En cours</option>
                    <option value="Vendu">Vendu</option>
                    <option value="Brouillon">Brouillon</option>
                  </select>
                </div>

                <div>
                  <label className="font-sans text-[11px] font-bold tracking-widest text-[#747878] uppercase block mb-1">
                    Type de bien
                  </label>
                  <select
                    value={editingProperty.type}
                    onChange={(e) => setEditingProperty({ ...editingProperty, type: e.target.value as any })}
                    className="w-full bg-[#F9F7F2] border border-[#8C6D3E]/30 p-2 font-sans text-[13px] outline-none text-[#0D0D0D] cursor-pointer"
                  >
                    <option value="Villa">Villa</option>
                    <option value="Résidentiel">Résidentiel Premium</option>
                    <option value="Commercial">Espace Commercial</option>
                    <option value="Hôtel Particulier">Hôtel Particulier</option>
                  </select>
                </div>

                <div>
                  <label className="font-sans text-[11px] font-bold tracking-widest text-[#747878] uppercase block mb-1">
                    Prix (USD)
                  </label>
                  <input
                    type="number"
                    value={editingProperty.numericPrice || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 0;
                      setEditingProperty({
                        ...editingProperty,
                        numericPrice: val,
                        price: `$ ${val.toLocaleString()}`
                      });
                    }}
                    className="minimal-input text-[14px] text-[#0D0D0D] w-full"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-sans text-[11px] font-bold tracking-widest text-[#747878] uppercase block mb-1">
                    Commune
                  </label>
                  <input
                    type="text"
                    value={editingProperty.commune}
                    onChange={(e) => setEditingProperty({ ...editingProperty, commune: e.target.value, location: `Kinshasa, ${e.target.value}` })}
                    className="minimal-input text-[14px] text-[#0D0D0D] w-full"
                    required
                  />
                </div>

                <div>
                  <label className="font-sans text-[11px] font-bold tracking-widest text-[#747878] uppercase block mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={editingProperty.address || ''}
                    onChange={(e) => setEditingProperty({ ...editingProperty, address: e.target.value })}
                    placeholder="ex: Boulevard du 30 Juin"
                    className="minimal-input text-[14px] text-[#0D0D0D] w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-sans text-[11px] font-bold tracking-widest text-[#747878] uppercase block mb-1">
                    Surface (m²)
                  </label>
                  <input
                    type="number"
                    value={editingProperty.surface || ''}
                    onChange={(e) => setEditingProperty({ ...editingProperty, surface: parseInt(e.target.value, 10) || 0 })}
                    className="minimal-input text-[14px] text-[#0D0D0D] w-full"
                  />
                </div>

                <div>
                  <label className="font-sans text-[11px] font-bold tracking-widest text-[#747878] uppercase block mb-1">
                    Chambres
                  </label>
                  <input
                    type="number"
                    value={editingProperty.bedrooms || ''}
                    onChange={(e) => setEditingProperty({ ...editingProperty, bedrooms: parseInt(e.target.value, 10) || 0 })}
                    className="minimal-input text-[14px] text-[#0D0D0D] w-full"
                  />
                </div>

                <div>
                  <label className="font-sans text-[11px] font-bold tracking-widest text-[#747878] uppercase block mb-1">
                    Pièces totales
                  </label>
                  <input
                    type="number"
                    value={editingProperty.rooms || ''}
                    onChange={(e) => setEditingProperty({ ...editingProperty, rooms: parseInt(e.target.value, 10) || 0 })}
                    className="minimal-input text-[14px] text-[#0D0D0D] w-full"
                  />
                </div>
              </div>

              <div>
                <label className="font-sans text-[11px] font-bold tracking-widest text-[#747878] uppercase block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingProperty.description}
                  onChange={(e) => setEditingProperty({ ...editingProperty, description: e.target.value })}
                  className="minimal-input text-[14px] text-[#0D0D0D] w-full resize-none"
                />
              </div>

              <div>
                <label className="font-sans text-[11px] font-bold tracking-widest text-[#747878] uppercase block mb-1">
                  Image principale (URL)
                </label>
                <div className="flex gap-3 items-center">
                  <div className="w-14 h-14 bg-[#0D0D0D] shrink-0 border border-[#8C6D3E]/30 overflow-hidden">
                    <img
                      src={resolveImageUrl(editingProperty.imageUrl)}
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_IMAGE_URL;
                      }}
                    />
                  </div>
                  <input
                    type="text"
                    value={editingProperty.imageUrl}
                    onChange={(e) => setEditingProperty({ ...editingProperty, imageUrl: e.target.value })}
                    className="minimal-input text-[13px] text-[#0D0D0D] flex-1"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#f0eee9]">
                {onEditProperty && (
                  <button
                    type="button"
                    onClick={() => {
                      const toEdit = editingProperty;
                      setEditingProperty(null);
                      onEditProperty(toEdit);
                    }}
                    className="w-full sm:w-auto text-[#8C6D3E] hover:text-[#0D0D0D] font-sans text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer py-2"
                  >
                    <ExternalLink size={14} />
                    <span>Ouvrir dans l'éditeur complet</span>
                  </button>
                )}

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingProperty(null)}
                    className="px-4 py-2.5 border border-stone-300 text-stone-700 hover:bg-stone-50 font-sans text-xs font-semibold uppercase tracking-wider cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0D0D0D] text-[#F9F7F2] hover:bg-[#8C6D3E] font-sans text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                  >
                    <Save size={15} />
                    <span>Enregistrer</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

