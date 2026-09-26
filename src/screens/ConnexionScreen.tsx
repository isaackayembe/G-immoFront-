import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ScreenId, TransitionType } from '../types';
import api from '../services/api';
import { LOGO_URL } from '../config';
import { SCREEN_PATHS } from '../routes';
import { ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

interface ConnexionScreenProps {
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
}

export const ConnexionScreen: React.FC<ConnexionScreenProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Page admin demandée avant la redirection vers /connexion (sinon le dashboard)
  const from = (location.state as { from?: { pathname: string; search: string } } | null)?.from;
  const goToAdmin = () =>
    navigate(from ? from.pathname + from.search : SCREEN_PATHS.dashboard, {
      replace: true,
      state: { transition: 'none' },
    });

  useEffect(() => {
    // Si déjà connecté (token JWT valide), rediriger vers le dashboard
    if (api.isAuthenticated()) {
      goToAdmin();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // ✅ Seule une réponse valide du backend (token JWT) autorise l'accès
      await api.login({ username: email, password });
      goToAdmin();
    } catch (err: any) {
      // ❌ Aucun bypass — toute erreur bloque l'accès et affiche un message
      const msg =
        err?.message ||
        'Identifiants incorrects ou serveur indisponible. Veuillez réessayer.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F9F7F2] relative overflow-hidden text-[#0D0D0D]">
      {/* Background Architectural Overlay */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAwTmLRxGYj6EuIY9IKhH0xee120LVwmsQ9cp1EjBh9Ox34e4AWCfGmutfhwCSOtW4oHzJxvxyZ7H4UkMZFMGJA7Cq7ZnMzw7knBpWDhU8xzkxyxiFp9N20s6XX0Rv3r9skKV7O-677nX9HLB4ewgzRxMRiIzK5d1mVr2YU3xl-wbecYsG9g1L7oFqVC2kcSvZq-qW4k8whM9TBfV0BRdNXTTszxDAipteroX33MC8LpgFWdVKLLsiqyJ91TVez3ZGzfY6kVVJeoDQlAA")`,
          }}
        />
      </div>

      {/* Top Header Link Back */}
      <header className="relative z-10 p-6 md:p-10 flex justify-between items-center">
        <button
          onClick={() => onNavigate('accueil', 'push_back')}
          className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-widest text-[#0D0D0D] hover:text-[#C5A059] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Retour à l'accueil</span>
        </button>
      </header>

      {/* Central Login Card */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-5 md:p-10">
        <div className="w-full max-w-md bg-white border border-[#8C6D3E]/20 p-8 md:p-12 shadow-sm">
          {/* Brand Badge */}
          <div className="flex justify-center mb-8">
            <img
              src={LOGO_URL}
              alt="G Business Immo"
              className="w-20 h-20 rounded-full object-cover border-2 border-[#C5A059] shadow-md"
            />
          </div>

          <div className="text-center mb-10">
            <h1 className="font-serif text-[32px] md:text-[36px] text-[#0D0D0D] font-bold mb-2">
              Accès Sécurisé
            </h1>
            <p className="font-sans text-[14px] text-[#747878]">
              Veuillez vous identifier pour accéder à votre espace d'investissement privé.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-300 p-3 text-rose-800 text-xs font-sans flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="relative">
              <label htmlFor="login-email" className="font-sans text-xs font-bold uppercase tracking-widest text-[#747878] block mb-1">
                Adresse Email / Identifiant
              </label>
              <input
                id="login-email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="minimal-input text-[16px] text-[#0D0D0D] w-full"
                placeholder="votre.email@gbusinessimmo.cd"
              />
            </div>

            <div className="relative">
              <label htmlFor="login-password" className="font-sans text-xs font-bold uppercase tracking-widest text-[#747878] block mb-1">
                Mot de passe
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="minimal-input text-[16px] text-[#0D0D0D] w-full"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between pt-2 font-sans">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="accent-[#C5A059]"
                />
                <span className="text-[12px] text-[#747878]">Se souvenir de moi</span>
              </label>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-[12px] text-[#C5A059] hover:text-[#8C6D3E] transition-colors font-medium"
              >
                Mot de passe oublié ?
              </a>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0D0D0D] text-[#F9F7F2] font-sans text-xs font-bold tracking-widest uppercase py-4 px-8 hover:bg-[#8C6D3E] transition-colors duration-300 flex justify-center items-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isLoading ? 'CONNEXION EN COURS...' : 'SE CONNECTER'}</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-[#C5A059]" />
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center font-sans text-[12px] text-[#747878]">
        © 2024 G Business Immo. Accès Réservé.
      </footer>
    </div>
  );
};
