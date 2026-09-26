import React, { useState, useEffect } from 'react';
import { ScreenId, TransitionType } from '../types';
import { pathFor } from '../routes';
import { LOGO_URL } from '../config';
import api from '../services/api';
import { Menu, X, LogIn, LayoutDashboard, LogOut } from 'lucide-react';

interface HeaderProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
  hideLogin?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentScreen, onNavigate, hideLogin = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(() => api.isAuthenticated());
  // Accueil : la barre se pose sur la photo du hero (transparente), puis devient du verre sombre au défilement
  const overlay = currentScreen === 'accueil';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [overlay]);

  useEffect(() => {
    const handleAuthChange = () => setIsAuth(api.isAuthenticated());
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Couleurs : claires sur la photo de l'accueil, habituelles ailleurs
  const linkActive = overlay
    ? 'text-[#F9F7F2] border-b-2 border-[#C5A059] font-bold'
    : 'text-[#0D0D0D] border-b-2 border-[#C5A059] font-bold';
  const linkIdle = overlay ? 'text-[#F9F7F2]/80 hover:text-[#F9F7F2]' : 'text-[#747878] hover:text-[#0D0D0D]';
  const drawerActive = overlay ? 'bg-[#C5A059]/15 text-[#D9BD85]' : 'bg-[#C5A059]/15 text-[#8C6D3E]';
  const drawerIdle = overlay ? 'text-[#F9F7F2] hover:bg-white/5' : 'text-[#0D0D0D] hover:bg-black/5';

  const handleNavClick = (screen: ScreenId, transition: TransitionType = 'push') => {
    setMobileMenuOpen(false);
    onNavigate(screen, transition);
  };

  return (
    <header
      className={
        overlay
          ? `w-full top-0 left-0 right-0 fixed z-50 text-[#F9F7F2] transition-[background-color,box-shadow,backdrop-filter] duration-500 ${
              scrolled || mobileMenuOpen
                ? 'bg-[#0D0D0D]/75 backdrop-blur-lg backdrop-saturate-150 shadow-[0_12px_32px_-18px_rgba(13,13,13,0.5)]'
                : 'bg-transparent'
            }`
          : 'w-full top-0 sticky z-50 bg-[#F9F7F2] border-b border-[#0D0D0D]/10 transform-gpu'
      }
    >
      {overlay && (
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-0 h-px bg-gradient-to-r from-transparent via-[#C5A059]/70 to-transparent transition-all duration-500 ${
            scrolled || mobileMenuOpen ? 'left-0 right-0 opacity-40' : 'left-4 right-4 sm:left-6 sm:right-6 md:left-12 md:right-12'
          }`}
        />
      )}
      <div className="flex justify-between items-center h-16 sm:h-20 px-4 sm:px-6 md:px-12 max-w-[1280px] mx-auto">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <a
            href={pathFor('accueil')}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('accueil', 'push_back');
            }}
            className="flex items-center gap-2 sm:gap-3 group min-w-0"
          >
            <img
              src={LOGO_URL}
              alt="G Business Immo Logo"
              width={44}
              height={44}
              loading="eager"
              decoding="async"
              className="h-9 w-9 sm:h-11 sm:w-11 rounded-full object-cover border border-[#C5A059]/40 group-hover:scale-105 transition-transform duration-200 shrink-0 transform-gpu"
            />
            <div className="flex flex-col min-w-0">
              <span className={`font-serif text-[16px] sm:text-[19px] font-bold tracking-tight leading-none truncate ${overlay ? 'text-[#F9F7F2]' : 'text-[#0D0D0D]'}`}>
                G BUSINESS IMMO
              </span>
              <span className={`font-sans text-[8.5px] sm:text-[10px] tracking-widest uppercase font-medium mt-0.5 truncate ${overlay ? 'text-[#D9BD85]' : 'text-[#8C6D3E]'}`}>
                Immobilier de Prestige
              </span>
            </div>
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex gap-8 items-center text-[12px] font-sans font-medium uppercase tracking-widest">
          <a
            href={pathFor('accueil')}
            onClick={(e) => {
              e.preventDefault();
              const trans = currentScreen === 'services' || currentScreen === 'offres' || currentScreen === 'contact' ? 'push_back' : 'none';
              handleNavClick('accueil', trans);
            }}
            className={`transition-colors py-1 ${
              currentScreen === 'accueil'
                ? linkActive
                : linkIdle
            }`}
          >
            Accueil
          </a>
          <a
            href={pathFor('services')}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('services', currentScreen === 'accueil' ? 'push' : 'none');
            }}
            className={`transition-colors py-1 ${
              currentScreen === 'services'
                ? linkActive
                : linkIdle
            }`}
          >
            Services
          </a>
          <a
            href={pathFor('offres')}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('offres', currentScreen === 'accueil' ? 'push' : 'none');
            }}
            className={`transition-colors py-1 ${
              currentScreen === 'offres'
                ? linkActive
                : linkIdle
            }`}
          >
            Offres
          </a>
          <a
            href={pathFor('about')}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('about', currentScreen === 'accueil' ? 'push' : 'none');
            }}
            className={`transition-colors py-1 ${
              currentScreen === 'about'
                ? linkActive
                : linkIdle
            }`}
          >
            À propos
          </a>
          <a
            href={pathFor('contact')}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('contact', 'push');
            }}
            className={`transition-colors py-1 ${
              currentScreen === 'contact'
                ? linkActive
                : linkIdle
            }`}
          >
            Contact
          </a>
        </nav>

        {/* Login / Dashboard Button Desktop */}
        {!hideLogin && (
          <div className="hidden md:flex items-center gap-2">
            {isAuth ? (
              <>
                <a
                  href={pathFor('dashboard')}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick('dashboard', 'push');
                  }}
                  className="px-5 py-2.5 bg-[#C5A059] text-[#0D0D0D] font-sans text-[11px] font-bold uppercase tracking-widest hover:bg-[#8C6D3E] hover:text-[#F9F7F2] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <LayoutDashboard size={14} />
                  <span>Dashboard</span>
                </a>
                <button
                  onClick={() => {
                    api.logout();
                    setIsAuth(false);
                    handleNavClick('accueil', 'push_back');
                  }}
                  title="Déconnexion"
                  className={`px-3 py-2.5 border font-sans text-[11px] font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer ${
                    overlay
                      ? 'border-[#F9F7F2]/25 text-[#F9F7F2]/75 hover:text-rose-300 hover:border-rose-300/60'
                      : 'border-[#0D0D0D]/15 text-[#747878] hover:text-rose-600 hover:border-rose-300'
                  }`}
                >
                  <LogOut size={13} />
                  <span>Quitter</span>
                </button>
              </>
            ) : (
              <a
                href={pathFor('login')}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('login', 'slide_up');
                }}
                className={`px-5 py-2.5 font-sans text-[11px] font-semibold uppercase tracking-widest transition-colors flex items-center gap-2 cursor-pointer ${
                  overlay
                    ? 'border border-[#C5A059] text-[#D9BD85] hover:bg-[#C5A059] hover:text-[#0D0D0D]'
                    : 'bg-[#0D0D0D] text-[#F9F7F2] hover:bg-[#8C6D3E]'
                }`}
              >
                <LogIn size={14} />
                <span>Login</span>
              </a>
            )}
          </div>
        )}

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          {!hideLogin && (
            <button
              onClick={() => handleNavClick(isAuth ? 'dashboard' : 'login', 'slide_up')}
              className={`px-3 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer ${
                isAuth
                  ? 'bg-[#C5A059] text-[#0D0D0D] font-bold'
                  : overlay
                    ? 'border border-[#C5A059]/70 text-[#D9BD85]'
                    : 'bg-[#0D0D0D] text-[#F9F7F2]'
              }`}
            >
              {isAuth ? <LayoutDashboard size={13} /> : <LogIn size={13} />}
              <span>{isAuth ? 'Dashboard' : 'Admin'}</span>
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded transition-colors ${overlay ? 'text-[#F9F7F2] hover:bg-white/10' : 'text-[#0D0D0D] hover:bg-black/5'}`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden px-5 py-5 flex flex-col gap-2 shadow-xl animate-fade-in ${
            overlay ? 'bg-[#0D0D0D]/90 border-t border-[#C5A059]/20' : 'bg-[#F9F7F2] border-b border-[#0D0D0D]/10'
          }`}
        >
          <a
            href={pathFor('accueil')}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('accueil', 'push_back');
            }}
            className={`text-[13px] font-sans font-bold uppercase tracking-widest py-3 px-3 rounded flex items-center justify-between ${
              currentScreen === 'accueil' ? drawerActive : drawerIdle
            }`}
          >
            <span>Accueil</span>
            {currentScreen === 'accueil' && <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />}
          </a>
          <a
            href={pathFor('services')}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('services', 'push');
            }}
            className={`text-[13px] font-sans font-bold uppercase tracking-widest py-3 px-3 rounded flex items-center justify-between ${
              currentScreen === 'services' ? drawerActive : drawerIdle
            }`}
          >
            <span>Services</span>
            {currentScreen === 'services' && <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />}
          </a>
          <a
            href={pathFor('offres')}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('offres', 'push');
            }}
            className={`text-[13px] font-sans font-bold uppercase tracking-widest py-3 px-3 rounded flex items-center justify-between ${
              currentScreen === 'offres' ? drawerActive : drawerIdle
            }`}
          >
            <span>Offres & Biens</span>
            {currentScreen === 'offres' && <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />}
          </a>
          <a
            href={pathFor('about')}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('about', 'push');
            }}
            className={`text-[13px] font-sans font-bold uppercase tracking-widest py-3 px-3 rounded flex items-center justify-between ${
              currentScreen === 'about' ? drawerActive : drawerIdle
            }`}
          >
            <span>À propos</span>
            {currentScreen === 'about' && <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />}
          </a>
          <a
            href={pathFor('contact')}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('contact', 'push');
            }}
            className={`text-[13px] font-sans font-bold uppercase tracking-widest py-3 px-3 rounded flex items-center justify-between ${
              currentScreen === 'contact' ? drawerActive : drawerIdle
            }`}
          >
            <span>Contact & Estimation</span>
            {currentScreen === 'contact' && <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />}
          </a>
          {isAuth ? (
            <div className="space-y-2 mt-2">
              <button
                onClick={() => handleNavClick('dashboard', 'slide_up')}
                className="w-full px-6 py-3.5 text-xs font-sans font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors bg-[#C5A059] text-[#0D0D0D] hover:bg-[#8C6D3E] hover:text-[#F9F7F2]"
              >
                <LayoutDashboard size={15} />
                <span>Accéder au Dashboard</span>
              </button>
              <button
                onClick={() => {
                  api.logout();
                  setIsAuth(false);
                  handleNavClick('accueil', 'push_back');
                }}
                className="w-full px-6 py-2.5 text-xs font-sans font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors border border-rose-300 text-rose-600 bg-rose-50 hover:bg-rose-100"
              >
                <LogOut size={14} />
                <span>Se Déconnecter</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavClick('login', 'slide_up')}
              className={`w-full mt-2 px-6 py-3.5 text-xs font-sans font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors ${
                overlay
                  ? 'border border-[#C5A059] text-[#F9F7F2] hover:bg-[#C5A059] hover:text-[#0D0D0D]'
                  : 'bg-[#0D0D0D] text-[#F9F7F2] hover:bg-[#8C6D3E]'
              }`}
            >
              <LogIn size={15} className="text-[#C5A059]" />
              <span>Login</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
