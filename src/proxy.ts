import { NextResponse, type NextRequest } from 'next/server';

/**
 * ADMINISTRATION INVISIBLE
 * - L'adresse interne /gestion n'est jamais accessible directement : elle répond « page introuvable ».
 * - Le propriétaire entre par une adresse secrète, choisie dans la variable ADMIN_URL_SECRET
 *   (ex. : ADMIN_URL_SECRET=atelier-k7p2x9 → https://site/atelier-k7p2x9). Aucun lien public n'y mène.
 * - Le mot de passe (ADMIN_PASSWORD) reste exigé en plus : connaître l'adresse ne suffit pas.
 */
export function proxy(req: NextRequest) {
  const chemin = req.nextUrl.pathname;
  const secret = process.env.ADMIN_URL_SECRET?.trim().replace(/^\/+|\/+$/g, '');

  if (chemin === '/gestion' || chemin.startsWith('/gestion/')) {
    return NextResponse.rewrite(new URL('/page-introuvable', req.url));
  }
  if (secret && secret.length >= 8 && chemin === `/${secret}`) {
    const res = NextResponse.rewrite(new URL('/gestion', req.url));
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }
  return NextResponse.next();
}

export const config = {
  // Toutes les pages, sauf les fichiers techniques et les images.
  matcher: ['/((?!_next/static|_next/image|creations/|uploads/|favicon|.*\\.(?:svg|png|jpg|jpeg|webp|ico|txt|xml)$).*)'],
};
