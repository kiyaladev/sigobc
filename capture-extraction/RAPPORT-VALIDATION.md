# Rapport d'extraction & validation — Bordereaux d'émission des mandats (Vavoua, exercice 2026)

Source : 7 PDF scannés dans `capture/` (CamScanner). Extraction par vision, une page = un folio.

## Résultat global
- **117 folios** extraits, couvrant la plage **folio 1 → 123** (exercice 2026, Commune de Vavoua, code 433).
- **734 mandats** (lignes) extraits.
- Chaîne des « total du présent / précédent / général » cohérente et continue de 0 (folio 1) jusqu'à **283 428 329 FCFA** (folio 123).

### Correspondance PDF → folios
| PDF | Folios | Période | N° mandats |
|---|---|---|---|
| 19.39 | 1–11 | Janvier 2026 | 1–72 |
| 19.48 | 13–41 | Février 2026 + achats janvier | 73–187 |
| 19.59 | 42–57 | Mars 2026 | 188–318 |
| 20.23 | 58–83 | Avril 2026 | 319–467 |
| 20.38 | 85–102 | Mai 2026 | 470–644 |
| 20.47 | 103–123 (dont « 122 »=en fait 121) | Mai–Juin 2026 | 645–789 |
| 20.54 | 122 (le vrai) | Juin 2026 | 771–778 |

Folios **absents des scans** (trous) : 12, 80, 84, 106, 107, 108, 121.

