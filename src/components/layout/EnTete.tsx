'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { Menu, X, LayoutGrid, Tags, ShoppingBag, Compass } from 'lucide-react';
import { bloquerDefilement } from '@/components/providers/DefilementDoux';
import { classeBouton, Fleche, IconeWhatsApp, lienWhatsApp } from '@/components/ui/Bouton';
import { Logo } from './Logo';

export const NAVIGATION = [
  { href: '/#difference', label: 'La différence' },
  { href: '/creations', label: 'Mes créations' },
  { href: '/tarifs', label: 'Tarifs' },
  { href: '/#contact', label: 'Contact' },
];

/**
 * En-tête adapté à chaque appareil :
 * - ordinateur : navigation centrale en pilule, se replie à la descente et revient à la remontée ;
 * - tablette : navigation en ligne ;
 * - téléphone : logo + menu en haut, barre d'actions au pouce en bas (Commander au centre).
 */
export function EnTete({ logo, whatsapp }: { logo: string | null; whatsapp: string }) {
  const chemin = usePathname();
  const [menu, setMenu] = useState(false);
  const [cache, setCache] = useState(false);
  const [defile, setDefile] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => {
    const avant = scrollY.getPrevious() ?? 0;
    setDefile(y > 24);
    setCache(y > 320 && y > avant + 2);
  });
  useEffect(() => { bloquerDefilement(menu); }, [menu]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- refermer le menu à chaque changement de page
  useEffect(() => { setMenu(false); }, [chemin]);

  const actif = (href: string) => !href.includes('#') && chemin.startsWith(href);
  const wa = lienWhatsApp(whatsapp, 'Bonjour Pixora Studio, ');

  return (
    <>
      <motion.header animate={{ y: cache && !menu ? '-120%' : '0%' }} transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }} className="fixed inset-x-0 top-0 z-50 md:pt-3">
        <div className={`conteneur flex h-16 items-center justify-between gap-4 transition-[background-color,box-shadow] duration-300 md:h-[4.25rem] ${defile ? 'bg-white/90 shadow-[0_10px_30px_-18px_rgba(11,22,52,0.35)] backdrop-blur-md md:mx-auto md:max-w-[84rem] md:rounded-full' : ''}`}>
          <Logo logo={logo} />

          <nav aria-label="Navigation principale" className="absolute left-1/2 hidden -translate-x-1/2 lg:block">
            <ul className="flex items-center gap-1 rounded-full bg-white/85 p-1.5 ring-1 ring-filet backdrop-blur">
              {NAVIGATION.map((n) => (
                <li key={n.href} className="relative">
                  {actif(n.href) && <motion.span layoutId="nav-actif" className="absolute inset-0 rounded-full bg-encre" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                  <Link href={n.href} aria-current={actif(n.href) ? 'page' : undefined}
                    className={`relative block rounded-full px-4 py-2 text-[0.92rem] font-semibold transition-colors ${actif(n.href) ? 'text-white' : 'hover:bg-fond-2'}`}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Navigation principale" className="hidden md:block lg:hidden">
            <ul className="flex items-center gap-5 text-[0.95rem] font-semibold">
              {NAVIGATION.map((n) => (
                <li key={n.href}><Link href={n.href} className={`underline-offset-[6px] ${actif(n.href) ? 'underline decoration-bleu decoration-2' : 'hover:underline'}`}>{n.label}</Link></li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/commander" className={classeBouton('bleu', 'max-md:!hidden !h-11 whitespace-nowrap !pl-5 !pr-1.5 text-[0.92rem]')}>
              Commander<span className="scale-[0.85]"><Fleche /></span>
            </Link>
            <button onClick={() => setMenu(true)} aria-label="Ouvrir le menu" aria-expanded={menu} className="grid h-11 w-11 place-items-center rounded-full bg-encre text-white md:hidden"><Menu size={20} /></button>
          </div>
        </div>
      </motion.header>

      {/* Téléphone : barre d'actions au pouce */}
      <nav aria-label="Actions rapides" className="fixed inset-x-3 bottom-0 z-50 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <ul className="mx-auto flex max-w-md items-center justify-between rounded-full bg-encre/95 p-1.5 text-white shadow-[0_18px_40px_-12px_rgba(11,22,52,0.6)] backdrop-blur">
          {[{ href: '/creations', label: 'Créations', Icone: LayoutGrid }, { href: '/tarifs', label: 'Tarifs', Icone: Tags }].map(({ href, label, Icone }) => (
            <li key={href} className="flex-1">
              <Link href={href} aria-current={chemin.startsWith(href) ? 'page' : undefined} className={`flex flex-col items-center gap-0.5 rounded-full py-2 text-[0.72rem] font-semibold ${chemin.startsWith(href) ? 'text-[#8fb0ff]' : 'text-white/75'}`}>
                <Icone size={19} strokeWidth={1.8} />{label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/commander" aria-label="Commander" className="mx-1 grid h-14 w-14 place-items-center rounded-full bg-bleu text-white active:scale-95"><ShoppingBag size={22} strokeWidth={1.9} /></Link>
          </li>
          <li className="flex-1">
            <a href={wa} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-0.5 rounded-full py-2 text-[0.72rem] font-semibold text-white/75"><IconeWhatsApp size={19} />WhatsApp</a>
          </li>
          <li className="flex-1">
            <button onClick={() => setMenu(true)} className="flex w-full flex-col items-center gap-0.5 rounded-full py-2 text-[0.72rem] font-semibold text-white/75"><Menu size={19} strokeWidth={1.8} />Menu</button>
          </li>
        </ul>
      </nav>

      <AnimatePresence>
        {menu && (
          <motion.div role="dialog" aria-modal="true" aria-label="Menu" className="sur-sombre fixed inset-0 z-[60] flex flex-col bg-encre text-white"
            initial={{ clipPath: 'circle(0% at 92% 4%)' }} animate={{ clipPath: 'circle(150% at 92% 4%)' }} exit={{ clipPath: 'circle(0% at 92% 4%)' }} transition={{ duration: 0.55, ease: [0.65, 0, 0.15, 1] }}>
            <div className="conteneur flex h-16 items-center justify-between">
              <Logo logo={logo} clair onClick={() => setMenu(false)} />
              <button onClick={() => setMenu(false)} aria-label="Fermer le menu" className="grid h-11 w-11 place-items-center rounded-full bg-white/10"><X size={20} /></button>
            </div>
            <nav className="conteneur mt-6 flex-1">
              <ul>
                {[{ href: '/', label: 'Accueil' }, ...NAVIGATION, { href: '/commander', label: 'Commander' }].map((n, i) => (
                  <motion.li key={n.href} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 + i * 0.05, duration: 0.45 }} className="border-b border-white/10">
                    <Link href={n.href} onClick={() => setMenu(false)} className="flex items-center justify-between py-4 text-[2rem] font-extrabold tracking-[-0.03em]">
                      {n.label}{(n.href === '/' ? chemin === '/' : actif(n.href)) && <span className="h-2.5 w-2.5 rounded-full bg-bleu" />}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <button onClick={() => { setMenu(false); window.setTimeout(() => window.dispatchEvent(new Event('pixora:visite')), 600); }}
                className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-white/10 px-5 font-bold"><Compass size={18} className="text-[#8fb0ff]" />Visite guidée du site</button>
            </nav>
            <div className="conteneur pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <p className="text-[0.95rem] text-white/60">WhatsApp</p>
              <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-2 text-[1.5rem] font-extrabold"><IconeWhatsApp size={22} /> {whatsapp}</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
