'use client';

import { AnimatePresence, motion } from 'motion/react';

/** Notification brève (ajout au panier, copie…), annoncée aux lecteurs d'écran. */
export function Toast({ texte }: { texte: string | null }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4">
      <AnimatePresence>
        {texte && (
          <motion.p
            key={texte}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            className="rounded-[var(--radius-ctrl)] bg-encre px-5 py-3 text-sm font-medium text-surface shadow-[0_8px_24px_rgba(23,18,15,0.25)]"
          >
            {texte}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
