/**
 * visiteGuidee.ts
 *
 * Les renvois de la visite guidée de SIGOBC, groupés en parcours, et la
 * mémoire de ce qui a déjà été montré.
 *
 * La visite n'est plus un unique tour linéaire : un sommaire propose
 * plusieurs parcours, chacun limité aux écrans d'un module. Un agent des
 * Recettes n'a pas à traverser les mandats de Dépenses pour trouver ce qui
 * le concerne.
 */

import { computed, ref } from 'vue';
import type { EtapeVisite } from 'src/components/VisiteGuidee.vue';

const CLE_VUE = '_sigobc_visite_vue';

export interface ScenarioVisite {
  id: string;
  titre: string;
  description: string;
  icone: string;
  duree: string;
}

export const SCENARIOS_VISITE: ScenarioVisite[] = [
  {
    id: 'essentiels',
    titre: 'Découverte complète',
    description: 'Indicateurs, modules, mode de données, compte et documentation.',
    icone: 'explore',
    duree: '2 min',
  },
  {
    id: 'depenses-previsions',
    titre: 'Dépenses : nomenclature & prévisions',
    description: 'Ajouter et modifier une nature de dépense, un compte fonctionnel, une prévision.',
    icone: 'account_balance_wallet',
    duree: '3 min',
  },
  {
    id: 'depenses-mandats',
    titre: 'Dépenses : mandats & bordereaux',
    description: 'Ajouter, modifier et imprimer un mandat ou un bordereau ; suivre un projet.',
    icone: 'receipt',
    duree: '4 min',
  },
  {
    id: 'recettes-previsions',
    titre: 'Recettes : déclarations & prévisions',
    description: 'Ajouter, modifier et imprimer une déclaration ; gérer prévisions et taxes.',
    icone: 'request_quote',
    duree: '3 min',
  },
  {
    id: 'recettes-mandats',
    titre: 'Recettes : mandats & bordereaux',
    description: 'Ajouter, modifier et imprimer un mandat ou un bordereau de recette.',
    icone: 'payments',
    duree: '4 min',
  },
  {
    id: 'personnel',
    titre: 'Gestion des Employés',
    description: 'Ajouter et modifier un agent, un fournisseur, un service.',
    icone: 'people',
    duree: '3 min',
  },
  {
    id: 'personnel-paie',
    titre: 'Personnel : paie & missions',
    description: 'Générer et imprimer un bulletin, gérer congés et ordres de mission.',
    icone: 'badge',
    duree: '4 min',
  },
  {
    id: 'compte-administratif',
    titre: 'Compte administratif',
    description: 'Retrouver, imprimer et naviguer dans la synthèse annuelle.',
    icone: 'assignment',
    duree: '1 min',
  },
  {
    id: 'administration',
    titre: 'Administration',
    description: 'Créer et modifier un utilisateur, consulter les statistiques globales.',
    icone: 'admin_panel_settings',
    duree: '1 min',
  },
  {
    id: 'systeme',
    titre: 'Système & sauvegarde',
    description: 'Données de test, sauvegarde, verrouillage d’un exercice budgétaire.',
    icone: 'dns',
    duree: '2 min',
  },
];

