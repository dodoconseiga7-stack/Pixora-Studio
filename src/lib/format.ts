import type { Catalogue, FormuleId, Service } from './types';

/** 7500 → « 7 500 F CFA » (espaces simples : lisibles partout, y compris dans WhatsApp). */
export const fcfa = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n).replace(/[  ]/g, ' ')} F CFA`;

export const prixDe = (s: Service | undefined, f: FormuleId) => (s ? s.prix[f] : null);

export const nomDomaine = (c: Catalogue, id: string) => c.domaines.find((d) => d.id === id)?.nom ?? 'Autres';
export const nomService = (c: Catalogue, id: string) => c.services.find((s) => s.id === id)?.nom ?? 'Autres';

/** Créations prêtes à afficher (noms du domaine et du service), les plus récentes d'abord. */
export function creationsAffichees(c: Catalogue, type?: 'pixora' | 'ia') {
  return c.creations
    .filter((x) => !type || x.type === type)
    .sort((a, b) => b.ajouteLe - a.ajouteLe)
    .map((x) => ({ ...x, domaine: nomDomaine(c, x.domaineId), service: nomService(c, x.serviceId) }));
}

/** « +226 03 24 95 48 » → « 22603249548 » pour les liens wa.me et tel:. */
export const chiffres = (tel: string) => tel.replace(/\D/g, '');

/** Identifiant lisible à partir d'un nom : « Restaurant / Délice » → « restaurant-delice ». */
export function slug(texte: string) {
  return texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'element';
}

/** Services dont les visuels sont larges (logos, étiquettes, cartes) : montrés en entier, jamais recadrés. */
export const ENTIERES = ['logo', 'etiquette', 'carte-de-visite'];
