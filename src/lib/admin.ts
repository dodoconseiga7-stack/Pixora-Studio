import 'server-only';
import { cookies } from 'next/headers';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Session d'administration : un seul propriétaire, mot de passe dans la variable ADMIN_PASSWORD
 * (jamais dans le code ni dans le dépôt). Le cookie est signé, illisible par JavaScript,
 * limité au site et valable 8 heures. Changer le mot de passe déconnecte toutes les sessions.
 */
const COOKIE = 'pixora_admin';
const DUREE_MS = 8 * 60 * 60 * 1000;

const empreinte = (t: string) => createHash('sha256').update(t).digest();

function cle() {
  const mdp = process.env.ADMIN_PASSWORD;
  return mdp ? empreinte(`pixora-studio:${process.env.ADMIN_SESSION_SECRET ?? ''}:${mdp}`) : null;
}
function signer(valeur: string) {
  const k = cle();
  return k ? createHmac('sha256', k).update(valeur).digest('base64url') : null;
}

export const motDePasseConfigure = () => !!process.env.ADMIN_PASSWORD && !!process.env.ADMIN_EMAIL;

/** Identifiants du propriétaire : son adresse e-mail (ADMIN_EMAIL) ET son mot de passe (ADMIN_PASSWORD). */
export function identifiantsCorrects(email: string, motDePasse: string) {
  const attenduEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const attenduMdp = process.env.ADMIN_PASSWORD;
  if (!attenduEmail || !attenduMdp) return false;
  // Les deux comparaisons sont toujours faites, en temps constant : rien n'indique laquelle a échoué.
  const okEmail = timingSafeEqual(empreinte(email.trim().toLowerCase()), empreinte(attenduEmail));
  const okMdp = timingSafeEqual(empreinte(motDePasse), empreinte(attenduMdp));
  return okEmail && okMdp;
}

export async function ouvrirSession() {
  const fin = String(Date.now() + DUREE_MS);
  (await cookies()).set(COOKIE, `${fin}.${signer(fin)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: DUREE_MS / 1000,
  });
}

export async function fermerSession() {
  (await cookies()).delete(COOKIE);
}

export async function estAdmin() {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [fin, sig] = v.split('.');
  if (!fin || !sig || !(Number(fin) > Date.now())) return false;
  const attendu = signer(fin);
  if (!attendu) return false;
  const a = Buffer.from(sig), b = Buffer.from(attendu);
  return a.length === b.length && timingSafeEqual(a, b);
}