export const ETAPES_VISITE: EtapeVisite[] = [
  // ── Découverte complète ───────────────────────────────────────────────
  {
    cible: '[data-visite="indicateurs"]',
    titre: 'Votre exercice en un coup d’œil',
    corps:
      "Prévu, engagé, disponible : les montants se recalculent à chaque mandat saisi. C'est l'état de situation que le registre papier obligeait à reconstituer chapitre par chapitre avant chaque réunion.",
    scenarioIds: ['essentiels'],
  },
  {
    cible: '[data-visite="modules"]',
    titre: 'Les modules, dans l’ordre de la chaîne',
    corps:
      'Dépenses, Recettes, Personnel, Compte administratif : chaque module ouvre ses prévisions, ses pièces et ses états. Une pièce saisie dans un module alimente directement les états réglementaires du même exercice.',
    scenarioIds: ['essentiels'],
  },
  {
    cible: '[data-visite="mode-donnees"]',
    titre: 'Le mode de données',
    corps:
      "Il décide de ce qui se passe si le réseau tombe au milieu d'une saisie. Hors ligne : tout reste sur le poste. Hors ligne + sync : le poste travaille seul et rattrape le serveur dès qu'il revient. En ligne : tout va au serveur, rien n'est gardé sur le poste.",
    scenarioIds: ['essentiels'],
  },
  {
    cible: '[data-visite="compte"]',
    titre: 'Votre compte et vos droits',
    corps:
      "Votre profil, votre rôle et la déconnexion. Le rôle détermine ce que vous pouvez valider : un opérateur saisit, un comptable liquide, un administrateur ouvre et verrouille les exercices.",
    scenarioIds: ['essentiels'],
  },
  {
    cible: '[data-visite="documentation"]',
    titre: 'Le reste est écrit',
    corps:
      'Modules, sécurité, pré-requis techniques, accompagnement : la documentation détaille tout, avec sa propre recherche. Vous pouvez y retrouver le sommaire des visites.',
    scenarioIds: ['essentiels'],
  },

  // ── Dépenses : nomenclature & prévisions ──────────────────────────────
  {
    route: '/app3/dashboard',
    cible: '[data-visite="indicateurs"]',
    titre: 'Le tableau de bord Dépenses',
    corps:
      'Prévu, engagé et disponible par chapitre : ce sont les mêmes montants qui alimentent les bordereaux et le compte administratif.',
    scenarioIds: ['depenses-previsions'],
  },
  {
    route: '/app3/chapitres',
    cible: '[data-visite="depenses-nouvelle-nature"]',
    titre: 'Ajouter une nature de dépense',
    corps:
      '1. Cliquez sur Nouvelle Nature de Dépense. 2. Renseignez le libellé et le code. 3. Enregistrer : elle apparaît aussitôt dans la liste des chapitres disponibles.',
    scenarioIds: ['depenses-previsions'],
  },
  {
    route: '/app3/chapitres',
    cible: '[data-visite="depenses-modifier-nature"]',
    titre: 'Modifier une nature de dépense',
    corps: 'Le crayon de la ligne rouvre sa fiche : corrigez le libellé ou le code, puis Enregistrer.',
    scenarioIds: ['depenses-previsions'],
  },
  {
    route: '/app3/sous-chapitres',
    cible: '[data-visite="depenses-nouveau-compte-fonctionnel"]',
    titre: 'Ajouter un compte fonctionnel',
    corps:
      '1. Cliquez sur Nouveau Compte Fonctionnel. 2. Choisissez la nature de dépense parente. 3. Renseignez le libellé et le code, puis Enregistrer.',
    scenarioIds: ['depenses-previsions'],
  },
  {
    route: '/app3/sous-chapitres',
    cible: '[data-visite="depenses-modifier-compte-fonctionnel"]',
    titre: 'Modifier un compte fonctionnel',
    corps: 'Le crayon de la ligne rouvre la fiche : ajustez la nature parente, le libellé ou le code, puis Enregistrer.',
    scenarioIds: ['depenses-previsions'],
  },
  {
    route: '/app3/previsions',
    cible: '[data-visite="depenses-nouvelle-prevision"]',
    titre: 'Ajouter une prévision',
    corps:
      '1. Cliquez sur Nouvelle. 2. Choisissez le chapitre et l’exercice. 3. Saisissez le montant voté, puis Enregistrer.',
    scenarioIds: ['depenses-previsions'],
  },
  {
    route: '/app3/previsions',
    cible: '[data-visite="depenses-modifier-prevision"]',
    titre: 'Modifier une prévision',
    corps: 'Le crayon de la ligne rouvre la prévision : ajustez le montant voté, puis Enregistrer.',
    scenarioIds: ['depenses-previsions'],
  },

  // ── Dépenses : mandats & bordereaux ────────────────────────────────────
  {
    route: '/app3/mandats',
    cible: '[data-visite="depenses-nouveau-mandat"]',
    titre: 'Ajouter un mandat',
    corps:
      '1. Cliquez sur Nouveau. 2. Choisissez la nature de dépense, le bénéficiaire et le montant. 3. Enregistrer : le mandat s’impute aussitôt sur le disponible du chapitre.',
    scenarioIds: ['depenses-mandats'],
  },
  {
    route: '/app3/mandats',
    cible: '[data-visite="depenses-modifier-mandat"]',
    titre: 'Modifier un mandat',
    corps: 'Le crayon de la ligne ouvre Modifier le mandat : corrigez montant, priorité ou échéance, puis Enregistrer.',
    scenarioIds: ['depenses-mandats'],
  },
  {
    route: '/app3/mandats',
    cible: '[data-visite="depenses-imprimer-mandat"]',
    titre: 'Imprimer un mandat',
    corps: 'L’icône Imprimer de la ligne génère le mandat prêt à signer et à transmettre au Trésor.',
    scenarioIds: ['depenses-mandats'],
  },
  {
    route: '/app3/bordereaux-mandats-gestion',
    cible: '[data-visite="depenses-nouveau-bordereau"]',
    titre: 'Constituer un bordereau de mandats',
    corps:
      '1. Cliquez sur Nouveau Bordereau. 2. Sélectionnez les mandats du même lot. 3. Enregistrer : ils sont regroupés pour la transmission.',
    scenarioIds: ['depenses-mandats'],
  },
  {
    route: '/app3/bordereaux-mandats-gestion',
    cible: '[data-visite="depenses-modifier-bordereau"]',
    titre: 'Modifier un bordereau de mandats',
    corps: 'Le crayon de la ligne rouvre le bordereau : ajustez sa composition, puis Enregistrer.',
    scenarioIds: ['depenses-mandats'],
  },
  {
    route: '/app3/bordereaux-mandats-gestion',
    cible: '[data-visite="depenses-imprimer-bordereau"]',
    titre: 'Imprimer un bordereau de mandats',
    corps: 'L’icône Imprimer produit le bordereau récapitulatif à joindre à l’envoi.',
    scenarioIds: ['depenses-mandats'],
  },
  {
    route: '/app3/statistiques',
    cible: '[data-visite="depenses-statistiques"]',
    titre: 'Suivre les statistiques Dépenses',
    corps: 'Le taux d’exécution par chapitre, comparé aux prévisions votées.',
    scenarioIds: ['depenses-mandats'],
  },
  {
    route: '/app3/projets',
    cible: '[data-visite="depenses-nouveau-projet"]',
    titre: 'Ajouter un projet',
    corps:
      '1. Cliquez sur Nouveau Projet. 2. Renseignez son libellé et son enveloppe. 3. Enregistrer : les mandats pourront ensuite s’y rattacher.',
    scenarioIds: ['depenses-mandats'],
  },
  {
    route: '/app3/projets',
    cible: '[data-visite="depenses-modifier-projet"]',
    titre: 'Modifier un projet',
    corps: 'Le crayon de la ligne rouvre la fiche projet : ajustez son enveloppe ou son statut, puis Enregistrer.',
    scenarioIds: ['depenses-mandats'],
  },

  // ── Recettes : déclarations & prévisions ──────────────────────────────
  {
    route: '/app6/dashboard',
    cible: '[data-visite="recettes-indicateurs"]',
    titre: 'Le tableau de bord Recettes',
    corps: 'Déclarations, mandats de recette et prévisions : la situation de l’exercice en cours.',
    scenarioIds: ['recettes-previsions'],
  },
  {
    route: '/app6/declarations',
    cible: '[data-visite="recettes-nouvelle-declaration"]',
    titre: 'Ajouter une déclaration',
    corps:
      '1. Cliquez sur Nouvelle Déclaration. 2. Choisissez le contribuable et la nature de recette. 3. Saisissez le montant, puis Enregistrer.',
    scenarioIds: ['recettes-previsions'],
  },
  {
    route: '/app6/declarations',
    cible: '[data-visite="recettes-modifier-declaration"]',
    titre: 'Modifier une déclaration',
    corps: 'Le crayon de la ligne rouvre Modifier Déclaration : corrigez le montant ou les informations, puis Enregistrer.',
    scenarioIds: ['recettes-previsions'],
  },
  {
    route: '/app6/declarations',
    cible: '[data-visite="recettes-imprimer-declaration"]',
    titre: 'Imprimer une déclaration',
    corps: 'L’icône Imprimer produit la déclaration prête à remettre au redevable.',
    scenarioIds: ['recettes-previsions'],
  },
  {
    route: '/app6/previsions',
    cible: '[data-visite="recettes-nouvelle-prevision"]',
    titre: 'Ajouter une prévision de recette',
    corps:
      '1. Cliquez sur Nouvelle. 2. Choisissez la nature de recette et l’exercice. 3. Saisissez le montant attendu, puis Enregistrer.',
    scenarioIds: ['recettes-previsions'],
  },
  {
    route: '/app6/previsions',
    cible: '[data-visite="recettes-modifier-prevision"]',
    titre: 'Modifier une prévision de recette',
    corps: 'Le crayon de la ligne rouvre la prévision : ajustez le montant attendu, puis Enregistrer.',
    scenarioIds: ['recettes-previsions'],
  },
  {
    route: '/app6/taxes',
    cible: '[data-visite="recettes-nouvelle-taxe"]',
    titre: 'Ajouter une taxe',
    corps: '1. Cliquez sur Nouvelle Taxe. 2. Renseignez son libellé, son taux et son assiette. 3. Enregistrer.',
    scenarioIds: ['recettes-previsions'],
  },
  {
    route: '/app6/taxes',
    cible: '[data-visite="recettes-modifier-taxe"]',
    titre: 'Modifier une taxe',
    corps: 'Le crayon de la ligne rouvre la taxe : ajustez le taux ou l’assiette, puis Enregistrer.',
    scenarioIds: ['recettes-previsions'],
  },

  // ── Recettes : mandats & bordereaux ────────────────────────────────────
  {
    route: '/app6/mandats-recette',
    cible: '[data-visite="recettes-nouveau-mandat"]',
    titre: 'Émettre un mandat de recette',
    corps: '1. Cliquez sur Nouveau. 2. Choisissez la déclaration à mandater. 3. Enregistrer : le titre de recette est émis.',
    scenarioIds: ['recettes-mandats'],
  },
  {
    route: '/app6/mandats-recette',
    cible: '[data-visite="recettes-modifier-mandat"]',
    titre: 'Modifier un mandat de recette',
    corps: 'Le crayon de la ligne ouvre Modifier le mandat : corrigez les informations, puis Enregistrer.',
    scenarioIds: ['recettes-mandats'],
  },
  {
    route: '/app6/mandats-recette',
    cible: '[data-visite="recettes-imprimer-mandat"]',
    titre: 'Imprimer un mandat de recette',
    corps: 'L’icône Imprimer génère le titre de recette prêt à transmettre au Trésor.',
    scenarioIds: ['recettes-mandats'],
  },
  {
    route: '/app6/bordereaux',
    cible: '[data-visite="recettes-nouveau-bordereau"]',
    titre: 'Constituer un bordereau de recettes',
    corps: '1. Cliquez sur Nouveau Bordereau. 2. Sélectionnez les titres du même lot. 3. Enregistrer.',
    scenarioIds: ['recettes-mandats'],
  },
  {
    route: '/app6/bordereaux',
    cible: '[data-visite="recettes-modifier-bordereau"]',
    titre: 'Modifier un bordereau de recettes',
    corps: 'Le crayon de la ligne rouvre le bordereau : ajustez sa composition, puis Enregistrer.',
    scenarioIds: ['recettes-mandats'],
  },
  {
    route: '/app6/bordereaux-mandats-recette',
    cible: '[data-visite="recettes-nouveau-bordereau-ordre"]',
    titre: 'Constituer un bordereau d’ordres de recette',
    corps: '1. Cliquez sur Nouveau Bordereau. 2. Sélectionnez les ordres de recette concernés. 3. Enregistrer.',
    scenarioIds: ['recettes-mandats'],
  },
  {
    route: '/app6/bordereaux-mandats-recette',
    cible: '[data-visite="recettes-modifier-bordereau-ordre"]',
    titre: 'Modifier un bordereau d’ordres de recette',
    corps: 'Le crayon de la ligne rouvre le bordereau : ajustez sa composition, puis Enregistrer.',
    scenarioIds: ['recettes-mandats'],
  },
  {
    route: '/app6/bordereaux-mandats-recette',
    cible: '[data-visite="recettes-imprimer-bordereau-ordre"]',
    titre: 'Imprimer un bordereau d’ordres de recette',
    corps: 'L’icône Imprimer produit le bordereau récapitulatif à joindre à l’envoi.',
    scenarioIds: ['recettes-mandats'],
  },
  {
    route: '/app6/statistiques',
    cible: '[data-visite="recettes-statistiques"]',
    titre: 'Suivre les statistiques Recettes',
    corps: 'Le taux de recouvrement par nature de recette, sur l’exercice en cours.',
    scenarioIds: ['recettes-mandats'],
  },

  // ── Gestion des Employés ──────────────────────────────────────────────
  {
    route: '/app7/dashboard',
    cible: '[data-visite="personnel-indicateurs"]',
    titre: 'Le tableau de bord du personnel',
    corps: 'Effectifs, masse salariale et congés en cours, vus par service.',
    scenarioIds: ['personnel'],
  },
  {
    route: '/app7/employes',
    cible: '[data-visite="personnel-nouvel-agent"]',
    titre: 'Ajouter un agent',
    corps: '1. Cliquez sur Nouvel agent. 2. Renseignez identité, service et fonction. 3. Enregistrer.',
    scenarioIds: ['personnel'],
  },
  {
    route: '/app7/employes',
    cible: '[data-visite="personnel-modifier-agent"]',
    titre: 'Modifier un agent',
    corps: 'Le crayon de la ligne ouvre « Modifier l’agent » : ajustez son service ou sa fonction, puis Enregistrer.',
    scenarioIds: ['personnel'],
  },
  {
    route: '/app3/fournisseurs',
    cible: '[data-visite="personnel-nouveau-fournisseur"]',
    titre: 'Ajouter un fournisseur',
    corps: '1. Cliquez sur Nouveau Fournisseur. 2. Renseignez sa raison sociale et ses coordonnées. 3. Enregistrer.',
    scenarioIds: ['personnel'],
  },
  {
    route: '/app3/fournisseurs',
    cible: '[data-visite="personnel-modifier-fournisseur"]',
    titre: 'Modifier un fournisseur',
    corps: 'Le crayon de la ligne rouvre sa fiche : corrigez ses coordonnées, puis Enregistrer.',
    scenarioIds: ['personnel'],
  },
  {
    route: '/app7/services',
    cible: '[data-visite="personnel-nouveau-service"]',
    titre: 'Ajouter un service',
    corps: '1. Cliquez sur Nouveau Service. 2. Renseignez son libellé et son responsable. 3. Enregistrer.',
    scenarioIds: ['personnel'],
  },
  {
    route: '/app7/services',
    cible: '[data-visite="personnel-modifier-service"]',
    titre: 'Modifier un service',
    corps: 'Le crayon de la ligne rouvre le service : ajustez son libellé ou son responsable, puis Enregistrer.',
    scenarioIds: ['personnel'],
  },

  // ── Personnel : paie & missions ────────────────────────────────────────
  {
    route: '/app7/salaires',
    cible: '[data-visite="personnel-nouveau-salaire"]',
    titre: 'Générer un bulletin de salaire',
    corps:
      '1. Cliquez sur Nouveau. 2. Choisissez l’agent et le mois. 3. Enregistrer : le bulletin reprend automatiquement les retenues et le net à payer.',
    scenarioIds: ['personnel-paie'],
  },
  {
    route: '/app7/salaires',
    cible: '[data-visite="personnel-modifier-salaire"]',
    titre: 'Modifier un bulletin de salaire',
    corps: 'Le crayon de la ligne rouvre la fiche de paie : ajustez les éléments variables, puis Enregistrer.',
    scenarioIds: ['personnel-paie'],
  },
  {
    route: '/app7/salaires',
    cible: '[data-visite="personnel-imprimer-bulletin"]',
    titre: 'Imprimer un bulletin de salaire',
    corps: 'Une fois le bulletin validé (hors brouillon), l’icône Imprimer produit le document à remettre à l’agent.',
    scenarioIds: ['personnel-paie'],
  },
  {
    route: '/app7/conges',
    cible: '[data-visite="personnel-nouveau-conge"]',
    titre: 'Enregistrer un congé',
    corps: '1. Cliquez sur Nouveau congé. 2. Choisissez l’agent, le type et les dates. 3. Enregistrer.',
    scenarioIds: ['personnel-paie'],
  },
  {
    route: '/app7/conges',
    cible: '[data-visite="personnel-modifier-conge"]',
    titre: 'Modifier un congé',
    corps: 'Le crayon de la ligne rouvre le congé : ajustez les dates ou le type, puis Enregistrer.',
    scenarioIds: ['personnel-paie'],
  },
  {
    route: '/app7/missions',
    cible: '[data-visite="personnel-nouvel-ordre"]',
    titre: 'Émettre un ordre de mission',
    corps: '1. Cliquez sur Nouvel ordre. 2. Choisissez l’agent, la destination et les dates. 3. Enregistrer.',
    scenarioIds: ['personnel-paie'],
  },
  {
    route: '/app7/missions',
    cible: '[data-visite="personnel-modifier-mission"]',
    titre: 'Modifier un ordre de mission',
    corps: 'Le crayon de la ligne rouvre l’ordre : ajustez les dates ou les frais, puis Enregistrer.',
    scenarioIds: ['personnel-paie'],
  },
  {
    route: '/app7/missions',
    cible: '[data-visite="personnel-imprimer-mission"]',
    titre: 'Imprimer un ordre de mission',
    corps: 'L’icône Imprimer produit l’ordre de mission signé, prêt à remettre à l’agent.',
    scenarioIds: ['personnel-paie'],
  },
  {
    route: '/app7/statistiques',
    cible: '[data-visite="personnel-statistiques"]',
    titre: 'Suivre les statistiques RH',
    corps: 'Masse salariale, effectifs et congés, vus par service et par mois.',
    scenarioIds: ['personnel-paie'],
  },

  // ── Compte administratif ──────────────────────────────────────────────
  {
    route: '/compte-admin',
    cible: '[data-visite="compte-admin-imprimer"]',
    titre: 'Imprimer la synthèse annuelle',
    corps:
      '1. Choisissez l’exercice dans la liste déroulante. 2. Ouvrez l’onglet voulu. 3. Cliquez sur Imprimer : le tableau affiché s’imprime tel quel.',
    scenarioIds: ['compte-administratif'],
  },
  {
    route: '/compte-admin',
    cible: '[data-visite="compte-admin-onglets"]',
    titre: 'Naviguer entre les tableaux',
    corps:
      'Récap. Fonct., Dép. Eng., Rec. Fonct., Investissement, Résultat : chaque onglet ouvre l’état réglementaire correspondant sans changer d’écran.',
    scenarioIds: ['compte-administratif'],
  },

  // ── Administration ────────────────────────────────────────────────────
  {
    route: '/utilisateurs',
    cible: '[data-visite="administration-nouvel-utilisateur"]',
    titre: 'Créer un utilisateur',
    corps: '1. Cliquez sur Nouvel Utilisateur. 2. Renseignez son nom, son identifiant et son rôle. 3. Enregistrer.',
    scenarioIds: ['administration'],
  },
  {
    route: '/utilisateurs',
    cible: '[data-visite="administration-modifier-utilisateur"]',
    titre: 'Modifier un utilisateur',
    corps: 'Le crayon de la ligne rouvre la fiche : changez le rôle ou les informations, puis Enregistrer.',
    scenarioIds: ['administration'],
  },
  {
    route: '/statistiques',
    cible: '[data-visite="administration-statistiques-globales"]',
    titre: 'Consulter les statistiques globales',
    corps: 'La vue consolidée de tous les modules, tous exercices confondus.',
    scenarioIds: ['administration'],
  },

  // ── Système & sauvegarde ───────────────────────────────────────────────
  {
    route: '/admin/seeders',
    cible: '[data-visite="systeme-seeders"]',
    titre: 'Réinitialiser les données de test',
    corps:
      'Cliquez sur Initialiser : réservé à la mise en place, cela vide la base puis la remplit de données de démonstration (chapitres, sous-chapitres, admin, etc.).',
    scenarioIds: ['systeme'],
  },
  {
    route: '/admin/backup',
    cible: '[data-visite="systeme-backup"]',
    titre: 'Télécharger une sauvegarde',
    corps:
      'Cliquez sur Télécharger la sauvegarde complète : un fichier reprenant toutes les données de la collectivité est généré, accessible même après l’expiration d’une période d’essai.',
    scenarioIds: ['systeme'],
  },
  {
    route: '/admin/parametrage',
    cible: '[data-visite="systeme-parametrage"]',
    titre: 'Ouvrir un exercice budgétaire',
    corps: '1. Cliquez sur Nouvel Exercice. 2. Indiquez l’année. 3. Enregistrer : l’exercice s’ouvre, prêt à recevoir des pièces.',
    scenarioIds: ['systeme'],
  },
  {
    route: '/admin/parametrage',
    cible: '[data-visite="systeme-verrouiller-exercice"]',
    titre: 'Verrouiller ou rouvrir un exercice',
    corps:
      'Le cadenas de la ligne verrouille l’exercice sélectionné ; une fois verrouillé, la même icône permet de le rouvrir si nécessaire.',
    scenarioIds: ['systeme'],
  },
];

