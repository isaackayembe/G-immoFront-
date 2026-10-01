import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenId, TransitionType, Property } from '../types';
import { propertyPath } from '../routes';
import './HomeHero.css';

import tourPiscines from '../assets/images/hero/hero-tour-piscines.jpg';
import tourPiscines960 from '../assets/images/hero/hero-tour-piscines-960.jpg';
import residenceCourbe from '../assets/images/hero/residence-courbe.jpg';
import residenceCourbe960 from '../assets/images/hero/residence-courbe-960.jpg';
import salonSignature from '../assets/images/hero/salon-signature.jpg';
import salonSignature960 from '../assets/images/hero/salon-signature-960.jpg';
import penthouseVue from '../assets/images/hero/penthouse-vue.jpg';
import penthouseVue960 from '../assets/images/hero/penthouse-vue-960.jpg';
import medaillon from '../assets/images/hero/medaillon-320.webp';

interface HomeHeroProps {
  onNavigate: (screen: ScreenId, transition?: TransitionType) => void;
  properties: Property[];
}

interface Slide {
  key: string;
  src: string;
  srcMobile?: string;
  propertyId?: string;
  status?: string;
  title: string;
  facts: string[];
}

const SLIDE_DURATION = 6500;
const MAX_SLIDES = 5;

/** Travelling lent, différent pour chaque photo (zoom avant, arrière, glissement). */
const KEN_BURNS: React.CSSProperties[] = [
  { '--origin': '38% 55%', '--kb-from': 'scale(1.1)', '--kb-to': 'scale(1)' },
  { '--origin': '30% 40%', '--kb-from': 'scale(1.02) translate(1.5%, 0)', '--kb-to': 'scale(1.1) translate(-1.5%, -1%)' },
  { '--origin': '60% 60%', '--kb-from': 'scale(1.12)', '--kb-to': 'scale(1.01)' },
  { '--origin': '70% 45%', '--kb-from': 'scale(1.04) translate(-1.5%, 0)', '--kb-to': 'scale(1.12) translate(1%, 0)' },
] as React.CSSProperties[];

/** Photos de secours tant que l'API n'a pas renvoyé d'offres publiées. */
const FALLBACK_SLIDES: Slide[] = [
  { key: 'f1', src: tourPiscines, srcMobile: tourPiscines960, title: 'Nos biens à Kinshasa', facts: [] },
  { key: 'f2', src: residenceCourbe, srcMobile: residenceCourbe960, title: 'Nos biens à Kinshasa', facts: [] },
  { key: 'f3', src: salonSignature, srcMobile: salonSignature960, title: 'Nos biens à Kinshasa', facts: [] },
  { key: 'f4', src: penthouseVue, srcMobile: penthouseVue960, title: 'Nos biens à Kinshasa', facts: [] },
];

/** Biens montrés dans le hero : publiés, avec photo, non vendus de préférence. L'accueil s'en sert pour ne pas les répéter. */
export function pickHeroProperties(properties: Property[]): Property[] {
  const withImage = properties.filter((p) => p.status !== 'Brouillon' && p.imageUrl);
  const available = withImage.filter((p) => p.status !== 'Vendu');
  return (available.length ? available : withImage).slice(0, MAX_SLIDES);
}

const toSlide = (p: Property): Slide => ({
  key: p.id,
  src: p.imageUrl,
  propertyId: p.id,
  status: [p.status, p.commune].filter(Boolean).join(' · '),
  title: p.title,
  facts: [
    p.surface ? `${p.surface} m²` : '',
    p.bedrooms ? `${p.bedrooms} chambres` : p.rooms ? `${p.rooms} pièces` : '',
    p.price || '',
  ].filter(Boolean),
});

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** L'intro ne se joue qu'à la 1re page de la session, jamais en mouvement réduit. */
const shouldPlayIntro = () => {
  if (typeof window === 'undefined' || prefersReducedMotion()) return false;
  try {
    if (sessionStorage.getItem('gbi-intro') === '1') return false;
  } catch {
    /* stockage indisponible : on joue l'intro */
  }
  const idx = (window.history.state as { idx?: number } | null)?.idx;
  return !idx;
};

const isMobileViewport = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches;
const slideSrc = (s: Slide) => (s.srcMobile && isMobileViewport() ? s.srcMobile : s.src);

/** Télécharge et décode une image avant de l'afficher (fondu sans saut). */
const preloadCache = new Map<string, Promise<void>>();
const preload = (src: string) => {
  if (!preloadCache.has(src)) {
    const img = new Image();
    img.src = src;
    preloadCache.set(
      src,
      new Promise<void>((resolve) => {
        img.onload = () => (img.decode ? img.decode().catch(() => {}).then(() => resolve()) : resolve());
        img.onerror = () => resolve();
      })
    );
  }
  return preloadCache.get(src)!;
};

