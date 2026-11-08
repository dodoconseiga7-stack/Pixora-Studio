'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CarteCreation, Visionneuse, type CreationAffichee } from './Creations';
import { classeBouton, Fleche } from '@/components/ui/Bouton';
import type { Domaine, Service } from '@/lib/types';

/**
 * CATALOGUE « MES CRÉATIONS » — domaine d'abord, puis service. Les choix sont gardés dans l'adresse
 * (on peut partager le lien « Flyers pour fast-food »). Uniquement les vraies créations du designer.
 */
export function Catalogue({ creations, domaines, services }: { creations: CreationAffichee[]; domaines: Domaine[]; services: Service[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const chemin = usePathname();
  const domaine = domaines.some((d) => d.id === params.get('domaine')) ? params.get('domaine')! : '';
  const service = services.some((s) => s.id === params.get('service')) ? params.get('service')! : '';
  const [ouverte, setOuverte] = useState<CreationAffichee | null>(null);
  const fermer = useCallback(() => setOuverte(null), []);

  const choisir = (cle: 'domaine' | 'service', valeur: string) => {
    const p = new URLSearchParams(params.toString());
    if (valeur) p.set(cle, valeur); else p.delete(cle);
    router.replace(`${chemin}${p.size ? `?${p}` : ''}`, { scroll: false });
  };

  // Le choix actif reste visible dans les rangées défilantes (téléphone).
  const barre = useRef<HTMLDivElement>(null);
  useEffect(() => {
    barre.current?.querySelectorAll<HTMLElement>('[aria-pressed="true"]').forEach((b) => {
      const rangee = b.parentElement!;
      rangee.scrollTo({ left: b.offsetLeft - rangee.clientWidth / 2 + b.offsetWidth / 2, behavior: 'smooth' });
    });
  }, [domaine, service]);

  const dansDomaine = creations.filter((c) => !domaine || c.domaineId === domaine);
  const visibles = dansDomaine.filter((c) => !service || c.serviceId === service);
  const nomD = domaines.find((d) => d.id === domaine)?.nom;
  const nomS = services.find((s) => s.id === service)?.nom;

  const puce = (actif: boolean) => `inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-[0.95rem] font-bold transition-colors ${actif ? 'bg-encre text-white' : 'bg-white ring-1 ring-filet hover:ring-bleu'}`;

  return (
    <div className="conteneur pb-10">
      <div ref={barre} data-guide="domaines" className="sticky top-16 z-30 -mx-4 bg-white/92 px-4 py-4 backdrop-blur md:top-20">
        <p className="text-[0.92rem] font-bold text-sourdine">1. Votre domaine</p>
        <div className="sans-barre mt-2 flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => choisir('domaine', '')} className={puce(!domaine)} aria-pressed={!domaine}>Tous</button>
          {domaines.map((d) => {
            const n = creations.filter((c) => c.domaineId === d.id).length;
            return <button key={d.id} onClick={() => choisir('domaine', d.id)} aria-pressed={domaine === d.id} className={puce(domaine === d.id)}>{d.nom}<span className={`text-[0.8rem] ${domaine === d.id ? 'text-white/60' : 'text-sourdine'}`}>{n}</span></button>;
          })}
        </div>
        <p className="mt-3 text-[0.92rem] font-bold text-sourdine">2. Le service</p>
        <div data-guide="services" className="sans-barre mt-2 flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => choisir('service', '')} className={puce(!service)} aria-pressed={!service}>Tous les services</button>
          {services.map((s) => {
            const n = dansDomaine.filter((c) => c.serviceId === s.id).length;
            return <button key={s.id} onClick={() => choisir('service', s.id)} aria-pressed={service === s.id} className={`${puce(service === s.id)} ${n ? '' : 'opacity-60'}`}>{s.nom}<span className={`text-[0.8rem] ${service === s.id ? 'text-white/60' : 'text-sourdine'}`}>{n}</span></button>;
          })}
        </div>
      </div>

      <p aria-live="polite" className="mt-6 text-[1.05rem] text-sourdine">
        <strong className="text-encre">{visibles.length} création{visibles.length > 1 ? 's' : ''}</strong>
        {nomS ? ` · ${nomS}` : ''}{nomD ? ` · ${nomD}` : ''}
      </p>

      <AnimatePresence mode="wait">
        {visibles.length ? (
          <motion.ul key={`${domaine}-${service}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            data-guide="grille" className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
            {visibles.map((c, i) => <li key={c.id}><CarteCreation c={c} onOuvrir={setOuverte} prioritaire={i < 4} /></li>)}
          </motion.ul>
        ) : (
          <motion.div key="vide" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-6 rounded-[var(--radius-carte)] bg-fond-2 p-8 sm:p-12">
            <h2 className="titre text-[clamp(1.8rem,3.4vw,2.6rem)]">Pas encore de {nomS ? nomS.toLowerCase() : 'création'} {nomD ? `pour « ${nomD} »` : ''} en ligne.</h2>
            <p className="chapo mt-3 max-w-xl">Pixora Studio la crée pour vous, à l’image de votre activité. Commandez, et recevez une proposition sur WhatsApp.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/commander?${new URLSearchParams({ ...(service && { service }), ...(domaine && { domaine }) })}`} className={classeBouton('bleu')}>Commander<Fleche /></Link>
              <button onClick={() => { choisir('service', ''); }} className={classeBouton('secondaire')}>Voir les autres services</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Visionneuse c={ouverte} onFermer={fermer} />
    </div>
  );
}
