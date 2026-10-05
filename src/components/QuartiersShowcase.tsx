import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { offersSearchPath } from '../offerFilters';

export interface Quartier {
  commune: string;
  count: number;
  image: string;
}

/** Nombre minimal de cartes autour du cylindre (les quartiers sont répétés si besoin pour faire le tour). */
const MIN_CARDS_ON_RING = 10;
/** Temps (s) pour qu'une carte prenne la place de la précédente devant : la vitesse ne dépend pas du nombre de quartiers. */
const SECONDS_PER_CARD = 4;
/** Espace (px) entre deux cartes voisines sur le cylindre. */
const CARD_GAP = 24;
/** Distance (px) au-delà de laquelle un appui devient un glissement (et n'ouvre plus le lien). */
const DRAG_THRESHOLD = 6;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Quartiers : les cartes sont posées tout autour d'un cylindre qui tourne sur lui-même, comme une orange.
 * - La carte de devant fait face ; celles des côtés tournent et s'éloignent ; celles de derrière s'effacent
 *   puis reviennent par l'autre côté.
 * - Survol : la rotation ralentit en douceur jusqu'à l'arrêt. Glisser (souris ou doigt) fait tourner à la main.
 * - Focus clavier sur une carte : le cylindre tourne pour l'amener devant.
 * - Hors de l'écran, onglet caché ou mouvement réduit demandé : pas de rotation automatique.
 * Styles : .qr-* dans index.css.
 */
