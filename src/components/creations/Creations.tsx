'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bot, PenTool, X } from 'lucide-react';
import { bloquerDefilement } from '@/components/providers/DefilementDoux';
import { classeBouton, Fleche } from '@/components/ui/Bouton';
import type { Creation, TypeCreation } from '@/lib/types';
import { ENTIERES } from '@/lib/format';

/** Le badge qui ne ment jamais : une image IA porte toujours « CRÉATION PAR IA ». */
export function Badge({ type, className = '' }: { type: TypeCreation; className?: string }) {
  return type === 'ia' ? (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[0.72rem] font-extrabold tracking-[0.06em] text-encre ring-1 ring-encre/15 ${className}`}>
      <Bot size={14} strokeWidth={2.2} /> CRÉATION PAR IA
    </span>
  ) : (
    <span className={`inline-flex items-center gap-1.5 rounded-full bg-bleu px-3 py-1.5 text-[0.72rem] font-extrabold tracking-[0.06em] text-white ${className}`}>
      <PenTool size={13} strokeWidth={2.2} /> MA CRÉATION
    </span>
  );
}

export type CreationAffichee = Creation & { domaine: string; service: string };


/** Vignette d'une création : l'image d'abord, le texte en retrait. */
export function CarteCreation({ c, onOuvrir, prioritaire = false, badge = false }: {
  c: CreationAffichee; onOuvrir: (c: CreationAffichee) => void; prioritaire?: boolean; badge?: boolean;
}) {
  return (
    <button onClick={() => onOuvrir(c)} className="group block w-full text-left" aria-label={`Agrandir : ${c.titre}`}>
      <span className="relative block aspect-[4/5] overflow-hidden rounded-[var(--radius-carte)] bg-fond-2 ring-1 ring-filet">
        <Image src={c.image} alt={c.titre} fill priority={prioritaire} sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 50vw"
          className={`${ENTIERES.includes(c.serviceId) ? 'bg-white object-contain p-5' : 'object-cover'} transition-transform duration-500 ease-[var(--ease-sortie)] group-hover:scale-[1.03]`} />
        {(badge || c.type === 'ia') && <Badge type={c.type} className="absolute left-3 top-3" />}
      </span>
      <span className="mt-3 block px-1">
        <span className="block font-bold leading-snug group-hover:text-bleu">{c.titre}</span>
        <span className="mt-0.5 block text-[0.9rem] text-sourdine">{c.service} · {c.domaine}</span>
      </span>
    </button>
  );
}

/** Visionneuse plein écran (Échap ou clic à côté pour fermer). */
export function Visionneuse({ c, onFermer }: { c: CreationAffichee | null; onFermer: () => void }) {
  const fermer = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!c) return;
    bloquerDefilement(true);
    fermer.current?.focus();
    const touche = (e: KeyboardEvent) => { if (e.key === 'Escape') onFermer(); };
    window.addEventListener('keydown', touche);
    return () => { window.removeEventListener('keydown', touche); bloquerDefilement(false); };
  }, [c, onFermer]);

  return (
    <AnimatePresence>
      {c && (
        <motion.div role="dialog" aria-modal="true" aria-label={c.titre} data-lenis-prevent
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
          onClick={onFermer} className="fixed inset-0 z-[70] overflow-y-auto bg-encre/80 p-3 backdrop-blur-sm sm:p-6">
          <motion.div initial={{ y: 24, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 12, opacity: 0 }} transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto grid max-w-6xl overflow-hidden rounded-[var(--radius-carte)] bg-white lg:grid-cols-[1.4fr_1fr]">
            <div className="relative flex min-h-[50vh] items-center justify-center bg-fond-2 p-4 sm:p-8">
              {/* eslint-disable-next-line @next/next/no-img-element -- image entière, proportions d'origine */}
              <img src={c.image} alt={c.titre} className="max-h-[78vh] w-auto max-w-full rounded-lg object-contain shadow-[0_20px_50px_-20px_rgba(11,22,52,0.45)]" />
            </div>
            <div className="flex flex-col p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <Badge type={c.type} />
                <button ref={fermer} onClick={onFermer} aria-label="Fermer" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-fond-2 hover:bg-bleu-clair"><X size={20} /></button>
              </div>
              <h2 className="titre mt-6 text-[2rem]">{c.titre}</h2>
              <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-filet py-4 text-[0.95rem]">
                <div><dt className="text-sourdine">Service</dt><dd className="font-bold">{c.service}</dd></div>
                <div><dt className="text-sourdine">Domaine</dt><dd className="font-bold">{c.domaine}</dd></div>
              </dl>
              {c.description && <p className="mt-5 text-sourdine">{c.description}</p>}
              {c.type === 'ia' ? (
                <p className="mt-6 rounded-[var(--radius-ctrl)] bg-fond-2 p-4 text-[0.95rem]">Cette image a été générée par une intelligence artificielle. Elle sert de comparaison et n’est pas une création de Pixora Studio.</p>
              ) : (
                <Link href={`/commander?service=${c.serviceId}&domaine=${c.domaineId}`} className={classeBouton('bleu', 'mt-8 self-start')}>
                  Commander ce type de création<Fleche />
                </Link>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
