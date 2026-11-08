'use server';

import { updateTag } from 'next/cache';
import { estAdmin, fermerSession, motDePasseConfigure, motDePasseCorrect, ouvrirSession } from '@/lib/admin';
import { controlerImage, ecrireCatalogue, enregistrerImage, lireCatalogue, stockageDisponible, supprimerImage } from '@/lib/stockage';
import { slug } from '@/lib/format';
import type { Catalogue, FormuleId, TypeCreation } from '@/lib/types';

/**
 * ACTIONS DE L'ADMINISTRATION — chacune revérifie la session côté serveur
 * (un bouton caché dans la page ne suffit jamais à protéger une action).
 */
export type Resultat = { ok: true; message?: string } | { ok: false; erreur: string };

const texte = (v: FormDataEntryValue | null, max: number) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

async function proteger(): Promise<Resultat | null> {
  if (!(await estAdmin())) return { ok: false, erreur: 'Session expirée : reconnectez-vous.' };
  if (!stockageDisponible()) return { ok: false, erreur: 'Le stockage en ligne n’est pas encore relié (Vercel Blob). Voir le guide d’installation.' };
  return null;
}

/** Lit, modifie, enregistre, puis rafraîchit tout le site. */
async function modifier(changement: (c: Catalogue) => Catalogue | string, message?: string): Promise<Resultat> {
  const refus = await proteger();
  if (refus) return refus;
  try {
    const actuel = await lireCatalogue();
    const nouveau = changement(actuel);
    if (typeof nouveau === 'string') return { ok: false, erreur: nouveau };
    await ecrireCatalogue(nouveau);
    updateTag('catalogue');
    return { ok: true, message };
  } catch {
    return { ok: false, erreur: 'Enregistrement impossible pour le moment. Réessayez dans un instant.' };
  }
}

const idUnique = (base: string, existants: string[]) => {
  let id = slug(base), n = 2;
  while (existants.includes(id)) id = `${slug(base)}-${n++}`;
  return id;
};

/* ───────── Connexion ───────── */

export async function connexion(_: Resultat | null, fd: FormData): Promise<Resultat> {
  if (!motDePasseConfigure()) return { ok: false, erreur: 'Aucun mot de passe n’est configuré (variable ADMIN_PASSWORD).' };
  if (!motDePasseCorrect(String(fd.get('motdepasse') ?? ''))) {
    await new Promise((r) => setTimeout(r, 900)); // freine les essais en série
    return { ok: false, erreur: 'Mot de passe incorrect.' };
  }
  await ouvrirSession();
  return { ok: true };
}

export async function deconnexion() {
  await fermerSession();
}

/* ───────── Créations (Ma création et Création par IA) ───────── */

export async function enregistrerCreation(fd: FormData): Promise<Resultat> {
  const refus = await proteger();
  if (refus) return refus;
  const id = texte(fd.get('id'), 80);
  const type: TypeCreation = fd.get('type') === 'ia' ? 'ia' : 'pixora';
  const domaineId = texte(fd.get('domaineId'), 60);
  const serviceId = texte(fd.get('serviceId'), 60);
  const titre = texte(fd.get('titre'), 120);
  const description = texte(fd.get('description'), 400);
  const fichier = fd.get('image');
  const avecImage = fichier instanceof File && fichier.size > 0;

  if (!titre) return { ok: false, erreur: 'Indiquez un titre.' };
  if (!id && !avecImage) return { ok: false, erreur: 'Ajoutez l’image de la création.' };
  if (avecImage) { const e = await controlerImage(fichier); if (e) return { ok: false, erreur: e }; }

  let nouvelleImage: string | null = null;
  try { if (avecImage) nouvelleImage = await enregistrerImage(fichier as File, 'creations'); }
  catch { return { ok: false, erreur: 'L’image n’a pas pu être enregistrée. Réessayez.' }; }

  let ancienneImage: string | null = null;
  const r = await modifier((c) => {
    if (!c.domaines.some((d) => d.id === domaineId)) return 'Choisissez un domaine.';
    if (!c.services.some((s) => s.id === serviceId)) return 'Choisissez un service.';
    if (id) {
      const existante = c.creations.find((x) => x.id === id);
      if (!existante) return 'Cette création n’existe plus.';
      if (nouvelleImage) ancienneImage = existante.image;
      return { ...c, creations: c.creations.map((x) => x.id === id ? { ...x, type, domaineId, serviceId, titre, description, image: nouvelleImage ?? x.image } : x) };
    }
    const nouvelle = { id: idUnique(`${type}-${titre}`, c.creations.map((x) => x.id)), type, domaineId, serviceId, titre, description, image: nouvelleImage!, ajouteLe: Date.now() };
    return { ...c, creations: [nouvelle, ...c.creations] };
  }, id ? 'Création mise à jour.' : 'Création ajoutée.');

  if (r.ok) await supprimerImage(ancienneImage);
  else await supprimerImage(nouvelleImage); // rien ne reste orphelin en cas d'échec
  return r;
}

