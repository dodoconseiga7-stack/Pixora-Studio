import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Catalogue } from './types';
import { catalogueInitial } from '@/data/initial';

/**
 * STOCKAGE du catalogue (textes, prix, liste des créations) et des images importées.
 * - En ligne : Vercel Blob (variable BLOB_READ_WRITE_TOKEN, créée par Vercel quand on relie un « Blob store »).
 * - En local (développement) : fichier .donnees/catalogue.json et images dans public/uploads/.
 * En production sans Blob, l'administration refuse d'écrire (le disque de Vercel est en lecture seule).
 */
const avecBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;
const CHEMIN_BLOB = 'pixora-studio/catalogue.json';
const FICHIER_LOCAL = path.join(process.cwd(), '.donnees', 'catalogue.json');
const DOSSIER_LOCAL = path.join(process.cwd(), 'public', 'uploads');

export const stockageDisponible = () => avecBlob() || process.env.NODE_ENV !== 'production';

/** Remet d'aplomb un catalogue lu (champs manquants → valeurs de départ). */
function normaliser(brut: Partial<Catalogue>): Catalogue {
  return {
    version: 1,
    logo: typeof brut.logo === 'string' ? brut.logo : null,
    whatsapp: typeof brut.whatsapp === 'string' && brut.whatsapp ? brut.whatsapp : catalogueInitial.whatsapp,
    domaines: Array.isArray(brut.domaines) ? brut.domaines : catalogueInitial.domaines,
    services: Array.isArray(brut.services) ? brut.services : catalogueInitial.services,
    creations: Array.isArray(brut.creations) ? brut.creations : catalogueInitial.creations,
    majLe: typeof brut.majLe === 'number' ? brut.majLe : Date.now(),
  };
}

/**
 * Lit le catalogue enregistré. Renvoie le contenu de départ s'il n'a jamais été enregistré.
 * Lève une erreur si le stockage ne répond pas : on ne doit jamais écraser un vrai catalogue
 * par le contenu de départ à cause d'une panne passagère.
 */
export async function lireCatalogue(): Promise<Catalogue> {
  if (avecBlob()) {
    const { get } = await import('@vercel/blob');
    let r;
    try { r = await get(CHEMIN_BLOB, { access: 'public', useCache: false }); }
    catch (e) { if (e instanceof Error && /not.?found/i.test(e.name + e.message)) return catalogueInitial; throw e; }
    if (!r || r.statusCode !== 200) return catalogueInitial;
    return normaliser(JSON.parse(await new Response(r.stream).text()));
  }
  try { return normaliser(JSON.parse(await fs.readFile(FICHIER_LOCAL, 'utf8'))); }
  catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') return catalogueInitial; throw e; }
}

export async function ecrireCatalogue(c: Catalogue) {
  const contenu = JSON.stringify({ ...c, majLe: Date.now() }, null, 1);
  if (avecBlob()) {
    const { put } = await import('@vercel/blob');
    await put(CHEMIN_BLOB, contenu, { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json', cacheControlMaxAge: 60 });
    return;
  }
  if (!stockageDisponible()) throw new Error('STOCKAGE_INDISPONIBLE');
  await fs.mkdir(path.dirname(FICHIER_LOCAL), { recursive: true });
  await fs.writeFile(FICHIER_LOCAL, contenu, 'utf8');
}

const EXTENSIONS: Record<string, string> = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' };

/** Vérifie la signature réelle du fichier (pas seulement le type annoncé par le navigateur). */
function signatureValide(o: Uint8Array, type: string) {
  if (type === 'image/png') return o[0] === 0x89 && o[1] === 0x50 && o[2] === 0x4e && o[3] === 0x47;
  if (type === 'image/jpeg') return o[0] === 0xff && o[1] === 0xd8 && o[2] === 0xff;
  if (type === 'image/webp') return String.fromCharCode(...o.slice(0, 4)) === 'RIFF' && String.fromCharCode(...o.slice(8, 12)) === 'WEBP';
  return false;
}

export const TAILLE_MAX = 3.5 * 1024 * 1024;

/** Contrôle une image envoyée par l'administration. Renvoie un message d'erreur, ou null si elle est valide. */
export async function controlerImage(f: unknown): Promise<string | null> {
  if (!(f instanceof File) || f.size === 0) return 'Choisissez une image.';
  if (!EXTENSIONS[f.type]) return 'Format non accepté : utilisez une image JPG, PNG ou WebP.';
  if (f.size > TAILLE_MAX) return 'Image trop lourde (3,5 Mo au maximum).';
  const debut = new Uint8Array(await f.slice(0, 12).arrayBuffer());
  if (!signatureValide(debut, f.type)) return 'Ce fichier n’est pas une image valide.';
  return null;
}

/** Enregistre une image déjà contrôlée et renvoie son adresse publique. */
export async function enregistrerImage(f: File, dossier: 'creations' | 'logo'): Promise<string> {
  const nom = `${dossier}-${randomUUID()}.${EXTENSIONS[f.type]}`;
  if (avecBlob()) {
    const { put } = await import('@vercel/blob');
    const r = await put(`pixora-studio/${dossier}/${nom}`, f, { access: 'public', addRandomSuffix: false, contentType: f.type });
    return r.url;
  }
  if (!stockageDisponible()) throw new Error('STOCKAGE_INDISPONIBLE');
  await fs.mkdir(DOSSIER_LOCAL, { recursive: true });
  await fs.writeFile(path.join(DOSSIER_LOCAL, nom), Buffer.from(await f.arrayBuffer()));
  return `/uploads/${nom}`;
}

/** Supprime une image importée (les images de départ, dans /creations/, ne sont jamais effacées). */
export async function supprimerImage(url: string | null | undefined) {
  if (!url) return;
  try {
    if (url.includes('.blob.vercel-storage.com/') && avecBlob()) {
      const { del } = await import('@vercel/blob');
      await del(url);
    } else if (url.startsWith('/uploads/')) {
      await fs.unlink(path.join(DOSSIER_LOCAL, path.basename(url)));
    }
  } catch { /* image déjà absente : rien à faire */ }
}