export const QuartiersShowcase: React.FC<{ quartiers: Quartier[] }> = ({ quartiers }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const state = useRef({ hovering: false, dragging: false, offscreen: true, suppressClick: false });

  const n = quartiers.length;
  const repeat = n ? Math.ceil(MIN_CARDS_ON_RING / n) : 0;
  const ring = Array.from({ length: repeat }, () => quartiers).flat();
  const count = ring.length;
  const step = count ? 360 / count : 0; // angle entre deux cartes
  const ringKey = ring.map((q) => q.commune).join('|');

  useEffect(() => {
    const viewport = viewportRef.current;
    const ringEl = ringRef.current;
    if (!viewport || !ringEl || !count) return;

    const reduced = prefersReducedMotion();
    const s = state.current;
    const baseSpeed = reduced ? 0 : step / SECONDS_PER_CARD; // degrés par seconde
    let rot = 0; // angle du cylindre : la carte k est devant quand rot = k * step
    let speed = 0;
    let degPerPx = 0;
    let lastRot = NaN;
    let last = 0;
    let raf = 0;

    // Rayon du cylindre : les cartes se touchent presque (largeur + espace) sur le pourtour
    const measure = () => {
      const card = ringEl.querySelector<HTMLElement>('.qr-card');
      const w = (card?.offsetWidth || 300) + CARD_GAP;
      const radius = w / (2 * Math.tan(Math.PI / count));
      ringEl.style.setProperty('--qr-r', `${radius}px`);
      degPerPx = step / w;
      lastRot = NaN;
    };

    const render = () => {
      if (rot === lastRot) return; // rien n'a bougé : on n'écrit rien
      lastRot = rot;
      ringEl.style.transform = `translateZ(calc(var(--qr-r) * -1)) rotateY(${-rot}deg)`;
      // Les cartes qui passent sur le côté puis derrière s'estompent
      itemRefs.current.forEach((item, k) => {
        if (!item) return;
        const facing = Math.cos(((k * step - rot) * Math.PI) / 180); // 1 devant, 0 de profil, -1 derrière
        item.style.opacity = String(Math.max(0, Math.min(1, (facing + 0.15) / 0.75)));
        item.style.pointerEvents = facing > 0.2 ? 'auto' : 'none';
      });
    };

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      const target = s.hovering || s.dragging || s.offscreen || document.hidden ? 0 : baseSpeed;
      speed += (target - speed) * Math.min(1, dt * 3); // ralentit / repart en douceur
      if (!s.dragging) rot += speed * dt;
      render();
      raf = requestAnimationFrame(tick);
    };

    measure();
    render();
    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      measure();
      render();
    });
    ro.observe(viewport);

    const io = new IntersectionObserver(([e]) => {
      s.offscreen = !e.isIntersecting;
    });
    io.observe(viewport);

    // ── Glisser à la souris ou au doigt : tirer vers la gauche fait tourner dans le sens du défilé
    let startX = 0;
    let startRot = 0;
    let pointerId: number | null = null;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      pointerId = e.pointerId;
      startX = e.clientX;
      startRot = rot;
      s.suppressClick = false;
    };
    const onMove = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      const dx = e.clientX - startX;
      if (!s.dragging && Math.abs(dx) > DRAG_THRESHOLD) {
        s.dragging = true;
        s.suppressClick = true;
        speed = 0;
        viewport.classList.add('is-dragging');
      }
      if (s.dragging) rot = startRot - dx * degPerPx;
    };
    const onUp = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      pointerId = null;
      s.dragging = false;
      viewport.classList.remove('is-dragging');
    };
    // Un glissement ne doit pas ouvrir le quartier sur lequel il s'est terminé
    const onClickCapture = (e: MouseEvent) => {
      if (s.suppressClick) {
        e.preventDefault();
        e.stopPropagation();
        s.suppressClick = false;
      }
    };

    // ── Survol : pause + halo doré qui suit le curseur
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      s.hovering = true;
      viewport.classList.add('is-hovering');
    };
    const onLeave = () => {
      s.hovering = false;
      viewport.classList.remove('is-hovering');
    };
    const onHoverMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('.qr-card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    };

    // ── Clavier : la carte qui reçoit le focus vient se placer devant (par le chemin le plus court)
    const onFocusIn = (e: FocusEvent) => {
      s.hovering = true;
      const k = Number((e.target as HTMLElement).closest<HTMLElement>('[data-ring-index]')?.dataset.ringIndex);
      if (Number.isNaN(k)) return;
      const delta = ((((k * step - rot) % 360) + 540) % 360) - 180;
      rot += delta;
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!viewport.contains(e.relatedTarget as Node)) s.hovering = false;
    };
    // Le navigateur fait défiler la zone pour montrer l'élément focalisé : on l'annule (le cylindre gère la position)
    const onScroll = () => {
      if (viewport.scrollLeft) viewport.scrollLeft = 0;
    };

    viewport.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    viewport.addEventListener('click', onClickCapture, true);
    viewport.addEventListener('pointerenter', onEnter);
    viewport.addEventListener('pointerleave', onLeave);
    viewport.addEventListener('pointermove', onHoverMove);
    viewport.addEventListener('focusin', onFocusIn);
    viewport.addEventListener('focusout', onFocusOut);
    viewport.addEventListener('scroll', onScroll);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      viewport.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      viewport.removeEventListener('click', onClickCapture, true);
      viewport.removeEventListener('pointerenter', onEnter);
      viewport.removeEventListener('pointerleave', onLeave);
      viewport.removeEventListener('pointermove', onHoverMove);
      viewport.removeEventListener('focusin', onFocusIn);
      viewport.removeEventListener('focusout', onFocusOut);
      viewport.removeEventListener('scroll', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ringKey]);

  if (n === 0) return null;
  itemRefs.current.length = count;

  const countLabel = (q: Quartier) =>
    q.count > 0 ? `${q.count} ${q.count > 1 ? 'biens disponibles' : 'bien disponible'}` : 'Biens sur demande';

  return (
    <section className="pb-12 sm:pb-16 md:pb-24 w-full overflow-hidden">
      <div className="px-4 sm:px-6 md:px-12 max-w-[1280px] mx-auto mb-6 sm:mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="font-sans text-[11px] font-semibold uppercase tracking-widest text-[#7A5C2E] mb-2">Kinshasa</p>
          <h2 className="font-serif text-[26px] sm:text-[32px] md:text-[40px] text-[#0D0D0D] font-bold">Nos Quartiers</h2>
        </div>
        <p className="font-sans text-[14px] text-[#6B6F6F]">Faites glisser pour parcourir, cliquez pour voir les biens.</p>
      </div>

      {/* Le cylindre tourne dans la largeur du contenu (alignée sur le titre), pas sur toute la fenêtre */}
      <div className="px-4 sm:px-6 md:px-12 max-w-[1280px] mx-auto">
        <div ref={viewportRef} className="qr-viewport" data-no-reveal>
          <div ref={ringRef} className="qr-ring" key={ringKey}>
            <ul>
              {ring.map((q, k) => {
                // Seule la 1re occurrence de chaque quartier est lue par les lecteurs d'écran et atteinte au clavier
                const isCopy = k >= n;
                return (
                  <li
                    key={k}
                    ref={(el) => {
                      itemRefs.current[k] = el;
                    }}
                    className="qr-item"
                    data-ring-index={k}
                    style={{ transform: `rotateY(${k * step}deg) translateZ(var(--qr-r))` }}
                    aria-hidden={isCopy || undefined}
                  >
                    <Link
                      to={offersSearchPath({ commune: q.commune })}
                      state={{ transition: 'push' }}
                      tabIndex={isCopy ? -1 : 0}
                      draggable={false}
                      aria-label={`${q.commune} : ${countLabel(q)}`}
                      className="qr-card"
                    >
                      <img
                        src={q.image}
                        alt=""
                        width={600}
                        height={800}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className="qr-card__img"
                      />
                      <span className="qr-card__shade" aria-hidden="true" />
                      <span className="qr-card__glow" aria-hidden="true" />
                      <span className="qr-card__frame" aria-hidden="true" />
                      <span className="qr-card__body">
                        <span className="qr-card__title">{q.commune}</span>
                        <span className="qr-card__count">{countLabel(q)}</span>
                        <span className="qr-card__more">
                          <span>
                            <span className="qr-card__cta">Voir les biens</span>
                          </span>
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
