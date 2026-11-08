'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

/**
 * Curseur d'accompagnement (souris uniquement) : un point qui suit la souris avec un léger
 * retard et s'agrandit en anneau au-dessus de ce qui est cliquable. Le curseur du système
 * reste visible : c'est un complément, jamais un remplacement.
 */
export function Curseur() {
  const [actif, setActif] = useState(false);
  const [survol, setSurvol] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    const souris = window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!souris) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- activation unique selon le type de pointeur
    setActif(true);
    const bouge = (e: PointerEvent) => {
      x.set(e.clientX); y.set(e.clientY);
      setSurvol(!!(e.target as Element)?.closest?.('a, button, [role="button"], input, select, textarea, label'));
    };
    window.addEventListener('pointermove', bouge, { passive: true });
    return () => window.removeEventListener('pointermove', bouge);
  }, [x, y]);

  if (!actif) return null;
  return (
    <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90] rounded-full border border-accent mix-blend-multiply"
      style={{ x: sx, y: sy, translateX: '-50%', translateY: '-50%' }}
      animate={{ width: survol ? 46 : 10, height: survol ? 46 : 10, backgroundColor: survol ? 'rgba(27,77,216,0.12)' : 'rgba(27,77,216,1)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
  );
}
