import type { Metadata } from 'next';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { estAdmin, motDePasseConfigure } from '@/lib/admin';
import { lireCatalogue, stockageDisponible } from '@/lib/stockage';
import { Connexion } from '@/components/admin/Connexion';
import { Tableau } from '@/components/admin/Tableau';

export const metadata: Metadata = { title: 'Administration', robots: { index: false, follow: false } };

/** Lit la session (cookie) : doit rester dans une zone dynamique. */
async function Contenu() {
  await connection(); // toujours calculée à la demande (session, heure d'expiration)
  if (!(await estAdmin())) return <Connexion configure={motDePasseConfigure()} />;
  const c = await lireCatalogue().catch(() => null);
  if (!c) return <p className="conteneur py-32 text-center">Le stockage ne répond pas. Réessayez dans un instant.</p>;
  return <Tableau catalogue={c} stockage={stockageDisponible()} />;
}

export default function PageAdmin() {
  return (
    <Suspense fallback={<p className="conteneur py-32 text-center text-sourdine">Chargement…</p>}>
      <Contenu />
    </Suspense>
  );
}
