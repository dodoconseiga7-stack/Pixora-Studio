'use client';

import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';

/** Indication discrète de la progression dans la page : un fil bleu en haut de l'écran. */
export function Progression() {
  const { scrollYProgress } = useScroll();
  const reduit = useReducedMotion();
  const x = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.3 });
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[55] h-[3px] origin-left bg-accent" style={{ scaleX: reduit ? scrollYProgress : x }} />;
}
