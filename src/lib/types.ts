/** Modèle de données de PIXORA STUDIO : tout ce que l'administration peut modifier sans toucher au code. */

export type FormuleId = 'basic' | 'standard' | 'premium';

export const FORMULES: { id: FormuleId; nom: string; texte: string }[] = [
  { id: 'basic', nom: 'Basic', texte: 'Pour un besoin simple et professionnel.' },
  { id: 'standard', nom: 'Standard', texte: 'Pour une création plus personnalisée et travaillée.' },
  { id: 'premium', nom: 'Premium', texte: 'Pour une création plus complète et poussée.' },
];

export type Domaine = { id: string; nom: string };

/** Prix en F CFA par formule ; null = « sur devis » (prix à définir avec le client). */
export type Service = { id: string; nom: string; prix: Record<FormuleId, number | null> };

/**
 * « pixora » = MA CRÉATION (uniquement des créations importées par le designer).
 * « ia » = CRÉATION PAR IA (exemples générés, toujours signalés comme tels).
 */
export type TypeCreation = 'pixora' | 'ia';

export type Creation = {
  id: string;
  type: TypeCreation;
  domaineId: string;
  serviceId: string;
  titre: string;
  description?: string;
  image: string;
  ajouteLe: number;
};

export type Catalogue = {
  version: 1;
  logo: string | null;
  whatsapp: string;
  domaines: Domaine[];
  services: Service[];
  creations: Creation[];
  majLe: number;
};
