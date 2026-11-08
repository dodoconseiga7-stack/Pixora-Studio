import Link from 'next/link';
import { BoutonLien } from '@/components/ui/Bouton';

/** Page introuvable (y compris pour toute tentative d'accès à l'administration interne). */
export default function PageIntrouvable() {
  return (
    <section className="conteneur flex min-h-[90svh] flex-col justify-center py-24">
      <Link href="/" className="font-extrabold">PIXORA <span className="text-bleu">STUDIO</span></Link>
      <p className="mt-16 font-bold text-bleu">Erreur 404</p>
      <h1 className="titre mt-4 text-[clamp(2.8rem,8vw,6.5rem)]">Cette page n’existe pas.</h1>
      <p className="chapo mt-6 max-w-lg">Le lien est peut-être ancien, ou l’adresse mal recopiée. Reprenez depuis l’accueil ou les créations.</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <BoutonLien href="/">Retour à l’accueil</BoutonLien>
        <BoutonLien href="/creations" variante="secondaire">Voir mes créations</BoutonLien>
      </div>
    </section>
  );
}