const Arrow = ({ back = false }: { back?: boolean }) => (
  <svg viewBox="0 0 18 10" fill="none" stroke="currentColor" aria-hidden="true">
    <path d={back ? 'M18 5H1M5 1 1 5l4 4' : 'M0 5h17M13 1l4 4-4 4'} />
  </svg>
);

export const HomeHero: React.FC<HomeHeroProps> = ({ onNavigate, properties }) => {
  const navigate = useNavigate();

  // ── Biens affichés : les offres publiées avec photo, sinon les photos de secours
  const slides = useMemo<Slide[]>(() => {
    const picked = pickHeroProperties(properties);
    return picked.length ? picked.map(toSlide) : FALLBACK_SLIDES;
  }, [properties]);
  const slidesKey = slides.map((s) => s.key).join('|');
  const N = slides.length;

  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [userPaused, setUserPaused] = useState(prefersReducedMotion);
  const [playIntro] = useState(shouldPlayIntro);
  const [introState, setIntroState] = useState<'on' | 'lifting' | 'off'>(playIntro ? 'on' : 'off');
  const [ready, setReady] = useState(!playIntro);

  const sectionRef = useRef<HTMLElement>(null);
  const barRef = useRef<SVGCircleElement>(null);
  const liftRef = useRef<(() => void) | null>(null);
  const segFillRefs = useRef<(HTMLElement | null)[]>([]);
  const counterRef = useRef<HTMLSpanElement>(null);
  const elapsed = useRef(0);
  const busy = useRef(false);
  const pauseFlags = useRef({ hover: false, focus: false, offscreen: false });
  const indexRef = useRef(0);
  indexRef.current = index;

  // Nouvelle liste de biens (ex. l'API répond après l'affichage) → on repart du premier
  useEffect(() => {
    setIndex(0);
    setPrevIndex(null);
    elapsed.current = 0;
  }, [slidesKey]);

  // ── Intro : l'anneau suit le chargement réel de la 1re photo (min 1,3 s, max 4 s)
  useEffect(() => {
    if (!playIntro) return;
    document.body.style.overflow = 'hidden';
    const t0 = performance.now();
    const MIN = 1300;
    const MAX = 4000;
    let loaded = false;
    let raf = 0;
    let done = false;
    const timers: number[] = [];
    preload(slideSrc(slides[0])).then(() => {
      loaded = true;
    });

    const lift = () => {
      if (done) return;
      done = true;
      try {
        sessionStorage.setItem('gbi-intro', '1');
      } catch {
        /* ignoré */
      }
      setIntroState('lifting');
      document.body.style.overflow = '';
      timers.push(window.setTimeout(() => setReady(true), 140));
      timers.push(window.setTimeout(() => setIntroState('off'), 800));
    };
    const step = (now: number) => {
      const t = now - t0;
      const auto = Math.min(t / MIN, 1) * 0.85;
      const p = loaded ? Math.min(1, Math.max(auto, t / MIN)) : auto;
      barRef.current?.style.setProperty('--p', p.toFixed(3));
      if ((loaded && t >= MIN) || t >= MAX) {
        barRef.current?.style.setProperty('--p', '1');
        timers.push(window.setTimeout(lift, 380));
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const onKey = () => lift();
    window.addEventListener('keydown', onKey, { once: true });
    liftRef.current = lift;

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      if (!done) {
        // Démontage pendant l'intro : on termine proprement
        setReady(true);
        setIntroState('off');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playIntro]);

  const skipIntro = () => liftRef.current?.();

  // ── Changement de bien
  const go = useCallback(
    async (target: number) => {
      const n = ((target % N) + N) % N;
      const current = indexRef.current;
      if (n === current || busy.current) return;
      busy.current = true;
      await preload(slideSrc(slides[n]));
      elapsed.current = 0;
      setPrevIndex(current);
      setIndex(n);
      busy.current = false;
    },
    [N, slides]
  );

  // Retire la photo précédente une fois le fondu terminé, précharge la suivante
  useEffect(() => {
    if (N > 1) preload(slideSrc(slides[(index + 1) % N]));
    const el = counterRef.current;
    if (el) {
      el.classList.remove('is-flip');
      void el.offsetWidth;
      el.classList.add('is-flip');
    }
    if (prevIndex === null) return;
    const t = window.setTimeout(() => setPrevIndex(null), 1450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // ── Lecture automatique + barre de progression (sans re-rendu à chaque image)
  useEffect(() => {
    if (!ready || N < 2) return;
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      const dt = last ? Math.min(t - last, 100) : 0;
      last = t;
      const f = pauseFlags.current;
      const paused = userPaused || f.hover || f.focus || f.offscreen || document.hidden;
      if (!paused) {
        elapsed.current += dt;
        if (elapsed.current >= SLIDE_DURATION) go(indexRef.current + 1);
      }
      const progress = Math.min(elapsed.current / SLIDE_DURATION, 1);
      segFillRefs.current.forEach((el, k) => {
        if (!el) return;
        el.style.transform = k < indexRef.current ? 'scaleX(1)' : k === indexRef.current ? `scaleX(${progress})` : 'scaleX(0)';
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ready, N, userPaused, go]);

  // Pause quand le hero sort de l'écran
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => {
      pauseFlags.current.offscreen = !e.isIntersecting;
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Flèches du clavier quand le hero est à l'écran
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (introState !== 'off' || pauseFlags.current.offscreen) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (/input|textarea|select/i.test(tag)) return;
      if (e.key === 'ArrowRight') go(indexRef.current + 1);
      if (e.key === 'ArrowLeft') go(indexRef.current - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, introState]);

  // Glissement du doigt (mobile)
  const touch = useRef({ x: 0, y: 0 });
  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touch.current.x;
    const dy = e.changedTouches[0].clientY - touch.current.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) go(indexRef.current + (dx < 0 ? 1 : -1));
  };

  const openSlide = (s: Slide) => {
    if (s.propertyId) navigate(propertyPath(s.propertyId), { state: { transition: 'slide_up' } });
    else onNavigate('offres', 'push');
  };

  const next = slides[(index + 1) % N];
  const isFallback = !slides[0]?.propertyId;

  return (
    <>
      {introState !== 'off' && (
        <div className={`gh-intro${introState === 'lifting' ? ' is-lifting' : ''}`} aria-hidden="true">
          <div className="gh-intro__mark">
            <div className="gh-intro__glow" />
            <img className="gh-intro__medal" src={medaillon} alt="" width={320} height={320} />
            <svg className="gh-intro__ring" viewBox="0 0 100 100">
              <circle className="track" cx="50" cy="50" r="48" />
              <circle className="bar" ref={barRef} cx="50" cy="50" r="48" />
            </svg>
          </div>
          <p className="gh-intro__line">Immobilier de prestige · Kinshasa</p>
          <button className="gh-intro__skip" type="button" tabIndex={-1} onClick={skipIntro}>
            Passer
          </button>
        </div>
      )}

      <section
        ref={sectionRef}
        className={`gh${ready ? ' is-ready' : ''}`}
        aria-labelledby="gh-title"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="gh-media" aria-hidden="true" key={slidesKey}>
          {slides.map((s, k) => {
            const active = k === index;
            const prev = k === prevIndex;
            // On ne monte que les photos utiles : l'actuelle, la précédente (fondu) et la suivante (préchargée)
            if (!active && !prev && k !== (index + 1) % N) return null;
            return (
              <figure
                key={s.key}
                className={`gh-slide${active ? ' is-active' : ''}${prev ? ' is-prev' : ''}`}
                style={KEN_BURNS[k % KEN_BURNS.length]}
              >
                <picture>
                  {s.srcMobile && <source media="(max-width: 720px)" srcSet={s.srcMobile} />}
                  <img
                    src={s.src}
                    alt=""
                    width={1920}
                    height={1440}
                    decoding="async"
                    fetchPriority={k === 0 ? 'high' : 'low'}
                  />
                </picture>
              </figure>
            );
          })}
        </div>
        <div className="gh-veil" aria-hidden="true" />
        <div className="gh-grain" aria-hidden="true" />

        <div className="gh-body">
          <div>
            <p className="gh-overline gh-enter d1">
              Kinshasa <span>— Gombe · Ngaliema · Limete</span>
            </p>
            <h1 className="gh-headline" id="gh-title">
              <span className="gh-line"><span>L'adresse</span></span>
              <span className="gh-line"><span className="gh-indent">d'exception</span></span>
              <span className="gh-line"><span><em>à Kinshasa.</em></span></span>
            </h1>
            <p className="gh-lead gh-enter d2">
              Appartements, villas et espaces commerciaux de prestige, sélectionnés avec la plus grande discrétion pour
              les acquéreurs, investisseurs de la diaspora et entreprises.
            </p>
            <div className="gh-ctas gh-enter d3">
              <button type="button" className="gh-btn" onClick={() => onNavigate('offres', 'push')}>
                Découvrir nos offres
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
                  <path d="M4 12h15M13 6l6 6-6 6" />
                </svg>
              </button>
              <button type="button" className="gh-btn-text" onClick={() => onNavigate('contact', 'push')}>
                Estimer mon bien
              </button>
            </div>
          </div>

          {/* La vitrine : le bien actuellement à l'écran */}
          <aside
            className="gh-vitrine gh-enter d4"
            aria-roledescription="carrousel"
            aria-label="Biens à la une"
            onMouseEnter={() => (pauseFlags.current.hover = true)}
            onMouseLeave={() => (pauseFlags.current.hover = false)}
            onFocus={() => (pauseFlags.current.focus = true)}
            onBlur={() => (pauseFlags.current.focus = false)}
          >
            <div className="gh-copies" aria-live="polite">
              {isFallback ? (
                <article className="gh-copy is-active">
                  <p className="gh-copy__status"><i />Vente et location</p>
                  <h2 className="gh-copy__title">Nos biens à Kinshasa</h2>
                  <ul className="gh-copy__facts"><li>Appartements</li><li>Villas</li><li>Bureaux</li></ul>
                  <button type="button" className="gh-copy__link" onClick={() => onNavigate('offres', 'push')}>
                    Voir les offres <Arrow />
                  </button>
                </article>
              ) : (
                slides.map((s, k) => {
                  const on = k === index;
                  return (
                    <article
                      key={s.key}
                      className={`gh-copy${on ? ' is-active' : ''}`}
                      aria-roledescription="diapositive"
                      aria-label={`${k + 1} sur ${N}`}
                      aria-hidden={!on}
                    >
                      {s.status && <p className="gh-copy__status"><i />{s.status}</p>}
                      <h2 className="gh-copy__title">{s.title}</h2>
                      {s.facts.length > 0 && (
                        <ul className="gh-copy__facts">
                          {s.facts.map((f) => <li key={f}>{f}</li>)}
                        </ul>
                      )}
                      <button
                        type="button"
                        className="gh-copy__link"
                        tabIndex={on ? 0 : -1}
                        onClick={() => openSlide(s)}
                      >
                        Voir ce bien <Arrow />
                      </button>
                    </article>
                  );
                })
              )}
            </div>

            {N > 1 && (
              <>
                <div className="gh-controls">
                  <div className="gh-counter" aria-hidden="true">
                    <span className="gh-counter__cur" ref={counterRef}>{String(index + 1).padStart(2, '0')}</span>
                    <span className="gh-counter__tot">/ {String(N).padStart(2, '0')}</span>
                  </div>
                  <div className="gh-segments">
                    {slides.map((s, k) => (
                      <button
                        key={s.key}
                        type="button"
                        className="gh-seg"
                        aria-label={`Afficher la photo ${k + 1}`}
                        aria-current={k === index}
                        onClick={() => go(k)}
                      >
                        <i ref={(el) => { segFillRefs.current[k] = el; }} />
                      </button>
                    ))}
                  </div>
                  <div className="gh-ctrl-group">
                    <button
                      type="button"
                      className="gh-ctrl gh-ctrl--play"
                      aria-label={userPaused ? 'Relancer le diaporama' : 'Mettre le diaporama en pause'}
                      onClick={() => setUserPaused((v) => !v)}
                    >
                      {userPaused ? (
                        <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M2.5 1v10l8-5z" /></svg>
                      ) : (
                        <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                          <rect x="2" y="1" width="2.4" height="10" />
                          <rect x="7.6" y="1" width="2.4" height="10" />
                        </svg>
                      )}
                    </button>
                    <button type="button" className="gh-ctrl gh-ctrl--prev" aria-label="Photo précédente" onClick={() => go(index - 1)}>
                      <Arrow back />
                    </button>
                    <button type="button" className="gh-ctrl gh-ctrl--next" aria-label="Photo suivante" onClick={() => go(index + 1)}>
                      <Arrow />
                    </button>
                  </div>
                </div>

                {!isFallback && (
                  <button type="button" className="gh-upnext" onClick={() => go(index + 1)}>
                    <img className="gh-upnext__img" src={next.srcMobile || next.src} alt="" width={56} height={42} loading="lazy" />
                    <span className="gh-upnext__txt">
                      <span className="gh-upnext__k">Ensuite</span>
                      <span className="gh-upnext__t">{next.title}</span>
                    </span>
                  </button>
                )}
              </>
            )}
          </aside>
        </div>

        <button
          type="button"
          className="gh-scroll"
          aria-label="Défiler vers les dernières offres"
          onClick={() => {
            const el = sectionRef.current;
            if (el) window.scrollTo({ top: el.offsetTop + el.offsetHeight, behavior: 'smooth' });
          }}
        >
          <span>Défiler</span>
          <span className="gh-scroll__line" aria-hidden="true" />
        </button>
      </section>
    </>
  );
};
