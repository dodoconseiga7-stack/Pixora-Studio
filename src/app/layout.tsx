import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

// Une seule famille, professionnelle et très lisible sur téléphone.
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3300'),
  title: { default: 'Pixora Studio · Création graphique à Ouagadougou', template: '%s · Pixora Studio' },
  description: 'Au-delà de l’IA, nous créons des designs pensés, maîtrisés et adaptés à votre image : cartes de visite, flyers, affiches, visuels, kakémonos, étiquettes et logos.',
  openGraph: { siteName: 'Pixora Studio', locale: 'fr_FR', type: 'website' },
};

export const viewport: Viewport = { themeColor: '#ffffff' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={jakarta.variable}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
