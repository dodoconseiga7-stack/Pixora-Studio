import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

/**
 * Boutons en pilule.
 * - bleu : action principale (Commander, Confirmer) — flèche dans un rond blanc qui pivote au survol ;
 * - sombre : action forte sur fond clair ; secondaire : contour ; clair : sur fond sombre ou photo.
 */
export type Variante = 'bleu' | 'sombre' | 'secondaire' | 'clair';

const base = 'group/btn inline-flex items-center justify-center gap-3 rounded-full text-[1rem] font-bold transition-[background-color,color,border-color,transform] duration-200 ease-[var(--ease-sortie)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50';
const styles: Record<Variante, string> = {
  bleu: 'h-14 bg-bleu pl-7 pr-2 text-white hover:bg-bleu-fonce',
  sombre: 'h-14 bg-encre pl-7 pr-2 text-white hover:bg-encre-2',
  secondaire: 'h-14 border-2 border-encre/15 px-7 text-encre hover:border-bleu hover:text-bleu',
  clair: 'h-14 bg-white pl-7 pr-2 text-encre hover:bg-bleu-clair',
};

export function Fleche({ variante = 'bleu' }: { variante?: Variante }) {
  if (variante === 'secondaire') return null;
  const fond = variante === 'bleu' ? 'bg-white text-bleu' : 'bg-bleu text-white';
  return (
    <span aria-hidden className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${fond} transition-transform duration-300 ease-[var(--ease-sortie)] group-hover/btn:rotate-45`}>
      <ArrowUpRight size={19} strokeWidth={2.2} />
    </span>
  );
}

export const classeBouton = (variante: Variante = 'bleu', className = '') => `${base} ${styles[variante]} ${className}`;

export function BoutonLien({ href, children, variante = 'bleu', className = '', ...props }: {
  href: string; children: React.ReactNode; variante?: Variante; className?: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <Link href={href} className={classeBouton(variante, className)} {...props}>
      {children}<Fleche variante={variante} />
    </Link>
  );
}

/** Pictogramme de bulle de discussion (tracé simple, pas le logo officiel de WhatsApp). */
export function IconeWhatsApp({ size = 22 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 20.5l1.3-4.1A8.5 8.5 0 1 1 8 19.6z" />
      <path d="M9 8.6c0 3.3 3 6.4 6.4 6.4l1.2-1.3-1.9-1-1 .8c-1.2-.5-2.3-1.6-2.8-2.8l.8-1-1-1.9z" />
    </svg>
  );
}

/** Lien WhatsApp avec un message de départ (ouvre l'application ou WhatsApp Web). */
export const lienWhatsApp = (numero: string, message: string) =>
  `https://wa.me/${numero.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
