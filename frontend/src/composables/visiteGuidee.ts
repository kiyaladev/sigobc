/**
 * visiteGuidee.ts
 *
 * Les renvois de la visite guidée de SIGOBC, et la mémoire de ce qui a déjà
 * été montré.
 *
 * L'ordre suit le regard : on part de ce que l'agent a sous les yeux en
 * ouvrant l'application — les indicateurs du module Dépenses — avant
 * d'expliquer comment circuler entre les modules, puis où trouver le reste.
 */

import { ref } from 'vue';
import type { EtapeVisite } from 'src/components/VisiteGuidee.vue';

const CLE_VUE = '_sigobc_visite_vue';

export const ETAPES_VISITE: EtapeVisite[] = [
  {
    cible: '[data-visite="indicateurs"]',
    titre: 'Votre exercice en un coup d’œil',
    corps:
      "Prévu, engagé, disponible : les montants se recalculent à chaque mandat saisi. C'est l'état de situation que le registre papier obligeait à reconstituer chapitre par chapitre avant chaque réunion.",
  },
  {
    cible: '[data-visite="modules"]',
    titre: 'Les modules, dans l’ordre de la chaîne',
    corps:
      'Dépenses, Recettes, Personnel, Compte administratif : chaque module ouvre ses prévisions, ses pièces et ses états. Une pièce saisie dans un module alimente directement les états réglementaires du même exercice.',
  },
  {
    cible: '[data-visite="mode-donnees"]',
    titre: 'Le mode de données',
    corps:
      "Il décide de ce qui se passe si le réseau tombe au milieu d'une saisie. Hors ligne : tout reste sur le poste. Hors ligne + sync : le poste travaille seul et rattrape le serveur dès qu'il revient. En ligne : tout va au serveur, rien n'est gardé sur le poste.",
  },
  {
    cible: '[data-visite="compte"]',
    titre: 'Votre compte et vos droits',
    corps:
      "Votre profil, votre rôle et la déconnexion. Le rôle détermine ce que vous pouvez valider : un opérateur saisit, un comptable liquide, un administrateur ouvre et verrouille les exercices.",
  },
  {
    cible: '[data-visite="documentation"]',
    titre: 'Le reste est écrit',
    corps:
      'Modules, sécurité, pré-requis techniques, accompagnement : la documentation détaille tout, avec sa propre recherche. Vous pouvez y relancer cette visite.',
  },
];

/** Ouverture de la visite : partagée entre la mise en page et la documentation. */
export const visiteOuverte = ref(false);

function dejaVue(): boolean {
  if (typeof localStorage === 'undefined') return true;
  return localStorage.getItem(CLE_VUE) === '1';
}

/** Marque la visite comme vue : elle ne s'ouvrira plus d'elle-même. */
export function marquerVisiteVue(): void {
  if (typeof localStorage !== 'undefined') localStorage.setItem(CLE_VUE, '1');
}

/** Ouvre la visite à la demande, depuis la documentation par exemple. */
export function relancerVisite(): void {
  visiteOuverte.value = true;
}

/**
 * Ouvre la visite au tout premier démarrage, une seule fois.
 * Le délai laisse la mise en page se poser : on mesure des éléments réels,
 * pas des cases encore vides.
 */
export function ouvrirVisiteSiPremiereFois(): void {
  if (dejaVue()) return;
  setTimeout(() => {
    visiteOuverte.value = true;
  }, 900);
}
