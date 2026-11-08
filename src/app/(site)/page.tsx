import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getCatalogue } from '@/lib/catalogue';
import { creationsAffichees, ENTIERES } from '@/lib/format';
import { Hero, Ruban } from '@/components/accueil/Hero';
import { Difference, type Duel } from '@/components/accueil/Difference';
import { Formules, GrilleTarifs } from '@/components/tarifs/Tarifs';
import { Apparition } from '@/components/animations/Apparition';
import { BoutonLien, IconeWhatsApp, lienWhatsApp } from '@/components/ui/Bouton';

/**
 * ACCUEIL — le parcours demandé, dans l'ordre :
 * accueil → la différence → mes créations par domaine → tarifs et formules → commander → contact.
 */
export default async function Accueil() {
  const c = await getCatalogue();
  const pixora = creationsAffichees(c, 'pixora');
  const ia = creationsAffichees(c, 'ia');

  // Un duel par service qui possède à la fois une vraie création et un exemple IA.
  const duels: Duel[] = c.services.flatMap((s) => {
    const p = pixora.find((x) => x.serviceId === s.id);
    const a = ia.find((x) => x.serviceId === s.id);
    return p && a ? [{ serviceId: s.id, service: s.nom, pixora: p, ia: a }] : [];
  });

  return (
    <>
      <Hero logo={c.logo} creations={pixora} whatsapp={c.whatsapp} />
      <Ruban creations={pixora} />
      <Difference duels={duels} />

      {/* MES CRÉATIONS PAR DOMAINE */}
      <section data-guide="domaines-accueil" aria-labelledby="titre-domaines" className="section conteneur">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="font-bold text-bleu">Mes créations</p>
            <h2 id="titre-domaines" className="titre mt-3 text-[clamp(2.3rem,5vw,4.2rem)]">Trouvez des créations pour votre domaine.</h2>
          </div>
          <p className="chapo lg:col-span-5">Plombier, restaurant, salon de coiffure, boutique de mode… Choisissez votre domaine, puis le service qui vous intéresse.</p>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {c.domaines.map((d, i) => {
            const liste = pixora.filter((x) => x.domaineId === d.id);
            const couverture = liste.find((x) => !ENTIERES.includes(x.serviceId)) ?? liste[0];
            return (
              <Apparition as="li" key={d.id} delai={(i % 5) * 0.05}>
                <Link href={`/creations?domaine=${d.id}`} className="group block">
                  <span className="relative block aspect-[4/5] overflow-hidden rounded-[var(--radius-carte)] bg-bleu-clair ring-1 ring-filet">
                    {couverture ? (
                      <Image src={couverture.image} alt="" fill sizes="(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 50vw" className="object-cover transition-transform duration-500 ease-[var(--ease-sortie)] group-hover:scale-[1.04]" />
                    ) : (
                      <span aria-hidden className="absolute inset-0 grid place-items-center text-[4.5rem] font-extrabold tracking-[-0.05em] text-bleu/25">{d.nom.charAt(0)}</span>
                    )}
                    <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-encre/85 to-transparent" />
                    <span className="absolute inset-x-3 bottom-3 text-white">
                      <span className="block text-[1.05rem] font-extrabold leading-tight">{d.nom}</span>
                      <span className="mt-0.5 block text-[0.85rem] text-white/80">{liste.length ? `${liste.length} création${liste.length > 1 ? 's' : ''}` : 'Bientôt en ligne'}</span>
                    </span>
                    <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white text-encre transition-transform duration-300 group-hover:rotate-45"><ArrowUpRight size={17} /></span>
                  </span>
                </Link>
              </Apparition>
            );
          })}
        </ul>
        <div className="mt-10 rounded-[var(--radius-carte)] bg-fond-2 p-6 sm:p-8">
          <p className="font-bold">Dans chaque domaine</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {c.services.filter((s) => s.id !== 'autres').map((s) => (
              <li key={s.id}><Link href={`/creations?service=${s.id}`} className="inline-flex h-10 items-center rounded-full bg-white px-4 text-[0.95rem] font-semibold ring-1 ring-filet hover:text-bleu hover:ring-bleu">{s.nom}</Link></li>
            ))}
          </ul>
        </div>
        <div className="mt-10"><BoutonLien href="/creations" variante="sombre">Voir toutes mes créations</BoutonLien></div>
      </section>

      {/* TARIFS */}
      <section data-guide="tarifs" aria-labelledby="titre-tarifs" className="section bg-fond-2">
        <div className="conteneur">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="font-bold text-bleu">Tarifs</p>
              <h2 id="titre-tarifs" className="titre mt-3 text-[clamp(2.3rem,5vw,4.2rem)]">Trois formules, un prix clair pour chaque service.</h2>
            </div>
            <p className="chapo lg:col-span-5">Basic, Standard ou Premium : choisissez le niveau de travail. Le prix dépend du service.</p>
          </div>
          <div className="mt-12"><Formules /></div>
          <div className="mt-6"><GrilleTarifs services={c.services} /></div>
        </div>
      </section>

      {/* COMMENT COMMANDER — une vraie suite d'étapes */}
      <section data-guide="etapes" aria-labelledby="titre-etapes" className="section conteneur">
        <p className="font-bold text-bleu">Commander</p>
        <h2 id="titre-etapes" className="titre mt-3 max-w-3xl text-[clamp(2.3rem,5vw,4.2rem)]">Votre commande en trois étapes.</h2>
        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { t: 'Choisissez', d: 'Vos services, la formule Basic, Standard ou Premium et la quantité. Le total se calcule tout seul.' },
            { t: 'Vérifiez', d: 'Un récapitulatif reprend vos informations et chaque service avant l’envoi.' },
            { t: 'Envoyez', d: 'WhatsApp s’ouvre avec votre commande complète, déjà rédigée. Il suffit d’appuyer sur Envoyer.' },
          ].map((e, i) => (
            <Apparition as="li" key={e.t} delai={i * 0.08} className="rounded-[var(--radius-carte)] p-7 ring-1 ring-filet">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-bleu text-[1.1rem] font-extrabold text-white">{i + 1}</span>
              <h3 className="mt-6 text-[1.5rem] font-extrabold tracking-[-0.02em]">{e.t}</h3>
              <p className="mt-2 text-sourdine">{e.d}</p>
            </Apparition>
          ))}
        </ol>
        <div className="mt-10"><BoutonLien href="/commander">Commander maintenant</BoutonLien></div>
      </section>

      {/* CONTACT — sobre, le numéro bien visible */}
      <section id="contact" aria-labelledby="titre-contact" className="conteneur scroll-mt-24">
        <div data-guide="contact" className="grid gap-8 rounded-[2rem] bg-bleu p-8 text-white sm:p-12 lg:grid-cols-12 lg:items-center lg:p-16">
          <div className="lg:col-span-7">
            <h2 id="titre-contact" className="titre text-[clamp(2.2rem,4.6vw,3.8rem)]">Une question ? Écrivez-nous.</h2>
            <p className="mt-4 text-[1.1rem] text-white/80">Pixora Studio répond sur WhatsApp.</p>
          </div>
          <div className="lg:col-span-5">
            <p className="text-white/75">WhatsApp</p>
            <p className="chiffres mt-1 flex items-center gap-3 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-[-0.02em]"><IconeWhatsApp size={30} />{c.whatsapp}</p>
            <a href={lienWhatsApp(c.whatsapp, 'Bonjour Pixora Studio, ')} target="_blank" rel="noopener noreferrer"
              className="mt-6 inline-flex h-14 items-center rounded-full bg-white px-7 font-bold text-bleu transition-colors hover:bg-bleu-clair">
              Contacter Pixora Studio
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