## ⚠️ Point bloquant — chevauchement avec la base existante
La base applicative (instantané de sauvegarde) contient déjà **199 mandats et 43 bordereaux (folios 1→44)** pour l'exercice 2026. Les PDF **ré-couvrent ces folios 1→44**. Charger l'ensemble créerait des **doublons**. Il faut décider à partir de quel folio les données sont réellement nouvelles (dépend de l'état de la base **vive**, non démarrée ici).

## Anomalies à trancher avant création
1. **Doublon folio 122** : le PDF 20.47 étiquette « 122 » une page (total 480 000) qui, d'après la chaîne des totaux, est en réalité le **folio 121**. Le vrai folio 122 (total 440 000) est le PDF 20.54. → résolu par déduction, à confirmer.
2. **Totaux non concordants** (Σ lignes ≠ total imprimé) : folios **4, 93, 98, 109, 120**.
   - folio 4 : ligne 28 (SOULEYMANE COULIBALY) montant illisible (~34 000 manquant).
   - folio 66 : **7 montants illisibles** (encre pâle) — total 286 451 connu, détail non.
   - folios 93/98/109/120 : ambiguïté OCR 50 000/60 000 ou chiffres peu nets.
3. **numeroOrdre en collision** (PDF 20.38, folios 99/101/…) : la colonne N° de ce PDF est peu fiable ; à renuméroter à la création.
4. **Codes non résolus dans le référentiel** :
   - sous-chapitres : `6013` (= très probablement `60013` INDEMNITÉ DE FONCTION), `6018`, `6205`, `6812`, `6906` (= prob. `6006`).
   - chapitres : `2211`, `2219` (imputations **patrimoniales d'investissement**, folios 76/77 — hors schéma fonctionnel 1–8).

## Fichiers produits
- `p1..p7-*.json` — extraction brute par PDF (verbatim).
- `consolide.json` — tous les folios fusionnés, avec `chapitreId`/`sousChapitreId` résolus par code (null si non résolu).
- `consolidate.js` — script de fusion/validation (rejouable).

## Résultat final de génération (décisions : folios 45→123, exclusion des folios non équilibrés)
- **`import-bordereaux.json`** : 62 bordereaux (ids **80→141**, `numero`=folio).
- **`import-mandats.json`** : 418 mandats (ids **13617→14034**), **145 948 643 FCFA**.
- Contrôle : pour chaque bordereau, `montantTotal` == Σ des mandats liés == total imprimé (0 écart).
- **`A-SAISIR-MANUELLEMENT.json`** : 12 folios exclus (Σ lignes ≠ total imprimé ou montants illisibles) : **66, 85, 86, 91, 92, 93, 98, 109, 110, 111, 115, 120**. (Le critère d'exclusion est un **recalcul indépendant** ; les drapeaux `totalMatch` des agents d'extraction se sont révélés non fiables.)
- Doublon folio 122 résolu : le « 122 » du PDF 20.47 (480 000) est renommé **folio 121** (comblait le trou).

### Réserves sur l'import généré (à corriger avant/pendant le chargement)
- **7 collisions de `numeroMandat`** : folio 101 (Transport, N° 627–633) entre en collision avec folio 99 — la colonne N° du PDF 20.38 est peu fiable. À renuméroter au chargement.
- **Codes non résolus** (mandats inclus, `chapitreId`/`sousChapitreId`=null, code brut mis en `patrimonial`/observations) : chapitres `2211`/`2219` (investissement, folios 76/77) et sous-chapitre `6812` (folio 102).
- **IDs à re-baser** : `START_BORDEREAU_ID`/`START_MANDAT_ID` dans `generate-import.js` supposent que la base vive s'arrête au folio 44 / mandat id 13616 / numeroMandat 199. Si la base réelle est plus avancée, ajuster ces constantes et relancer `node generate-import.js`.

## FICHIER FINAL À IMPORTER (base vive réelle)
`sigobc-module-depenses-REEL.json` — construit sur l'export **réel** du 2026-07-13 14:18 (et non l'instantané périmé). Format « module Dépenses » attendu par `#/admin/backup`.

Décisions appliquées : importer **tout le réel 1→123**, **remplacer** les données démo (folios 1→10 fictifs 2024‑2026), **créer** les codes manquants.

- **104 bordereaux** (ids 11→114), **626 mandats** (ids 101→726) — **255 863 699 FCFA**. Démo remplacée.
- Référentiel **vif conservé** : 8 chapitres, 1472 prévisions.
- **5 sous-chapitres créés** (ids 143→147) : `6131` Opérations d'assainissement, `6344` Marchés, `9100` Administration (invest.), `6205` (à vérifier), `6812` Prime de session (à vérifier). → sous-chapitres passent de 142 à **147**.
- Contrôles : montantTotal de chaque bordereau = Σ mandats liés (0 écart) ; aucun sousChapitreId orphelin ; aucun doublon de n° folio ; IDs re-basés sur la base vive (pas de collision).
- 3 mandats en `chapitreId=null` = investissement patrimonial (folios 76/77, codes 2211/2219 en champ `patrimonial`) + 1 ligne folio 103 illisible.
- **13 folios exclus** (Σ≠total ou illisibles) → `A-SAISIR-MANUELLEMENT.json` : 4, 66, 85, 86, 91, 92, 93, 98, 109, 110, 111, 115, 120.
- **7 collisions numeroMandat** restantes : folio 101 (Transport, N° 627–633, colonne N° du PDF 20.38 peu fiable) — à renuméroter après import.

### Procédure d'import
1. Page `#/admin/backup` → carte **Dépenses** → **Exporter** (sauvegarde de sécurité).
2. Carte **Dépenses** → **Importer** → choisir `sigobc-module-depenses-REEL.json` → Confirmer.
   (Ne PAS utiliser « Restaurer la base » complète : elle toucherait Recettes/Employés.)

## Mapping cible (schéma app)
- **BordereauMandat** : `numero`=folio, `exercice`, `dateEmission`, `montantTotal`=Σ lignes, `totalPrecedent`, `nombreMandats`, `statut:"ferme"`, `mairieId:1`.
- **Mandat** : `numeroMandat`=String(numeroOrdre), `numeroOrdre`, `dateMandat`=dateEmission, `chapitreId`/`sousChapitreId` résolus, `beneficiaire`=créancier, `objet`=nature, `montant`=somme, `modePaiement:"virement"`, `statut:"paye"`, `bordereauMandatId`.
