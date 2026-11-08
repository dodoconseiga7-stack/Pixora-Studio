import { cacheLife, cacheTag } from 'next/cache';
import { lireCatalogue } from './stockage';
import { catalogueInitial } from '@/data/initial';
import type { Catalogue } from './types';

/**
 * Catalogue mis en cache pour tout le site : le stockage n'est relu qu'après une modification
 * dans l'administration (updateTag('catalogue')), ce qui garde les pages très rapides.
 */
export async function getCatalogue(): Promise<Catalogue> {
  'use cache';
  cacheTag('catalogue');
  try {
    const c = await lireCatalogue();
    cacheLife('max');
    return c;
  } catch {
    // Stockage momentanément injoignable : contenu de départ, réessayé quelques minutes plus tard.
    cacheLife('minutes');
    return catalogueInitial;
  }
}