/** Ouverture de la visite : partagée entre la mise en page et la documentation. */
export const visiteOuverte = ref(false);
/** Ouverture du sommaire des parcours : partagée entre la mise en page et la documentation. */
export const sommaireOuvert = ref(false);
/** Parcours actuellement choisi — décide des étapes passées à VisiteGuidee. */
export const scenarioActif = ref<string>('essentiels');

export const etapesVisiteActives = computed(() =>
  ETAPES_VISITE.filter((etape) => etape.scenarioIds.includes(scenarioActif.value)),
);

export function nombreEtapes(scenarioId: string): number {
  return ETAPES_VISITE.filter((etape) => etape.scenarioIds.includes(scenarioId)).length;
}

function dejaVue(): boolean {
  if (typeof localStorage === 'undefined') return true;
  return localStorage.getItem(CLE_VUE) === '1';
}

/** Marque la visite comme vue : elle ne s'ouvrira plus d'elle-même. */
export function marquerVisiteVue(): void {
  if (typeof localStorage !== 'undefined') localStorage.setItem(CLE_VUE, '1');
}

/** Démarre directement un parcours donné — depuis le sommaire ou la documentation. */
export function demarrerVisite(scenarioId = 'essentiels'): void {
  scenarioActif.value = scenarioId;
  sommaireOuvert.value = false;
  visiteOuverte.value = true;
}

/** Ouvre le sommaire des parcours, sans en choisir un. */
export function ouvrirSommaire(): void {
  sommaireOuvert.value = true;
}

/** Historique : conservé pour les appels existants — ouvre désormais le sommaire. */
export function relancerVisite(): void {
  ouvrirSommaire();
}

/**
 * Ouvre le sommaire au tout premier démarrage, une seule fois.
 * Le délai laisse la mise en page se poser : on mesure des éléments réels,
 * pas des cases encore vides.
 */
export function ouvrirVisiteSiPremiereFois(): void {
  if (dejaVue()) return;
  setTimeout(() => {
    sommaireOuvert.value = true;
  }, 900);
}
