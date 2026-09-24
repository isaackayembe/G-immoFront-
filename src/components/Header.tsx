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

  useEffect(() => {
    const handleAuthChange = () => setIsAuth(api.isAuthenticated());
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const handleNavClick = (screen: ScreenId, transition: TransitionType = 'push') => {
    setMobileMenuOpen(false);
    onNavigate(screen, transition);
  };

  return (
    <header className="w-full top-0 sticky z-50 bg-[#F9F7F2] border-b border-[#0D0D0D]/10 transform-gpu">
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
              <span className="font-serif text-[16px] sm:text-[19px] font-bold tracking-tight text-[#0D0D0D] leading-none truncate">
                G BUSINESS IMMO
              </span>
              <span className="font-sans text-[8.5px] sm:text-[10px] tracking-widest uppercase text-[#8C6D3E] font-medium mt-0.5 truncate">
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
                ? 'text-[#0D0D0D] border-b-2 border-[#C5A059] font-bold'
                : 'text-[#747878] hover:text-[#0D0D0D]'
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
                ? 'text-[#0D0D0D] border-b-2 border-[#C5A059] font-bold'
                : 'text-[#747878] hover:text-[#0D0D0D]'
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
                ? 'text-[#0D0D0D] border-b-2 border-[#C5A059] font-bold'
                : 'text-[#747878] hover:text-[#0D0D0D]'
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
                ? 'text-[#0D0D0D] border-b-2 border-[#C5A059] font-bold'
                : 'text-[#747878] hover:text-[#0D0D0D]'
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
                ? 'text-[#0D0D0D] border-b-2 border-[#C5A059] font-bold'
                : 'text-[#747878] hover:text-[#0D0D0D]'
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
                  className="px-3 py-2.5 border border-[#0D0D0D]/15 text-[#747878] hover:text-rose-600 hover:border-rose-300 font-sans text-[11px] font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
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
                className="px-5 py-2.5 bg-[#0D0D0D] text-[#F9F7F2] font-sans text-[11px] font-semibold uppercase tracking-widest hover:bg-[#8C6D3E] transition-colors flex items-center gap-2 cursor-pointer"
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
                  : 'bg-[#0D0D0D] text-[#F9F7F2]'
              }`}
            >
              {isAuth ? <LayoutDashboard size={13} /> : <LogIn size={13} />}
              <span>{isAuth ? 'Dashboard' : 'Admin'}</span>
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[#0D0D0D] p-2 hover:bg-black/5 rounded transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F9F7F2] border-b border-[#0D0D0D]/10 px-5 py-5 flex flex-col gap-2 shadow-xl animate-fade-in">
          <a
            href={pathFor('accueil')}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('accueil', 'push_back');
            }}
            className={`text-[13px] font-sans font-bold uppercase tracking-widest py-3 px-3 rounded flex items-center justify-between ${
              currentScreen === 'accueil' ? 'bg-[#C5A059]/15 text-[#8C6D3E]' : 'text-[#0D0D0D] hover:bg-black/5'
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
              currentScreen === 'services' ? 'bg-[#C5A059]/15 text-[#8C6D3E]' : 'text-[#0D0D0D] hover:bg-black/5'
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
              currentScreen === 'offres' ? 'bg-[#C5A059]/15 text-[#8C6D3E]' : 'text-[#0D0D0D] hover:bg-black/5'
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
              currentScreen === 'about' ? 'bg-[#C5A059]/15 text-[#8C6D3E]' : 'text-[#0D0D0D] hover:bg-black/5'
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
              currentScreen === 'contact' ? 'bg-[#C5A059]/15 text-[#8C6D3E]' : 'text-[#0D0D0D] hover:bg-black/5'
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
              className="w-full mt-2 px-6 py-3.5 bg-[#0D0D0D] text-[#F9F7F2] text-xs font-sans font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm cursor-pointer hover:bg-[#8C6D3E] transition-colors"
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