export async function supprimerCreation(id: string): Promise<Resultat> {
  let image: string | null = null;
  const r = await modifier((c) => {
    const x = c.creations.find((k) => k.id === id);
    if (!x) return 'Cette création n’existe plus.';
    image = x.image;
    return { ...c, creations: c.creations.filter((k) => k.id !== id) };
  }, 'Création supprimée.');
  if (r.ok) await supprimerImage(image);
  return r;
}

/* ───────── Domaines ───────── */

export async function ajouterDomaine(nom: string): Promise<Resultat> {
  const n = texte(nom, 60);
  if (!n) return { ok: false, erreur: 'Indiquez le nom du domaine.' };
  return modifier((c) => c.domaines.some((d) => d.nom.toLowerCase() === n.toLowerCase()) ? 'Ce domaine existe déjà.'
    : { ...c, domaines: [...c.domaines, { id: idUnique(n, c.domaines.map((d) => d.id)), nom: n }] }, 'Domaine ajouté.');
}

export async function renommerDomaine(id: string, nom: string): Promise<Resultat> {
  const n = texte(nom, 60);
  if (!n) return { ok: false, erreur: 'Le nom ne peut pas être vide.' };
  return modifier((c) => ({ ...c, domaines: c.domaines.map((d) => d.id === id ? { ...d, nom: n } : d) }), 'Domaine renommé.');
}

export async function supprimerDomaine(id: string): Promise<Resultat> {
  return modifier((c) => {
    const n = c.creations.filter((x) => x.domaineId === id).length;
    if (n) return `Impossible : ${n} création${n > 1 ? 's utilisent' : ' utilise'} ce domaine. Déplacez-les d’abord.`;
    return { ...c, domaines: c.domaines.filter((d) => d.id !== id) };
  }, 'Domaine supprimé.');
}

/* ───────── Services et tarifs ───────── */

function lirePrix(fd: FormData): Record<FormuleId, number | null> | string {
  const p = {} as Record<FormuleId, number | null>;
  for (const f of ['basic', 'standard', 'premium'] as FormuleId[]) {
    const v = String(fd.get(f) ?? '').replace(/\s/g, '');
    if (v === '') { p[f] = null; continue; }
    const n = Number(v);
    if (!Number.isInteger(n) || n < 0 || n > 10_000_000) return 'Les prix doivent être des nombres entiers en F CFA (ou vides pour « sur devis »).';
    p[f] = n;
  }
  return p;
}

export async function enregistrerService(fd: FormData): Promise<Resultat> {
  const id = texte(fd.get('id'), 60);
  const nom = texte(fd.get('nom'), 60);
  if (!nom) return { ok: false, erreur: 'Indiquez le nom du service.' };
  const prix = lirePrix(fd);
  if (typeof prix === 'string') return { ok: false, erreur: prix };
  return modifier((c) => {
    if (id) return { ...c, services: c.services.map((s) => s.id === id ? { ...s, nom, prix } : s) };
    if (c.services.some((s) => s.nom.toLowerCase() === nom.toLowerCase())) return 'Ce service existe déjà.';
    return { ...c, services: [...c.services, { id: idUnique(nom, c.services.map((s) => s.id)), nom, prix }] };
  }, id ? 'Service et tarifs enregistrés.' : 'Service ajouté.');
}

export async function supprimerService(id: string): Promise<Resultat> {
  return modifier((c) => {
    const n = c.creations.filter((x) => x.serviceId === id).length;
    if (n) return `Impossible : ${n} création${n > 1 ? 's utilisent' : ' utilise'} ce service. Déplacez-les d’abord.`;
    return { ...c, services: c.services.filter((s) => s.id !== id) };
  }, 'Service supprimé.');
}

/* ───────── Logo et WhatsApp ───────── */

export async function changerLogo(fd: FormData): Promise<Resultat> {
  const refus = await proteger();
  if (refus) return refus;
  const f = fd.get('logo');
  const e = await controlerImage(f);
  if (e) return { ok: false, erreur: e };
  let url: string;
  try { url = await enregistrerImage(f as File, 'logo'); } catch { return { ok: false, erreur: 'Le logo n’a pas pu être enregistré.' }; }
  let ancien: string | null = null;
  const r = await modifier((c) => { ancien = c.logo; return { ...c, logo: url }; }, 'Logo mis à jour.');
  if (r.ok) await supprimerImage(ancien); else await supprimerImage(url);
  return r;
}

export async function supprimerLogo(): Promise<Resultat> {
  let ancien: string | null = null;
  const r = await modifier((c) => { ancien = c.logo; return { ...c, logo: null }; }, 'Logo supprimé.');
  if (r.ok) await supprimerImage(ancien);
  return r;
}

export async function changerWhatsapp(numero: string): Promise<Resultat> {
  const n = texte(numero, 30);
  const chiffres = n.replace(/\D/g, '');
  if (!/^\+?[\d\s.-]+$/.test(n) || chiffres.length < 8 || chiffres.length > 15) return { ok: false, erreur: 'Numéro invalide : indiquez-le avec l’indicatif, par exemple +226 03 24 95 48.' };
  return modifier((c) => ({ ...c, whatsapp: n }), 'Numéro WhatsApp mis à jour.');
}
