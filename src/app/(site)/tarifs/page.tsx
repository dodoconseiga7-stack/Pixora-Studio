import type { Metadata } from 'next';
import { getCatalogue } from '@/lib/catalogue';
import { Formules, GrilleTarifs } from '@/components/tarifs/Tarifs';
import { EnTetePage } from '@/components/layout/EnTetePage';
import { BoutonLien } from '@/components/ui/Bouton';

export const metadata: Metadata = {
  title: 'Services et tarifs',
  description: 'Les tarifs de Pixora Studio en F CFA : carte de visite, flyer, affiche, visuel, kakémono, étiquette et logo, en formule Basic, Standard ou Premium.',
  alternates: { canonical: '/tarifs' },
};

export default async function PageTarifs() {
  const c = await getCatalogue();
  return (
    <>
      <EnTetePage fil="Tarifs" titre="Services et tarifs."
        intro="Chaque service existe en trois formules. Le prix dépend du service et de la formule choisis : il est calculé automatiquement au moment de commander." />
      <section className="conteneur">
        <h2 className="sr-only">Les formules</h2>
        <div data-guide="formules"><Formules /></div>
        <h2 className="titre mt-16 text-[clamp(1.8rem,3.4vw,2.6rem)]">Les prix par service</h2>
        <div data-guide="grille-tarifs" className="mt-6"><GrilleTarifs services={c.services} /></div>
        <div className="mt-10"><BoutonLien href="/commander">Commander</BoutonLien></div>
      </section>
    </>
  );
}
