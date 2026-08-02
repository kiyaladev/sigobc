# Retenues fiscales paramétrables (ITS / retenue communale / I.G.R.)

Date : 2026-08-02
Écran concerné : `/admin/parametrage` — section « Paramètres de Paie (Taux & Cotisations) »

## Problème

Les communes n'appliquent pas la même retenue communale : Gboguhé applique la
Contribution Nationale (C.N.), Vavoua le Fonds National de Solidarité (F.N.S.).
C'est **une seule et même retenue sous deux libellés**, aujourd'hui codée en dur
par `MAIRIE_INFO.typeRetenue` (`frontend/public/constanteInfo.js`) et lue
directement dans les gabarits d'impression. Elle n'est ni visible ni modifiable
depuis l'application.

Trois défauts en découlent :

1. **La retenue communale n'a pas de taux propre.** Elle est dérivée de l'ITS —
   `cn = max(0, its - abattementCN)` (`frontend/public/employe/etat-solde.html:331`),
   avec `abattementCN = 750` par défaut. Modifier le taux ITS modifie
   mécaniquement la retenue.
2. **Elle n'est jamais enregistrée.** Elle est recalculée à chaque impression de
   l'état de solde. Le bulletin de paie et l'état de paie l'ignorent.
3. **Le net stocké et le net imprimé divergent.**
   `SalairesPage.vue:772-778` calcule `net = brut − CNPS − ITS − autresRetenues + primes`
   (retenue communale non déduite), tandis que `etat-solde.html:332-335` calcule
   `net = (brut − CNPS) − (ITS + C.N.) + primes` (déduite). Le montant imprimé
   sur l'état de solde ne correspond donc pas au `montantNet` de la fiche, ni au
   bordereau de règlement qui le reprend.

Cas réel observé sur `?mois=3&annee=2026` : ligne 8, ITS 1 744, C.N. 994,
Net imprimé 128 258 contre 129 252 enregistré — 994 F d'écart, et 1 988 F sur
l'ensemble de l'état.

Côté F.N.S., défaut symétrique : `tauxFns` est paramétrable mais **aucun montant
n'est jamais calculé** — il ne sert que d'étiquette de colonne
(`etat-solde.html:288`). À Vavoua, la colonne s'intitule `F.N.S` et reste vide.
La colonne I.G.R. s'imprime elle aussi systématiquement vide (`<td></td>` codé
en dur).

## Objectif

Faire des trois retenues — ITS, retenue communale, I.G.R. — des entités de même
nature : un taux, un interrupteur d'activation, un montant calculé et stocké,
une déduction du net. Rendre leur activation pilotable depuis
`/admin/parametrage` plutôt que par un fichier de constantes.

## Décisions

