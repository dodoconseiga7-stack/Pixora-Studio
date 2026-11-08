import { fcfa } from './format';
import type { Catalogue, FormuleId } from './types';
import { FORMULES } from './types';

/** Une commande telle que le client l'a remplie (rien d'autre n'est inventé). */
export type Ligne = { serviceId: string; formule: FormuleId; quantite: number };
export type ModeContact = 'appel' | 'appel-whatsapp' | 'texto-whatsapp';
export type Commande = {
  lignes: Ligne[];
  domaineId: string;
  logo: '' | 'oui' | 'non';
  nom: string; prenom: string; telephone: string; adresse: string;
  contact: '' | ModeContact;
  precisions: string;
};

export const commandeVide: Commande = { lignes: [], domaineId: '', logo: '', nom: '', prenom: '', telephone: '', adresse: '', contact: '', precisions: '' };

export const MODES_CONTACT: { id: ModeContact; nom: string; message: string }[] = [
  { id: 'appel', nom: 'Appel téléphonique', message: 'Appel téléphonique' },
  { id: 'appel-whatsapp', nom: 'Appel via WhatsApp', message: 'Appel WhatsApp' },
  { id: 'texto-whatsapp', nom: 'Texto via WhatsApp', message: 'Message WhatsApp' },
];

export const nomFormule = (f: FormuleId) => FORMULES.find((x) => x.id === f)?.nom ?? f;

/** Prix d'une ligne (null = sur devis). */
export function prixLigne(c: Catalogue, l: Ligne) {
  const p = c.services.find((s) => s.id === l.serviceId)?.prix[l.formule];
  return p == null ? null : p * l.quantite;
}

export function total(c: Catalogue, lignes: Ligne[]) {
  return lignes.reduce((t, l) => t + (prixLigne(c, l) ?? 0), 0);
}
export const aDesDevis = (c: Catalogue, lignes: Ligne[]) => lignes.some((l) => prixLigne(c, l) == null);

const nettoyer = (v: string, max = 300) => v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const CHIFFRES = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
const TRAIT = '━━━━━━━━━━━━━━━━━━';

/**
 * Message WhatsApp reçu par Pixora Studio : construit UNIQUEMENT à partir de ce que le client a
 * rempli, sans rien oublier (chaque service, sa formule, sa quantité et son prix).
 */
export function messageWhatsApp(c: Catalogue, k: Commande) {
  const domaine = c.domaines.find((d) => d.id === k.domaineId)?.nom ?? '';
  const services = k.lignes.map((l, i) => {
    const s = c.services.find((x) => x.id === l.serviceId);
    const unitaire = s?.prix[l.formule];
    const prix = unitaire == null ? 'Sur devis'
      : l.quantite > 1 ? `${l.quantite} × ${fcfa(unitaire)} = ${fcfa(unitaire * l.quantite)}` : fcfa(unitaire);
    return [
      `${CHIFFRES[i] ?? `${i + 1}.`} ${s?.nom ?? 'Service'}`,
      `Formule : ${nomFormule(l.formule)}`,
      ...(l.quantite > 1 ? [`Quantité : ${l.quantite}`] : []),
      `Prix : ${prix}`,
    ].join('\n');
  });
  const devis = aDesDevis(c, k.lignes);
  const mode = MODES_CONTACT.find((m) => m.id === k.contact)?.message ?? '';

  return [
    TRAIT, '🎨 NOUVELLE COMMANDE', 'PIXORA STUDIO', TRAIT, '',
    '👤 INFORMATIONS DU CLIENT', '',
    `Nom : ${nettoyer(k.nom, 80)}`,
    `Prénom : ${nettoyer(k.prenom, 80)}`,
    `Téléphone : ${nettoyer(k.telephone, 30)}`,
    `Adresse / Quartier : ${nettoyer(k.adresse, 120)}`, '',
    '🏢 DOMAINE', '', domaine, '',
    '🏷️ LOGO', '', k.logo === 'oui' ? 'Oui' : 'Non', '',
    '🎨 SERVICES COMMANDÉS', '', services.join('\n\n'), '',
    '💰 TOTAL', '', `${fcfa(total(c, k.lignes))}${devis ? ' (+ services sur devis)' : ''}`, '',
    ...(nettoyer(k.precisions) ? ['📝 PRÉCISIONS', '', nettoyer(k.precisions, 600), ''] : []),
    '📞 MODE DE CONTACT', '', mode, '',
    TRAIT, 'Commande envoyée depuis Pixora Studio', TRAIT,
  ].join('\n');
}
