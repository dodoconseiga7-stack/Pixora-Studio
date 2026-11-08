import Link from 'next/link';
import { fcfa } from '@/lib/format';
import { FORMULES, type Service } from '@/lib/types';

/** Les trois niveaux, expliqués en une phrase : le prix dépend toujours du service choisi. */
export function Formules() {
  return (
    <ol className="grid gap-3 md:grid-cols-3">
      {FORMULES.map((f, i) => (
        <li key={f.id} className={`rounded-[var(--radius-carte)] p-6 ${i === 2 ? 'bg-encre text-white' : i === 1 ? 'bg-bleu text-white' : 'bg-white ring-1 ring-filet'}`}>
          <p className="flex items-center gap-2">
            {[0, 1, 2].map((k) => <span key={k} aria-hidden className={`h-2 w-6 rounded-full ${k <= i ? (i === 0 ? 'bg-bleu' : 'bg-white') : i === 0 ? 'bg-filet' : 'bg-white/25'}`} />)}
          </p>
          <h3 className="mt-5 text-[1.6rem] font-extrabold tracking-[-0.02em]">{f.nom}</h3>
          <p className={`mt-2 ${i === 0 ? 'text-sourdine' : 'text-white/80'}`}>{f.texte}</p>
        </li>
      ))}
    </ol>
  );
}

const Prix = ({ s, f }: { s: Service; f: (typeof FORMULES)[number] }) => {
  const p = s.prix[f.id];
  return (
    <Link href={`/commander?service=${s.id}&formule=${f.id}`} aria-label={`${s.nom}, formule ${f.nom} : ${p == null ? 'sur devis' : fcfa(p)}. Commander`}
      className="chiffres block rounded-xl px-3 py-2 font-bold transition-colors hover:bg-bleu hover:text-white">
      {p == null ? <span className="font-semibold text-sourdine">Sur devis</span> : fcfa(p)}
    </Link>
  );
};

/** Grille des tarifs : tableau sur grand écran, une carte par service sur téléphone. */
export function GrilleTarifs({ services }: { services: Service[] }) {
  return (
    <>
      <table className="hidden w-full border-separate border-spacing-0 overflow-hidden rounded-[var(--radius-carte)] bg-white text-left ring-1 ring-filet md:table">
        <caption className="sr-only">Tarifs de Pixora Studio en F CFA, par service et par formule</caption>
        <thead>
          <tr className="bg-fond-2">
            <th scope="col" className="px-6 py-4 text-[0.95rem] font-bold text-sourdine">Service</th>
            {FORMULES.map((f) => <th key={f.id} scope="col" className="px-6 py-4 text-[0.95rem] font-bold">{f.nom}</th>)}
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id} className="group">
              <th scope="row" className="border-t border-filet px-6 py-3 text-[1.05rem] font-bold">{s.nom}</th>
              {FORMULES.map((f) => <td key={f.id} className="border-t border-filet px-3 py-2 text-[1.05rem]"><Prix s={s} f={f} /></td>)}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="grid gap-3 md:hidden">
        {services.map((s) => (
          <li key={s.id} className="rounded-[var(--radius-carte)] bg-white p-5 ring-1 ring-filet">
            <p className="text-[1.15rem] font-extrabold">{s.nom}</p>
            <dl className="mt-3 grid grid-cols-3 gap-1 text-center">
              {FORMULES.map((f) => (
                <div key={f.id} className="rounded-xl bg-fond-2 py-2">
                  <dt className="text-[0.82rem] font-semibold text-sourdine">{f.nom}</dt>
                  <dd className="text-[0.98rem]"><Prix s={s} f={f} /></dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[0.95rem] text-sourdine">Touchez un prix pour commander directement ce service dans cette formule.</p>
    </>
  );
}
