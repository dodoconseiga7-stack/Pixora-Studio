import { getCatalogue } from '@/lib/catalogue';
import { EnTete } from '@/components/layout/EnTete';
import { PiedDePage } from '@/components/layout/PiedDePage';
import { Progression } from '@/components/layout/Progression';
import { DefilementDoux } from '@/components/providers/DefilementDoux';
import { Curseur } from '@/components/ui/Curseur';
import { VisiteGuidee } from '@/components/guide/VisiteGuidee';

/**
 * Habillage du site PUBLIC (l'administration, dans app/gestion, n'en hérite pas).
 * En-tête et pied de page reçoivent le logo et le numéro WhatsApp gérés dans l'administration.
 */
export default async function LayoutSite({ children }: { children: React.ReactNode }) {
  const c = await getCatalogue();
  return (
    <>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-white focus:px-4 focus:py-2">
        Aller au contenu
      </a>
      <Progression />
      <EnTete logo={c.logo} whatsapp={c.whatsapp} />
      <main id="contenu" className="flex-1">{children}</main>
      <PiedDePage logo={c.logo} whatsapp={c.whatsapp} />
      <VisiteGuidee />
      <DefilementDoux />
      <Curseur />
    </>
  );
}
