'use client';

import { motion, useReducedMotion } from 'motion/react';

/** Apparition à l'entrée dans l'écran (une seule fois) : léger glissement + fondu. Réservée aux éléments clés. */
export function Apparition({ children, className = '', delai = 0, as = 'div' }: { children: React.ReactNode; className?: string; delai?: number; as?: 'div' | 'li' }) {
  const reduit = useReducedMotion();
  const M = as === 'li' ? motion.li : motion.div;
  if (reduit) return as === 'li' ? <li className={className}>{children}</li> : <div className={className}>{children}</div>;
  return (
    <M className={className} initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-12% 0px' }} transition={{ duration: 0.75, delay: delai, ease: [0.2, 0.8, 0.2, 1] }}>
      {children}
    </M>
  );
}
