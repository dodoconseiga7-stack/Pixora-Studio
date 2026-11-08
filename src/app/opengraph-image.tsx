import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

/** Aperçu affiché quand le lien du site est partagé (WhatsApp, Facebook…) : logo, nom et promesse. */
export const alt = 'Pixora Studio : création graphique à Ouagadougou';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const logo = await readFile(path.join(process.cwd(), 'src/app/icon.png'));
  const src = `data:image/png;base64,${logo.toString('base64')}`;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', background: '#ffffff', color: '#0b1634' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendu d'image Open Graph */}
          <img src={src} width={120} height={120} style={{ borderRadius: '24px' }} alt="" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-2px' }}>PIXORA</div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '10px', color: '#1b4dd8' }}>STUDIO</div>
          </div>
        </div>
        <div style={{ marginTop: '56px', fontSize: 58, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, maxWidth: '980px' }}>
          Au-delà de l’IA, des designs pensés et adaptés à votre image.
        </div>
        <div style={{ marginTop: '36px', fontSize: 28, color: '#4b5775' }}>Cartes de visite · Flyers · Affiches · Kakémonos · Logos</div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '18px', background: '#1b4dd8' }} />
      </div>
    ),
    size,
  );
}
