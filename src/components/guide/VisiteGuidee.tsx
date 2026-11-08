'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { Compass, X } from 'lucide-react';
import { bloquerDefilement, defilerVers } from '@/components/providers/DefilementDoux';

type Etape = { cible: string; titre: string; texte: string };

/** Le parcours expliqué, page par page (cibles repérées par l'attribut data-guide). */
const PARCOURS: Record<string, Etape[]> = {
  '/': [
    { cible: 'hero', titre: 'Bienvenue chez Pixora Studio', texte: 'Deux chemins : voir les créations, ou commander directement. Je vous montre le site en quelques étapes.' },
    { cible: 'difference', titre: 'La différence', texte: 'À gauche une vraie création du designer, à droite un exemple fait par une IA. Changez de service avec les boutons pour comparer.' },
    { cible: 'domaines-accueil', titre: 'Votre domaine', texte: 'Plombier, restaurant, salon de coiffure… Touchez votre domaine pour voir les créations qui lui correspondent.' },
    { cible: 'tarifs', titre: 'Les tarifs', texte: 'Basic, Standard ou Premium : le prix dépend du service. Touchez un prix pour commander directement.' },
    { cible: 'etapes', titre: 'Commander en 3 étapes', texte: 'Vous choisissez, vous vérifiez le récapitulatif, puis la commande part sur WhatsApp, déjà rédigée.' },
    { cible: 'contact', titre: 'Une question ?', texte: 'Le numéro WhatsApp de Pixora Studio est ici. Un bouton ouvre la discussion directement.' },
  ],
  '/creations': [
    { cible: 'domaines', titre: '1. Choisissez votre domaine', texte: 'Le chiffre indique combien de créations existent pour chaque domaine.' },
    { cible: 'services', titre: '2. Puis le service', texte: 'Carte de visite, flyer, affiche, logo… Les services sans création encore en ligne restent commandables.' },
    { cible: 'grille', titre: '3. Agrandissez une création', texte: 'Touchez une image pour la voir en grand, puis « Commander ce type de création ».' },
  ],
  '/tarifs': [
    { cible: 'formules', titre: 'Trois formules', texte: 'Basic pour l’essentiel, Standard plus personnalisé, Premium le plus poussé.' },
    { cible: 'grille-tarifs', titre: 'Le prix de chaque service', texte: 'Touchez un prix : la commande s’ouvre avec ce service et cette formule déjà choisis.' },
  ],
  '/commander': [
    { cible: 'etapes', titre: 'Quatre étapes', texte: 'Services, activité, coordonnées, puis récapitulatif. Vous pouvez revenir en arrière à tout moment.' },
    { cible: 'formulaire', titre: 'Choisissez vos services', texte: 'Un service, sa formule, la quantité, puis « Ajouter à ma commande ». Recommencez pour en ajouter d’autres.' },
    { cible: 'panier', titre: 'Le total en direct', texte: 'Votre commande et son total se mettent à jour à chaque choix. Vous pouvez changer la formule ou la quantité ici.' },
  ],
};

const VU = 'pixora:visite-vue';

