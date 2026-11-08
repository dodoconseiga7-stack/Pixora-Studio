'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Compass, Minus, Pencil, Plus, Trash2 } from 'lucide-react';
import { defilerVers } from '@/components/providers/DefilementDoux';
import { classeBouton, Fleche, IconeWhatsApp, lienWhatsApp } from '@/components/ui/Bouton';
import { fcfa } from '@/lib/format';
import { FORMULES, type Catalogue, type FormuleId } from '@/lib/types';
import { aDesDevis, commandeVide, messageWhatsApp, MODES_CONTACT, nomFormule, prixLigne, total, type Commande as TCommande, type Ligne } from '@/lib/commande';

const ETAPES = ['Vos services', 'Votre activité', 'Vos coordonnées', 'Récapitulatif'] as const;
const BROUILLON = 'pixora:commande';
const ease = [0.2, 0.8, 0.2, 1] as const;

/**
 * COMMANDER — formulaire guidé en 4 étapes, total calculé en direct, récapitulatif complet,
 * puis WhatsApp s'ouvre avec la commande rédigée. Rien n'est enregistré sur un serveur :
 * le brouillon reste seulement dans l'onglet (sessionStorage), pour ne rien perdre en revenant.
 */
export function Commande({ catalogue }: { catalogue: Catalogue }) {
  const params = useSearchParams();
  const id = useId();
  const haut = useRef<HTMLDivElement>(null);
  const [etape, setEtape] = useState(0);
  const [k, setK] = useState<TCommande>(commandeVide);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [pret, setPret] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  // Sélection en cours (étape 1)
  const [service, setService] = useState('');
  const [formule, setFormule] = useState<FormuleId | ''>('');
  const [quantite, setQuantite] = useState(1);

  const serviceChoisi = catalogue.services.find((s) => s.id === service);
  const set = <K extends keyof TCommande>(cle: K, v: TCommande[K]) => { setK((x) => ({ ...x, [cle]: v })); setErreurs((e) => ({ ...e, [cle]: '' })); };

  // Brouillon + préremplissage depuis un lien (?service=&formule=&domaine=) : lecture unique au montage.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let base = commandeVide;
    try { const b = sessionStorage.getItem(BROUILLON); if (b) base = { ...commandeVide, ...JSON.parse(b) }; } catch { /* navigation privée */ }
    const s = params.get('service'), f = params.get('formule') as FormuleId | null, d = params.get('domaine');
    const sOk = catalogue.services.some((x) => x.id === s), fOk = FORMULES.some((x) => x.id === f);
    if (d && catalogue.domaines.some((x) => x.id === d)) base = { ...base, domaineId: d };
    if (sOk && fOk && !base.lignes.some((l) => l.serviceId === s && l.formule === f)) base = { ...base, lignes: [...base.lignes, { serviceId: s!, formule: f!, quantite: 1 }] };
    else if (sOk) setService(s!);
    setK(base); setPret(true);
  }, [params, catalogue]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => { if (pret) try { sessionStorage.setItem(BROUILLON, JSON.stringify(k)); } catch { /* ignoré */ } }, [k, pret]);

  const somme = useMemo(() => total(catalogue, k.lignes), [catalogue, k.lignes]);
  const devis = aDesDevis(catalogue, k.lignes);

  const ajouter = () => {
    if (!service) return setErreurs({ service: 'Choisissez un service.' });
    if (!formule) return setErreurs({ formule: 'Choisissez une formule.' });
    setK((x) => {
      const existe = x.lignes.findIndex((l) => l.serviceId === service && l.formule === formule);
      const lignes = existe >= 0 ? x.lignes.map((l, i) => i === existe ? { ...l, quantite: Math.min(50, l.quantite + quantite) } : l) : [...x.lignes, { serviceId: service, formule, quantite }];
      return { ...x, lignes };
    });
    setService(''); setFormule(''); setQuantite(1); setErreurs({});
  };
  const majLigne = (i: number, m: Partial<Ligne>) => setK((x) => ({ ...x, lignes: x.lignes.map((l, j) => j === i ? { ...l, ...m } : l) }));
  const retirer = (i: number) => setK((x) => ({ ...x, lignes: x.lignes.filter((_, j) => j !== i) }));

  const valider = (n: number) => {
    const e: Record<string, string> = {};
    if (n === 0 && !k.lignes.length) e.lignes = service && formule ? 'Appuyez sur « Ajouter à ma commande » pour garder ce service.' : 'Ajoutez au moins un service à votre commande.';
    if (n === 1) {
      if (!k.domaineId) e.domaineId = 'Choisissez votre domaine.';
      if (!k.logo) e.logo = 'Indiquez si votre entreprise a déjà un logo.';
    }
    if (n === 2) {
      if (!k.nom.trim()) e.nom = 'Indiquez votre nom.';
      if (!k.prenom.trim()) e.prenom = 'Indiquez votre prénom.';
      if (k.telephone.replace(/\D/g, '').length < 8) e.telephone = 'Indiquez un numéro complet (8 chiffres au moins).';
      if (!k.adresse.trim()) e.adresse = 'Indiquez votre adresse ou votre quartier.';
      if (!k.contact) e.contact = 'Choisissez comment être recontacté.';
    }
    setErreurs(e);
    const premier = Object.keys(e)[0];
    if (premier) document.getElementById(`${id}-${premier}`)?.focus({ preventScroll: false });
    return !premier;
  };
  const aller = (n: number) => { setEtape(n); requestAnimationFrame(() => haut.current && defilerVers(haut.current.offsetTop - 20)); };
  const suivant = () => { if (valider(etape)) aller(etape + 1); };

  const envoyer = () => {
    window.open(lienWhatsApp(catalogue.whatsapp, messageWhatsApp(catalogue, k)), '_blank', 'noopener,noreferrer');
    setEnvoye(true);
  };
  const recommencer = () => { setK(commandeVide); setEnvoye(false); aller(0); try { sessionStorage.removeItem(BROUILLON); } catch { /* ignoré */ } };

  const champ = (n: string) => `mt-2 block h-14 w-full rounded-[var(--radius-ctrl)] border-2 bg-white px-4 text-[1.05rem] outline-none transition-colors focus:border-bleu ${erreurs[n] ? 'border-erreur' : 'border-filet'}`;
  const erreur = (n: string) => erreurs[n] ? <p id={`${id}-${n}-err`} role="alert" className="mt-2 text-[0.95rem] font-semibold text-erreur">{erreurs[n]}</p> : null;
  const tuile = (actif: boolean) => `relative rounded-[var(--radius-ctrl)] border-2 p-4 text-left transition-colors ${actif ? 'border-bleu bg-bleu-clair' : 'border-filet bg-white hover:border-filet-fort'}`;
  const coche = (actif: boolean) => actif ? <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-bleu text-white"><Check size={14} strokeWidth={3} /></span> : null;

  /** GUIDE INTERACTIF : la prochaine chose à faire, recalculée à chaque action du client. */
  const conseil = (() => {
    if (etape === 0) {
      if (!service && !k.lignes.length) return 'Touchez le service que vous voulez commander, par exemple « Flyer ».';
      if (service && !formule) return `Choisissez la formule pour « ${serviceChoisi?.nom} » : le prix est écrit dans chaque case.`;
      if (service && formule) return 'Réglez la quantité si besoin, puis touchez « Ajouter à ma commande ».';
      return `${k.lignes.length} service${k.lignes.length > 1 ? 's' : ''} dans votre commande. Ajoutez-en un autre, ou touchez « Continuer ».`;
    }
    if (etape === 1) {
      if (!k.domaineId) return 'Touchez le domaine qui correspond le mieux à votre activité.';
      if (!k.logo) return 'Dites-nous si votre entreprise a déjà un logo.';
      return 'Parfait. Touchez « Continuer » pour indiquer vos coordonnées.';
    }
    if (etape === 2) {
      const manquants = [!k.nom.trim() && 'nom', !k.prenom.trim() && 'prénom', k.telephone.replace(/\D/g, '').length < 8 && 'téléphone', !k.adresse.trim() && 'quartier', !k.contact && 'mode de contact'].filter(Boolean);
      return manquants.length ? `Il reste à remplir : ${manquants.join(', ')}.` : 'Tout est rempli. Touchez « Voir le récapitulatif ».';
    }
    return 'Vérifiez chaque ligne. Si tout est juste, touchez « Confirmer et envoyer sur WhatsApp ».';
  })();

  if (envoye) return (
    <div className="conteneur">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }} role="status" className="mx-auto max-w-2xl rounded-[var(--radius-carte)] bg-fond-2 p-8 text-center sm:p-12">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-succes text-white"><Check size={26} /></span>
        <h2 className="titre mt-6 text-[2.2rem]">WhatsApp s’est ouvert avec votre commande.</h2>
        <p className="chapo mt-3">Appuyez sur <strong>Envoyer</strong> dans WhatsApp pour la transmettre à Pixora Studio. Tant que le message n’est pas envoyé, la commande n’est pas reçue.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={envoyer} className={classeBouton('bleu')}>Rouvrir WhatsApp<Fleche /></button>
          <button onClick={recommencer} className={classeBouton('secondaire')}>Nouvelle commande</button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div ref={haut} className="conteneur grid gap-10 lg:grid-cols-12">
      <div data-guide="formulaire" className="lg:col-span-8">
        {/* Progression */}
        <ol data-guide="etapes" className="grid grid-cols-4 gap-2" aria-label="Étapes de la commande">
          {ETAPES.map((e, i) => (
            <li key={e}>
              <button onClick={() => i < etape && aller(i)} disabled={i > etape} aria-current={i === etape ? 'step' : undefined} className="w-full text-left disabled:cursor-default">
                <span className={`block h-1.5 rounded-full transition-colors duration-500 ${i <= etape ? 'bg-bleu' : 'bg-filet'}`} />
                <span className={`mt-2 hidden text-[0.88rem] font-bold sm:block ${i === etape ? 'text-encre' : 'text-sourdine'}`}>{i + 1}. {e}</span>
              </button>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[0.95rem] font-bold sm:hidden">Étape {etape + 1} sur 4 : {ETAPES[etape]}</p>

        {/* Guide : toujours la prochaine action, annoncée aux lecteurs d'écran */}
        <div data-guide="conseil" aria-live="polite" className="sticky top-3 z-20 mt-6 flex items-start gap-3 rounded-[var(--radius-ctrl)] bg-bleu px-4 py-3.5 text-white shadow-[0_14px_30px_-16px_rgba(27,77,216,0.7)] md:top-24">
          <span className="relative mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/15">
            <Compass size={16} />
            <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-white/20 [animation-iteration-count:2]" key={conseil} />
          </span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p key={conseil} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="text-[0.98rem] font-semibold leading-snug">
              {conseil}
            </motion.p>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.section key={etape} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease }} className="mt-8" aria-labelledby={`${id}-titre`}>
            {etape === 0 && (
              <>
                <h2 id={`${id}-titre`} className="titre text-[clamp(1.9rem,3.6vw,2.8rem)]">Que voulez-vous commander ?</h2>
                <p className="chapo mt-2">Choisissez un service, sa formule et la quantité. Vous pouvez en ajouter plusieurs.</p>

                <fieldset className="mt-8 min-w-0">
                  <legend className="text-[1.05rem] font-bold">1. Le service</legend>
                  <div id={`${id}-service`} tabIndex={-1} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {catalogue.services.map((s) => {
                      const min = Math.min(...Object.values(s.prix).filter((p): p is number => p != null));
                      return (
                        <button key={s.id} type="button" onClick={() => { setService(s.id); setErreurs({}); }} aria-pressed={service === s.id} className={tuile(service === s.id)}>
                          {coche(service === s.id)}
                          <span className="block pr-6 font-bold leading-snug">{s.nom}</span>
                          <span className="mt-1 block text-[0.88rem] text-sourdine">{Number.isFinite(min) ? `dès ${fcfa(min)}` : 'Sur devis'}</span>
                        </button>
                      );
                    })}
                  </div>
                  {erreur("service")}
                </fieldset>

                <AnimatePresence>
                  {serviceChoisi && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease }} className="overflow-hidden">
                      <fieldset className="mt-8 min-w-0">
                        <legend className="text-[1.05rem] font-bold">2. La formule pour « {serviceChoisi.nom} »</legend>
                        <div id={`${id}-formule`} tabIndex={-1} className="mt-3 grid gap-2 sm:grid-cols-3">
                          {FORMULES.map((f) => {
                            const p = serviceChoisi.prix[f.id];
                            return (
                              <button key={f.id} type="button" onClick={() => { setFormule(f.id); setErreurs({}); }} aria-pressed={formule === f.id} className={tuile(formule === f.id)}>
                                {coche(formule === f.id)}
                                <span className="block text-[1.15rem] font-extrabold">{f.nom}</span>
                                <span className="chiffres mt-1 block text-[1.2rem] font-extrabold text-bleu">{p == null ? 'Sur devis' : fcfa(p)}</span>
                                <span className="mt-2 block text-[0.92rem] text-sourdine">{f.texte}</span>
                              </button>
                            );
                          })}
                        </div>
                        {erreur("formule")}
                      </fieldset>

                      <div className="mt-8 flex flex-wrap items-end gap-4">
                        <div>
                          <p className="text-[1.05rem] font-bold">3. La quantité</p>
                          <div className="mt-3 inline-flex items-center rounded-full border-2 border-filet">
                            <button type="button" onClick={() => setQuantite((q) => Math.max(1, q - 1))} aria-label="Diminuer la quantité" className="grid h-12 w-12 place-items-center rounded-full hover:bg-fond-2"><Minus size={18} /></button>
                            <span aria-live="polite" className="chiffres w-10 text-center text-[1.15rem] font-extrabold">{quantite}</span>
                            <button type="button" onClick={() => setQuantite((q) => Math.min(50, q + 1))} aria-label="Augmenter la quantité" className="grid h-12 w-12 place-items-center rounded-full hover:bg-fond-2"><Plus size={18} /></button>
                          </div>
                        </div>
                        <button type="button" onClick={ajouter} className={classeBouton('sombre')}>
                          Ajouter à ma commande{formule && serviceChoisi.prix[formule] != null ? ` · ${fcfa(serviceChoisi.prix[formule]! * quantite)}` : ''}<Fleche variante="sombre" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div id={`${id}-lignes`} tabIndex={-1}>{erreur("lignes")}</div>
              </>
            )}

            {etape === 1 && (
              <>
                <h2 id={`${id}-titre`} className="titre text-[clamp(1.9rem,3.6vw,2.8rem)]">Parlez-nous de votre activité.</h2>
                <p className="chapo mt-2">Pour adapter la création à votre métier et à vos clients.</p>
                <fieldset className="mt-8 min-w-0">
                  <legend className="text-[1.05rem] font-bold">Votre domaine <span className="text-erreur">*</span></legend>
                  <div id={`${id}-domaineId`} tabIndex={-1} className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {catalogue.domaines.map((d) => (
                      <button key={d.id} type="button" onClick={() => set('domaineId', d.id)} aria-pressed={k.domaineId === d.id} className={tuile(k.domaineId === d.id)}>
                        {coche(k.domaineId === d.id)}<span className="block pr-6 font-bold leading-snug">{d.nom}</span>
                      </button>
                    ))}
                  </div>
                  {erreur("domaineId")}
                </fieldset>
                <fieldset className="mt-10 min-w-0">
                  <legend className="text-[1.05rem] font-bold">Votre entreprise a-t-elle déjà un logo ? <span className="text-erreur">*</span></legend>
                  <div id={`${id}-logo`} tabIndex={-1} className="mt-3 grid max-w-md grid-cols-2 gap-2">
                    {(['oui', 'non'] as const).map((v) => (
                      <button key={v} type="button" onClick={() => set('logo', v)} aria-pressed={k.logo === v} className={tuile(k.logo === v)}>
                        {coche(k.logo === v)}<span className="block font-bold">{v === 'oui' ? 'Oui' : 'Non'}</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[0.95rem] text-sourdine">{k.logo === 'oui' ? 'Vous pourrez l’envoyer à Pixora Studio sur WhatsApp.' : k.logo === 'non' ? 'Pas de souci : un logo peut aussi être créé (service « Logo »).' : ''}</p>
                  {erreur("logo")}
                </fieldset>
              </>
            )}

            {etape === 2 && (
              <>
                <h2 id={`${id}-titre`} className="titre text-[clamp(1.9rem,3.6vw,2.8rem)]">Vos coordonnées.</h2>
                <p className="chapo mt-2">Pour que Pixora Studio vous recontacte au sujet de votre commande.</p>
                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  {([['nom', 'Nom', 'family-name', 'text'], ['prenom', 'Prénom', 'given-name', 'text'], ['telephone', 'Numéro de téléphone', 'tel', 'tel'], ['adresse', 'Adresse / Quartier', 'address-level3', 'text']] as const).map(([n, label, auto, type]) => (
                    <div key={n} className="min-w-0">
                      <label htmlFor={`${id}-${n}`} className="text-[1rem] font-bold">{label} <span className="text-erreur">*</span></label>
                      <input id={`${id}-${n}`} type={type} inputMode={type === 'tel' ? 'tel' : undefined} autoComplete={auto} maxLength={n === 'adresse' ? 120 : 60}
                        placeholder={n === 'telephone' ? '70 00 00 00' : n === 'adresse' ? 'Ex. : Ouaga 2000' : ''}
                        value={k[n]} onChange={(e) => set(n, e.target.value)} aria-invalid={!!erreurs[n]} aria-describedby={erreurs[n] ? `${id}-${n}-err` : undefined} className={champ(n)} />
                      {erreur(n)}
                    </div>
                  ))}
                </div>
                <fieldset className="mt-10 min-w-0">
                  <legend className="text-[1.05rem] font-bold">Comment souhaitez-vous être recontacté ? <span className="text-erreur">*</span></legend>
                  <div id={`${id}-contact`} tabIndex={-1} className="mt-3 grid gap-2 sm:grid-cols-3">
                    {MODES_CONTACT.map((m) => (
                      <button key={m.id} type="button" onClick={() => set('contact', m.id)} aria-pressed={k.contact === m.id} className={tuile(k.contact === m.id)}>
                        {coche(k.contact === m.id)}<span className="block pr-6 font-bold">{m.nom}</span>
                      </button>
                    ))}
                  </div>
                  {erreur("contact")}
                </fieldset>
                <div className="mt-10">
                  <label htmlFor={`${id}-precisions`} className="text-[1rem] font-bold">Précisions <span className="font-normal text-sourdine">(facultatif)</span></label>
                  <textarea id={`${id}-precisions`} rows={4} maxLength={600} value={k.precisions} onChange={(e) => set('precisions', e.target.value)}
                    placeholder="Nom de l’entreprise, couleurs souhaitées, texte à mettre, délai…" className="mt-2 block w-full rounded-[var(--radius-ctrl)] border-2 border-filet bg-white px-4 py-3 text-[1.05rem] outline-none focus:border-bleu" />
                </div>
              </>
            )}

            {etape === 3 && (
              <>
                <h2 id={`${id}-titre`} className="titre text-[clamp(1.9rem,3.6vw,2.8rem)]">Récapitulatif de votre commande.</h2>
                <p className="chapo mt-2">Vérifiez tout avant l’envoi. Ce message sera envoyé tel quel à Pixora Studio sur WhatsApp.</p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    { t: 'Client', e: 2, l: [['Nom', k.nom], ['Prénom', k.prenom], ['Téléphone', k.telephone], ['Quartier', k.adresse]] },
                    { t: 'Activité', e: 1, l: [['Domaine', catalogue.domaines.find((d) => d.id === k.domaineId)?.nom ?? ''], ['Logo', k.logo === 'oui' ? 'Oui' : 'Non'], ['Contact', MODES_CONTACT.find((m) => m.id === k.contact)?.nom ?? '']] },
                  ].map((b) => (
                    <div key={b.t} className="rounded-[var(--radius-carte)] bg-fond-2 p-6">
                      <div className="flex items-center justify-between"><h3 className="text-[1.1rem] font-extrabold">{b.t}</h3><button onClick={() => aller(b.e)} className="inline-flex items-center gap-1.5 text-[0.92rem] font-bold text-bleu hover:underline"><Pencil size={14} /> Modifier</button></div>
                      <dl className="mt-3 space-y-1.5">{b.l.map(([d, v]) => <div key={d} className="flex justify-between gap-4"><dt className="text-sourdine">{d}</dt><dd className="text-right font-semibold">{v}</dd></div>)}</dl>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-[var(--radius-carte)] bg-fond-2 p-6">
                  <div className="flex items-center justify-between"><h3 className="text-[1.1rem] font-extrabold">Services</h3><button onClick={() => aller(0)} className="inline-flex items-center gap-1.5 text-[0.92rem] font-bold text-bleu hover:underline"><Pencil size={14} /> Modifier</button></div>
                  <ol className="mt-3 divide-y divide-filet-fort/60">
                    {k.lignes.map((l, i) => {
                      const p = prixLigne(catalogue, l);
                      return (
                        <li key={i} className="flex items-start justify-between gap-4 py-3">
                          <span><span className="font-bold">{i + 1}. {catalogue.services.find((s) => s.id === l.serviceId)?.nom}</span><span className="block text-[0.95rem] text-sourdine">Formule {nomFormule(l.formule)}{l.quantite > 1 ? ` · quantité ${l.quantite}` : ''}</span></span>
                          <span className="chiffres shrink-0 font-bold">{p == null ? 'Sur devis' : fcfa(p)}</span>
                        </li>
                      );
                    })}
                  </ol>
                  {k.precisions.trim() && <p className="mt-3 border-t border-filet-fort/60 pt-3 text-[0.95rem]"><span className="font-bold">Précisions : </span>{k.precisions}</p>}
                  <p className="mt-3 flex items-baseline justify-between border-t-2 border-encre pt-4 text-[1.3rem] font-extrabold"><span>Total</span><span className="chiffres">{fcfa(somme)}</span></p>
                  {devis && <p className="mt-1 text-right text-[0.92rem] text-sourdine">+ services sur devis</p>}
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button onClick={envoyer} data-guide="envoyer" className={classeBouton('bleu')}><IconeWhatsApp size={20} />Confirmer et envoyer sur WhatsApp<Fleche /></button>
                  <button onClick={() => aller(0)} className={classeBouton('secondaire')}>Modifier la commande</button>
                </div>
                <p className="mt-4 text-[0.92rem] text-sourdine">Envoi vers le WhatsApp de Pixora Studio : {catalogue.whatsapp}. Vos informations ne sont enregistrées nulle part sur ce site.</p>
              </>
            )}
          </motion.section>
        </AnimatePresence>

        {etape < 3 && (
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button onClick={suivant} className={classeBouton('bleu')}>{etape === 2 ? 'Voir le récapitulatif' : 'Continuer'}<Fleche /></button>
            {etape > 0 && <button onClick={() => aller(etape - 1)} className={classeBouton('secondaire')}>Retour</button>}
          </div>
        )}
      </div>

      {/* Panier : toujours visible sur grand écran */}
      <aside data-guide="panier" className="lg:col-span-4" aria-label="Votre commande">
        <div className="rounded-[var(--radius-carte)] bg-encre p-6 text-white lg:sticky lg:top-28">
          <h2 className="text-[1.2rem] font-extrabold">Votre commande</h2>
          {k.lignes.length ? (
            <ul className="mt-4 space-y-3">
              {k.lignes.map((l, i) => {
                const p = prixLigne(catalogue, l);
                return (
                  <li key={i} className="rounded-2xl bg-white/[0.07] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <span><span className="block font-bold">{catalogue.services.find((s) => s.id === l.serviceId)?.nom}</span>
                        <select value={l.formule} onChange={(e) => majLigne(i, { formule: e.target.value as FormuleId })} aria-label="Formule" className="mt-1 rounded-lg bg-white/10 px-2 py-1 text-[0.9rem]">
                          {FORMULES.map((f) => <option key={f.id} value={f.id} className="text-encre">{f.nom}</option>)}
                        </select></span>
                      <button onClick={() => retirer(i)} aria-label="Retirer ce service" className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-white/10"><Trash2 size={16} /></button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-white/10">
                        <button onClick={() => majLigne(i, { quantite: Math.max(1, l.quantite - 1) })} aria-label="Diminuer" className="grid h-9 w-9 place-items-center"><Minus size={15} /></button>
                        <span className="chiffres w-6 text-center font-bold">{l.quantite}</span>
                        <button onClick={() => majLigne(i, { quantite: Math.min(50, l.quantite + 1) })} aria-label="Augmenter" className="grid h-9 w-9 place-items-center"><Plus size={15} /></button>
                      </span>
                      <span className="chiffres font-bold">{p == null ? 'Sur devis' : fcfa(p)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : <p className="mt-3 text-white/65">Aucun service pour l’instant. Choisissez un service à gauche.</p>}
          <p className="mt-5 flex items-baseline justify-between border-t border-white/15 pt-4 text-[1.25rem] font-extrabold"><span>Total</span><motion.span key={somme} initial={{ opacity: 0.4, y: -4 }} animate={{ opacity: 1, y: 0 }} className="chiffres">{fcfa(somme)}</motion.span></p>
          {devis && <p className="mt-1 text-right text-[0.88rem] text-white/60">+ services sur devis</p>}
          <p className="mt-4 text-[0.88rem] text-white/55">Tarifs : <Link href="/tarifs" className="underline">voir la grille complète</Link></p>
        </div>
      </aside>
    </div>
  );
}
