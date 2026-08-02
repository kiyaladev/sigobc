# Retenues fiscales paramétrables (ITS / C.N. / F.N.S. / I.G.R.)

Date : 2026-08-02
Écran concerné : `/admin/parametrage` — section « Paramètres de Paie (Taux & Cotisations) »

## Problème

Les communes n'appliquent pas les mêmes retenues sur salaire : la Contribution
Nationale (C.N.) existe à Gboguhé, pas à Vavoua, qui applique le F.N.S. Cette
différence est aujourd'hui codée en dur par `MAIRIE_INFO.typeRetenue`
(`frontend/public/constanteInfo.js`), lue directement dans les gabarits
d'impression. Elle n'est ni visible ni modifiable depuis l'application.

Trois défauts en découlent :

1. **La C.N. n'a pas de taux propre.** Elle est dérivée de l'ITS —
   `cn = max(0, its - abattementCN)` (`frontend/public/employe/etat-solde.html:331`),
   avec `abattementCN = 750` par défaut. Modifier le taux ITS modifie
   mécaniquement la C.N.
2. **La C.N. n'est jamais enregistrée.** Elle est recalculée à chaque impression
   de l'état de solde. Le bulletin de paie et l'état de paie l'ignorent.
3. **Le net stocké et le net imprimé divergent.**
   `SalairesPage.vue:772-778` calcule `net = brut − CNPS − ITS − autresRetenues + primes`
   (C.N. non déduite), tandis que `etat-solde.html:332-335` calcule
   `net = (brut − CNPS) − (ITS + C.N.) + primes` (C.N. déduite). Le montant
   imprimé sur l'état de solde ne correspond donc pas au `montantNet` de la
   fiche, ni au bordereau de règlement qui le reprend.

La F.N.S. et l'I.G.R. souffrent d'un défaut symétrique : `tauxFns` et `tauxIgr`
sont paramétrables mais **aucun montant n'est jamais calculé**. `tauxFns` ne sert
que d'étiquette de colonne (`etat-solde.html:288`), et la colonne I.G.R.
s'imprime systématiquement vide.

## Objectif

Faire des quatre retenues fiscales des entités de même nature — un taux, un
interrupteur d'activation, un montant calculé et stocké, une déduction du net —
et rendre leur activation pilotable depuis `/admin/parametrage` plutôt que par
un fichier de constantes.

## Décisions

| Sujet | Décision |
|---|---|
| Formule C.N. | `C.N. = brut × tauxCn / 100`. Taux propre, indépendant de l'ITS. |
| `abattementCN` | Supprimé — plus de dérivation depuis l'ITS. |
| Impact sur le net | Les quatre retenues sont déduites du net payé. |
| Granularité de l'activation | Un interrupteur par retenue fiscale. CNPS et indemnité de résidence restent toujours actifs. |
| Périmètre | Les quatre retenues sont traitées uniformément (F.N.S. et I.G.R. deviennent réellement calculées). |
| Colonnes des états | Fixes. Les quatre colonnes de retenues sont toujours imprimées ; une retenue inactive ou nulle laisse la cellule vide. |
| Taux C.N. par défaut | `0` — à saisir par l'administrateur. Aucun taux fiscal inventé par le code. |
| Fiches existantes | Aucun backfill. Les nets déjà mandatés ne changent pas. |

## Modèle de données

### `ParametresPaie` — `frontend/src/database/db.ts:532`

```ts
export interface ParametresPaie {
  id?: number;
  mairieId: number;

  // Retenues fiscales — taux + activation
  itsActif: boolean;   tauxIts: number;
  cnActif:  boolean;   tauxCn:  number;   // remplace abattementCN
  fnsActif: boolean;   tauxFns: number;
  igrActif: boolean;   tauxIgr: number;

  // Toujours actifs
  tauxCnpsEmploye: number;
  tauxCnpsPatronalPrestationFamiliale: number;
  tauxCnpsPatronalAccidentTravail: number;
  tauxCnpsPatronalRetraite: number;
  tauxIndemniteResidence: number;

  updatedAt: Date;
}
```

`abattementCN: number` est **supprimé** de l'interface.

### `FichePaie` — `frontend/src/database/db.ts:465`

Trois montants stockés, symétriques de `impotSurSalaire` :

```ts
contributionNationale: number;
fondNationalSolidarite: number;
impotGeneralRevenu: number;
```

Les montants doivent être stockés et non recalculés à l'affichage. Puisqu'ils
entrent dans `montantNet`, un recalcul à l'impression divergerait dès qu'un taux
change — c'est exactement le défaut n°3 décrit plus haut.

### Backend — `backend/src/models/index.ts`

Schémas Mongoose, pas de migration SQL.

