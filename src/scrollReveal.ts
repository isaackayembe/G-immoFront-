/**
 * Apparition progressive du contenu au défilement.
 *
 * Aucune page n'est modifiée : on parcourt le contenu de la page affichée, on repère ses blocs
 * (titres, paragraphes, cartes, images…) et chacun apparaît (fondu + légère montée) quand il entre
 * à l'écran, une seule fois. Les éléments qui arrivent ensemble apparaissent l'un après l'autre.
 *
 * - Pages exclues : tableau de bord admin (/admin…) et connexion.
 * - Zones exclues : barre de navigation, pied de page, hero de l'accueil, et tout élément marqué
 *   `data-no-reveal` (pour exclure un bloc précis sans rien changer d'autre).
 * - Mouvement réduit demandé par le système : rien n'est animé.
 * Styles associés : [data-rv] dans index.css.
 */

const SKIP = 'header, footer, nav, .gh, .gh-intro, [data-no-reveal], script, style';
const STAGGER_MS = 90;
const MAX_STAGGER_MS = 450;
const CLEANUP_AFTER_MS = 1300; // durée de l'animation + marge, avant de rendre l'élément à son état normal
const MAX_DEPTH = 5;

const EXCLUDED_PATHS = ['/admin', '/connexion'];

export function setupScrollReveal(root: HTMLElement): (() => void) | undefined {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const path = window.location.pathname;
  if (EXCLUDED_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) return;

  const seen = new WeakSet<Element>();
  const timers = new Set<number>();

  const io = new IntersectionObserver(
    (entries) => {
      // Ceux qui entrent ensemble apparaissent en cascade, de haut en bas puis de gauche à droite
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort(
          (a, b) =>
            a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left
        );
      visible.forEach((entry, i) => {
        const el = entry.target as HTMLElement;
        io.unobserve(el);
        const delay = Math.min(i * STAGGER_MS, MAX_STAGGER_MS);
        el.style.setProperty('--rv-delay', `${delay}ms`);
        el.dataset.rv = 'in';
        const t = window.setTimeout(() => {
          timers.delete(t);
          delete el.dataset.rv;
          el.style.removeProperty('--rv-delay');
        }, delay + CLEANUP_AFTER_MS);
        timers.add(t);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0 }
  );

  const mark = (el: HTMLElement) => {
    seen.add(el);
    el.dataset.rv = '';
    io.observe(el);
  };

  /** Grille ou rangée d'éléments : on anime chaque élément séparément. */
  const isGroup = (el: HTMLElement) => {
    if (el.children.length < 2) return false;
    const cs = getComputedStyle(el);
    if (cs.display.includes('grid')) return true;
    return cs.display.includes('flex') && cs.flexDirection.startsWith('row') && cs.flexWrap !== 'nowrap';
  };

  /** Conteneur à ouvrir (section, zone principale, bloc plus haut que l'écran…) plutôt qu'à animer d'un bloc. */
  const shouldDescend = (el: HTMLElement) => {
    const n = el.children.length;
    if (n === 0) return false;
    const tag = el.tagName;
    if (tag === 'MAIN' || tag === 'SECTION') return true;
    if (n >= 2 && isGroup(el)) return true;
    return el.getBoundingClientRect().height > window.innerHeight * 0.9;
  };

  const walk = (container: Element, depth: number) => {
    for (const node of Array.from(container.children)) {
      const el = node as HTMLElement;
      if (seen.has(el) || el.matches(SKIP)) continue;
      if (!el.getClientRects().length) continue; // masqué
      if (depth < MAX_DEPTH && shouldDescend(el)) walk(el, depth + 1);
      else mark(el);
    }
  };

  // Premier passage une fois la page mise en page
  let raf = requestAnimationFrame(() => walk(root, 0));

  // Contenu arrivé plus tard (offres chargées depuis l'API, filtres…) : on le prend en compte aussi
  const mo = new MutationObserver((mutations) => {
    const relevant = mutations.some(
      (m) => m.addedNodes.length > 0 && !(m.target as Element).closest?.('.gh, .gh-intro, [data-no-reveal]')
    );
    if (!relevant) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => walk(root, 0));
  });
  mo.observe(root, { childList: true, subtree: true });

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    mo.disconnect();
    timers.forEach(clearTimeout);
  };
}
