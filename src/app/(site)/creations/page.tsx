import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getCatalogue } from '@/lib/catalogue';
import { creationsAffichees } from '@/lib/format';
import { Catalogue } from '@/components/creations/Catalogue';
import { EnTetePage } from '@/components/layout/EnTetePage';

export const metadata: Metadata = {
  title: 'Mes créations par domaine',
  description: 'Cartes de visite, flyers, affiches, visuels, kakémonos, étiquettes et logos créés par Pixora Studio, classés par domaine d’activité.',
  alternates: { canonical: '/creations' },
};

export default async function PageCreations() {
  const c = await getCatalogue();
  return (
    <>
      <EnTetePage fil="Mes créations" titre="Mes créations, classées par domaine."
        intro="Choisissez votre domaine, puis le service. Touchez une création pour l’agrandir et commander la même chose pour votre activité." />
      <Suspense fallback={<div className="conteneur h-96" />}>
        <Catalogue creations={creationsAffichees(c, 'pixora')} domaines={c.domaines} services={c.services} />
      </Suspense>
    </>
  );
}
