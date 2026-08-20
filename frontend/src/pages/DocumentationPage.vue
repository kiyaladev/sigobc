<template>
  <q-page class="documentation-page q-pa-md">
    <PageHeader
      title="Documentation"
      subtitle="Guide complet de SIGOBC : présentation, modules, sécurité, prérequis et accompagnement"
      icon="menu_book"
    >
      <template #actions>
        <q-btn
          color="primary"
          icon="explore"
          label="Découvrir les parcours guidés"
          no-caps
          @click="ouvrirSommaire()"
        />
      </template>
      <template #stats>
        <div class="col-12">
          <q-input
            v-model="search"
            outlined
            dense
            clearable
            placeholder="Rechercher dans la documentation..."
            class="doc-search"
            @update:model-value="onSearchChange"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
      </template>
    </PageHeader>

    <!--
      La visite montre l'application elle-même ; la documentation l'explique.
      On offre le passage de l'une à l'autre ici, là où quelqu'un qui cherche
      comment faire arrive naturellement.
    -->
    <section class="doc-tour-section q-mb-lg">
      <div class="doc-tour-heading">
        <div>
          <p class="eyebrow">Visite interactive</p>
          <h2>Sommaire des parcours guidés</h2>
        </div>
        <q-badge color="primary" outline :label="`${scenarios.length} parcours`" />
      </div>
      <div class="doc-tour-grid">
        <q-card v-for="scenario in scenarios" :key="scenario.id" flat bordered class="doc-tour-card">
          <q-card-section>
            <q-avatar color="green-1" text-color="primary" :icon="scenario.icone" />
            <div>
              <h3>{{ scenario.titre }}</h3>
              <p>{{ scenario.description }}</p>
              <span>{{ nombreEtapes(scenario.id) }} étapes · {{ scenario.duree }}</span>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              flat
              color="primary"
              icon="play_arrow"
              label="Lancer ce parcours"
              no-caps
              @click="demarrerVisite(scenario.id)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </section>

    <!-- Navigation rapide par catégorie -->
    <div class="doc-chips q-mb-lg">
      <q-chip
        v-for="section in sections"
        :key="section.title"
        clickable
        :outline="activeChip !== section.title"
        color="primary"
        :text-color="activeChip === section.title ? 'white' : 'primary'"
        :icon="section.icon"
        @click="scrollToSection(section.title)"
      >
        {{ section.shortTitle }}
      </q-chip>
    </div>

    <!-- Résultat de recherche : aucun match -->
    <q-banner v-if="search && visibleSections.length === 0" rounded class="doc-empty-banner q-mb-md">
      <template #avatar>
        <q-icon name="search_off" color="grey-6" />
      </template>
      Aucun résultat pour « {{ search }} ». Essayez un autre mot-clé.
    </q-banner>

    <q-list class="doc-list" padding>
      <q-expansion-item
        v-for="section in visibleSections"
        :id="`doc-${slugify(section.title)}`"
        :key="section.title"
        :model-value="isSectionOpen(section)"
        :icon="section.icon"
        :label="section.title"
        header-class="doc-section-header"
        class="doc-section q-mb-md"
        @update:model-value="(val) => setSectionOpen(section.title, val)"
      >
        <q-card flat class="doc-section-card">
          <q-card-section>
            <!-- Rubriques simples -->
            <template v-if="section.items">
              <div
                v-for="item in filteredItems(section)"
                :key="item.label"
                class="doc-item q-mb-md"
              >
                <div class="doc-item-label">{{ item.label }}</div>
                <div class="doc-item-description text-grey-8">{{ item.description }}</div>
              </div>
            </template>

            <!-- Modules fonctionnels -->
            <div v-if="section.modules" class="doc-modules-grid">
              <q-card
                v-for="mod in filteredModules(section)"
                :key="mod.title"
                flat
                bordered
                class="doc-module-card"
              >
                <q-card-section>
                  <div class="doc-module-title">
                    <q-icon :name="mod.icon" color="primary" size="20px" class="q-mr-sm" />
                    {{ mod.title }}
                  </div>
                  <div class="doc-module-row">
                    <span class="doc-module-tag">Fonctions</span>
                    <span class="text-grey-8">{{ mod.fonctions }}</span>
                  </div>
                  <div class="doc-module-row">
                    <span class="doc-module-tag benefice">Bénéfice</span>
                    <span class="text-grey-8">{{ mod.benefice }}</span>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!--
              Catalogue des productions. Le tableau défile seul en largeur :
              c'est une pièce de référence, on ne la casse pas en cartes.
            -->
            <div v-if="section.productions" class="doc-productions">
              <table class="doc-productions-table">
                <thead>
                  <tr>
                    <th class="doc-prod-num">N°</th>
                    <th>Production</th>
                    <th>Où la produire</th>
                    <th>Document obtenu</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(prod, i) in filteredProductions(section)" :key="prod.intitule">
                    <td class="doc-prod-num">{{ i + 1 }}</td>
                    <td class="doc-prod-intitule">{{ prod.intitule }}</td>
                    <td>
                      <div class="doc-prod-module">{{ prod.module }}</div>
                      <div class="doc-prod-chemin">{{ prod.chemin }}</div>
                    </td>
                    <td class="text-grey-8">{{ prod.document }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import PageHeader from 'src/components/PageHeader.vue';
import { SCENARIOS_VISITE, demarrerVisite, nombreEtapes, ouvrirSommaire } from 'src/composables/visiteGuidee';

const scenarios = SCENARIOS_VISITE;

interface DocItem {
  label: string;
  description: string;
}

interface DocModule {
  title: string;
  icon: string;
  fonctions: string;
  benefice: string;
}

/**
 * Une pièce que l'application produit et que l'agent signe ou transmet.
 * Une liste réglementaire de livrables se lit en colonnes, pas en prose : on
 * cherche « où produit-on l'état d'ITS ? » et la réponse tient sur une ligne.
 */
interface DocProduction {
  intitule: string;
  module: string;
  /** Chemin exact dans l'application, tel qu'il apparaît dans le sommaire. */
  chemin: string;
  /** Ce qui sort de l'impression, décrit du point de vue de qui le reçoit. */
  document: string;
}

interface DocSection {
  title: string;
  shortTitle: string;
  icon: string;
  items?: DocItem[];
  modules?: DocModule[];
  productions?: DocProduction[];
}

const sections: DocSection[] = [
  {
    title: 'Partie 1 — Présentation générale',
    shortTitle: 'Présentation',
    icon: 'info',
    items: [
      {
        label: 'Objectif du logiciel',
        description:
          "SIGOBC couvre toute la chaîne budgétaire et comptable d'une collectivité, de la préparation du budget jusqu'au paiement et à l'édition des états financiers.",
      },
      {
        label: 'Public cible',
        description: 'Agents du service finances, DGS, Secrétaire Général, Ordonnateur, Élus.',
      },
      {
        label: 'Cadre réglementaire',
        description: 'Conformité M14, M4, M52. Génération du flux PES V2. Traçabilité RGPD.',
      },
    ],
  },
  {
    title: 'Partie 2 — Modules fonctionnels',
    shortTitle: 'Modules',
    icon: 'apps',
    modules: [
      {
        title: 'Module Budget',
        icon: 'account_balance_wallet',
        fonctions: 'Saisie BP, DM, BS, RAR. Vote. Édition des maquettes M14.',
        benefice: 'Budget voté 2x plus vite. Zéro erreur de chapitre.',
      },
      {
        title: 'Module Dépenses',
        icon: 'receipt_long',
        fonctions:
          'Engagement juridique → Liquidation → Mandatement. Gestion des pièces jointes. Circuit de validation.',
        benefice: 'Délai de paiement inférieur à 20 jours. Suivi fournisseur en temps réel.',
      },
      {
        title: 'Module Recettes',
        icon: 'payments',
        fonctions:
          'Émission de titres, bordereaux de rôles, suivi des encaissements, gestion des impayés.',
        benefice: 'Amélioration du taux de recouvrement.',
      },
      {
        title: 'Module Tiers / Marchés / Dette',
        icon: 'handshake',
        fonctions:
          "Fichier fournisseur unique. Suivi des marchés et avenants. Tableau d'amortissement des emprunts.",
        benefice: 'Base de données propre et fiable.',
      },
      {
        title: 'Module Pilotage & Reporting',
        icon: 'insights',
        fonctions:
          "Tableaux de bord DGS/Élus. Taux d'exécution par chapitre. Situation de trésorerie. Export Excel/PDF.",
        benefice: 'Décision basée sur des chiffres à J+1.',
      },
      {
        title: 'Module Dématérialisation PES V2',
        icon: 'cloud_upload',
        fonctions:
          'Génération automatique du fichier PES Budget et PES Titres/Mandats. Envoi sécurisé au Trésor via Hélios.',
        benefice: '100% sans papier. Conformité légale.',
      },
    ],
  },
  {
    title: 'Partie 3 — Catalogue des productions',
    shortTitle: 'Productions',
    icon: 'print',
    items: [
      {
        label: 'Ce que recense ce catalogue',
        description:
          "Toutes les pièces que l'application édite et que l'agent signe, transmet ou archive. Chaque ligne indique où la production se déclenche : l'écran, puis le bouton. Une pièce absente de ce tableau n'est pas produite par l'application.",
      },
    ],
    productions: [
      {
        intitule: 'Mandat de paiement',
        module: 'Gestion des Dépenses',
        chemin: 'Mandats › ligne du mandat › Imprimer',
        document: "Le mandat de dépense à signer par l'ordonnateur, avec son imputation et son bénéficiaire.",
      },
      {
        intitule: 'Bordereau de transmission de mandats',
        module: 'Gestion des Dépenses',
        chemin: 'Bordereaux Mandats › ligne du bordereau › Imprimer',
        document:
          "Le bordereau d'émission récapitulant les mandats transmis au Trésor, avec son total et son report. Un bordereau de rejet existe pour les mandats retournés.",
      },
      {
        intitule: "État d'exécution budgétaire — dépenses",
        module: 'Gestion des Dépenses',
        chemin: 'Prévisions › Imprimer',
        document:
          "L'état financier mensuel des dépenses — fonctionnement et investissement — avec les antécédents cumulés mois par mois. Le CT02 s'édite depuis le même écran.",
      },
      {
        intitule: "Mandat d'ordre de recettes",
        module: 'Gestion des Recettes',
        chemin: 'Mandats Recette › ligne du mandat › Imprimer',
        document: "L'ordre de recette à signer, avec sa nature de recette et sa partie versante.",
      },
      {
        intitule: "Bordereau de transmission des ordres de recettes",
        module: 'Gestion des Recettes',
        chemin: 'Bordereaux Mandats Recette › ligne du bordereau › Imprimer',
        document: "Le bordereau récapitulant les ordres de recettes transmis, avec son total.",
      },
      {
        intitule: "État d'exécution budgétaire — recettes",
        module: 'Gestion des Recettes',
        chemin: 'Prévisions Recettes › Imprimer',
        document:
          "L'état financier mensuel des recettes, fonctionnelles et d'investissement, avec les antécédents cumulés.",
      },
      {
        intitule: 'Bulletin de salaire',
        module: 'Gestion des Employés',
        chemin: 'Salaires › ligne de l’agent › Imprimer',
        document: "Le bulletin de paie de l'agent pour le mois retenu : brut, retenues, net à payer.",
      },
      {
        intitule: 'État de solde',
        module: 'Gestion des Employés',
        chemin: 'Salaires › Documents officiels › État de solde',
        document: "Le détail des rémunérations du service ou de la mairie pour la période retenue.",
      },
      {
        intitule: "État d'ITS",
        module: 'Gestion des Employés',
        chemin: 'Salaires › Documents officiels › État ITS',
        document: "L'état de l'impôt sur traitements et salaires, à joindre à la déclaration fiscale.",
      },
      {
        intitule: 'États CNPS',
        module: 'Gestion des Employés',
        chemin: 'Salaires › Documents officiels › États CNPS',
        document:
          "L'état de la part salariale CNPS. Le décompte de la part patronale s'édite depuis le même menu, et le fichier DISA depuis la fiche des employés.",
      },
      {
        intitule: 'Ordre de mission',
        module: 'Gestion des Employés',
        chemin: 'Ordres de mission › ligne de la mission › Imprimer',
        document:
          "L'ordre de mission à signer, avec la destination, les dates et les indemnités calculées.",
      },
      {
        intitule: 'Compte administratif',
        module: 'Compte administratif',
        chemin: "Compte administratif › onglet voulu › Imprimer",
        document:
          "La synthèse annuelle de l'exécution, onglet par onglet : récapitulatifs global, fonctionnel et d'investissement, dépenses engagées et ventilées, recettes, résultat et modifications patrimoniales.",
      },
    ],
  },
  {
    title: 'Partie 4 — Ce que le logiciel change',
    shortTitle: 'Apport',
    icon: 'trending_up',
    items: [
      {
        label: 'Avant : la chaîne au papier',
        description:
          "Chaque mandat s'inscrivait sur le registre, se reportait au bordereau d'émission, puis sur l'état financier du mois et enfin au compte administratif. La même somme était donc recopiée quatre fois, et vérifiée quatre fois. Une ligne fausse en janvier se propageait jusqu'au compte administratif de décembre, sans qu'on sache où reprendre.",
      },
      {
        label: 'Les reports se font seuls',
        description:
          "Les antécédents mensuels, les cumuls par chapitre et les totaux de bordereau découlent des pièces saisies. Il n'y a plus de report à recopier d'un état à l'autre, donc plus de report à rattraper : une pièce saisie une fois alimente tous les états où elle doit figurer.",
      },
      {
        label: 'Moins d’erreurs de calcul',
        description:
          "Additionner des centaines de mandats par chapitre et par mois, calculer les retenues d'une fiche de paie, ventiler des recettes sur les natures : c'est là que la main se trompe, surtout en fin d'exercice. Ces opérations sont posées à chaque saisie, toujours de la même façon.",
      },
      {
        label: 'Du temps repris sur les états',
        description:
          "Bordereaux, états financiers mensuels, CT02, compte administratif : ce qui demandait des journées de composition à la règle s'imprime à la demande sur la période voulue, prêt à signer. Le temps gagné retourne au contrôle des pièces, qui est le vrai travail.",
      },
      {
        label: 'Un archivage qui ne s’abîme pas',
        description:
          "Un registre papier s'use, se perd, prend l'humidité et occupe une armoire par exercice. Ici l'historique complet reste consultable, exportable et sauvegardable — et une pièce de l'exercice précédent se retrouve en quelques secondes au lieu d'un après-midi d'archives.",
      },
      {
        label: 'La traçabilité, pièce par pièce',
        description:
          "Tout montant affiché se remonte jusqu'à la pièce qui l'a produit, avec sa date, son bénéficiaire et l'agent qui l'a saisie. Un contrôle de la tutelle se prépare en interrogeant l'application, pas en dépouillant les classeurs.",
      },
      {
        label: 'Ce que le logiciel ne fait pas',
        description:
          "Il produit l'état, il ne le signe pas. Un chiffre juste reste un chiffre à vérifier avant signature : la machine ôte l'erreur d'addition, pas l'erreur de saisie, et n'engage pas la responsabilité de l'ordonnateur.",
      },
    ],
  },
  {
    title: 'Partie 5 — Modes de données et travail hors ligne',
    shortTitle: 'Modes de données',
    icon: 'cloud_sync',
    items: [
      {
        label: 'Pourquoi trois modes',
        description:
          "Toutes les communes n'ont pas la même connexion. Le mode de données se choisit poste par poste, dans la barre du haut, et décide de ce qui se passe quand le réseau tombe au milieu d'une saisie. Le choix est retenu sur le poste ; l'application se recharge pour l'appliquer.",
      },
      {
        label: 'Hors ligne',
        description:
          "Tout vit dans la base locale du poste, aucun appel réseau n'est émis. C'est le mode à choisir quand il n'y a pas de serveur, ou pas d'internet pendant plusieurs jours. C'est aussi le mode par défaut : une installation qui n'a jamais été raccordée à un serveur fonctionne exactement comme avant.",
      },
      {
        label: 'Hors ligne avec synchronisation',
        description:
          "Les lectures et les écritures passent d'abord par la base locale ; le serveur est appelé quand il est joignable, et une file rejoue les écritures manquées dès le retour du réseau. C'est le mode prévu pour les zones à connexion instable : la saisie ne s'arrête jamais et rien n'est perdu.",
      },
      {
        label: 'En ligne',
        description:
          "Tout va au serveur, rien n'est conservé sur le poste. À réserver aux bureaux à connexion stable : sans serveur joignable, l'application ne peut plus ni lire ni écrire, et le dit plutôt que d'afficher des listes vides.",
      },
      {
        label: 'Ce qui reste partagé',
        description:
          "Quel que soit le mode, la base d'un poste raccordé au serveur est alimentée automatiquement en arrière-plan, afin que les données soient déjà là si la connexion disparaît en cours de journée.",
      },
    ],
  },
  {
    title: 'Partie 6 — Sécurité & Administration',
    shortTitle: 'Sécurité',
    icon: 'security',
    items: [
      {
        label: 'Gestion des droits',
        description: 'Profils « Saisie », « Visa », « Mandataire », « Consultation Élu ».',
      },
      {
        label: 'Traçabilité',
        description: 'Historique de chaque action : qui, quoi, quand.',
      },
      {
        label: 'Sauvegarde',
        description: 'Sauvegarde automatique quotidienne et base de données sécurisée.',
      },
    ],
  },
  {
    title: 'Partie 7 — Pré-requis techniques',
    shortTitle: 'Prérequis',
    icon: 'dns',
    items: [
      {
        label: 'Installation',
        description: 'Serveur Windows/Linux ou version Cloud/SaaS.',
      },
      {
        label: 'Accès',
        description: 'Navigateur Web Chrome, Firefox. Compatible mobile/tablette.',
      },
      {
        label: 'Interopérabilité',
        description: 'Import/Export Excel, CSV. Connexion possible avec un logiciel RH/État Civil.',
      },
    ],
  },
  {
    title: 'Partie 8 — Accompagnement',
    shortTitle: 'Accompagnement',
    icon: 'support_agent',
    items: [
      {
        label: 'Mise en place',
        description: 'Audit, paramétrage, reprise de données N-1.',
      },
      {
        label: 'Formation',
        description: '2 jours pour les agents + une demi-journée pour les élus.',
      },
      {
        label: 'Support',
        description: 'Hotline, maintenance corrective et évolutive.',
      },
    ],
  },
];

const search = ref('');
const activeChip = ref('');
// Sections manuellement ouvertes/fermées par l'utilisateur (hors recherche)
const openState = reactive<Record<string, boolean>>({ [sections[0]!.title]: true });

const DIACRITICS_RE = new RegExp('[\\u0300-\\u036f]', 'g');

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS_RE, '');
}

