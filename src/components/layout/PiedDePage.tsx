'use client';

import Link from 'next/link';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { IconeWhatsApp, lienWhatsApp } from '@/components/ui/Bouton';
import { NAVIGATION } from './EnTete';
import { Logo } from './Logo';

/** Pied de page bleu nuit : dernier appel (disque bleu qui suit la souris), numéro WhatsApp bien visible. */
export function PiedDePage({ logo, whatsapp }: { logo: string | null; whatsapp: string }) {
  const reduit = useReducedMotion();
  const mx = useMotionValue(0); const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 200, damping: 18 }); const y = useSpring(my, { stiffness: 200, damping: 18 });

  const aimant = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (reduit || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left - r.width / 2) * 0.3); my.set((e.clientY - r.top - r.height / 2) * 0.3);
  };

  return (
    <footer className="sur-sombre relative mt-24 overflow-hidden rounded-t-[2rem] bg-encre pb-32 text-white md:pb-12">
      <div className="conteneur pt-20 lg:pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="text-[1rem] font-semibold text-[#8fb0ff]">Votre prochaine création</p>
            <h2 className="titre mt-3 text-[clamp(2.4rem,5.4vw,4.6rem)]">Donnez à votre activité l’image qu’elle mérite.</h2>
          </div>
          <div className="flex lg:col-span-4 lg:justify-end">
            <motion.a href="/commander" onPointerMove={aimant} onPointerLeave={() => { mx.set(0); my.set(0); }} style={{ x, y }}
              className="group grid h-44 w-44 place-items-center rounded-full bg-bleu text-center text-white transition-colors hover:bg-[#2c5cf0] lg:h-52 lg:w-52">
              <span className="flex flex-col items-center gap-2 text-[1.1rem] font-bold"><ArrowUpRight size={26} className="transition-transform duration-300 group-hover:rotate-45" />Commander</span>
            </motion.a>
          </div>
        </div>

        <div className="mt-20 grid gap-12 border-t border-white/10 pt-12 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo logo={logo} clair />
            <p className="mt-5 max-w-sm text-white/65">Studio de création graphique à Ouagadougou : cartes de visite, flyers, affiches, visuels, kakémonos, étiquettes et logos.</p>
          </div>
          <div className="lg:col-span-4">
            <p className="text-[0.95rem] text-white/60">WhatsApp</p>
            <a href={lienWhatsApp(whatsapp, 'Bonjour Pixora Studio, ')} target="_blank" rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-3 text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-[-0.02em] hover:text-[#8fb0ff]">
              <IconeWhatsApp size={26} />{whatsapp}
            </a>
          </div>
          <nav aria-label="Pied de page" className="grid grid-cols-2 gap-8 text-[0.98rem] lg:col-span-3">
            <ul className="space-y-3">
              {NAVIGATION.map((n) => <li key={n.href}><Link href={n.href} className="text-white/70 hover:text-white">{n.label}</Link></li>)}
              <li><Link href="/commander" className="text-white/70 hover:text-white">Commander</Link></li>
            </ul>
            <ul className="space-y-3">
              <li><Link href="/mentions-legales" className="text-white/70 hover:text-white">Mentions légales</Link></li>
            </ul>
          </nav>
        </div>
      </div>
      <p aria-hidden className="pointer-events-none mt-14 select-none whitespace-nowrap text-center text-[17vw] font-extrabold leading-[0.9] tracking-[-0.05em] text-white/[0.05]">PIXORA</p>
      <p className="conteneur mt-4 text-[0.82rem] text-white/45">© 2026 Pixora Studio. Toutes les créations présentées restent la propriété de leurs auteurs.</p>
    </footer>
  );
}
