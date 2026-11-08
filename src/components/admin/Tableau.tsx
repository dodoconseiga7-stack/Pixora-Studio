'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ImagePlus, LogOut, Pencil, Plus, Trash2, X, ExternalLink, AlertTriangle } from 'lucide-react';
import * as A from '@/app/gestion/actions';
import { reduireImage } from './image';
import { Badge } from '@/components/creations/Creations';
import { Toast } from '@/components/ui/Toast';
import { classeBouton } from '@/components/ui/Bouton';
import { FORMULES, type Catalogue, type Creation, type TypeCreation } from '@/lib/types';

type Onglet = 'pixora' | 'ia' | 'domaines' | 'services' | 'reglages';
const ONGLETS: { id: Onglet; nom: string }[] = [
  { id: 'pixora', nom: 'Ma création' }, { id: 'ia', nom: 'Création par IA' }, { id: 'domaines', nom: 'Domaines' },
  { id: 'services', nom: 'Services et tarifs' }, { id: 'reglages', nom: 'Logo et WhatsApp' },
];

const champ = 'mt-1.5 block h-12 w-full rounded-[var(--radius-ctrl)] border-2 border-filet bg-white px-3.5 text-[1rem] outline-none focus:border-bleu';
const petitBouton = 'inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[0.92rem] font-bold transition-colors';

