'use client';

import Image from 'next/image';
import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Badge, Visionneuse, type CreationAffichee } from '@/components/creations/Creations';

export type Duel = { serviceId: string; service: string; pixora: CreationAffichee; ia: CreationAffichee };

/**
 * LA DIFFÉRENCE — pour un même service, deux images DIFFÉRENTES côte à côte :
 * à gauche une vraie création du designer, à droite un exemple généré par IA, toujours signalé.
 */
export function Difference({ duels }: { duels: Duel[] }) {
  const [i, setI] = useState(0);
  const [ouverte, setOuverte] = useState<CreationAffichee | null>(null);
  const fermer = useCallback(() => setOuverte(null), []);
  if (!duels.length) return null;
  const d = duels[Math.min(i, duels.length - 1)];

  const cote = (c: CreationAffichee) => (
    <figure>
      <button onClick={() => setOuverte(c)} className="group block w-full text-left" aria-label={`Agrandir : ${c.titre}`}>
        <span className={`relative block aspect-[4/5] overflow-hidden rounded-[var(--radius-carte)] bg-white ${c.type === 'pixora' ? 'ring-2 ring-bleu' : 'ring-1 ring-filet-fort'}`}>
          <Image src={c.image} alt={c.titre} fill sizes="(min-width: 1024px) 34vw, 50vw" className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.02] sm:p-4" />
          <Badge type={c.type} className="absolute left-2 top-2 sm:left-3 sm:top-3" />
        </span>
      </button>
      <figcaption className="mt-3 px-1">
        <p className="font-bold leading-snug">{c.titre}</p>
        {c.description && <p className="mt-1 text-[0.92rem] text-sourdine">{c.description}</p>}
      </figcaption>
    </figure>
  );

  return (
    <section id="difference" data-guide="difference" aria-labelledby="titre-difference" className="section scroll-mt-20 bg-fond-2">
      <div className="conteneur">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="font-bold text-bleu">La différence</p>
            <h2 id="titre-difference" className="titre mt-3 text-[clamp(2.3rem,5vw,4.2rem)]">Ma création ou création par IA : jugez vous-même.</h2>
          </div>
          <p className="chapo lg:col-span-5">Une image générée automatiquement peut impressionner au premier regard. Une création pensée par un designer respecte votre message, votre marque et votre client.</p>
        </div>

        <div role="tablist" aria-label="Choisir un service à comparer" className="sans-barre -mx-4 mt-10 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {duels.map((x, k) => (
            <button key={x.serviceId} role="tab" aria-selected={k === i} onClick={() => setI(k)}
              className={`h-11 shrink-0 rounded-full px-5 text-[0.95rem] font-bold transition-colors ${k === i ? 'bg-encre text-white' : 'bg-white ring-1 ring-filet hover:ring-bleu'}`}>
              {x.service}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={d.serviceId} role="tabpanel" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:gap-10">
            {cote(d.pixora)}
            {cote(d.ia)}
            <span aria-hidden className="absolute left-1/2 top-[38%] grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-encre text-[0.95rem] font-extrabold text-white ring-4 ring-fond-2 sm:h-16 sm:w-16 sm:text-[1.15rem]">VS</span>
          </motion.div>
        </AnimatePresence>
        <p className="mt-8 text-[0.95rem] text-sourdine">Les images marquées « Création par IA » ont été générées automatiquement. Elles ne sont jamais présentées comme des créations de Pixora Studio.</p>
      </div>
      <Visionneuse c={ouverte} onFermer={fermer} />
    </section>
  );
}