function matches(text: string): boolean {
  const query = normalize(search.value.trim());
  if (!query) return true;
  return normalize(text).includes(query);
}

function filteredItems(section: DocSection): DocItem[] {
  if (!section.items) return [];
  return section.items.filter((item) => matches(item.label) || matches(item.description));
}

function filteredModules(section: DocSection): DocModule[] {
  if (!section.modules) return [];
  return section.modules.filter(
    (mod) => matches(mod.title) || matches(mod.fonctions) || matches(mod.benefice),
  );
}

function filteredProductions(section: DocSection): DocProduction[] {
  if (!section.productions) return [];
  return section.productions.filter(
    (prod) =>
      matches(prod.intitule) ||
      matches(prod.module) ||
      matches(prod.chemin) ||
      matches(prod.document),
  );
}

function sectionHasMatch(section: DocSection): boolean {
  if (!search.value.trim()) return true;
  return (
    filteredItems(section).length > 0 ||
    filteredModules(section).length > 0 ||
    filteredProductions(section).length > 0
  );
}

const visibleSections = computed(() => sections.filter((section) => sectionHasMatch(section)));

function isSectionOpen(section: DocSection): boolean {
  if (search.value.trim()) return sectionHasMatch(section);
  return !!openState[section.title];
}

function setSectionOpen(title: string, val: boolean) {
  openState[title] = val;
}

