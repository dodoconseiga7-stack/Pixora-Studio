import Link from 'next/link';

/** En-tête de page intérieure : fil d'Ariane, grand titre, une phrase. */
export function EnTetePage({ fil, titre, intro, children }: { fil: string; titre: string; intro: string; children?: React.ReactNode }) {
  return (
    <header className="conteneur pb-8 pt-28 lg:pb-12 lg:pt-36">
      <nav aria-label="Fil d’Ariane">
        <ol className="flex gap-2 text-[0.9rem] text-sourdine">
          <li><Link href="/" className="hover:underline">Accueil</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="font-semibold text-encre">{fil}</li>
        </ol>
      </nav>
      <h1 className="titre mt-6 max-w-4xl text-[clamp(2.6rem,6.4vw,5.4rem)]">{titre}</h1>
      <p className="chapo mt-5 max-w-2xl">{intro}</p>
      {children && <div className="mt-8">{children}</div>}
    </header>
  );
}
