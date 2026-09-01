import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ScreenId, TransitionType, Property } from './types';
import { INITIAL_PROPERTIES } from './data';
import { AccueilScreen } from './screens/AccueilScreen';
import { ServicesScreen } from './screens/ServicesScreen';
import { AboutScreen } from './screens/AboutScreen';
import { OffresScreen } from './screens/OffresScreen';
import { ContactScreen } from './screens/ContactScreen';
import { DashboardAdminScreen } from './screens/DashboardAdminScreen';
import { AjouterOffreScreen } from './screens/AjouterOffreScreen';
import { ConnexionScreen } from './screens/ConnexionScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('accueil');
  const [transitionType, setTransitionType] = useState<TransitionType>('none');
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);

  const handleNavigate = (screen: ScreenId, transition: TransitionType = 'push') => {
    setTransitionType(transition);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddProperty = (newProperty: Property) => {
    setProperties((prev) => [newProperty, ...prev]);
  };

  const handleUpdateStatus = (
    propertyId: string,
    newStatus: 'Disponible' | 'En cours' | 'Vendu' | 'Brouillon' | 'Urgent'
  ) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, status: newStatus } : p))
    );
  };

  const handleDeleteProperty = (propertyId: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
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
          key={currentScreen}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{ duration: transitionType === 'none' ? 0 : 0.35, ease: 'easeInOut' }}
          className="w-full min-h-screen"
        >
          {currentScreen === 'accueil' && (
            <AccueilScreen onNavigate={handleNavigate} properties={properties} />
          )}
          {currentScreen === 'services' && (
            <ServicesScreen onNavigate={handleNavigate} />
          )}
          {currentScreen === 'about' && (
            <AboutScreen onNavigate={handleNavigate} />
          )}
          {currentScreen === 'offres' && (
            <OffresScreen onNavigate={handleNavigate} properties={properties} />
          )}
          {currentScreen === 'contact' && (
            <ContactScreen onNavigate={handleNavigate} />
          )}
          {currentScreen === 'dashboard' && (
            <DashboardAdminScreen
              onNavigate={handleNavigate}
              properties={properties}
              onUpdateStatus={handleUpdateStatus}
              onDeleteProperty={handleDeleteProperty}
            />
          )}
          {currentScreen === 'ajouter_offre' && (
            <AjouterOffreScreen
              onNavigate={handleNavigate}
              onAddProperty={handleAddProperty}
            />
          )}
          {currentScreen === 'login' && (
            <ConnexionScreen onNavigate={handleNavigate} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