function onSearchChange() {
  activeChip.value = '';
}

function slugify(title: string): string {
  return normalize(title).replace(/[^a-z0-9]+/g, '-');
}

function scrollToSection(title: string) {
  activeChip.value = title;
  openState[title] = true;
  const el = document.getElementById(`doc-${slugify(title)}`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
</script>

<style scoped lang="scss">
.doc-tour-section {
  padding: 18px 20px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(255, 255, 255, 0.75);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.doc-tour-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.doc-tour-heading .eyebrow {
  margin: 0 0 2px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: $primary;
}

.doc-tour-heading h2 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
}

.doc-tour-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.doc-tour-card {
  border-radius: 14px;

  :deep(.q-card__section) {
    display: flex;
    gap: 12px;
  }

  h3 {
    margin: 0 0 4px;
    font-size: 0.9375rem;
    font-weight: 700;
    color: #0f172a;
  }

  p {
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.4;
    color: #475569;
  }

  span {
    display: block;
    margin-top: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #64748b;
  }
}

.doc-search {
  max-width: 480px;

  :deep(.q-field__control) {
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.9);
  }
}

.doc-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.doc-empty-banner {
  background: rgba(148, 163, 184, 0.12);
}

.doc-section {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(255, 255, 255, 0.75);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);

  :deep(.q-expansion-item__content) {
    padding: 0;
  }
}

