import type { Catalogue, Creation } from '@/lib/types';

/**
 * CONTENU DE DÉPART — utilisé tant que l'administration n'a rien enregistré.
 * Prix : grille officielle fournie par Pixora Studio (08/11/2026).
 * Créations : images déjà publiées sur l'ancien site pixora-academy.vercel.app (dossiers creations/,
 * services/custom/ et ai/). Domaines repris de l'ancien site quand ils étaient indiqués ; sinon
 * proposés d'après l'image, à corriger dans l'administration.
 * Aucune image n'a été générée ni téléchargée sur Internet pour « Ma création ».
 */
const t0 = Date.UTC(2026, 10, 8);
const c = (id: string, type: Creation['type'], domaineId: string, serviceId: string, titre: string, description: string, i: number): Creation =>
  ({ id, type, domaineId, serviceId, titre, description, image: `/creations/${id}.webp`, ajouteLe: t0 - i * 60000 });

export const catalogueInitial: Catalogue = {
  version: 1,
  logo: '/logo-pixora.webp', // « P » découpé du logo de l'ancien site (assets/images/logo.png), remplaçable dans l'administration
  whatsapp: '+226 03 24 95 48',
  domaines: [
    { id: 'plombier', nom: 'Plombier' },
    { id: 'restaurant-delice', nom: 'Restaurant / Délice' },
    { id: 'fashion', nom: 'Fashion' },
    { id: 'market', nom: 'Market' },
    { id: 'fast-food', nom: 'Fast-food' },
    { id: 'boulangerie-patisserie', nom: 'Boulangerie / Pâtisserie' },
    { id: 'electricite-batiment', nom: 'Électricité / Bâtiment' },
    { id: 'salon-de-coiffure', nom: 'Salon de coiffure' },
    { id: 'show-biz-evenements', nom: 'Show-biz / Événements' },
    { id: 'autres', nom: 'Autres' },
  ],
  services: [
    { id: 'carte-de-visite', nom: 'Carte de visite', prix: { basic: 5000, standard: 7500, premium: 10000 } },
    { id: 'flyer', nom: 'Flyer', prix: { basic: 5000, standard: 7500, premium: 10000 } },
    { id: 'affiche-publicitaire', nom: 'Affiche publicitaire', prix: { basic: 5000, standard: 8000, premium: 12000 } },
    { id: 'visuel-publicitaire', nom: 'Visuel publicitaire', prix: { basic: 5000, standard: 7000, premium: 10000 } },
    { id: 'affiche-kakemono', nom: 'Affiche / Kakémono', prix: { basic: 8000, standard: 12000, premium: 15000 } },
    { id: 'etiquette', nom: 'Étiquette', prix: { basic: 5000, standard: 7500, premium: 10000 } },
    { id: 'logo', nom: 'Logo', prix: { basic: 10000, standard: 15000, premium: 25000 } },
    { id: 'autres', nom: 'Autres', prix: { basic: null, standard: null, premium: null } },
  ],
  creations: [
    // MA CRÉATION — ancien site, dossier creations/ (domaine indiqué par Pixora)
    c('logo-eamo-btp', 'pixora', 'electricite-batiment', 'logo', 'Logo EAMO-BTP', 'Logo pour une entreprise du bâtiment et des travaux publics.', 0),
    c('carte-bliss-restaurant', 'pixora', 'restaurant-delice', 'carte-de-visite', 'Carte de visite Bliss Restaurant', 'Carte de visite recto verso pour un restaurant.', 1),
    c('flyer-exclusive', 'pixora', 'show-biz-evenements', 'flyer', 'Flyer « Exclusive Sunday »', 'Flyer de soirée pour un club.', 2),
    c('affiche-uniq-plumbing', 'pixora', 'plombier', 'affiche-publicitaire', 'Affiche Uniq Plumbing', 'Affiche de présentation des services d’un plombier.', 3),
    c('kakemono-beauty-glam', 'pixora', 'salon-de-coiffure', 'affiche-kakemono', 'Kakémono Beauty Glam', 'Kakémono vertical pour un salon de beauté.', 4),
    c('visuel-house-of-unique', 'pixora', 'fashion', 'visuel-publicitaire', 'Visuel House of Unique', 'Visuel pour une boutique de mode.', 5),
    c('etiquette-marmalade', 'pixora', 'restaurant-delice', 'etiquette', 'Étiquette de marmelade', 'Étiquette de pot avec tableau nutritionnel.', 6),
    c('visuel-seco', 'pixora', 'electricite-batiment', 'visuel-publicitaire', 'Visuel SECO Electricals', 'Visuel publicitaire pour un électricien.', 7),
    // MA CRÉATION — ancien site, images des services (domaine proposé, à confirmer)
    c('carte-kensky', 'pixora', 'electricite-batiment', 'carte-de-visite', 'Carte de visite Kensky', 'Carte de visite recto verso pour une entreprise de construction.', 8),
    c('flyer-food', 'pixora', 'fast-food', 'flyer', 'Flyer « Delicious Food »', 'Flyer de livraison pour un fast-food.', 9),
    c('etiquette-shito', 'pixora', 'market', 'etiquette', 'Étiquette Spicy Shito', 'Étiquette de bocal pour un condiment.', 10),
    c('kakemono-glampee', 'pixora', 'salon-de-coiffure', 'affiche-kakemono', 'Kakémono Glampee Studio', 'Kakémono pour un studio de beauté.', 11),
    c('affiche-african-women', 'pixora', 'autres', 'affiche-publicitaire', 'Affiche « African Women »', 'Affiche éditoriale.', 12),
    c('logo-afrogram', 'pixora', 'autres', 'logo', 'Logo Afrogram Studio', 'Logo pour un studio.', 13),
    c('visuel-beauty-paradise', 'pixora', 'market', 'visuel-publicitaire', 'Visuel Beauty Paradise', 'Visuel pour une gamme de soins.', 14),
    // CRÉATION PAR IA — ancien site, dossier ai/ (exemples générés, toujours signalés)
    c('ia-carte-palais-saveurs', 'ia', 'restaurant-delice', 'carte-de-visite', 'Carte de visite de restaurant', 'Carte standard, sans personnalisation fine.', 15),
    c('ia-flyer-masterclass', 'ia', 'show-biz-evenements', 'flyer', 'Flyer de formation', 'Flyer automatique, texte générique.', 16),
    c('ia-affiche-big-town', 'ia', 'restaurant-delice', 'affiche-publicitaire', 'Affiche de restaurant', 'Composition chargée, hiérarchie peu claire.', 17),
    c('ia-visuel-restaurants', 'ia', 'show-biz-evenements', 'visuel-publicitaire', 'Visuel publicitaire', 'Beaucoup d’éléments, sans identité de marque cohérente.', 18),
    c('ia-kakemono-intercontinental', 'ia', 'autres', 'affiche-kakemono', 'Kakémono d’entreprise', 'Mise en page standardisée.', 19),
  ],
  majLe: t0,
};
