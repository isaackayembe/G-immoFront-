import React from 'react';
import { Quote, Star } from 'lucide-react';
import { TESTIMONIALS } from '../config';

/**
 * Témoignages clients : une carte par avis (citation, note, nom, contexte).
 * Contenu : TESTIMONIALS dans config.ts. Rien n'est affiché si la liste est vide.
 */
export const Testimonials: React.FC = () => {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="py-20 md:py-28" aria-labelledby="temoignages-title">
      <div className="px-4 sm:px-6 md:px-12 max-w-[1280px] mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <p className="font-sans text-[11px] font-semibold uppercase tracking-widest text-[#7A5C2E] mb-2">Témoignages</p>
          <h2 id="temoignages-title" className="font-serif text-[32px] md:text-[40px] text-[#0D0D0D] font-bold">
            Ils Nous Font Confiance
          </h2>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {TESTIMONIALS.map((t) => (
            <li key={t.name}>
              <figure className="h-full bg-white border border-[#8C6D3E]/20 shadow-sm p-8 flex flex-col">
                <Quote size={32} className="text-[#C5A059] mb-5 shrink-0" aria-hidden="true" />

                {t.rating ? (
                  <div className="flex gap-1 mb-4" role="img" aria-label={`Note : ${t.rating} sur 5`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < t.rating! ? 'text-[#C5A059] fill-[#C5A059]' : 'text-[#C5A059]/30'}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                ) : null}

                <blockquote className="font-sans text-[15px] text-[#4A4D4D] leading-relaxed flex-grow">
                  <p>« {t.quote} »</p>
                </blockquote>

                <figcaption className="mt-6 pt-5 border-t border-[#f0eee9]">
                  <p className="font-serif text-[18px] font-bold text-[#0D0D0D]">{t.name}</p>
                  <p className="font-sans text-[12px] font-semibold uppercase tracking-widest text-[#7A5C2E] mt-1">
                    {t.context}
                  </p>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
