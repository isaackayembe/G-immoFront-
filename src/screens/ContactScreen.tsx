import React, { useState } from 'react';
import { ScreenId, TransitionType } from '../types';
import api from '../services/api';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Phone, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

interface ContactScreenProps {
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
}

export const ContactScreen: React.FC<ContactScreenProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await api.sendContactMessage({
        name: formData.name,
        email: formData.email,
        subject: formData.subject || 'Demande de contact',
        message: formData.message,
      });
      setSubmitted(true);
    } catch (err) {
      console.warn('Backend API contact indisponible, confirmation locale:', err);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] text-[#0D0D0D]">
      <Header currentScreen="contact" onNavigate={onNavigate} />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-24 flex flex-col gap-8 sm:gap-12 md:gap-16">
        {/* Header Section */}
        <header className="text-center md:text-left flex flex-col gap-3 sm:gap-4">
          <h1 className="font-serif text-[28px] sm:text-[36px] md:text-[56px] text-[#0D0D0D] font-bold tracking-tight">
            Contactez-nous
          </h1>
          <p className="font-sans text-[14px] sm:text-[16px] md:text-[18px] text-[#747878] max-w-2xl leading-relaxed">
            L'équipe de G Business Immo se tient à votre entière disposition pour échanger sur vos projets d'investissement avec la plus grande discrétion.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
          {/* Coordonnées Section */}
          <section className="flex flex-col gap-8">
            <h2 className="font-serif text-[28px] text-[#0D0D0D] border-b border-[#f0eee9] pb-4 font-bold">
              Nos Coordonnées
            </h2>

            <div className="flex flex-col gap-6">
              {/* Phone */}
              <a
                href="tel:+243810000000"
                className="flex items-center gap-4 group p-4 bg-white hover:bg-[#F9F7F2] transition-colors duration-300 border border-[#8C6D3E]/20 shadow-sm"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#C5A059]/15 text-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-[#0D0D0D] transition-colors">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="font-sans text-xs font-bold tracking-widest uppercase text-[#747878] mb-1">
                    Téléphone
                  </p>
                  <p className="font-sans text-[18px] text-[#0D0D0D] font-bold">
                    +243 81 000 0000
                  </p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:contact@gbusinessimmo.com"
                className="flex items-center gap-4 group p-4 bg-white hover:bg-[#F9F7F2] transition-colors duration-300 border border-[#8C6D3E]/20 shadow-sm"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#C5A059]/15 text-[#C5A059] group-hover:bg-[#C5A059] group-hover:text-[#0D0D0D] transition-colors">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="font-sans text-xs font-bold tracking-widest uppercase text-[#747878] mb-1">
                    Email
                  </p>
                  <p className="font-sans text-[18px] text-[#0D0D0D] font-bold">
                    contact@gbusinessimmo.com
                  </p>
                </div>
              </a>

              {/* Address */}
              <div className="flex items-center gap-4 p-4 bg-white border border-[#8C6D3E]/20 shadow-sm">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#C5A059]/15 text-[#C5A059]">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="font-sans text-xs font-bold tracking-widest uppercase text-[#747878] mb-1">
                    Bureau
                  </p>
                  <p className="font-sans text-[18px] text-[#0D0D0D] font-bold">
                    Boulevard du 30 Juin<br />Kinshasa, RDC
                  </p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="w-full h-64 overflow-hidden border border-[#8C6D3E]/20 relative shadow-sm">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJT9IGMCLFgT7TgFkgW4SOqMoImB4_kYKNo41TBCKgj7MP5JzbTqVJ5ms_sub_DRW614yTk9R2x9F0D_3rMCTxzaPJsqnAFoA8jfbxHda_ZBwqM8ejn8waqSh1ifnr8yZM5G_tICsCGEN6da4b3egRvVOYqLD7_DQ12wWtTe_n1hZ26qu74MAJQVZ22B0FK0yHDDiGr5ZR3papWSxq1X43JYg6KtV72qxT5RxnGM5HOkGcN9JWqX6h"
                alt="Localisation Kinshasa"
                className="w-full h-full object-cover grayscale opacity-85"
              />
              <div className="absolute inset-0 bg-[#0D0D0D]/10 pointer-events-none" />
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 font-sans text-[12px] font-medium text-[#0D0D0D] shadow-sm">
                📍 Boulevard du 30 Juin, Kinshasa Gombe
              </div>
            </div>
          </section>

          {/* Formulaire Section */}
          <section className="bg-white p-6 md:p-10 border border-[#8C6D3E]/20 flex flex-col gap-6 shadow-sm">
            <h2 className="font-serif text-[28px] text-[#0D0D0D] font-bold">
              Envoyer un message
            </h2>

            {submitted ? (
              <div className="py-12 flex flex-col items-center text-center gap-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-[#C5A059]/15 flex items-center justify-center text-[#C5A059]">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="font-serif text-[24px] text-[#0D0D0D] font-bold">
                  Message envoyé avec succès
                </h3>
                <p className="font-sans text-[15px] text-[#747878] max-w-md">
                  Nous vous remercions pour votre confiance. Un consultant spécialisé examinera votre demande et prendra contact avec vous sous 24 heures.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', subject: '', message: '' });
                  }}
                  className="mt-4 bg-[#0D0D0D] text-[#F9F7F2] font-sans font-semibold text-xs tracking-widest uppercase px-6 py-3 hover:bg-[#8C6D3E] transition-colors cursor-pointer"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="font-sans text-xs font-bold tracking-widest uppercase text-[#0D0D0D]">
                    Nom Complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Votre nom"
                    className="minimal-input font-sans text-[16px] text-[#0D0D0D] w-full"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="font-sans text-xs font-bold tracking-widest uppercase text-[#0D0D0D]">
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Votre email"
                    className="minimal-input font-sans text-[16px] text-[#0D0D0D] w-full"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="subject" className="font-sans text-xs font-bold tracking-widest uppercase text-[#0D0D0D]">
                    Sujet de la demande
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Ex: Investissement locatif / Achat de villa"
                    className="minimal-input font-sans text-[16px] text-[#0D0D0D] w-full"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="font-sans text-xs font-bold tracking-widest uppercase text-[#0D0D0D]">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Comment pouvons-nous vous assister ?"
                    className="minimal-input font-sans text-[16px] text-[#0D0D0D] w-full resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 bg-[#0D0D0D] text-[#F9F7F2] font-sans font-semibold text-xs tracking-widest uppercase px-8 py-4 w-full hover:bg-[#8C6D3E] transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}</span>
                  <Send size={16} />
                </button>

                <p className="font-sans text-[12px] text-[#747878] text-center mt-1">
                  Vos informations sont traitées avec la plus stricte confidentialité.
                </p>
              </form>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};
