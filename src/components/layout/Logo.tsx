import Link from 'next/link';

/**
 * Logo de Pixora Studio : l'image importée par le propriétaire dans l'administration.
 * Tant qu'aucun logo n'est importé, le nom est simplement écrit en texte (aucun logo inventé).
 */
export function Logo({ logo, clair = false, onClick, taille = 'normal' }: {
  logo: string | null; clair?: boolean; onClick?: () => void; taille?: 'normal' | 'grand';
}) {
  return (
    <Link href="/" onClick={onClick} aria-label="Pixora Studio, accueil" className="flex shrink-0 items-center gap-3">
      {logo && (
        // eslint-disable-next-line @next/next/no-img-element -- logo importé, dimensions inconnues à l'avance
        <img src={logo} alt="" className={`${taille === 'grand' ? 'h-14' : 'h-10'} w-auto max-w-[9rem] rounded-lg object-contain`} />
      )}
      <span className={`flex flex-col leading-none ${clair ? 'text-white' : 'text-encre'}`}>
        <span className="text-[1.2rem] font-extrabold tracking-[-0.02em]">PIXORA</span>
        <span className={`mt-1 text-[0.68rem] font-bold tracking-[0.32em] ${clair ? 'text-sourdine-clair' : 'text-bleu'}`}>STUDIO</span>
      </span>
    </Link>
  );
}
