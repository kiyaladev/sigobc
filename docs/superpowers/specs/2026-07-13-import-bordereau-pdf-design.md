# Spec — Import de bordereaux PDF → Mandats

**Date :** 2026-07-13
**Statut :** Validé (design), à planifier
**Périmètre v1 :** Upload d'un PDF « Bordereau d'émission des mandats » (Commune de
Vavoua) → extraction par LLM (MiniMax) → écran de vérification éditable → création des
`BordereauMandat` (un par folio) et des `Mandat` (un par ligne).

---

## 1. Objectif

Permettre à l'utilisateur d'uploader un PDF scanné de « BORDEREAU D'ÉMISSION DES
MANDATS » et d'en créer automatiquement, après vérification, les bordereaux de mandats
et leurs mandats dans l'application (module App3 — Dépenses).

Les lignes de salaires/indemnités/cotisations présentes dans ces bordereaux sont
traitées comme des **mandats normaux** — aucune `FichePaie` n'est générée (décision
produit : le document ne contient pas le détail brut/CNPS/ITS/net requis).

## 2. Contexte technique (existant)

- **Stack :** Frontend Quasar/Vue 3/Electron ; backend Express/MongoDB. Couche
  `Collection` offline-first (`frontend/src/database/collection.ts`) : lit/écrit via
  l'API REST et un cache Dexie, avec file de synchronisation hors-ligne.
- **Modèles concernés** (`frontend/src/database/db.ts`) :
  - `Mandat` : `numeroMandat` (string, unique/an), `numeroOrdre?`, `exercice`,
    `dateMandat`, `chapitreId` (obligatoire), `sousChapitreId` (obligatoire),
    `bordereauMandatId?`, `beneficiaire`, `objet`, `montant`, `modePaiement`,
    `statut` (`brouillon|paye|annule`), `mairieId`, `personnelId`.
  - `BordereauMandat` : `numero` (incrémental), `exercice`, `dateEmission?`,
    `montantTotal`, `totalPrecedent?`, `nombreMandats`, `statut` (`ouvert|ferme`),
    `mairieId`, `personnelId`.
  - `Chapitre` : `code` (ex. `1`..`8`), `libelle`. `SousChapitre` : `code`
    (ex. `6000`, `6131`, `60012`), `libelle`.
- **Conventions de création** (`pages/app3/MandatsPage.vue`,
  `pages/app3/BordereauxMandatsGestionPage.vue`) :
  - `BordereauMandat.numero` = `max(numero de l'exercice) + 1`.
  - `mairieId = 1` ; `personnelId = authStore.currentUser?.id ?? 1`.
  - `recalculateBordereauStats(bordereauId)` recompte `nombreMandats` et `montantTotal`
    à partir des mandats **payés** uniquement (brouillon/annulé exclus).
- **Electron IPC** : pattern `ipcMain.handle(...)` dans
  `src-electron/electron-main.ts`, exposé via `contextBridge.exposeInMainWorld` dans
  `src-electron/electron-preload.ts` (ex. `licenseAPI`).

## 3. Structure du document source (analysée sur 2 PDF réels)

Document : « BORDEREAU D'ÉMISSION DES MANDATS », Commune de Vavoua, Code 433,
Exercice 2026. Un PDF contient **un ou plusieurs folios** (ex. folios 01→11, 72 mandats).

**Par folio (→ un `BordereauMandat`) :**
| Champ document | Champ cible |
|---|---|
| `FOLIO N°` (01, 02…, 122) | `numero` |
| `EXERCICE` | `exercice` |
| `DATE D'EMISSION` (« A VAVOUA, le 13 JANVIER 2026 ») | `dateEmission` |
| `TOTAL DU PRESENT BORDEREAU` | `montantTotal` (contrôle) |
| `TOTAL DU PRECEDENT BORDEREAU` | `totalPrecedent` |

