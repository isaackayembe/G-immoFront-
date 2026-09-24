import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useNavigationType,
  useParams,
} from 'react-router-dom';
import { ScreenId, TransitionType, Property, PropertyStatus } from './types';
import api from './services/api';
import { DashboardTab, pathFor, editPropertyPath, SCREEN_PATHS } from './routes';
import { AccueilScreen } from './screens/AccueilScreen';
import { ServicesScreen } from './screens/ServicesScreen';
import { AboutScreen } from './screens/AboutScreen';
import { OffresScreen } from './screens/OffresScreen';
import { PropertyDetailScreen } from './screens/PropertyDetailScreen';
import { ContactScreen } from './screens/ContactScreen';
import { DashboardAdminScreen } from './screens/DashboardAdminScreen';
import { AjouterOffreScreen } from './screens/AjouterOffreScreen';
import { ConnexionScreen } from './screens/ConnexionScreen';
import { NotFoundScreen } from './screens/NotFoundScreen';

/**
 * Fusionne les données du backend avec l'état local.
 * - Conserve le statut optimiste pour les propriétés récemment modifiées localement
 * - Conserve les propriétés locales uniquement (brouillons créés hors-ligne)
 */
function mergeWithOptimistic(
  backendData: Property[],
  localData: Property[],
  optimisticMap: Map<string, PropertyStatus>
): Property[] {
  const backendIds = new Set(backendData.map((p) => p.id));
  // Propriétés uniquement locales (pas encore dans le backend)
  const localOnly = localData.filter((p) => !backendIds.has(p.id));
  // Appliquer les statuts optimistes sur les données backend
  const merged = backendData.map((p) => {
    const optimisticStatus = optimisticMap.get(p.id);
    return optimisticStatus ? { ...p, status: optimisticStatus } : p;
  });
  return [...merged, ...localOnly];
}

/** 🔒 Redirige vers /connexion si l'utilisateur n'est pas authentifié, puis le ramène ici après login. */
function RequireAuth({ children }: { children: React.ReactElement }) {
  const location = useLocation();
  if (!api.isAuthenticated()) {
    return <Navigate to={SCREEN_PATHS.login} replace state={{ from: location, transition: 'none' }} />;
  }
  return children;
}

