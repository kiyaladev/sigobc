/**
 * numeroSequence.ts
 *
 * Numérotation séquentielle des pièces comptables (mandats de dépense,
 * mandats de recette, ...).
 *
 * Règle métier : le numéro proposé est toujours « dernier + 1 » sur l'exercice.
 * Si le dernier mandat porte le n° 123, le suivant est le 124 — jamais 125.
 *
 * Le numéro n'est volontairement pas réservé à l'ouverture du formulaire : il
 * est recalculé au moment de l'enregistrement. Sinon un formulaire ouvert puis
 * abandonné consommerait un numéro (trou dans la séquence), et deux formulaires
 * ouverts en même temps produiraient deux fois le même numéro.
 */

/**
 * Plus grand numéro déjà utilisé dans la liste, 0 si aucun n'est exploitable.
 *
 * Les numéros sont stockés en chaîne car ils peuvent être zéro-remplis
 * (« 0124 ») : on les compare donc sur leur valeur entière, pas sur leur texte
 * (en texte, '99' serait supérieur à '124').
 */
export function dernierNumero(numeros: readonly string[]): number {
  let max = 0;
  for (const numero of numeros) {
    const valeur = parseInt(numero, 10);
    if (Number.isFinite(valeur) && valeur > max) {
      max = valeur;
    }
  }
  return max;
}

/**
 * Numéro suivant de la séquence.
 *
 * @param numeros  Numéros déjà attribués sur l'exercice.
 * @param pad      Longueur du zéro-remplissage (0 = aucun). Doit rester
 *                 identique à celui des numéros déjà en base, sinon les
 *                 documents imprimés changent de format en cours d'exercice.
 */
export function prochainNumero(numeros: readonly string[], pad = 0): string {
  const suivant = String(dernierNumero(numeros) + 1);
  return pad > 0 ? suivant.padStart(pad, '0') : suivant;
}

/**
 * Normalise un exercice avant de l'utiliser comme clé d'index Dexie.
 *
 * `where('exercice').equals(...)` est strict sur le type : un exercice arrivant
 * du formulaire sous forme de chaîne ('2026') ne remonterait aucun mandat, et
 * la séquence repartirait à 1 en créant des doublons.
 */
export function exerciceValide(exercice: unknown): number | null {
  const annee = Number(exercice);
  return Number.isInteger(annee) && annee > 0 ? annee : null;
}