- `ParametresPaieSchema:475` — ajouter `tauxCn`, `itsActif`, `cnActif`,
  `fnsActif`, `igrActif` ; retirer `abattementCN`.
- `FichePaieSchema:406` — ajouter `contributionNationale`,
  `fondNationalSolidarite`, `impotGeneralRevenu`.

### Valeurs par défaut

Au seed (`db.ts:1798`) comme au backfill des bases existantes :

```ts
tauxCn:   0,     cnActif:  MAIRIE_INFO.typeRetenue === 'CN',
tauxIts:  1.6,   itsActif: true,
tauxFns:  1.0,   fnsActif: MAIRIE_INFO.typeRetenue === 'FNS',
tauxIgr:  0,     igrActif: false,
```

`typeRetenue` reste dans `constanteInfo.js` comme **valeur de départ** par
commune ; les interrupteurs en base font autorité ensuite. Hors ce seed, plus
aucune lecture de `typeRetenue` ne subsiste — ni dans la logique de calcul, ni
dans les gabarits d'impression.

L'initialisation des paramètres de paie n'existe qu'à un seul endroit
(`db.ts:1792-1812`) ; `seeders.ts` ne touche pas à cette table.

Le backfill des bases existantes suit le pattern déjà en place à
`ParametragePage.vue:517-518` (`params.tauxIgr = params.tauxIgr ?? 0`).

Conséquence assumée du défaut `tauxCn = 0` : jusqu'à la saisie du taux par
l'administrateur, la colonne C.N. affiche 0 au lieu de la valeur dérivée
actuelle.

## Calcul

Un seul endroit fait autorité : `frontend/src/pages/app7/SalairesPage.vue`,
fonctions `recalculate()` (ligne 742) et `genererBulletins()` (ligne 997). Les
deux doivent produire des résultats identiques pour les mêmes entrées.

```
exempt = typeEmploye ∈ { Contractuels*, Agents de l'État*, Maire et Adjoints* }

si exempt :
    CNPS = ITS = C.N. = F.N.S = I.G.R = 0
    net  = brut + transport + autresIndemnités

sinon :
    CNPS  = arrondi(brut × tauxCnpsEmploye / 100)
    ITS   = itsActif ? arrondi(brut × tauxIts / 100) : 0
    C.N.  = cnActif  ? arrondi(brut × tauxCn  / 100) : 0
    F.N.S = fnsActif ? arrondi(brut × tauxFns / 100) : 0
    I.G.R = igrActif ? arrondi(brut × tauxIgr / 100) : 0
    net   = brut − CNPS − ITS − C.N. − F.N.S − I.G.R − autresRetenues
            + transport + autresIndemnités
```

`brut = salaireBase + indemniteLogement` (inchangé). La règle d'exemption
(`isExemptFromTax`, ligne 733) est inchangée.

Pour éviter la duplication entre `recalculate()` et `genererBulletins()`, la
formule est extraite dans une fonction pure exportée, prenant en entrée les
montants bruts et les `ParametresPaie`, et retournant les cinq retenues plus le
net. Les deux appelants la consomment.

## Écran de paramétrage

`frontend/src/pages/admin/ParametragePage.vue:259-361` — la grille unique de
neuf champs est découpée en trois sous-blocs :

```
Retenues fiscales
  [ON ] Taux ITS ....... 1.6 %      [ON ] Taux C.N. ...... 0 %
  [OFF] Taux F.N.S. .... grisé      [OFF] Taux I.G.R. .... grisé

Cotisations CNPS
  Part salariale 6.3 %    Prest. familiale 5.75 %
  Accident travail 2.0 %  Retraite 7.7 %

Autres
  Indemnité de résidence 15 %
```

- `q-toggle` en `prepend` de chaque `q-input` de retenue fiscale.
- Champ `:disable="!xxxActif"` — grisé quand la retenue est désactivée, la
  valeur du taux est conservée en base.
- `Taux C.N.` est placé immédiatement après `Taux ITS` pour que les deux
  retenues se lisent ensemble.
- Le champ « Abattement C.N. (ITS − valeur) » (lignes 305-316) disparaît.
- La tuile de résumé « Taux ITS » (ligne 493-499) est conservée telle quelle.

## États et impressions

### `frontend/public/employe/etat-solde.html` — colonnes fixes, cellules vides

La grille reste identique d'une commune à l'autre. Le bloc « Retenues » passe de
**3 à 4 colonnes fixes**, dans cet ordre :

```
|            Retenues                | Total  |
| I.T.S | I.G.R | C.N.  | F.N.S      | Impôts |
```