/** Charge le bien à modifier depuis l'URL (/admin/offres/:id/modifier), même après un rafraîchissement. */
function EditPropertyRoute({
  properties,
  renderForm,
}: {
  properties: Property[];
  renderForm: (property: Property) => React.ReactElement;
}) {
  const { id = '' } = useParams();
  const fromList = properties.find((p) => p.id === id);
  const [fetched, setFetched] = useState<Property | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (fromList) return;
    let isMounted = true;
    api
      .getPropertyById(id)
      .then((p) => isMounted && setFetched(p))
      .catch(() => isMounted && setNotFound(true));
    return () => {
      isMounted = false;
    };
  }, [id, fromList]);

  const property = fromList || fetched;
  if (notFound) return <Navigate to={SCREEN_PATHS.dashboard} replace />;
  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans text-[13px] uppercase tracking-widest text-[#747878]">
        Chargement du bien…
      </div>
    );
  }
  // key : le formulaire initialise son état une seule fois, on le recrée si le bien change
  return React.cloneElement(renderForm(property), { key: property.id });
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [properties, setProperties] = useState<Property[]>([]);

  // 🔒 Tracking des statuts modifiés localement pour éviter qu'un GET ne les écrase
  const optimisticStatuses = React.useRef<Map<string, PropertyStatus>>(new Map());

  // Charge les données initiales depuis le backend
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        const data = api.isAuthenticated()
          ? await api.getAdminProperties().catch(() => api.getProperties())
          : await api.getProperties();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setProperties(prev => mergeWithOptimistic(data, prev, optimisticStatuses.current));
        }
      } catch (err) {
        console.warn('Backend API hors-ligne ou non configuré. Les propriétés seront chargées dès la connexion.', err);
      }
    };
    fetchInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Remonte en haut de page à chaque changement de page (sauf retour arrière du navigateur)
  useEffect(() => {
    if (navigationType !== 'POP') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname, navigationType]);

  // L'animation est transmise dans l'état de navigation ; bouton retour/avant du navigateur → pas d'animation
  const transitionType: TransitionType =
    (location.state as { transition?: TransitionType } | null)?.transition ??
    (navigationType === 'POP' ? 'none' : 'push');

  const handleNavigate = (screen: ScreenId, transition: TransitionType = 'push', tab?: DashboardTab) => {
    navigate(pathFor(screen, tab), { state: { transition } });
  };

  const handleEditProperty = (prop: Property) => {
    navigate(editPropertyPath(prop.id), { state: { transition: 'slide_up' } });
  };

  const handleAddProperty = (newProperty: Property) => {
    setProperties((prev) => [newProperty, ...prev]);
  };

  const handleUpdateStatus = async (
    propertyId: string,
    newStatus: PropertyStatus
  ) => {
    // ⚡ Mise à jour immédiate optimiste de l'état
    optimisticStatuses.current.set(propertyId, newStatus);
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, status: newStatus } : p))
    );
    try {
      await api.updatePropertyStatus(propertyId, newStatus);
      // Après confirmation backend, on garde quand même le suivi 5s pour éviter les refresh immédiats
      setTimeout(() => optimisticStatuses.current.delete(propertyId), 5000);
    } catch (err) {
      console.warn('Erreur mise à jour statut API backend:', err);
      // En cas d'erreur, on laisse le suivi en place (l'état local est la référence)
    }
  };

  const handleUpdateProperty = async (updatedProperty: Property) => {
    // ⚡ Mise à jour immédiate optimiste de l'offre
    setProperties((prev) =>
      prev.map((p) => (p.id === updatedProperty.id ? updatedProperty : p))
    );
    try {
      await api.updateProperty(updatedProperty.id, {
        title: updatedProperty.title,
        numericPrice: updatedProperty.numericPrice,
        commune: updatedProperty.commune,
        address: updatedProperty.address || undefined,
        type: updatedProperty.type,
        status: updatedProperty.status,
        surface: updatedProperty.surface,
        description: updatedProperty.description,
      });
    } catch (err) {
      console.warn('Erreur mise à jour API backend:', err);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    // ⚡ Suppression immédiate de la liste
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
    try {
      await api.deleteProperty(propertyId);
    } catch (err) {
      console.warn('Erreur suppression bien API backend:', err);
    }
  };

  const handleRefreshProperties = async () => {
    try {
      const data = api.isAuthenticated()
        ? await api.getAdminProperties().catch(() => api.getProperties())
        : await api.getProperties();
      if (Array.isArray(data) && data.length > 0) {
        // 🔀 Fusion intelligente : conserve les statuts optimistes + les brouillons locaux
        setProperties((prev) => mergeWithOptimistic(data, prev, optimisticStatuses.current));
      }
    } catch (err) {
      console.warn('Erreur rafraîchissement API:', err);
    }
  };

  // Motion animation variants based on transition spec
  const getVariants = () => {
    switch (transitionType) {
      case 'push':
        return {
          initial: { x: '100%', opacity: 0 },
          animate: { x: '0%', opacity: 1 },
          exit: { x: '-20%', opacity: 0 },
        };
      case 'push_back':
        return {
          initial: { x: '-100%', opacity: 0 },
          animate: { x: '0%', opacity: 1 },
          exit: { x: '20%', opacity: 0 },
        };
      case 'slide_up':
        return {
          initial: { y: '100%', opacity: 0 },
          animate: { y: '0%', opacity: 1 },
          exit: { y: '-10%', opacity: 0 },
        };
      case 'none':
      default:
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 },
        };
    }
  };

  const variants = getVariants();

  return (
    <div className="min-h-screen bg-[#fbf9f4] w-full overflow-x-hidden font-sans">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{ duration: transitionType === 'none' ? 0 : 0.35, ease: 'easeInOut' }}
          className="w-full min-h-screen"
        >
          <Routes location={location}>
            <Route path="/" element={<AccueilScreen onNavigate={handleNavigate} properties={properties} />} />
            <Route path="/services" element={<ServicesScreen onNavigate={handleNavigate} />} />
            <Route path="/a-propos" element={<AboutScreen onNavigate={handleNavigate} />} />
            <Route path="/offres" element={<OffresScreen onNavigate={handleNavigate} properties={properties} />} />
            <Route path="/offres/:id" element={<PropertyDetailScreen onNavigate={handleNavigate} properties={properties} />} />
            <Route path="/contact" element={<ContactScreen onNavigate={handleNavigate} />} />
            <Route path="/connexion" element={<ConnexionScreen onNavigate={handleNavigate} />} />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <DashboardAdminScreen
                    onNavigate={handleNavigate}
                    properties={properties}
                    onUpdateStatus={handleUpdateStatus}
                    onDeleteProperty={handleDeleteProperty}
                    onUpdateProperty={handleUpdateProperty}
                    onRefreshProperties={handleRefreshProperties}
                    onEditProperty={handleEditProperty}
                  />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/ajouter"
              element={
                <RequireAuth>
                  <AjouterOffreScreen
                    onNavigate={handleNavigate}
                    onAddProperty={handleAddProperty}
                    onUpdateProperty={handleUpdateProperty}
                    propertyToEdit={null}
                    existingProperties={properties}
                  />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/offres/:id/modifier"
              element={
                <RequireAuth>
                  <EditPropertyRoute
                    properties={properties}
                    renderForm={(property) => (
                      <AjouterOffreScreen
                        onNavigate={handleNavigate}
                        onAddProperty={handleAddProperty}
                        onUpdateProperty={handleUpdateProperty}
                        propertyToEdit={property}
                        existingProperties={properties}
                      />
                    )}
                  />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFoundScreen onNavigate={handleNavigate} />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
