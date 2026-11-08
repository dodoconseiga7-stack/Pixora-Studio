import type { Metadata } from 'next';
import { getCatalogue } from '@/lib/catalogue';
import { EnTetePage } from '@/components/layout/EnTetePage';

export const metadata: Metadata = {
  title: 'Mentions légales et confidentialité',
  alternates: { canonical: '/mentions-legales' },
};

/** Les champs entre crochets sont à compléter par le propriétaire (aucune donnée d'entreprise inventée). */
const ACompleter = ({ children }: { children: React.ReactNode }) => <span className="rounded bg-[#fff4e5] px-1.5 font-semibold text-[#8a4b08]">[À compléter : {children}]</span>;

export default async function MentionsLegales() {
  const c = await getCatalogue();
  const sections = [
    { t: 'Éditeur du site', c: <p>Pixora Studio, Ouagadougou (Burkina Faso). <ACompleter>forme juridique, RCCM et IFU s’ils existent</ACompleter></p> },
    { t: 'Contact', c: <p>WhatsApp : {c.whatsapp}</p> },
    { t: 'Responsable de la publication', c: <p><ACompleter>nom du responsable</ACompleter></p> },
    { t: 'Hébergement', c: <p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.</p> },
    { t: 'Propriété des créations', c: <p>Les créations présentées dans « Mes créations » sont importées par Pixora Studio. Les images marquées « Création par IA » ont été générées par une intelligence artificielle et servent uniquement de comparaison : elles ne sont pas présentées comme des créations de Pixora Studio.</p> },
    { t: 'Vos données personnelles', c: <><p>Le formulaire de commande n’enregistre rien sur ce site : vos informations servent seulement à rédiger le message WhatsApp que vous choisissez d’envoyer. Un brouillon reste dans votre navigateur le temps de la visite, puis il est effacé à la fermeture de l’onglet.</p><p className="mt-3">Ce site n’utilise aucun cookie de mesure d’audience ni de publicité. Les messages reçus sur WhatsApp servent uniquement à traiter votre commande. Pour toute demande sur vos données, écrivez à Pixora Studio sur WhatsApp.</p></> },
  ];
  return (
    <>
      <EnTetePage fil="Mentions légales" titre="Mentions légales et confidentialité." intro="Qui édite ce site, qui l’héberge, et ce que deviennent vos informations." />
      <div className="conteneur max-w-3xl">
        {sections.map((s) => (
          <section key={s.t} className="border-t border-filet py-7">
            <h2 className="text-[1.3rem] font-extrabold">{s.t}</h2>
            <div className="mt-3 text-sourdine">{s.c}</div>
          </section>
        ))}
      </div>
    </>
  );
}