Quatre colonnes et non trois, parce que les interrupteurs sont indépendants :
une commune peut activer C.N. **et** F.N.S. Le slot unique actuel, qui affiche
`C.N.` ou `F.N.S` selon `typeRetenue`, ne peut pas porter les deux.

Modifications sur `buildTableHead()` (ligne 257-262) :

- `<th colspan="3">Retenues</th>` → `colspan="4"`.
- Ligne 260 — quatre `<th>` en dur : `I.T.S`, `I.G.R`, `C.N.`, `F.N.S`, chacun
  avec son taux en sous-titre lorsque la retenue est active. Suppression de la
  lecture de `MAIRIE_INFO.typeRetenue`.
- Largeurs `width:%` réparties sur 4 colonnes au lieu de 3 ; l'appoint est pris
  sur les colonnes `Signature` et `Nom & Prénom(S)`.

Modifications sur le rendu des lignes — données (410), REPORT (403), TOTAL (418) :

- Une cellule par retenue, rendue avec `fmtOrEmpty()` (ligne 190), qui affiche
  déjà une chaîne vide pour une valeur nulle ou absente. Une retenue inactive
  vaut `0` en base, donc la cellule sort vide sans condition supplémentaire.
- Les `<td></td>` codés en dur pour l'I.G.R. et les ternaires
  `MAIRIE_INFO.typeRetenue === 'CN' ? … : ''` disparaissent.
- Un cumul par colonne, soit quatre accumulateurs au lieu de deux.
- `colspan` des lignes REPORT et TOTAL ajusté de 3 à 4.

Modifications sur le calcul (lignes 289, 330-335) :

- Ligne 289 — lecture de `abattementCN` supprimée.
- Ligne 331 — `Math.max(0, its − abattementCN)` supprimé, remplacé par la
  lecture directe de `f.contributionNationale`, `f.fondNationalSolidarite` et
  `f.impotGeneralRevenu`.
- Ligne 332 — `totalImp = ITS + C.N. + F.N.S + I.G.R` (les retenues inactives
  valant 0, la somme est correcte sans condition).
- Ligne 335 — `net = (brut − CNPS) − totalImp + primes`, désormais égal au
  `montantNet` de la fiche.

**Effet immédiat attendu sur `?mois=3&annee=2026`** : les fiches de mars 2026 ne
portent aucun des nouveaux champs, donc C.N., F.N.S. et I.G.R. sortent vides,
`Total Impôts` vaut l'ITS seul, et le `Net à Payer` remonte à la valeur
enregistrée sur la fiche — celle que reprend le bordereau de règlement.

### `frontend/public/bulletin_paie.html`

- Bloc des retenues (lignes 568-592) — une ligne `(−) <libellé>` par retenue
  active dont le montant est non nul, à la suite de la cotisation CNPS.
- `totalRetenues` (ligne 430) — somme CNPS + retenues actives + autres retenues.

### `frontend/public/etat_paie.html`

`totalRetenues` (ligne 203) et `retenues` par ligne (ligne 215) intègrent les
quatre retenues.

### `frontend/public/employe/etat-impot.html`

**Inchangé.** C'est l'état ITS ; la C.N. n'y figure pas.

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
  (lignes 382-416), tuile « Total retenues » (ligne 431), mapping
  `openEdit` (1061-1077) et `saveFiche` (1084-1103).
- `frontend/src/database/seeders.ts:2019-2045` — fiches de démonstration :
  les trois nouveaux montants à `0`, `montantNet` inchangé.

## Vérification

1. `npx vue-tsc --noEmit` et `npm run lint` — sans erreur.
2. Sur un mois de test, générer des bulletins puis contrôler que le
   **NET À PAYER** du bulletin de paie, la colonne **NET** de l'état de solde et
   le montant du bordereau de règlement affichent le même montant. C'est le
   défaut n°3 : ces trois valeurs divergent aujourd'hui.
3. Sur `/employe/etat-solde.html?mois=3&annee=2026`, vérifier que les colonnes
   I.G.R, C.N. et F.N.S sortent vides, que `Total Impôts` vaut l'ITS seul, et que
   le `Net à Payer` est identique au montant du bordereau de règlement du même
   mois.
4. Activer chaque retenue avec un taux non nul, regénérer un bulletin, et
   vérifier que la colonne correspondante se remplit sans décaler les en-têtes
   ni les lignes REPORT et TOTAL. Les quatre colonnes restent imprimées dans
   tous les cas.
5. Vérifier qu'un employé exempt (Contractuel, Agent de l'État, Maire ou
   Adjoint) ne porte aucune retenue quelle que soit la configuration.
6. Vérifier qu'une base existante s'ouvre sans erreur, avec les interrupteurs
   positionnés selon `typeRetenue` et les nets antérieurs inchangés.