**Par ligne du tableau (→ un `Mandat`) :**
| Colonne document | Champ cible |
|---|---|
| `N°` (771, 1, 2…) | `numeroOrdre` |
| `Nature de la Dépense` (« SALAIRE AGENT CONTRACTUEL », « INDEMNITE DE FONCTION », « Cotis.ITS… ») | `objet` |
| `Nom et adresse du Créancier` | `beneficiaire` |
| `IMPUTATION Fonctionnelle` au format `{codeSousChapitre}/{codeChapitre}` (ex. `6000/2`) | `sousChapitreId` + `chapitreId` (résolus par code) |
| `SOMME MANDATÉE` | `montant` |

La **PARTIE RÉSERVÉE AU RECEVEUR MUNICIPAL** (manuscrite : dates de paiement, créditeurs,
autres opérations) est **ignorée** à la création.

## 4. Architecture / flux

```
[Page App3 « Importer bordereau »]
  → choix d'un PDF
  → IPC 'bordereau:parse' (renderer → Electron main)
       main : rasterise pages PDF en PNG
            → appel MiniMax (vision, JSON strict)
            → renvoie { ok, data | error }
  → Résolution locale (chapitres/sous-chapitres par code + détection conflits/écarts)
  → ÉCRAN DE VÉRIFICATION éditable (groupé par folio)
  → « Créer tout » → db.bordereauMandats.add + db.mandats.add (par folio) + recalcul
```

Le **parsing** requiert une connexion (MiniMax). La **création** utilise la couche
`Collection` habituelle (fonctionne hors-ligne, met en file de sync).

## 5. Composants à créer

**A. Electron main — `src-electron/bordereau-import.ts`** (+ enregistrement du handler
dans `electron-main.ts`)
- `ipcMain.handle('bordereau:parse', async (_e, bytes: Uint8Array) => …)`.
- Rasterise chaque page PDF en PNG (lib `pdf-to-png-converter` ou `pdfjs-dist` — à
  figer au plan).
- Appelle l'API MiniMax (endpoint OpenAI-compatible, modèle vision — endpoint/modèle
  exacts à confirmer au plan) avec prompt strict + demande de sortie JSON conforme au
  schéma §6. Clé lue dans `process.env.MINIMAX_API_KEY`.
- Renvoie `{ ok: true, data }` ou `{ ok: false, error }`.

**B. Preload — `src-electron/electron-preload.ts`**
```ts
contextBridge.exposeInMainWorld('importAPI', {
  parseBordereau: (bytes: Uint8Array) => ipcRenderer.invoke('bordereau:parse', bytes),
});
```
+ déclaration de type dans `src-electron/electron-env.d.ts`.

**C. Frontend**
- `composables/useBordereauImport.ts` : appelle `window.importAPI.parseBordereau`,
  résout les codes chapitre/sous-chapitre, détecte conflits/écarts, expose les lignes
  éditables et la fonction de création.
- `pages/app3/ImportBordereauPage.vue` : upload → revue → création. Nouvelle route +
  entrée de menu dans la section App3.
- `components/ImportBordereauReview.vue` : tableau éditable groupé par folio.

## 6. Schéma d'extraction (contrat JSON MiniMax)

```jsonc
{
  "commune": "VAVOUA",
  "code": "433",
  "exercice": 2026,
  "dateEmission": "2026-01-13",         // ISO ; dérivée de « le 13 JANVIER 2026 »
  "folios": [
    {
      "numero": 1,                       // FOLIO N°
      "totalPresent": 825597,            // TOTAL DU PRESENT BORDEREAU
      "totalPrecedent": 0,               // TOTAL DU PRECEDENT BORDEREAU
      "totalGeneral": 825597,            // TOTAL GENERAL (contrôle)
      "mandats": [
        {
          "numeroOrdre": 1,
          "nature": "INDEMNITE DE FONCTION",
          "creancier": "KALOU BONAVENTURE, MAIRE",
          "imputationFonctionnelle": "6001",  // partie gauche de « 6001/1 »
          "chapitre": "1",                     // partie droite
          "somme": 409417
        }
      ]
    }
  ]
}
```
Règles pour le LLM : ne jamais inventer de valeur manquante (mettre `null`) ; ignorer la
zone manuscrite du receveur ; montants en entier (retirer espaces/points de milliers).

