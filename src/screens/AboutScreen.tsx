import React from 'react';
import { ScreenId, TransitionType } from '../types';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LOGO_URL, DIRECTOR, KEY_FIGURES } from '../config';
import { Award, Shield, Scale, Eye } from 'lucide-react';

interface AboutScreenProps {
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
}

const PILLARS = [
  {
    icon: Shield,
    title: 'Discrétion',
    text: 'La confidentialité de chaque client et de chaque projet est préservée, de la première visite à la signature.',
  },
  {
    icon: Scale,
    title: 'Intégrité',
    text: 'Des conseils honnêtes et des informations vérifiées, pour décider en toute confiance.',
  },
  {
    icon: Award,
    title: 'Excellence',
    text: 'Une sélection exigeante de propriétés de qualité et un suivi soigné à chaque étape.',
  },
  {
    icon: Eye,
    title: 'Transparence',
    text: "Des conditions claires et un dialogue ouvert, pour défendre vos intérêts sans zone d'ombre.",
  },
];

export const AboutScreen: React.FC<AboutScreenProps> = ({ onNavigate }) => {
  const figures = KEY_FIGURES;

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F7F2] text-[#0D0D0D]">
      <Header currentScreen="about" onNavigate={onNavigate} />

      <main className="flex-grow w-full max-w-[1280px] mx-auto px-6 md:px-12 py-12 md:py-24">
        {/* Header Hero */}
        <section className="mb-16 md:mb-24 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center mb-6">
            <img
              src={LOGO_URL}
              alt="G Business Immo Logo"
              width={80}
              height={80}
              loading="lazy"
              decoding="async"
              className="w-20 h-20 rounded-full object-cover border-2 border-[#C5A059] shadow-md"
            />
          </div>
          <h1 className="font-serif text-[36px] md:text-[56px] text-[#0D0D0D] mb-6 font-bold leading-tight">
            À Propos de G Business Immo
          </h1>
          <p className="font-sans text-[18px] text-[#6B6F6F] leading-relaxed">
            Une maison immobilière premium à Kinshasa, fondée sur la discrétion, l'intégrité et l'exigence.
          </p>
        </section>

        {/* Vision, histoire, positionnement, engagements + portrait du DG */}
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-12 lg:gap-16 items-start mb-20 md:mb-28">
          <div className="space-y-6 order-2 lg:order-1">
            <span className="font-sans text-xs font-bold tracking-widest text-[#7A5C2E] uppercase block">
              Notre vision & notre histoire
            </span>
            <h2 className="font-serif text-[30px] md:text-[38px] text-[#0D0D0D] font-bold leading-snug">
              Une approche plus exclusive, exigeante et personnalisée de l'immobilier
            </h2>
            <p className="font-sans text-[16px] text-[#6B6F6F] leading-relaxed">
              Fondée par {DIRECTOR.name}, fort de 15 années d'expérience dans l'immobilier et de plus d'une centaine de
              clients accompagnés, G Business Immo est née d'une vision : proposer une approche plus exclusive,
              exigeante et personnalisée de l'immobilier.
            </p>
            <p className="font-sans text-[16px] text-[#6B6F6F] leading-relaxed">
              De l'achat à la vente, en passant par la location, chaque projet est accompagné avec la même exigence,
              qu'il s'agisse d'une résidence, d'un investissement ou d'un bien d'exception.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
              <div className="border-t-2 border-[#C5A059] pt-5">
                <h3 className="font-serif text-[22px] font-bold text-[#0D0D0D] mb-3">Notre positionnement</h3>
                <p className="font-sans text-[15px] text-[#6B6F6F] leading-relaxed">
                  G Business Immo se positionne comme une maison immobilière premium, spécialisée dans la sélection de
                  propriétés de qualité et l'accompagnement sur mesure d'une clientèle exigeante.
                </p>
              </div>
              <div className="border-t-2 border-[#C5A059] pt-5">
                <h3 className="font-serif text-[22px] font-bold text-[#0D0D0D] mb-3">Nos engagements</h3>
                <p className="font-sans text-[15px] text-[#6B6F6F] leading-relaxed">
                  Discrétion, intégrité et excellence définissent notre signature. Nous plaçons la confidentialité, la
                  transparence et la confiance au cœur de chaque relation, avec un seul objectif : défendre les intérêts
                  de nos clients à chaque étape de leur projet.
                </p>
              </div>
            </div>
          </div>

          {/* Portrait du Directeur Général */}
          <figure className="order-1 lg:order-2 relative w-full max-w-[460px] mx-auto lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#0D0D0D] shadow-[0_40px_70px_-35px_rgba(13,13,13,0.6)]">
              <img
                src={DIRECTOR.photo}
                alt={`${DIRECTOR.name}, ${DIRECTOR.role} de G Business Immo`}
                width={627}
                height={753}
                decoding="async"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/90 via-[#0D0D0D]/10 to-transparent" />
              {/* Passe-partout doré, comme les cartes « Nos Quartiers » */}
              <span className="absolute inset-[14px] border border-[#D9BD85]/40 pointer-events-none" aria-hidden="true" />
              <span className="absolute top-[13px] left-[13px] w-6 h-6 border-t-2 border-l-2 border-[#C5A059]" aria-hidden="true" />
              <span className="absolute bottom-[13px] right-[13px] w-6 h-6 border-b-2 border-r-2 border-[#C5A059]" aria-hidden="true" />
              <figcaption className="absolute left-8 right-8 bottom-8">
                <span className="block font-serif text-[26px] md:text-[30px] font-bold text-[#F9F7F2] leading-tight">
                  {DIRECTOR.name}
                </span>
                <span className="block font-sans text-[14px] text-[#D9BD85] mt-1">
                  {DIRECTOR.role} et fondateur
                </span>
              </figcaption>
            </div>
          </figure>
        </section>

        {/* Chiffres clés */}
        {figures.length > 0 && (
          <section className="bg-[#0D0D0D] text-[#F9F7F2] px-8 py-12 md:px-16 md:py-16 mb-20" aria-label="Chiffres clés">
            <div
              className={`grid grid-cols-1 gap-10 md:gap-0 md:divide-x divide-[#C5A059]/25 ${
                figures.length === 3 ? 'md:grid-cols-3' : figures.length === 2 ? 'md:grid-cols-2' : ''
              }`}
            >
              {figures.map((f) => (
                <div key={f.label} className="group text-center md:px-8 cursor-default">
                  {/* Zoom au survol : le chiffre grossit et s'éclaire, le libellé ressort */}
                  <div className="font-serif text-[48px] md:text-[60px] font-bold text-[#C5A059] leading-none mb-3 transition-[transform,color] duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.18] group-hover:text-[#D9BD85] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                    {f.value}
                  </div>
                  <p className="font-sans text-[15px] text-[#F9F7F2]/75 transition-colors duration-500 group-hover:text-[#F9F7F2]">
                    {f.label}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pillars / Values */}
        <section className="bg-[#f0eee9] border border-[#8C6D3E]/20 p-8 md:p-16 mb-20">
          <h2 className="font-serif text-[32px] text-[#0D0D0D] text-center mb-12 font-bold">Nos Valeurs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PILLARS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-white p-6 border border-[#8C6D3E]/20 shadow-sm flex flex-col items-start">
                <div className="p-3 bg-[#C5A059]/15 text-[#8C6D3E] rounded-full mb-4">
                  <Icon size={24} />
                </div>
                <h3 className="font-serif text-[20px] font-bold text-[#0D0D0D] mb-2">{title}</h3>
                <p className="font-sans text-[14px] text-[#6B6F6F] leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Action Banner */}
        <section className="text-center py-8">
          <h3 className="font-serif text-[28px] text-[#0D0D0D] mb-4 font-bold">Un projet immobilier en vue ?</h3>
          <p className="font-sans text-[16px] text-[#6B6F6F] mb-8 max-w-xl mx-auto">
            Parlons de votre achat, de votre vente ou de votre location, en toute confidentialité.
          </p>
          <button
            onClick={() => onNavigate('contact', 'push')}
            className="bg-[#0D0D0D] text-[#F9F7F2] font-sans font-semibold text-xs tracking-widest uppercase px-8 py-4 hover:bg-[#8C6D3E] transition-colors cursor-pointer"
          >
            NOUS CONTACTER
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
};
