import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion, Variants } from 'motion/react';
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
import { setupScrollReveal } from './scrollReveal';
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

/* ───────── Transition de page : fondu simple ─────────
 * La page qui part s'efface, la nouvelle apparaît. Seule l'opacité est animée (aucun transform),
 * donc la barre de navigation fixe de l'accueil reste en place. Les variantes sont des fonctions :
 * elles lisent le mode « instantané » au moment de l'animation, y compris pour la page qui sort. */
const pageFade = (instantRef: React.MutableRefObject<boolean>): Variants => ({
  initial: () => ({ opacity: instantRef.current ? 1 : 0 }),
  animate: () => ({ opacity: 1, transition: { duration: instantRef.current ? 0 : 0.35, ease: 'easeOut' } }),
  exit: () => ({ opacity: instantRef.current ? 1 : 0, transition: { duration: instantRef.current ? 0 : 0.2, ease: 'easeIn' } }),
});

/** Accepte une liste brute ou une réponse paginée DRF ({ results: [...] }). */
function toPropertyList(data: unknown): Property[] {
  if (Array.isArray(data)) return data as Property[];
  const results = (data as { results?: unknown } | null)?.results;
  return Array.isArray(results) ? (results as Property[]) : [];
}

/**
 * Charge les biens depuis le backend.
 * Admin connecté : liste complète (brouillons inclus). Si elle échoue (session expirée…), revient vide
 * ou dans un format inattendu, on se rabat sur la liste publique pour que le site affiche toujours les offres.
 */
async function loadProperties(): Promise<Property[]> {
  if (api.isAuthenticated()) {
    try {
      const adminList = toPropertyList(await api.getAdminProperties());
      if (adminList.length > 0) return adminList;
      console.warn('Liste admin vide ou inattendue : chargement de la liste publique.');
    } catch (err) {
      console.warn('Liste admin indisponible (session expirée ?) : chargement de la liste publique.', err);
    }
  }
  return toPropertyList(await api.getProperties());
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
        const data = await loadProperties();
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

  // (La remontée en haut de page se fait à la fin du rideau, voir onExitComplete plus bas.)

  // L'animation est transmise dans l'état de navigation ; bouton retour/avant du navigateur sans état → pas d'animation
  const stateTransition = (location.state as { transition?: TransitionType } | null)?.transition;
  const reduceMotion = useReducedMotion();
  const transitionType: TransitionType | 'instant' =
    stateTransition ?? (navigationType === 'POP' ? 'instant' : 'push');

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
      const data = await loadProperties();
      if (Array.isArray(data) && data.length > 0) {
        // 🔀 Fusion intelligente : conserve les statuts optimistes + les brouillons locaux
        setProperties((prev) => mergeWithOptimistic(data, prev, optimisticStatuses.current));
      }
    } catch (err) {
      console.warn('Erreur rafraîchissement API:', err);
    }
  };

  // Fondu instantané : retour arrière du navigateur sans état, ou mouvement réduit demandé
  const instantRef = React.useRef(false);
  instantRef.current = !!reduceMotion || transitionType === 'instant';
  const pageVariants = React.useMemo(() => pageFade(instantRef), []);
  const navTypeRef = React.useRef(navigationType);
  navTypeRef.current = navigationType;
  // Apparition progressive du contenu au défilement (pages publiques), relancée à chaque nouvelle page
  const revealRef = React.useCallback((el: HTMLDivElement | null) => (el ? setupScrollReveal(el) : undefined), []);

  return (
    <div className="min-h-screen bg-[#fbf9f4] w-full overflow-x-hidden font-sans">
      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={() => {
          // Page cachée par le rideau : on remonte en haut instantanément (sauf retour arrière du navigateur)
          if (navTypeRef.current !== 'POP') window.scrollTo({ top: 0, behavior: 'instant' });
        }}
      >
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          ref={revealRef}
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
