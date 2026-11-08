# PIXORA STUDIO

Vitrine professionnelle d'un designer graphique (Ouagadougou) : créations classées par domaine, comparaison
« Ma création / Création par IA », tarifs Basic · Standard · Premium, commande guidée envoyée sur WhatsApp,
et une administration privée pour gérer photos, prix, logo et numéro WhatsApp sans toucher au code.

## Lancer en local

```bash
npm install
PORT=3300 npm run dev      # http://localhost:3300
```

Créer un fichier `.env.local` (jamais envoyé sur GitHub) :

```
ADMIN_PASSWORD=un-mot-de-passe-long
ADMIN_URL_SECRET=atelier-xxxxxxxx     # adresse secrète de l'administration, 8 caractères minimum
```

L'administration s'ouvre sur `http://localhost:3300/atelier-xxxxxxxx`. Les adresses `/admin` et `/gestion`
répondent « page introuvable ». En local, les données sont enregistrées dans `.donnees/` et les images dans
`public/uploads/`.

## Mettre en ligne sur Vercel (3 réglages)

1. **Importer le dépôt** sur vercel.com (Add New → Project).
2. **Stockage des images** : onglet *Storage* → *Create* → *Blob* → relier au projet. Vercel ajoute seul la
   variable `BLOB_READ_WRITE_TOKEN`. Sans elle, le site s'affiche mais l'administration ne peut rien enregistrer.
3. **Variables** (*Settings → Environment Variables*) : `ADMIN_PASSWORD` et `ADMIN_URL_SECRET`, puis redéployer.

## Où se trouve quoi

| Élément | Fichier |
|---|---|
| Contenu de départ (domaines, services, prix, créations) | `src/data/initial.ts` |
| Lecture / écriture du catalogue et des images | `src/lib/stockage.ts` (un seul fichier à changer pour passer à Supabase) |
| Actions de l'administration (toutes revérifient la session) | `src/app/gestion/actions.ts` |
| Adresse secrète de l'administration | `src/proxy.ts` |
| Message WhatsApp de commande | `src/lib/commande.ts` |
| Visite guidée (textes page par page) | `src/components/guide/VisiteGuidee.tsx` |

## Règles de contenu

- « Ma création » : uniquement des créations importées par le designer. Jamais d'image générée ni trouvée sur Internet.
- « Création par IA » : toujours affichée avec la mention CRÉATION PAR IA, jamais présentée comme une création humaine.
- Le formulaire de commande n'enregistre rien sur le site : il rédige le message WhatsApp que le client envoie lui-même.
