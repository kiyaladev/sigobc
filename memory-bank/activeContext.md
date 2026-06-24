# Active context

**Current focus** (one short paragraph): Correction des convertisseurs chiffre-vers-lettres du dossier `frontend/public` pour les documents de paie et de solde, avec validation ciblée du cas `96`.

**In progress**:

- [x] Corriger les variantes locales qui produisaient `quatre-vingt-six` pour `96`
- [x] Vérifier automatiquement tous les convertisseurs HTML publics sur le cas `96`

**Decisions (recent)**:

- Garder les corrections dans les modèles sources sous `frontend/public` et ne pas modifier `frontend/dist`, qui doit être régénéré.
- Vérifier les fonctions dupliquées par exécution réelle des convertisseurs extraits des fichiers HTML.

**Open questions**:

- Aucun pour cette correction.

_Update when the task or branch focus changes._