export function VisiteGuidee() {
  const chemin = usePathname();
  const etapes = useMemo(() => PARCOURS[chemin] ?? [], [chemin]);
  const [i, setI] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [invitation, setInvitation] = useState(false);

  const fermer = useCallback(() => {
    setI(null); setRect(null); bloquerDefilement(false);
    try { localStorage.setItem(VU, '1'); } catch { /* ignoré */ }
  }, []);

  // Première visite : une invitation discrète, jamais une visite imposée.
  useEffect(() => {
    if (!etapes.length) return;
    let vu = false;
    try { vu = !!localStorage.getItem(VU); } catch { /* ignoré */ }
    if (vu) return;
    const t = window.setTimeout(() => setInvitation(true), 2500);
    return () => window.clearTimeout(t);
  }, [etapes.length]);

  // La visite se referme quand on change de page (sans marquer la visite comme vue).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- remise à zéro au changement de page
    setI(null); setRect(null); bloquerDefilement(false);
  }, [chemin]);

  // Lancement depuis le menu du téléphone (événement « pixora:visite »).
  useEffect(() => {
    const lancer = () => { setInvitation(false); setI(0); };
    window.addEventListener('pixora:visite', lancer);
    return () => window.removeEventListener('pixora:visite', lancer);
  }, []);

  // Sur téléphone, le bouton n'apparaît qu'en haut de page : il ne doit jamais cacher le contenu.
  const { scrollY } = useScroll();
  const [enHaut, setEnHaut] = useState(true);
  useMotionValueEvent(scrollY, 'change', (y) => setEnHaut(y < 280));

  // Place le projecteur sur la zone de l'étape en cours (et le suit si la page bouge).
  useLayoutEffect(() => {
    if (i === null) return;
    const el = document.querySelector<HTMLElement>(`[data-guide="${etapes[i]?.cible}"]`);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- zone absente de la page : pas de projecteur
    if (!el) { setRect(null); return; }
    bloquerDefilement(false);
    const y = el.getBoundingClientRect().top + window.scrollY;
    defilerVers(Math.max(0, y - Math.max(90, (window.innerHeight - Math.min(el.offsetHeight, window.innerHeight * 0.55)) / 3)));
    let raf = 0;
    const suivre = () => { setRect(el.getBoundingClientRect()); raf = requestAnimationFrame(suivre); };
    raf = requestAnimationFrame(suivre);
    const bloque = window.setTimeout(() => bloquerDefilement(true), 900);
    return () => { cancelAnimationFrame(raf); window.clearTimeout(bloque); };
  }, [i, etapes]);

  useEffect(() => {
    if (i === null) return;
    const t = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fermer();
      if (e.key === 'ArrowRight') setI((x) => (x !== null && x < etapes.length - 1 ? x + 1 : x));
      if (e.key === 'ArrowLeft') setI((x) => (x ? x - 1 : x));
    };
    window.addEventListener('keydown', t);
    return () => window.removeEventListener('keydown', t);
  }, [i, etapes.length, fermer]);

  if (!etapes.length) return null;
  const e = i !== null ? etapes[i] : null;
  const marge = 10;
  const haut = rect ? Math.max(rect.top - marge, 8) : 0;
  const hauteur = rect ? Math.min(rect.height + marge * 2, window.innerHeight - 16) : 0;
  const bulleEnBas = rect ? rect.top + hauteur < window.innerHeight * 0.62 : true;

  return (
    <>
      <div className={`${enHaut ? '' : 'max-md:pointer-events-none max-md:opacity-0'} transition-opacity duration-300`}>
      <AnimatePresence>
        {i === null && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-28 left-3 z-40 flex max-w-[calc(100vw-1.5rem)] items-end gap-2 md:bottom-6 md:left-6">
            <button onClick={() => { setInvitation(false); setI(0); }} aria-label="Lancer la visite guidée"
              className="flex h-12 shrink-0 items-center gap-2 rounded-full bg-white px-4 font-bold text-encre shadow-[0_12px_30px_-12px_rgba(11,22,52,0.45)] ring-1 ring-filet hover:text-bleu">
              <Compass size={20} className="text-bleu" /><span className="max-sm:sr-only">Visite guidée</span>
            </button>
            <AnimatePresence>
              {invitation && (
                <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} role="status"
                  className="relative mb-1 max-w-[15rem] rounded-2xl bg-encre p-4 pr-9 text-[0.92rem] text-white shadow-xl">
                  Première visite ? <button onClick={() => { setInvitation(false); setI(0); }} className="font-bold text-[#8fb0ff] underline">Je vous guide</button> en quelques secondes.
                  <button onClick={() => { setInvitation(false); try { localStorage.setItem(VU, '1'); } catch { /* ignoré */ } }} aria-label="Non merci" className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full hover:bg-white/10"><X size={14} /></button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      <AnimatePresence>
        {e && (
          <motion.div key="visite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[75]" role="dialog" aria-modal="true" aria-label="Visite guidée">
            {/* Projecteur : tout s'assombrit sauf la zone expliquée */}
            {rect ? (
              <motion.div aria-hidden animate={{ top: haut, left: Math.max(rect.left - marge, 6), width: Math.min(rect.width + marge * 2, window.innerWidth - 12), height: hauteur }}
                transition={{ type: 'spring', stiffness: 260, damping: 32 }}
                className="pointer-events-none fixed rounded-[22px] shadow-[0_0_0_9999px_rgba(11,22,52,0.62)] ring-2 ring-bleu" />
            ) : <div aria-hidden className="fixed inset-0 bg-encre/60" />}
            <button aria-label="Fermer la visite" onClick={fermer} className="absolute inset-0 cursor-default" />

            <motion.div key={i} initial={{ opacity: 0, y: bulleEnBas ? 12 : -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              className={`fixed inset-x-3 z-10 mx-auto max-w-md rounded-[var(--radius-carte)] bg-white p-6 shadow-2xl sm:inset-x-6 ${bulleEnBas ? 'bottom-4 md:bottom-8' : 'top-20'}`}>
              <div className="flex items-center justify-between">
                <p className="text-[0.88rem] font-bold text-bleu">Étape {i! + 1} sur {etapes.length}</p>
                <button onClick={fermer} aria-label="Quitter la visite" className="grid h-9 w-9 place-items-center rounded-full bg-fond-2 hover:bg-bleu-clair"><X size={16} /></button>
              </div>
              <h2 className="mt-2 text-[1.35rem] font-extrabold tracking-[-0.02em]">{e.titre}</h2>
              <p className="mt-2 text-sourdine">{e.texte}</p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="flex gap-1.5" aria-hidden>{etapes.map((_, k) => <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? 'w-6 bg-bleu' : 'w-1.5 bg-filet-fort'}`} />)}</div>
                <div className="flex gap-2">
                  {i! > 0 && <button onClick={() => setI(i! - 1)} className="h-11 rounded-full px-4 font-bold ring-1 ring-filet hover:ring-bleu">Précédent</button>}
                  <button onClick={() => (i! < etapes.length - 1 ? setI(i! + 1) : fermer())} className="h-11 rounded-full bg-bleu px-5 font-bold text-white hover:bg-bleu-fonce">
                    {i! < etapes.length - 1 ? 'Suivant' : 'Terminer'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
