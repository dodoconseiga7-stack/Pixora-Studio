'use client';

import Image from 'next/image';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { BoutonLien, IconeWhatsApp, lienWhatsApp } from '@/components/ui/Bouton';
import type { CreationAffichee } from '@/components/creations/Creations';
import { ENTIERES } from '@/lib/format';

const ease = [0.2, 0.8, 0.2, 1] as const;
const LARGES = ['logo', 'etiquette'];

/**
 * ACCUEIL — un seul moment orchestré : le titre monte mot par mot, puis la planche de créations
 * se pose. À la souris, la planche suit très légèrement le curseur (profondeur sans effet 3D).
 */
export function Hero({ logo, creations, whatsapp }: { logo: string | null; creations: CreationAffichee[]; whatsapp: string }) {
  const reduit = useReducedMotion();
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 }), sy = useSpring(my, { stiffness: 60, damping: 18 });
  const x1 = useTransform(sx, (v) => v * 14), y1 = useTransform(sy, (v) => v * 14);
  const x2 = useTransform(sx, (v) => v * -10), y2 = useTransform(sy, (v) => v * -10);
  const bouge = (e: React.PointerEvent) => {
    if (reduit || e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5);
  };
  // Planche d’accueil : des créations verticales (affiches, flyers…) ; logos et étiquettes sont trop larges.
  const [a, b, c, d] = creations.filter((x) => !LARGES.includes(x.serviceId));
  const mots = ['Bienvenue', 'à'];

  return (
    <section onPointerMove={bouge} className="relative overflow-hidden pb-16 pt-28 lg:pb-24 lg:pt-36">
      {/* trame de repères de mise en page : le vocabulaire du graphiste, très discret */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-filet)_1px,transparent_1px)] bg-[size:calc(100%/12)_100%] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className="conteneur relative grid items-center gap-12 lg:grid-cols-12">
        <div data-guide="hero" className="lg:col-span-6">
          {logo && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element -- logo importé par le propriétaire */}
              <img src={logo} alt="Logo Pixora Studio" className="h-24 w-auto max-w-[12rem] rounded-2xl object-contain sm:h-28" />
            </motion.div>
          )}
          <h1 className="titre text-[clamp(2.7rem,6.4vw,5.3rem)]">
            {mots.map((m, i) => (
              <motion.span key={m} className="mr-[0.25em] inline-block" initial={reduit ? false : { opacity: 0, y: '0.5em' }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08 * i, ease }}>{m}</motion.span>
            ))}
            <br />
            <motion.span className="inline-block text-bleu" initial={reduit ? false : { opacity: 0, y: '0.5em' }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease }}>Pixora Studio.</motion.span>
          </h1>
          <motion.p initial={reduit ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35, ease }}
            className="mt-7 max-w-xl text-[clamp(1.15rem,1.6vw,1.35rem)] leading-relaxed text-sourdine">
            « Au-delà de l’IA, nous créons des designs pensés, maîtrisés et adaptés à votre image. »
          </motion.p>
          <motion.div initial={reduit ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.45, ease }}
            className="mt-9 flex flex-col gap-3 sm:flex-row">
            <BoutonLien href="/creations" variante="sombre">Voir mes créations</BoutonLien>
            <BoutonLien href="/commander">Commander</BoutonLien>
          </motion.div>
          <motion.a initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            href={lienWhatsApp(whatsapp, 'Bonjour Pixora Studio, ')} target="_blank" rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 font-semibold text-sourdine hover:text-bleu">
            <IconeWhatsApp size={20} /> WhatsApp {whatsapp}
          </motion.a>
        </div>

        {a && (
          <div className="relative grid grid-cols-2 gap-3 sm:gap-4 lg:col-span-6">
            {[{ c: a, cls: 'row-span-2 aspect-[3/4.4]', x: x1, y: y1, d: 0.25 }, { c: b, cls: 'aspect-square', x: x2, y: y2, d: 0.35 }, { c: c, cls: 'aspect-square', x: x2, y: y2, d: 0.45 }]
              .filter((t) => t.c).map(({ c: cr, cls, x, y, d: delai }) => (
                <motion.div key={cr!.id} style={{ x, y }} className={cls}>
                  <motion.figure initial={reduit ? false : { opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: delai, ease }}
                    className="relative h-full w-full overflow-hidden rounded-[var(--radius-carte)] bg-fond-2 shadow-[0_30px_60px_-30px_rgba(11,22,52,0.45)] ring-1 ring-filet">
                    <Image src={cr!.image} alt={cr!.titre} fill priority sizes="(min-width: 1024px) 26vw, 50vw" className="object-cover" />
                    <figcaption className="absolute inset-x-2 bottom-2 rounded-xl bg-white px-3 py-2 text-[0.8rem] font-bold">{cr!.service} · {cr!.domaine}</figcaption>
                  </motion.figure>
                </motion.div>
              ))}
            {d && (
              <motion.div style={{ x: x1, y: y1 }} initial={reduit ? false : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.7, ease }}
                className="absolute -bottom-6 -left-4 hidden rounded-2xl bg-encre px-5 py-4 text-white shadow-xl sm:block">
                <p className="text-[2rem] font-extrabold leading-none">{creations.length}</p>
                <p className="mt-1 text-[0.85rem] text-white/70">créations à découvrir</p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/** Ruban de créations qui défile doucement (s'arrête au survol). */
export function Ruban({ creations }: { creations: CreationAffichee[] }) {
  if (creations.length < 4) return null;
  const liste = [...creations, ...creations];
  return (
    <div className="group relative overflow-hidden border-y border-filet bg-fond-2 py-5" aria-label="Aperçu des créations">
      <ul className="flex w-max animate-defile gap-4 group-hover:[animation-play-state:paused]">
        {liste.map((c, i) => (
          <li key={`${c.id}-${i}`} aria-hidden={i >= creations.length} className="relative h-44 w-36 shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-filet sm:h-52 sm:w-44">
            <Image src={c.image} alt={i < creations.length ? c.titre : ''} fill sizes="180px" className={ENTIERES.includes(c.serviceId) ? 'object-contain p-3' : 'object-cover'} />
          </li>
        ))}
      </ul>
    </div>
  );
}
