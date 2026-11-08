'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Lock } from 'lucide-react';
import { connexion, type Resultat } from '@/app/gestion/actions';
import { classeBouton, Fleche } from '@/components/ui/Bouton';

export function Connexion({ configure }: { configure: boolean }) {
  const [etat, action, enCours] = useActionState<Resultat | null, FormData>(connexion, null);
  const router = useRouter();
  useEffect(() => { if (etat?.ok) router.refresh(); }, [etat, router]);

  return (
    <div className="grid min-h-dvh place-items-center bg-fond-2 px-4 py-16">
      <form action={action} className="w-full max-w-md rounded-[var(--radius-carte)] bg-white p-8 ring-1 ring-filet sm:p-10">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-bleu text-white"><Lock size={20} /></span>
        <h1 className="titre mt-6 text-[2.2rem]">Tableau de bord</h1>
        <p className="mt-2 text-sourdine">Espace réservé au propriétaire de Pixora Studio.</p>
        {!configure && <p role="alert" className="mt-6 rounded-[var(--radius-ctrl)] bg-[#fdecea] p-4 text-[0.95rem] text-erreur">Connexion non configurée : ajoutez les variables ADMIN_EMAIL et ADMIN_PASSWORD (voir le guide d’installation).</p>}
        <label htmlFor="email" className="mt-8 block font-bold">Adresse e-mail</label>
        <input id="email" name="email" type="email" required autoComplete="username" autoFocus inputMode="email"
          className="mt-2 block h-14 w-full rounded-[var(--radius-ctrl)] border-2 border-filet px-4 text-[1.05rem] outline-none focus:border-bleu" />
        <label htmlFor="motdepasse" className="mt-5 block font-bold">Mot de passe</label>
        <input id="motdepasse" name="motdepasse" type="password" required autoComplete="current-password"
          className="mt-2 block h-14 w-full rounded-[var(--radius-ctrl)] border-2 border-filet px-4 text-[1.05rem] outline-none focus:border-bleu" />
        {etat && !etat.ok && <p role="alert" className="mt-3 font-semibold text-erreur">{etat.erreur}</p>}
        <button disabled={enCours || !configure} className={classeBouton('bleu', 'mt-6 w-full')}>{enCours ? 'Vérification…' : 'Se connecter'}<Fleche /></button>
        <Link href="/" className="mt-6 block text-center text-[0.95rem] font-semibold text-sourdine hover:text-bleu">Retour au site</Link>
      </form>
    </div>
  );
}
