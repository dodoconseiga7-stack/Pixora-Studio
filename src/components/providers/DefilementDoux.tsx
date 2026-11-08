'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

let instance: Lenis | null = null;

/** Bloque ou relâche le défilement (menus, tiroirs, plein écran). */
export function bloquerDefilement(bloquer: boolean) {
  if (instance) {
    if (bloquer) instance.stop(); else instance.start();
  } else {
    document.body.style.overflow = bloquer ? 'hidden' : '';
  }
}

/** Fait défiler en douceur vers une ancre ou une position. */
export function defilerVers(cible: string | number) {
  if (instance) instance.scrollTo(cible, { offset: -80 });
  else if (typeof cible === 'number') window.scrollTo({ top: cible, behavior: 'smooth' });
  else document.querySelector(cible)?.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Défilement avec une légère inertie, sur tout le site. Désactivé si la personne a demandé
 * moins d'animations dans son système. Revient en haut à chaque changement de page.
 */
export function DefilementDoux() {
  const chemin = usePathname();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, anchors: { offset: -80 } });
    instance = lenis;
    let raf = 0;
    const boucle = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(boucle); };
    raf = requestAnimationFrame(boucle);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); instance = null; };
  }, []);

  useEffect(() => { instance?.scrollTo(0, { immediate: true }); }, [chemin]);

  return null;
}