## 7. Résolution & vérifications (frontend, avant création)

1. **Imputations** : `sousChapitreId` ← `sousChapitres` dont `code === imputationFonctionnelle` ;
   `chapitreId` ← `chapitres` dont `code === chapitre`. Non résolu → ligne **marquée** ;
   l'utilisateur choisit via un select (ou crée le code manquant).
2. **Conflit de numéro de folio** : si un `BordereauMandat` existe déjà pour
   `(numero, exercice)`, **avertir** ; options « garder le numéro » ou « renuméroter
   auto » (`max+1`).
3. **Écart de total** : si `Σ sommes du folio ≠ totalPresent`, **avertir** (l'utilisateur
   tranche ; la création utilise la somme des lignes réellement créées).
4. Ligne sans imputation résolue ou sans montant → **bloque** la création de cette ligne
   tant qu'elle n'est pas corrigée.

## 8. Création (mapping fidèle à l'existant)

Pour chaque folio (dans l'ordre) :
```ts
const now = new Date();
const personnelId = authStore.currentUser?.id ?? 1;
const bId = await db.bordereauMandats.add({
  numero, exercice, dateEmission,
  statut: 'ouvert',
  totalPrecedent,
  montantTotal: sommeDesLignesCreees,
  nombreMandats: lignes.length,
  mairieId: 1, personnelId,
  createdAt: now, updatedAt: now,
});
for (const l of lignes) {
  await db.mandats.add({
    numeroMandat: String(l.numeroOrdre),   // défaut ; éditable ; collision détectée
    numeroOrdre: l.numeroOrdre,
    exercice, dateMandat: dateEmission,
    chapitreId: l.chapitreId, sousChapitreId: l.sousChapitreId,
    beneficiaire: l.creancier, objet: l.nature, montant: l.somme,
    modePaiement: 'virement',              // défaut éditable
    statut: 'paye',                         // défaut validé (cf. §9)
    bordereauMandatId: bId,
    mairieId: 1, personnelId,
    createdAt: now, updatedAt: now,
  });
}
await recalculateBordereauStats(bId);       // réutiliser la logique existante
```

## 9. Décisions produit validées

- **Statut par défaut des mandats importés = `paye`** (le bordereau a réellement été
  émis) → le total du bordereau se calcule correctement. La vérification budgétaire du
  flux manuel est **contournée** pour l'import en masse. Statut éditable dans la revue.
- **Appel LLM depuis le process principal Electron** (clé dans `process.env`, non
  commitée). L'utilisateur accepte que la clé soit embarquée dans l'app packagée.
- **Écran de vérification obligatoire** avant toute création.

## 10. Sécurité — clé MiniMax

- La clé **n'est jamais** écrite dans un fichier commité. Lue via
  `process.env.MINIMAX_API_KEY` (dev : `.env` local ignoré par git ; build : injectée).
- La clé partagée en clair dans le chat doit être **régénérée** par l'utilisateur.

## 11. Hors périmètre v1

- Pas de `FichePaie` / paie détaillée.
- Pas de bordereaux recette (`BordereauMandatRecette`, `BordereauRecette`,
  `Declaration`).
- Pas de création de `Fournisseur` (le créancier reste en texte libre sur le mandat).
- Pas de traitement multi-communes (mairieId fixé à 1).

## 12. Points à figer pendant le plan d'implémentation

- Endpoint + nom de modèle MiniMax vision exacts ; format de la requête (base64 images)
  et `response_format` JSON.
- Bibliothèque de rasterisation PDF→PNG compatible Electron/Node (native deps).
- Mécanisme d'injection de `MINIMAX_API_KEY` au build de l'app packagée.
- Robustesse OCR sur scans de faible qualité (ex. page jaune du folio 11) : stratégie
  de relance/segmentation par page si le JSON est incomplet.