| Sujet | Décision |
|---|---|
| Formule retenue communale | `montant = brut × taux / 100`. Taux propre, indépendant de l'ITS. |
| `abattementCN` | Supprimé — plus de dérivation depuis l'ITS. |
| C.N. et F.N.S. | **Une seule retenue**, libellé dérivé de `typeRetenue`. Un taux, un interrupteur, un montant stocké. |
| Impact sur le net | Les trois retenues sont déduites du net payé. |
| Granularité de l'activation | Un interrupteur par retenue fiscale. CNPS et indemnité de résidence restent toujours actifs. |
| Colonnes des états | Trois colonnes fixes : `I.T.S`, `I.G.R`, puis `C.N.` ou `F.N.S` selon la commune. Une retenue inactive ou nulle laisse la cellule vide. |
| Taux communal par défaut | `0` à Gboguhé (à saisir par l'administrateur), repris de `tauxFns` à Vavoua. |
| Fiches existantes | Aucun backfill. Les nets déjà mandatés ne changent pas. |

## Modèle de données

### `ParametresPaie` — `frontend/src/database/db.ts:532`

```ts
export interface ParametresPaie {
  id?: number;
  mairieId: number;

  // Retenues fiscales — taux + activation
  itsActif: boolean;                 tauxIts: number;
  retenueCommunaleActive: boolean;   tauxRetenueCommunale: number;
  igrActif: boolean;                 tauxIgr: number;

  // Toujours actifs
  tauxCnpsEmploye: number;
  tauxCnpsPatronalPrestationFamiliale: number;
  tauxCnpsPatronalAccidentTravail: number;
  tauxCnpsPatronalRetraite: number;
  tauxIndemniteResidence: number;

  updatedAt: Date;
}
```

Supprimés : `abattementCN` et `tauxFns`, ce dernier étant absorbé par
`tauxRetenueCommunale`.

### `FichePaie` — `frontend/src/database/db.ts:465`

Deux montants stockés, symétriques de `impotSurSalaire` :

```ts
retenueCommunale: number;   // C.N. à Gboguhé, F.N.S. à Vavoua
impotGeneralRevenu: number;
```

Les montants doivent être stockés et non recalculés à l'affichage. Puisqu'ils
entrent dans `montantNet`, un recalcul à l'impression divergerait dès qu'un taux
change — c'est exactement le défaut n°3 décrit plus haut.

### Backend — `backend/src/models/index.ts`

Schémas Mongoose, pas de migration SQL.

- `ParametresPaieSchema:475` — ajouter `tauxRetenueCommunale`, `itsActif`,
  `retenueCommunaleActive`, `igrActif` ; retirer `abattementCN` et `tauxFns`.
- `FichePaieSchema:406` — ajouter `retenueCommunale`, `impotGeneralRevenu`.

### Valeurs par défaut

Au seed (`db.ts:1798`) comme au backfill des bases existantes :

```ts
tauxIts: 1.6,   itsActif: true,
tauxIgr: 0,     igrActif: false,

// Gboguhé (typeRetenue 'CN') : 0, à saisir par l'administrateur.
// Vavoua  (typeRetenue 'FNS'): reprend le tauxFns existant (1.0).
tauxRetenueCommunale: typeRetenue === 'FNS' ? (tauxFns ?? 1) : 0,
retenueCommunaleActive: true,
```

Aucun taux fiscal n'est inventé par le code pour Gboguhé : tant que
`tauxRetenueCommunale` vaut 0, la colonne C.N. sort vide.

Le backfill des bases existantes suit le pattern déjà en place à
`ParametragePage.vue:517-518` (`params.tauxIgr = params.tauxIgr ?? 0`).
L'initialisation des paramètres de paie n'existe qu'à un seul endroit
(`db.ts:1792-1812`) ; `seeders.ts` ne touche pas à cette table.

### Rôle de `typeRetenue`

`typeRetenue` reste dans `constanteInfo.js` et devient **purement un libellé** :

```js
const libelleRetenueCommunale = MAIRIE_INFO.typeRetenue === 'CN' ? 'C.N.' : 'F.N.S';
```

Il ne pilote plus aucun calcul ni aucune activation — c'est l'interrupteur en
base qui décide si la retenue s'applique.

## Calcul

Un seul endroit fait autorité : `frontend/src/pages/app7/SalairesPage.vue`,
fonctions `recalculate()` (ligne 742) et `genererBulletins()` (ligne 997). Les
deux doivent produire des résultats identiques pour les mêmes entrées.

```
exempt = typeEmploye ∈ { Contractuels*, Agents de l'État*, Maire et Adjoints* }

si exempt :
    CNPS = ITS = retenueCommunale = I.G.R = 0
    net  = brut + transport + autresIndemnités

sinon :
    CNPS  = arrondi(brut × tauxCnpsEmploye / 100)
    ITS   = itsActif               ? arrondi(brut × tauxIts / 100)              : 0
    RC    = retenueCommunaleActive ? arrondi(brut × tauxRetenueCommunale / 100) : 0
    I.G.R = igrActif               ? arrondi(brut × tauxIgr / 100)              : 0
    net   = brut − CNPS − ITS − RC − I.G.R − autresRetenues
            + transport + autresIndemnités
```

`brut = salaireBase + indemniteLogement` (inchangé). La règle d'exemption
(`isExemptFromTax`, ligne 733) est inchangée.

Pour éviter la duplication entre `recalculate()` et `genererBulletins()`, la
formule est extraite dans une fonction pure exportée, prenant en entrée les
montants bruts et les `ParametresPaie`, et retournant les quatre retenues plus
le net. Les deux appelants la consomment.

## Écran de paramétrage

`frontend/src/pages/admin/ParametragePage.vue:259-361` — la grille unique de
neuf champs est découpée en trois sous-blocs :

```
Retenues fiscales
  [ON ] Taux ITS ....... 1.6 %
  [ON ] Taux C.N. ...... 0 %        ← libellé « Taux F.N.S. » à Vavoua
  [OFF] Taux I.G.R. .... grisé

Cotisations CNPS
  Part salariale 6.3 %    Prest. familiale 5.75 %
  Accident travail 2.0 %  Retraite 7.7 %

Autres
  Indemnité de résidence 15 %
```

- `q-toggle` en `prepend` de chaque `q-input` de retenue fiscale.
- Champ `:disable="!xxxActif"` — grisé quand la retenue est désactivée, la
  valeur du taux est conservée en base.
- Le libellé du champ de retenue communale est calculé :
  `` `Taux ${MAIRIE_INFO.typeRetenue === 'CN' ? 'C.N.' : 'F.N.S.'}` ``. Une seule
  commune n'affiche jamais les deux.
- Le champ « Abattement C.N. (ITS − valeur) » (lignes 305-316) et le champ
  « Taux FNS » (lignes 282-292) disparaissent au profit de ce champ unique.
- La tuile de résumé « Taux ITS » (lignes 493-499) est conservée telle quelle.

## États et impressions

### `frontend/public/employe/etat-solde.html`

**Déjà corrigé** — cette partie est appliquée, hors en-tête.

La grille garde ses **3 colonnes de retenues** : `I.T.S | I.G.R | C.N.-ou-F.N.S`.
C.N. et F.N.S. partagent le même emplacement puisqu'elles ne coexistent jamais.

Appliqué :

- Lecture d'`abattementCN` supprimée (ex-ligne 289) ; dérivation
  `Math.max(0, its − abattementCN)` remplacée par `f.retenueCommunale || 0`.
- I.G.R. alimenté depuis `f.impotGeneralRevenu || 0` avec son propre cumul, au
  lieu du `<td></td>` codé en dur.
- `totalImp = its + retenueCommunale + igr`, sans condition sur `typeRetenue`.
- Ternaires `MAIRIE_INFO.typeRetenue === 'CN' ? … : ''` retirés des lignes de
  données, REPORT et TOTAL. Les cellules passent par `fmtOrEmpty()` (ligne 190),
  qui rend déjà une chaîne vide pour une valeur nulle ou absente.

Reste à faire :

- `buildTableHead()` ligne 260 — afficher le taux sous le libellé de la retenue
  communale, comme pour l'I.T.S, et sous l'I.G.R. lorsqu'il est actif. Le choix
  du libellé via `typeRetenue` est conservé tel quel.

### `frontend/public/bulletin_paie.html`

- Bloc des retenues (lignes 568-592) — une ligne `(−) <libellé>` par retenue de
  montant non nul, à la suite de la cotisation CNPS. Libellé de la retenue
  communale : « Contribution Nationale » ou « Fonds National de Solidarité »
  selon `typeRetenue`.
- `totalRetenues` (ligne 430) — somme CNPS + ITS + retenue communale + I.G.R. +
  autres retenues.

### `frontend/public/etat_paie.html`

`totalRetenues` (ligne 203) et `retenues` par ligne (ligne 215) intègrent les
trois retenues.

### `frontend/public/employe/etat-impot.html`

**Inchangé.** C'est l'état ITS ; la retenue communale n'y figure pas.

### `frontend/public/bordereau_reglement_salaires.html`

**Inchangé.** Ne lit que `montantNet` (lignes 483, 502), qui reste la source de
vérité.

## Fiches de paie existantes

Aucun backfill. Les fiches enregistrées ne reçoivent pas les nouveaux champs ;
ils sont lus `|| 0` partout. Leur `montantNet` est inchangé, donc les mois déjà
mandatés et les bordereaux de règlement déjà émis restent cohérents.

Conséquence visible et voulue : sur un état de solde d'un mois antérieur, la
colonne C.N. sort **vide** au lieu de la valeur dérivée `ITS − 750` qu'elle
montrait avant, et le `Net à Payer` remonte à la valeur enregistrée sur la fiche.

Le formulaire d'édition d'une fiche (`SalairesPage.vue:1060`, `saveFiche()`
ligne 1081) mappe les nouveaux champs ; rouvrir et enregistrer une ancienne
fiche la recalcule avec les règles courantes — comportement attendu et identique
à celui des autres champs aujourd'hui.

## Autres fichiers touchés

- `frontend/src/pages/app7/SalairesPage.vue` — champs de saisie des retenues
  (lignes 382-416), tuile « Total retenues » (ligne 431), mapping `openEdit`
  (1061-1077) et `saveFiche` (1084-1103).
- `frontend/src/database/seeders.ts:2019-2045` — fiches de démonstration : les
  deux nouveaux montants à `0`, `montantNet` inchangé.

## Vérification

1. `npx vue-tsc --noEmit` et `npm run lint` — sans erreur.
2. Sur `/employe/etat-solde.html?mois=3&annee=2026`, vérifier que les colonnes
   I.G.R et C.N. sortent vides, que `Total Impôts` vaut l'ITS seul (3 488 au
   total), et que le `Net à Payer` total vaut 1 174 101 — identique au bordereau
   de règlement du même mois.
3. Sur un mois de test, générer des bulletins puis contrôler que le
   **NET À PAYER** du bulletin de paie, la colonne **NET** de l'état de solde et
   le montant du bordereau de règlement affichent le même montant. C'est le
   défaut n°3 : ces trois valeurs divergent aujourd'hui.
4. Activer chaque retenue avec un taux non nul, regénérer un bulletin, et
   vérifier que la colonne correspondante se remplit sans décaler les en-têtes
   ni les lignes REPORT et TOTAL. Les trois colonnes restent imprimées dans tous
   les cas.
5. Vérifier qu'un employé exempt (Contractuel, Agent de l'État, Maire ou
   Adjoint) ne porte aucune retenue quelle que soit la configuration.
6. Vérifier qu'une base existante s'ouvre sans erreur, avec le taux de retenue
   communale repris de `tauxFns` à Vavoua et à 0 à Gboguhé, et les nets
   antérieurs inchangés.