/** TABLEAU DE BORD — tout le contenu du site se gère ici, sans toucher au code. */
export function Tableau({ catalogue: c, stockage }: { catalogue: Catalogue; stockage: boolean }) {
  const router = useRouter();
  const [onglet, setOnglet] = useState<Onglet>('pixora');
  const [toast, setToast] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();
  const [edition, setEdition] = useState<Creation | 'nouvelle' | null>(null);

  /** Lance une action serveur, affiche le résultat, recharge les données. */
  const lancer = (fn: () => Promise<A.Resultat>, apres?: () => void) => demarrer(async () => {
    setErreur(null);
    const r = await fn();
    if (r.ok) { setToast(r.message ?? 'Enregistré.'); setTimeout(() => setToast(null), 2600); apres?.(); router.refresh(); }
    else setErreur(r.erreur);
  });

  const nomD = (id: string) => c.domaines.find((d) => d.id === id)?.nom ?? '?';
  const nomS = (id: string) => c.services.find((s) => s.id === id)?.nom ?? '?';
  const liste = c.creations.filter((x) => x.type === onglet).sort((a, b) => b.ajouteLe - a.ajouteLe);

  return (
    <div className="min-h-dvh bg-fond-2 pb-24">
      <header className="sticky top-0 z-40 border-b border-filet bg-white">
        <div className="conteneur flex h-16 items-center justify-between gap-4">
          <p className="font-extrabold">PIXORA <span className="text-bleu">STUDIO</span> <span className="ml-2 font-semibold text-sourdine">Administration</span></p>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank" className={`${petitBouton} ring-1 ring-filet hover:ring-bleu`}><ExternalLink size={15} /><span className="max-sm:hidden">Voir le site</span></Link>
            <button onClick={() => lancer(async () => { await A.deconnexion(); return { ok: true, message: 'Déconnecté.' }; })} className={`${petitBouton} bg-encre text-white`}><LogOut size={15} /><span className="max-sm:hidden">Se déconnecter</span></button>
          </div>
        </div>
        <nav aria-label="Rubriques" className="conteneur sans-barre flex gap-1 overflow-x-auto pb-2">
          {ONGLETS.map((o) => (
            <button key={o.id} onClick={() => { setOnglet(o.id); setErreur(null); }} aria-current={onglet === o.id ? 'page' : undefined}
              className={`h-10 shrink-0 rounded-full px-4 text-[0.95rem] font-bold ${onglet === o.id ? 'bg-bleu text-white' : 'hover:bg-fond-2'}`}>{o.nom}</button>
          ))}
        </nav>
      </header>

      <div className="conteneur pt-8">
        {!stockage && (
          <p role="alert" className="mb-6 flex gap-3 rounded-[var(--radius-ctrl)] bg-[#fff4e5] p-4 text-[0.95rem]"><AlertTriangle className="shrink-0 text-[#b54708]" size={20} />Le stockage en ligne n’est pas relié : les modifications ne peuvent pas être enregistrées. Reliez un « Blob store » au projet sur Vercel (voir le guide d’installation).</p>
        )}
        {erreur && <p role="alert" className="mb-6 rounded-[var(--radius-ctrl)] bg-[#fdecea] p-4 font-semibold text-erreur">{erreur}</p>}

        {(onglet === 'pixora' || onglet === 'ia') && (
          <section>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="titre text-[2rem]">{onglet === 'pixora' ? 'Ma création' : 'Création par IA'} <span className="text-sourdine">({liste.length})</span></h1>
                <p className="mt-1 max-w-2xl text-sourdine">{onglet === 'pixora'
                  ? 'Vos vraies créations uniquement. Elles apparaissent dans « Mes créations » et dans « La différence ».'
                  : 'Exemples générés par une IA, toujours affichés avec la mention « CRÉATION PAR IA ». Ils servent seulement à la comparaison.'}</p>
              </div>
              <button onClick={() => setEdition('nouvelle')} className={classeBouton('bleu', '!pr-7')}><Plus size={20} />{onglet === 'pixora' ? 'Ajouter une création' : 'Ajouter un exemple IA'}</button>
            </div>
            {liste.length ? (
              <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {liste.map((x) => (
                  <li key={x.id} className="overflow-hidden rounded-[var(--radius-carte)] bg-white ring-1 ring-filet">
                    <div className="relative aspect-[4/5] bg-fond-2">
                      <Image src={x.image} alt={x.titre} fill sizes="(min-width: 1280px) 22vw, 45vw" className="object-cover" />
                      {x.type === 'ia' && <Badge type="ia" className="absolute left-2 top-2" />}
                    </div>
                    <div className="p-4">
                      <p className="font-bold leading-snug">{x.titre}</p>
                      <p className="mt-0.5 text-[0.88rem] text-sourdine">{nomS(x.serviceId)} · {nomD(x.domaineId)}</p>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => setEdition(x)} className={`${petitBouton} bg-fond-2 hover:bg-bleu-clair`}><Pencil size={14} />Modifier</button>
                        <button onClick={() => { if (confirm(`Supprimer « ${x.titre} » ? Cette action est définitive.`)) lancer(() => A.supprimerCreation(x.id)); }} aria-label={`Supprimer ${x.titre}`} className={`${petitBouton} text-erreur hover:bg-[#fdecea]`}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-8 rounded-[var(--radius-carte)] bg-white p-8 text-sourdine ring-1 ring-filet">Aucune image pour l’instant. Ajoutez la première avec le bouton ci-dessus.</p>}
          </section>
        )}

        {onglet === 'domaines' && <Domaines c={c} lancer={lancer} enCours={enCours} />}
        {onglet === 'services' && <Services c={c} lancer={lancer} enCours={enCours} />}
        {onglet === 'reglages' && <Reglages c={c} lancer={lancer} enCours={enCours} setErreur={setErreur} />}
      </div>

      <AnimatePresence>
        {edition && (
          <FormCreation c={c} type={onglet === 'ia' ? 'ia' : 'pixora'} creation={edition === 'nouvelle' ? null : edition} enCours={enCours}
            onFermer={() => setEdition(null)} onEnvoyer={(fd) => lancer(() => A.enregistrerCreation(fd), () => setEdition(null))} erreur={erreur} />
        )}
      </AnimatePresence>
      <Toast texte={toast} />
    </div>
  );
}

type Lancer = (fn: () => Promise<A.Resultat>, apres?: () => void) => void;

/* ───────── Ajouter / modifier une création ───────── */
function FormCreation({ c, type, creation, onFermer, onEnvoyer, enCours, erreur }: {
  c: Catalogue; type: TypeCreation; creation: Creation | null; onFermer: () => void; onEnvoyer: (fd: FormData) => void; enCours: boolean; erreur: string | null;
}) {
  const [apercu, setApercu] = useState<string | null>(creation?.image ?? null);
  const [fichier, setFichier] = useState<File | null>(null);
  const [probleme, setProbleme] = useState<string | null>(null);
  const premier = useRef<HTMLSelectElement>(null);
  useEffect(() => { premier.current?.focus(); const t = (e: KeyboardEvent) => e.key === 'Escape' && onFermer(); window.addEventListener('keydown', t); return () => window.removeEventListener('keydown', t); }, [onFermer]);

  const choisirFichier = async (f: File | undefined) => {
    setProbleme(null);
    if (!f) return;
    try { const r = await reduireImage(f); setFichier(r); setApercu(URL.createObjectURL(r)); }
    catch (e) { setProbleme(e instanceof Error ? e.message : 'Image illisible.'); }
  };
  const envoyer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.delete('fichier');
    if (fichier) fd.set('image', fichier);
    else if (!creation) { setProbleme('Ajoutez l’image de la création.'); return; }
    onEnvoyer(fd);
  };

  return (
    <motion.div role="dialog" aria-modal="true" aria-label={creation ? 'Modifier la création' : 'Ajouter une création'} data-lenis-prevent
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 overflow-y-auto bg-encre/60 p-3 backdrop-blur-sm sm:p-8" onClick={onFermer}>
      <motion.form onSubmit={envoyer} onClick={(e) => e.stopPropagation()} initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: 10 }}
        className="mx-auto grid max-w-4xl gap-6 rounded-[var(--radius-carte)] bg-white p-6 sm:p-8 md:grid-cols-[1fr_1.2fr]">
        <input type="hidden" name="id" value={creation?.id ?? ''} />
        <input type="hidden" name="type" value={creation?.type ?? type} />
        <div>
          <p className="font-bold">Image <span className="text-erreur">*</span></p>
          <label className="mt-1.5 grid aspect-[4/5] cursor-pointer place-items-center overflow-hidden rounded-[var(--radius-carte)] border-2 border-dashed border-filet-fort bg-fond-2 hover:border-bleu">
            {apercu ? (
              // eslint-disable-next-line @next/next/no-img-element -- aperçu local avant l'envoi
              <img src={apercu} alt="Aperçu" className="h-full w-full object-contain" />
            ) : <span className="flex flex-col items-center gap-2 p-6 text-center text-sourdine"><ImagePlus size={30} />Choisir une image<span className="text-[0.85rem]">JPG, PNG ou WebP</span></span>}
            <input name="fichier" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => choisirFichier(e.target.files?.[0])} />
          </label>
          {creation && <p className="mt-2 text-[0.88rem] text-sourdine">Touchez l’image pour la remplacer.</p>}
        </div>
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="titre text-[1.7rem]">{creation ? 'Modifier' : 'Ajouter'}</h2>
              <Badge type={creation?.type ?? type} className="mt-2" />
            </div>
            <button type="button" onClick={onFermer} aria-label="Fermer" className="grid h-10 w-10 place-items-center rounded-full bg-fond-2"><X size={18} /></button>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="font-bold">Domaine
              <select ref={premier} name="domaineId" required defaultValue={creation?.domaineId ?? ''} className={champ}>
                <option value="" disabled>Choisir…</option>{c.domaines.map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
              </select></label>
            <label className="font-bold">Type de service
              <select name="serviceId" required defaultValue={creation?.serviceId ?? ''} className={champ}>
                <option value="" disabled>Choisir…</option>{c.services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select></label>
          </div>
          <label className="mt-4 font-bold">Titre<input name="titre" required maxLength={120} defaultValue={creation?.titre ?? ''} placeholder="Ex. : Flyer pour Délices de Gounghin" className={champ} /></label>
          <label className="mt-4 font-bold">Description <span className="font-normal text-sourdine">(facultatif)</span>
            <textarea name="description" rows={3} maxLength={400} defaultValue={creation?.description ?? ''} className="mt-1.5 block w-full rounded-[var(--radius-ctrl)] border-2 border-filet px-3.5 py-2.5 outline-none focus:border-bleu" /></label>
          {(creation?.type ?? type) === 'pixora' && <p className="mt-4 rounded-[var(--radius-ctrl)] bg-fond-2 p-3 text-[0.9rem] text-sourdine">Importez uniquement vos propres créations. Une image trouvée sur Internet (Pinterest…) ne doit pas être présentée comme la vôtre.</p>}
          {(probleme || erreur) && <p role="alert" className="mt-4 font-semibold text-erreur">{probleme ?? erreur}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <button disabled={enCours} className={classeBouton('bleu', '!pr-7')}>{enCours ? 'Enregistrement…' : creation ? 'Enregistrer' : 'Ajouter'}</button>
            <button type="button" onClick={onFermer} className={classeBouton('secondaire')}>Annuler</button>
          </div>
        </div>
      </motion.form>
    </motion.div>
  );
}

/* ───────── Domaines ───────── */
function Domaines({ c, lancer, enCours }: { c: Catalogue; lancer: Lancer; enCours: boolean }) {
  const [nouveau, setNouveau] = useState('');
  return (
    <section className="max-w-3xl">
      <h1 className="titre text-[2rem]">Domaines</h1>
      <p className="mt-1 text-sourdine">Les domaines servent à classer vos créations et apparaissent dans le formulaire de commande.</p>
      <form onSubmit={(e) => { e.preventDefault(); lancer(() => A.ajouterDomaine(nouveau), () => setNouveau('')); }} className="mt-6 flex gap-2">
        <input value={nouveau} onChange={(e) => setNouveau(e.target.value)} placeholder="Nouveau domaine (ex. : Pharmacie)" aria-label="Nouveau domaine" className={`${champ} !mt-0`} />
        <button disabled={enCours || !nouveau.trim()} className={`${petitBouton} !h-12 shrink-0 bg-bleu text-white`}><Plus size={16} />Ajouter</button>
      </form>
      <ul className="mt-6 divide-y divide-filet rounded-[var(--radius-carte)] bg-white ring-1 ring-filet">
        {c.domaines.map((d) => <LigneNom key={d.id} nom={d.nom} usage={c.creations.filter((x) => x.domaineId === d.id).length}
          onRenommer={(n) => lancer(() => A.renommerDomaine(d.id, n))} onSupprimer={() => confirm(`Supprimer le domaine « ${d.nom} » ?`) && lancer(() => A.supprimerDomaine(d.id))} />)}
      </ul>
    </section>
  );
}

function LigneNom({ nom, usage, onRenommer, onSupprimer }: { nom: string; usage: number; onRenommer: (n: string) => void; onSupprimer: () => void }) {
  const [v, setV] = useState(nom);
  return (
    <li className="flex flex-wrap items-center gap-2 p-3">
      <input value={v} onChange={(e) => setV(e.target.value)} aria-label="Nom du domaine" className="h-11 min-w-0 flex-1 rounded-xl border-2 border-transparent px-3 font-semibold hover:border-filet focus:border-bleu focus:outline-none" />
      <span className="text-[0.88rem] text-sourdine">{usage} création{usage > 1 ? 's' : ''}</span>
      {v.trim() !== nom && <button onClick={() => onRenommer(v)} className={`${petitBouton} bg-bleu text-white`}>Renommer</button>}
      <button onClick={onSupprimer} aria-label={`Supprimer ${nom}`} className={`${petitBouton} text-erreur hover:bg-[#fdecea]`}><Trash2 size={15} /></button>
    </li>
  );
}

/* ───────── Services et tarifs ───────── */
function Services({ c, lancer, enCours }: { c: Catalogue; lancer: Lancer; enCours: boolean }) {
  return (
    <section>
      <h1 className="titre text-[2rem]">Services et tarifs</h1>
      <p className="mt-1 max-w-2xl text-sourdine">Prix en F CFA pour chaque formule. Laissez une case vide pour afficher « Sur devis ». Le calcul automatique de la commande utilise ces prix.</p>
      <ul className="mt-6 grid gap-3 lg:grid-cols-2">
        {c.services.map((s) => <FormService key={`${s.id}-${c.majLe}`} s={s} c={c} lancer={lancer} enCours={enCours} />)}
        <FormService key={`nouveau-${c.services.length}`} c={c} lancer={lancer} enCours={enCours} />
      </ul>
    </section>
  );
}

function FormService({ s, c, lancer, enCours }: { s?: Catalogue['services'][number]; c: Catalogue; lancer: Lancer; enCours: boolean }) {
  const usage = s ? c.creations.filter((x) => x.serviceId === s.id).length : 0;
  return (
    <li className={`rounded-[var(--radius-carte)] p-5 ring-1 ${s ? 'bg-white ring-filet' : 'border-2 border-dashed border-filet-fort bg-transparent ring-transparent'}`}>
      <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); lancer(() => A.enregistrerService(fd)); }}>
        <input type="hidden" name="id" value={s?.id ?? ''} />
        <label className="block font-bold">{s ? 'Service' : 'Nouveau service'}<input name="nom" required maxLength={60} defaultValue={s?.nom ?? ''} placeholder="Ex. : Carte d’invitation" className={champ} /></label>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {FORMULES.map((f) => (
            <label key={f.id} className="text-[0.92rem] font-bold">{f.nom}
              <input name={f.id} inputMode="numeric" pattern="[0-9 ]*" defaultValue={s?.prix[f.id] ?? ''} placeholder="Sur devis" className={`${champ} chiffres`} />
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button disabled={enCours} className={`${petitBouton} bg-bleu text-white`}>{s ? 'Enregistrer' : 'Ajouter le service'}</button>
          {s && <button type="button" onClick={() => confirm(`Supprimer le service « ${s.nom} » ?`) && lancer(() => A.supprimerService(s.id))} className={`${petitBouton} text-erreur hover:bg-[#fdecea]`}><Trash2 size={15} />Supprimer</button>}
          {s && <span className="text-[0.85rem] text-sourdine">{usage} création{usage > 1 ? 's' : ''}</span>}
        </div>
      </form>
    </li>
  );
}

/* ───────── Logo et WhatsApp ───────── */
function Reglages({ c, lancer, enCours, setErreur }: { c: Catalogue; lancer: Lancer; enCours: boolean; setErreur: (e: string | null) => void }) {
  const [numero, setNumero] = useState(c.whatsapp);
  const envoyerLogo = async (f: File | undefined) => {
    if (!f) return;
    try { const r = await reduireImage(f, 800, 0.92); const fd = new FormData(); fd.set('logo', r); lancer(() => A.changerLogo(fd)); }
    catch (e) { setErreur(e instanceof Error ? e.message : 'Image illisible.'); }
  };
  return (
    <section className="grid max-w-4xl gap-6 md:grid-cols-2">
      <div className="rounded-[var(--radius-carte)] bg-white p-6 ring-1 ring-filet">
        <h1 className="titre text-[1.7rem]">Logo</h1>
        <p className="mt-1 text-sourdine">Affiché dans l’en-tête, l’accueil et le pied de page.</p>
        <div className="mt-5 grid h-40 place-items-center rounded-[var(--radius-ctrl)] bg-fond-2">
          {c.logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- logo importé
            <img src={c.logo} alt="Logo actuel" className="max-h-32 w-auto rounded-xl object-contain" />
          ) : <p className="text-sourdine">Aucun logo : le nom « PIXORA STUDIO » est affiché en texte.</p>}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <label className={`${petitBouton} cursor-pointer bg-bleu text-white`}><ImagePlus size={16} />{c.logo ? 'Remplacer le logo' : 'Ajouter mon logo'}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={enCours} onChange={(e) => envoyerLogo(e.target.files?.[0])} /></label>
          {c.logo && <button onClick={() => confirm('Supprimer le logo ?') && lancer(() => A.supprimerLogo())} className={`${petitBouton} text-erreur hover:bg-[#fdecea]`}><Trash2 size={15} />Supprimer</button>}
        </div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); lancer(() => A.changerWhatsapp(numero)); }} className="rounded-[var(--radius-carte)] bg-white p-6 ring-1 ring-filet">
        <h2 className="titre text-[1.7rem]">Numéro WhatsApp</h2>
        <p className="mt-1 text-sourdine">Les commandes et les boutons « Contacter » utilisent ce numéro.</p>
        <label className="mt-5 block font-bold">Numéro avec l’indicatif<input value={numero} onChange={(e) => setNumero(e.target.value)} inputMode="tel" className={`${champ} chiffres`} /></label>
        <button disabled={enCours || numero.trim() === c.whatsapp} className={`${petitBouton} mt-4 bg-bleu text-white`}>Enregistrer</button>
      </form>
    </section>
  );
}
