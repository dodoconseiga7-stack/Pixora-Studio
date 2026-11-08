import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getCatalogue } from '@/lib/catalogue';
import { Commande } from '@/components/commande/Commande';
import { EnTetePage } from '@/components/layout/EnTetePage';

export const metadata: Metadata = {
  title: 'Commander',
  description: 'Commandez votre carte de visite, flyer, affiche, visuel, kakémono, étiquette ou logo : total calculé automatiquement, commande envoyée sur WhatsApp.',
  alternates: { canonical: '/commander' },
};

export default async function PageCommander() {
  const c = await getCatalogue();
  return (
    <>
      <EnTetePage fil="Commander" titre="Commander une création."
        intro="Quatre étapes courtes. Le total se calcule pendant que vous choisissez, et vous vérifiez tout avant l’envoi sur WhatsApp." />
      <Suspense fallback={<div className="conteneur h-96" />}>
        <Commande catalogue={c} />
      </Suspense>
    </>
  );
}