:deep(.doc-section-header) {
  padding: 14px 16px;
  font-weight: 700;
  color: #0f172a;
}

.doc-item-label {
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.doc-item-description {
  line-height: 1.5;
}

.doc-modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.doc-module-card {
  border-radius: 14px;
}

.doc-module-title {
  display: flex;
  align-items: center;
  font-weight: 700;
  margin-bottom: 10px;
  color: #0f172a;
}

.doc-module-row {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 0.92rem;
  line-height: 1.5;
}

.doc-module-tag {
  flex: 0 0 auto;
  font-weight: 700;
  color: $primary;
  min-width: 74px;
}

.doc-module-tag.benefice {
  color: $secondary;
}

// ── Catalogue des productions ──────────────────────────────────────────────
// Un tableau de référence : filets fins, chiffres alignés, et un défilement
// horizontal qui reste dans le cadre plutôt que d'élargir la page.
.doc-productions {
  overflow-x: auto;
}

.doc-productions-table {
  width: 100%;
  min-width: 620px;
  border-collapse: collapse;
  font-size: 0.92rem;
  line-height: 1.5;

  th,
  td {
    padding: 10px 12px;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid var(--surface-border, rgba(148, 163, 184, 0.18));
  }

  th {
    font-weight: 700;
    color: $primary;
    white-space: nowrap;
    border-bottom-width: 2px;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }
}

.doc-prod-num {
  width: 1%;
  color: var(--text-soft, #64748b);
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.doc-prod-intitule {
  font-weight: 600;
}

.doc-prod-module {
  font-weight: 600;
  color: $primary;
}

// Le chemin est de l'appareil : plus petit, plus clair, il se lit après
// l'intitulé du module et non à sa place.
.doc-prod-chemin {
  margin-top: 2px;
  font-size: 0.84rem;
  color: var(--text-soft, #64748b);
}
</style>
