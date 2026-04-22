<template>
  <q-page class="mandats-page q-pa-md">
    <PageHeader title="Mandats de Dépenses" subtitle="Gestion des mandats" icon="receipt">
      <template #stats>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Mandats visibles</div>
                <div class="overview-stat-value">{{ filteredMandats.length }}</div>
              </div>
              <q-icon name="dataset" size="30px" color="primary" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Montant total</div>
                <div class="overview-stat-value">{{ formatMontant(totalMontantMandats) }}</div>
              </div>
              <q-icon name="payments" size="30px" color="secondary" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Mandatés</div>
                <div class="overview-stat-value">{{ mandatsPayesCount }}</div>
                <div class="overview-stat-helper">{{ formatMontant(totalMontantPaye) }}</div>
              </div>
              <q-icon name="task_alt" size="30px" color="positive" />
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">Brouillons</div>
                <div class="overview-stat-value">{{ mandatsBrouillonCount }}</div>
                <div class="overview-stat-helper">Annulés : {{ mandatsAnnulesCount }}</div>
              </div>
              <q-icon name="edit_note" size="30px" color="warning" />
            </q-card-section>
          </q-card>
        </div>
      </template>
    </PageHeader>

    <q-card class="main-card">
      <q-card-section>
        <div class="compact-toolbar q-mb-md">
          <div class="compact-toolbar-top row items-center q-col-gutter-sm">
            <div class="col-12 col-md-5">
              <q-input
                v-model="filter"
                placeholder="Rechercher un mandat..."
                outlined
                dense
                clearable
                class="compact-search"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-auto compact-toolbar-summary">
              <q-chip outline color="primary" icon="filter_alt" size="sm">
                {{ activeFiltersCount }} filtre{{ activeFiltersCount > 1 ? 's' : '' }}
              </q-chip>
            </div>
            <div class="col-12 col-md-auto compact-toolbar-actions">
              <q-btn dense outline color="grey-7" icon="tune" label="Filtres" no-caps>
                <q-menu class="compact-filter-menu" anchor="bottom right" self="top right">
                  <div class="compact-filter-panel">
                    <div class="compact-filter-panel-title">Filtres avancés</div>
                    <div class="row q-col-gutter-sm">
                      <div class="col-12 col-sm-6 col-md-4">
                        <q-select
                          v-model="filterExercice"
                          :options="exerciceFilterOptions"
                          label="Exercice"
                          outlined
                          dense
                          emit-value
                          map-options
                          clearable
                        />
                      </div>
                      <div class="col-12 col-sm-6 col-md-4">
                        <q-select
                          v-model="filterChapitreId"
                          :options="chapitreOptions"
                          label="Chapitre"
                          outlined
                          dense
                          emit-value
                          map-options
                          clearable
                        />
                      </div>
                      <div class="col-12 col-sm-6 col-md-4">
                        <q-select
                          v-model="filterSousChapitreId"
                          :options="filteredSousChapitreOptions"
                          label="Sous-chapitre"
                          outlined
                          dense
                          emit-value
                          map-options
                          clearable
                          use-input
                          input-debounce="0"
                          @filter="filterSousChapitre"
                        />
                      </div>
                      <div class="col-12 col-sm-6 col-md-4">
                        <q-input
                          v-model="filterDateDebut"
                          label="Date début"
                          outlined
                          dense
                          type="date"
                          clearable
                        />
                      </div>
                      <div class="col-12 col-sm-6 col-md-4">
                        <q-input
                          v-model="filterDateFin"
                          label="Date fin"
                          outlined
                          dense
                          type="date"
                          clearable
                        />
                      </div>
                      <div class="col-12 col-sm-6 col-md-4">
                        <q-btn
                          label="Réinitialiser"
                          icon="refresh"
                          outline
                          color="grey-7"
                          @click="resetFilters"
                          class="full-width"
                        />
                      </div>
                    </div>
                  </div>
                </q-menu>
              </q-btn>
              <q-btn
                color="primary"
                icon="add"
                label="Nouveau"
                unelevated
                no-caps
                @click="openAddDialog"
              />
              <q-btn dense flat round color="grey-7" icon="more_horiz">
                <q-menu anchor="bottom right" self="top right">
                  <q-list dense style="min-width: 220px">
                    <q-item clickable v-close-popup @click="exportRows">
                      <q-item-section avatar>
                        <q-icon name="download" color="primary" />
                      </q-item-section>
                      <q-item-section>Exporter CSV</q-item-section>
                    </q-item>
                    <q-item v-if="isDev" clickable v-close-popup @click="createFakeMandat">
                      <q-item-section avatar>
                        <q-icon name="science" color="orange" />
                      </q-item-section>
                      <q-item-section>Générer des données fake</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>
          </div>
        </div>

        <DataTable
          ref="dataTableRef"
          :rows="filteredMandats"
          :columns="columns"
          :loading="loading"
          show-print
          export-filename="mandats"
          @print="printMandat"
          @edit="editMandat"
          @delete="deleteMandat"
        >
          <template v-slot:body-cell-numeroOrdre="props">
            <q-td :props="props">
              {{ props.row.numeroOrdre || '-' }}
            </q-td>
          </template>

          <template v-slot:body-cell-bordereauNumero="props">
            <q-td :props="props">
              {{ getBordereauNumero(props.row.bordereauMandatId) }}
            </q-td>
          </template>

          <template v-slot:body-cell-compte="props">
            <q-td :props="props">
              {{ getCompte(props.row) }}
            </q-td>
          </template>

          <template v-slot:body-cell-statut="props">
            <q-td :props="props">
              <q-chip :color="getStatutColor(props.row.statut)" text-color="white" size="sm" dense>
                {{ getStatutLabel(props.row.statut) }}
              </q-chip>
            </q-td>
          </template>
        </DataTable>
      </q-card-section>
    </q-card>

    <!-- Dialog d'ajout/modification -->
    <q-dialog v-model="showAddDialog" persistent>
      <q-card class="dialog-card" style="width: min(900px, 96vw); max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editingId ? 'Modifier le mandat' : 'Nouveau mandat' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveMandat" class="q-gutter-sm">
            <!-- Section 1: Informations générales -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Informations générales</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="formData.exercice"
                  label="Exercice *"
                  outlined
                  dense
                  type="number"
                  :rules="[(val) => !!val || 'Exercice requis']"
                />
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.numeroMandat"
                  label="Numéro Mandat *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Numéro requis']"
                />
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.dateMandat"
                  label="Date Mandat *"
                  outlined
                  dense
                  type="date"
                  :rules="[(val) => !!val || 'Date requise']"
                />
              </div>
            </div>

            <q-separator class="q-my-sm" />

            <!-- Section 2: Classification budgétaire -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Classification budgétaire</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="formData.chapitreId"
                  :options="filteredChapitreOptions"
                  label="Nature de la dépense (barre) *"
                  outlined
                  dense
                  emit-value
                  map-options
                  use-input
                  input-debounce="0"
                  :rules="[(val) => !!val || 'Chapitre requis']"
                  @filter="filterChapitre"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="formData.sousChapitreId"
                  :options="filteredSousChapitreOptions"
                  label="Compte fonctionnel"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                  use-input
                  input-debounce="0"
                  @filter="filterSousChapitre"
                />
              </div>
              <div v-if="isInvestissement" class="col-12 col-md-6">
                <q-select
                  v-model="formData.typeBien"
                  :options="typeBienOptions"
                  label="Type de bien"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                />
              </div>
            </div>

            <div class="row q-col-gutter-sm q-mt-xs">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="formData.bordereauMandatId"
                  :options="filteredBordereauMandatOptions"
                  label="Bordereau de Mandat *"
                  outlined
                  dense
                  emit-value
                  map-options
                  use-input
                  input-debounce="0"
                  :rules="[(val) => !!val || 'Bordereau requis']"
                  @filter="filterBordereauMandat"
                >
                  <template v-slot:prepend>
                    <q-icon name="description" />
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.patrimonial"
                  label="Imputation Patrimoniale"
                  outlined
                  dense
                  placeholder="Ex: 6000/1"
                />
              </div>
            </div>

            <div v-if="isInvestissement" class="row q-col-gutter-sm q-mt-xs">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="formData.projetId"
                  :options="filteredProjetOptions"
                  label="Projet d'investissement"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                  use-input
                  input-debounce="0"
                  @filter="filterProjet"
                >
                  <template v-slot:prepend>
                    <q-icon name="engineering" color="primary" />
                  </template>
                </q-select>
              </div>
            </div>

            <q-separator class="q-my-sm" />

            <!-- Section 3: Bénéficiaire et paiement -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Bénéficiaire et paiement</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-select
                  v-model="formData.beneficiaire"
                  :options="filteredBeneficiaireOptions"
                  label="Bénéficiaire *"
                  outlined
                  dense
                  emit-value
                  map-options
                  use-input
                  input-debounce="0"
                  :rules="[(val: string) => !!val || 'Bénéficiaire requis']"
                  @filter="filterBeneficiaire"
                  @update:model-value="
                    (val: string) => {
                      const opt = beneficiaireOptions.find((o) => o.value === val);
                      onBeneficiaireSelected(opt || null);
                    }
                  "
                  new-value-mode="add"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section avatar>
                        <q-icon
                          :name="scope.opt.type === 'agent' ? 'badge' : 'storefront'"
                          :color="scope.opt.type === 'agent' ? 'deep-purple' : 'primary'"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ scope.opt.label }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        Tapez pour rechercher ou saisir un nom libre
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.rib"
                  label="RIB / Compte bancaire"
                  outlined
                  dense
                  placeholder="Ex: SN001 01234 123456789012 12"
                />
              </div>
            </div>

            <q-input
              v-model="formData.objet"
              label="Objet de la dépense *"
              outlined
              dense
              type="textarea"
              rows="2"
              :rules="[(val) => !!val || 'Objet requis']"
            />

            <q-separator class="q-my-sm" />

            <!-- Section 4: Détails financiers -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Détails financiers</div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="formData.montant"
                  label="Montant brut *"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                  :rules="[(val) => !!val || 'Montant requis']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="formData.modePaiement"
                  :options="['virement', 'cheque', 'especes', 'autre']"
                  label="Mode de paiement *"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="formData.statut"
                  :options="statutOptions"
                  label="Statut *"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
            </div>

            <!-- Budget disponible info -->
            <q-banner
              v-if="budgetInfo && formData.statut === 'paye'"
              :class="
                formData.montant > budgetInfo.disponible
                  ? 'bg-red-1 text-red-8'
                  : 'bg-teal-1 text-teal-8'
              "
              rounded
              dense
              class="q-mt-xs"
            >
              <template v-slot:avatar>
                <q-icon :name="formData.montant > budgetInfo.disponible ? 'warning' : 'info'" />
              </template>
              <div class="text-caption text-weight-medium">
                Budget {{ budgetInfo.sousChapitreLabel }} / {{ budgetInfo.chapitreLabel }}
              </div>
              <div class="row q-gutter-md text-caption">
                <span
                  >Prevision : <strong>{{ formatMontant(budgetInfo.totalPrevu) }}</strong></span
                >
                <span
                  >Mandate : <strong>{{ formatMontant(budgetInfo.totalMandated) }}</strong></span
                >
                <span
                  >Disponible : <strong>{{ formatMontant(budgetInfo.disponible) }}</strong></span
                >
              </div>
              <div v-if="formData.montant > budgetInfo.disponible" class="text-weight-bold q-mt-xs">
                Depassement de {{ formatMontant(formData.montant - budgetInfo.disponible) }}
              </div>
            </q-banner>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <q-input v-model="formData.numeroFacture" label="N° Facture" outlined dense />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.dateFacture"
                  label="Date Facture"
                  outlined
                  dense
                  type="date"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="formData.montantPrecompter"
                  label="Montant à précompter"
                  outlined
                  dense
                  type="number"
                  suffix="CFA"
                />
              </div>
            </div>

            <q-separator class="q-my-sm" />

            <!-- Section 5: Informations complémentaires -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Informations complémentaires</div>
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.referenceMarche"
                  label="Référence du Marché"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.avisMunicipalite"
                  label="Avis de la Municipalité"
                  outlined
                  dense
                />
              </div>
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.numeroDeliberation"
                  label="N° Délibération"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.dateDeliberation"
                  label="Date de Délibération"
                  outlined
                  dense
                  type="date"
                />
              </div>
            </div>

            <!-- Section 6: Motif d'annulation (visible uniquement si statut = annulé) -->
            <template v-if="formData.statut === 'annule'">
              <q-separator class="q-my-sm" />
              <div class="text-subtitle2 text-red q-mb-xs">Motif d'annulation</div>
              <div class="row q-col-gutter-sm">
                <div class="col-12">
                  <q-input
                    v-model="formData.motifAnnulation"
                    label="Motif d'annulation *"
                    outlined
                    dense
                    type="textarea"
                    rows="2"
                    :rules="[(val) => !!val || 'Le motif d\'annulation est requis']"
                    class="bg-red-1"
                  />
                </div>
              </div>
            </template>

            <q-separator class="q-my-sm" />

            <!-- Section 7: Observations -->
            <div class="text-subtitle2 text-grey-8 q-mb-xs">Notes</div>
            <q-input
              v-model="formData.observations"
              label="Observations"
              outlined
              dense
              type="textarea"
              rows="2"
            />

            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn label="Annuler" flat color="grey-7" v-close-popup />
              <q-btn label="Enregistrer" type="submit" color="primary" unelevated />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useQuasar, date } from 'quasar';
import {
  db,
  type Mandat,
  type Chapitre,
  type SousChapitre,
  type BordereauMandat,
  type Mairie,
  type Exercice,
  type Projet,
  type Prevision,
  type Fournisseur,
  type Employe,
} from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import DataTable from 'src/components/DataTable.vue';
import { openPrintWindow } from 'src/utils/printUrl';

const $q = useQuasar();
const loading = ref(false);
const dataTableRef = ref<{ exportCsv: () => void } | null>(null);
const filter = ref('');
const showAddDialog = ref(false);
const editingId = ref<number | null>(null);

// Filtres
const filterExercice = ref<number | null>(null);
const filterChapitreId = ref<number | null>(null);
const filterSousChapitreId = ref<number | null>(null);
const filterDateDebut = ref<string>('');
const filterDateFin = ref<string>('');

const mandats = ref<Mandat[]>([]);
const chapitres = ref<Chapitre[]>([]);
const sousChapitres = ref<SousChapitre[]>([]);
const bordereauMandats = ref<BordereauMandat[]>([]);
const mairies = ref<Mairie[]>([]);
const exercices = ref<Exercice[]>([]);
const projets = ref<Projet[]>([]);
const previsions = ref<Prevision[]>([]);
const fournisseurs = ref<Fournisseur[]>([]);
const employes = ref<Employe[]>([]);

const lockedYears = computed(() =>
  exercices.value.filter((e) => e.statut === 'verrouille').map((e) => e.annee),
);

function isYearLocked(annee: number): boolean {
  return lockedYears.value.includes(annee);
}

const formData = ref({
  numeroMandat: '',
  dateMandat: date.formatDate(new Date(), 'YYYY-MM-DD'),
  exercice: new Date().getFullYear(),
  chapitreId: null as number | null,
  sousChapitreId: null as number | null,
  bordereauMandatId: null as number | null,
  beneficiaire: '',
  rib: '',
  patrimonial: '',
  objet: '',
  montant: 0,
  numeroFacture: '',
  dateFacture: '',
  modePaiement: 'virement' as 'virement' | 'cheque' | 'especes' | 'autre',
  statut: 'paye' as 'brouillon' | 'paye' | 'annule',
  observations: '',
  motifAnnulation: '',
  // Nouveaux champs
  referenceMarche: '',
  avisMunicipalite: '',
  numeroDeliberation: '',
  dateDeliberation: '',
  montantPrecompter: 0,
  typeBien: '' as '' | 'immobilier' | 'mobilier' | 'incorporel',
  projetId: null as number | null,
});

const chapitreOptions = computed(() =>
  chapitres.value.map((c) => ({
    label: `${c.code} - ${c.libelle}`,
    value: c.id,
  })),
);

const sousChapitreOptions = computed(() =>
  sousChapitres.value.map((s) => ({ label: `${s.code} - ${s.libelle}`, value: s.id })),
);

const exerciceFilterOptions = computed(() => {
  const years = [...new Set(mandats.value.map((m) => m.exercice))].sort((a, b) => b - a);
  return years.map((y) => ({ label: String(y), value: y }));
});

const bordereauMandatOptions = computed(() =>
  bordereauMandats.value
    .filter((b) => b.statut === 'ouvert')
    .map((b) => ({
      label: `Bordereau ${b.numero}-${b.exercice % 100} (${b.nombreMandats || 0} mandats)`,
      value: b.id,
    })),
);

const isInvestissement = computed(() => {
  if (!formData.value.sousChapitreId) return false;
  const sc = sousChapitres.value.find((s) => s.id === formData.value.sousChapitreId);
  return sc?.code.startsWith('9') ?? false;
});

const projetOptions = computed(() =>
  projets.value
    .filter((p) => p.statut !== 'annule')
    .map((p) => ({
      label: `${p.libelle} (${p.annee})`,
      value: p.id,
    })),
);

const filteredProjetOptions = ref(projetOptions.value);

// Options beneficiaire (agents + fournisseurs combines)
interface BeneficiaireOption {
  label: string;
  value: string;
  type: 'agent' | 'fournisseur';
  rib?: string;
}

const beneficiaireOptions = computed<BeneficiaireOption[]>(() => {
  const options: BeneficiaireOption[] = [];
  for (const e of employes.value) {
    options.push({
      label: `[Agent] ${e.nom} ${e.prenom} - ${e.matricule}`,
      value: `${e.nom} ${e.prenom}`,
      type: 'agent',
      rib: e.rib || '',
    });
  }
  for (const f of fournisseurs.value) {
    options.push({
      label: `[Fournisseur] ${f.nom}${f.sigle ? ' (' + f.sigle + ')' : ''} - CC: ${f.compteContribuable}`,
      value: f.nom,
      type: 'fournisseur',
      rib: f.compteBancaire || '',
    });
  }
  return options;
});

const filteredBeneficiaireOptions = ref<BeneficiaireOption[]>([]);

watch(beneficiaireOptions, (newOptions) => {
  filteredBeneficiaireOptions.value = newOptions;
});

function filterBeneficiaire(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      filteredBeneficiaireOptions.value = beneficiaireOptions.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    filteredBeneficiaireOptions.value = beneficiaireOptions.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1,
    );
  });
}

function onBeneficiaireSelected(opt: BeneficiaireOption | null) {
  if (opt && opt.rib) {
    formData.value.rib = opt.rib;
  }
}

const filteredChapitreOptions = ref(chapitreOptions.value);
const filteredSousChapitreOptions = ref(sousChapitreOptions.value);
const filteredBordereauMandatOptions = ref(bordereauMandatOptions.value);

watch(chapitreOptions, (newOptions) => {
  filteredChapitreOptions.value = newOptions;
});

watch(sousChapitreOptions, (newOptions) => {
  filteredSousChapitreOptions.value = newOptions;
});

watch(bordereauMandatOptions, (newOptions) => {
  filteredBordereauMandatOptions.value = newOptions;
});

watch(projetOptions, (newOptions) => {
  filteredProjetOptions.value = newOptions;
});

watch(isInvestissement, (newValue) => {
  if (!newValue) {
    formData.value.typeBien = '';
    formData.value.projetId = null;
  }
});

function filterChapitre(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      filteredChapitreOptions.value = chapitreOptions.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    filteredChapitreOptions.value = chapitreOptions.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1,
    );
  });
}

function filterSousChapitre(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      filteredSousChapitreOptions.value = sousChapitreOptions.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    filteredSousChapitreOptions.value = sousChapitreOptions.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1,
    );
  });
}

function filterBordereauMandat(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      filteredBordereauMandatOptions.value = bordereauMandatOptions.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    filteredBordereauMandatOptions.value = bordereauMandatOptions.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1,
    );
  });
}

function filterProjet(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      filteredProjetOptions.value = projetOptions.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    filteredProjetOptions.value = projetOptions.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1,
    );
  });
}

// Budget info: show available prevision for current chapitre+sous-chapitre selection
const budgetInfo = computed(() => {
  const ex = formData.value.exercice;
  const chId = formData.value.chapitreId;
  const scId = formData.value.sousChapitreId;
  if (!ex || !chId || !scId) return null;

  // Sum previsions for this exercice + chapitre + sous-chapitre
  const matchingPrevisions = previsions.value.filter(
    (p) => p.exercice === ex && p.chapitreId === chId && p.sousChapitreId === scId,
  );
  const totalPrevu = matchingPrevisions.reduce((s, p) => s + p.montantPrevu, 0);
  if (totalPrevu === 0) return null;

  // Sum already mandated (paye) for same combination, excluding current mandat if editing
  const totalMandated = mandats.value
    .filter(
      (m) =>
        m.exercice === ex &&
        m.chapitreId === chId &&
        m.sousChapitreId === scId &&
        m.statut === 'paye' &&
        m.id !== editingId.value,
    )
    .reduce((s, m) => s + m.montant, 0);

  const disponible = totalPrevu - totalMandated;
  const ch = chapitres.value.find((c) => c.id === chId);
  const sc = sousChapitres.value.find((s) => s.id === scId);

  return {
    totalPrevu,
    totalMandated,
    disponible,
    chapitreLabel: ch ? `${ch.code} - ${ch.libelle}` : '',
    sousChapitreLabel: sc ? `${sc.code} - ${sc.libelle}` : '',
  };
});

function checkBudgetAvailability(): string | null {
  const info = budgetInfo.value;
  if (!info) return null;
  const montant = formData.value.montant || 0;
  if (montant > info.disponible) {
    return (
      `Le montant du mandat (${formatMontant(montant)}) depasse le budget disponible.\n\n` +
      `  Prevision : ${formatMontant(info.totalPrevu)}\n` +
      `  Deja mandate : ${formatMontant(info.totalMandated)}\n` +
      `  Disponible : ${formatMontant(info.disponible)}\n` +
      `  Depassement : ${formatMontant(montant - info.disponible)}`
    );
  }
  return null;
}

const columns = [
  /*{
    name: 'numeroOrdre',
    label: 'N° Ordre',
    align: 'center' as const,
    field: 'numeroOrdre',
    sortable: true,
  },*/
  {
    name: 'numeroMandat',
    label: 'N° Mandat',
    align: 'left' as const,
    field: 'numeroMandat',
    sortable: true,
    sort: (a: string, b: string) => parseInt(a, 10) - parseInt(b, 10),
  },
  {
    name: 'bordereauNumero',
    label: 'N° Bordereau',
    align: 'center' as const,
    field: 'bordereauMandatId',
    sortable: true,
  },
  {
    name: 'dateMandat',
    label: 'Date',
    align: 'left' as const,
    field: 'dateMandat',
    format: (val: Date) => date.formatDate(val, 'DD/MM/YYYY'),
    sortable: true,
  },
  {
    name: 'compte',
    label: 'Compte',
    align: 'left' as const,
    field: 'id',
    sortable: false,
  },
  {
    name: 'beneficiaire',
    label: 'Bénéficiaire',
    align: 'left' as const,
    field: 'beneficiaire',
    sortable: true,
  },
  {
    name: 'objet',
    label: 'Objet',
    align: 'left' as const,
    field: 'objet',
    sortable: true,
  },
  {
    name: 'montant',
    label: 'Montant',
    align: 'right' as const,
    field: 'montant',
    format: (val: number) => formatMontant(val),
    sortable: true,
  },
  {
    name: 'statut',
    label: 'Statut',
    align: 'center' as const,
    field: 'statut',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'center' as const,
    field: 'id',
  },
];

const activeFiltersCount = computed(() => {
  return [
    filterExercice.value,
    filterChapitreId.value,
    filterSousChapitreId.value,
    filterDateDebut.value,
    filterDateFin.value,
  ].filter((value) => value !== null && value !== '').length;
});

const filteredMandats = computed(() => {
  let result = mandats.value;

  if (lockedYears.value.length > 0) {
    result = result.filter((m) => !lockedYears.value.includes(m.exercice));
  }

  if (filterExercice.value) {
    result = result.filter((m) => m.exercice === filterExercice.value);
  }

  if (filterChapitreId.value) {
    result = result.filter((m) => m.chapitreId === filterChapitreId.value);
  }

  if (filterSousChapitreId.value) {
    result = result.filter((m) => m.sousChapitreId === filterSousChapitreId.value);
  }

  if (filterDateDebut.value) {
    const dateDebut = new Date(filterDateDebut.value);
    result = result.filter((m) => new Date(m.dateMandat) >= dateDebut);
  }

  if (filterDateFin.value) {
    const dateFin = new Date(filterDateFin.value);
    dateFin.setHours(23, 59, 59, 999);
    result = result.filter((m) => new Date(m.dateMandat) <= dateFin);
  }

  if (filter.value) {
    const searchTerm = filter.value.toLowerCase();
    result = result.filter((m) => {
      const bordereauNumero = getBordereauNumero(m.bordereauMandatId).toLowerCase();
      const compte = getCompte(m).toLowerCase();
      return (
        m.numeroMandat.toLowerCase().includes(searchTerm) ||
        m.beneficiaire.toLowerCase().includes(searchTerm) ||
        m.objet.toLowerCase().includes(searchTerm) ||
        bordereauNumero.includes(searchTerm) ||
        compte.includes(searchTerm)
      );
    });
  }

  return result;
});

const totalMontantMandats = computed(() =>
  filteredMandats.value.reduce((sum, mandat) => sum + (mandat.montant || 0), 0),
);

const totalMontantPaye = computed(() =>
  filteredMandats.value
    .filter((mandat) => mandat.statut === 'paye')
    .reduce((sum, mandat) => sum + (mandat.montant || 0), 0),
);

const mandatsPayesCount = computed(
  () => filteredMandats.value.filter((mandat) => mandat.statut === 'paye').length,
);

const mandatsBrouillonCount = computed(
  () => filteredMandats.value.filter((mandat) => mandat.statut === 'brouillon').length,
);

const mandatsAnnulesCount = computed(
  () => filteredMandats.value.filter((mandat) => mandat.statut === 'annule').length,
);

function resetFilters() {
  filterExercice.value = null;
  filterChapitreId.value = null;
  filterSousChapitreId.value = null;
  filterDateDebut.value = '';
  filterDateFin.value = '';
  filter.value = '';
}

function exportRows() {
  dataTableRef.value?.exportCsv();
}

function formatMontant(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
}

function getBordereauNumero(bordereauMandatId?: number): string {
  if (!bordereauMandatId) return '-';
  const bordereau = bordereauMandats.value.find((b) => b.id === bordereauMandatId);
  if (!bordereau) return '-';
  return `${bordereau.numero}-${bordereau.exercice}`;
}

function getCompte(row: Mandat): string {
  const sc = sousChapitres.value.find((s) => s.id === row.sousChapitreId);
  const ch = chapitres.value.find((c) => c.id === row.chapitreId);
  const scCode = sc?.code || '?';
  const chCode = ch?.code || '?';
  return `${scCode}/${chCode}`;
}

function getStatutColor(statut: string): string {
  switch (statut) {
    case 'brouillon':
      return 'grey';
    case 'paye':
      return 'positive';
    case 'annule':
      return 'red';
    default:
      return 'grey';
  }
}

const statutOptions = [
  { label: 'Mandaté', value: 'paye' },
  { label: 'Annulé', value: 'annule' },
  { label: 'Brouillon', value: 'brouillon' },
];

const typeBienOptions = [
  { label: 'Immobilier', value: 'immobilier' },
  { label: 'Mobilier', value: 'mobilier' },
  { label: 'Incorporel', value: 'incorporel' },
];

function getStatutLabel(statut: string): string {
  switch (statut) {
    case 'brouillon':
      return 'Brouillon';
    case 'paye':
      return 'Mandaté';
    case 'annule':
      return 'Annulé';
    default:
      return statut;
  }
}

function printMandat(mandat: Mandat) {
  // Le fichier HTML charge les données directement depuis IndexedDB
  openPrintWindow('mandat_depense.html', {
    mandatId: mandat.id!,
  });
}

async function loadData() {
  loading.value = true;
  try {
    [
      mandats.value,
      chapitres.value,
      sousChapitres.value,
      bordereauMandats.value,
      mairies.value,
      exercices.value,
      projets.value,
      previsions.value,
      fournisseurs.value,
      employes.value,
    ] = await Promise.all([
      db.mandats.toArray(),
      db.chapitres.filter((c) => c.actif).toArray(),
      db.sousChapitres.filter((s) => s.actif && !s.code.startsWith('7')).toArray(),
      db.bordereauMandats.toArray(),
      db.mairies.toArray(),
      db.exercices.toArray(),
      db.projets.toArray(),
      db.previsions.toArray(),
      db.fournisseurs.filter((f) => f.actif).toArray(),
      db.employes.filter((e) => e.actif).toArray(),
    ]);
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    $q.notify({
      type: 'negative',
      message: 'Erreur lors du chargement des données',
    });
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  formData.value = {
    numeroMandat: '',
    dateMandat: date.formatDate(new Date(), 'YYYY-MM-DD'),
    exercice: new Date().getFullYear(),
    chapitreId: null,
    sousChapitreId: null,
    bordereauMandatId: null,
    beneficiaire: '',
    rib: '',
    patrimonial: '',
    objet: '',
    montant: 0,
    numeroFacture: '',
    dateFacture: '',
    modePaiement: 'virement',
    statut: 'paye',
    observations: '',
    motifAnnulation: '',
    // Nouveaux champs
    referenceMarche: '',
    avisMunicipalite: '',
    numeroDeliberation: '',
    dateDeliberation: '',
    montantPrecompter: 0,
    typeBien: '',
    projetId: null,
  };
  editingId.value = null;
}

async function getNextMandatNumber(exercice: number): Promise<string> {
  const mandatsForYear = await db.mandats.where('exercice').equals(exercice).toArray();

  let maxNum = 0;
  for (const m of mandatsForYear) {
    const num = parseInt(m.numeroMandat, 10);
    if (!isNaN(num) && num > maxNum) {
      maxNum = num;
    }
  }

  return String(maxNum + 1);
}

async function openAddDialog() {
  if (isYearLocked(new Date().getFullYear())) {
    $q.notify({
      type: 'warning',
      message: "L'exercice en cours est verrouillé. Impossible d'ajouter un mandat.",
    });
    return;
  }
  resetForm();
  // Générer automatiquement le numéro de mandat (max des mandats de l'année + 1)
  const currentYear = new Date().getFullYear();
  formData.value.numeroMandat = await getNextMandatNumber(currentYear);
  showAddDialog.value = true;
}

/**
 * Recalcule les statistiques d'un bordereau (nombreMandats, montantTotal)
 * Note: Les mandats annulés ne sont pas comptabilisés
 */
async function recalculateBordereauStats(bordereauId: number): Promise<void> {
  const allMandats = await db.mandats.where('bordereauMandatId').equals(bordereauId).toArray();

  // Seuls les mandats payés impactent le bordereau (brouillon et annulé exclus)
  const mandatsDuBordereau = allMandats.filter((m) => m.statut === 'paye');

  const nombreMandats = mandatsDuBordereau.length;
  const montantTotal = mandatsDuBordereau.reduce((sum, m) => sum + (m.montant || 0), 0);

  await db.bordereauMandats.update(bordereauId, {
    nombreMandats,
    montantTotal,
    updatedAt: new Date(),
  });
}

async function saveMandat() {
  try {
    if (isYearLocked(formData.value.exercice)) {
      $q.notify({
        type: 'warning',
        message: 'Cet exercice est verrouillé. Modification impossible.',
      });
      return;
    }

    // Verifier le budget disponible si le mandat est payé
    if (formData.value.statut === 'paye') {
      const budgetError = checkBudgetAvailability();
      if (budgetError) {
        $q.notify({
          type: 'negative',
          message: 'Depassement de budget !',
          caption: budgetError,
          timeout: 8000,
          multiLine: true,
        });
        return;
      }
    }

    const now = new Date();
    const mairieId = 1;
    const personnelId = 1;

    // Garder trace de l'ancien bordereauMandatId pour la mise à jour des stats
    let oldBordereauMandatId: number | undefined;
    if (editingId.value) {
      const existingMandat = await db.mandats.get(editingId.value);
      oldBordereauMandatId = existingMandat?.bordereauMandatId;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { dateFacture, dateMandat, dateDeliberation, ...otherFormData } = formData.value;

    const data = {
      ...otherFormData,
      chapitreId: formData.value.chapitreId!,
      ...(formData.value.sousChapitreId ? { sousChapitreId: formData.value.sousChapitreId } : {}),
      dateMandat: new Date(formData.value.dateMandat),
      ...(dateFacture ? { dateFacture: new Date(dateFacture) } : {}),
      ...(dateDeliberation ? { dateDeliberation: new Date(dateDeliberation) } : {}),
      ...(formData.value.bordereauMandatId
        ? { bordereauMandatId: formData.value.bordereauMandatId }
        : {}),
      ...(formData.value.projetId ? { projetId: formData.value.projetId } : {}),
      mairieId,
      personnelId,
    };

    if (editingId.value) {
      const updateData = {
        ...data,
        updatedAt: now,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.mandats.update(editingId.value, updateData as any);

      // Recalculer les stats des bordereaux impactés
      const newBordereauId = formData.value.bordereauMandatId;
      if (oldBordereauMandatId && oldBordereauMandatId !== newBordereauId) {
        // L'ancien bordereau a perdu ce mandat
        await recalculateBordereauStats(oldBordereauMandatId);
      }
      if (newBordereauId) {
        // Le nouveau bordereau (ou le même si montant changé) doit être recalculé
        await recalculateBordereauStats(newBordereauId);
      }

      $q.notify({
        type: 'positive',
        message: 'Mandat modifié avec succès',
      });
    } else {
      type MandatInsert = Omit<Mandat, 'id'>;
      const insertData: MandatInsert = {
        ...data,
        createdAt: now,
        updatedAt: now,
      } as MandatInsert;
      await db.mandats.add(insertData);

      // Recalculer les stats du bordereau si un bordereau est sélectionné
      if (formData.value.bordereauMandatId) {
        await recalculateBordereauStats(formData.value.bordereauMandatId);
      }

      $q.notify({
        type: 'positive',
        message: 'Mandat ajouté avec succès',
      });
    }

    showAddDialog.value = false;
    resetForm();
    await loadData();
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    $q.notify({
      type: 'negative',
      message: "Erreur lors de l'enregistrement",
    });
  }
}

function editMandat(row: Mandat) {
  if (isYearLocked(row.exercice)) {
    $q.notify({
      type: 'warning',
      message: 'Cet exercice est verrouillé. Modification impossible.',
    });
    return;
  }
  editingId.value = row.id!;
  formData.value = {
    numeroMandat: row.numeroMandat,
    dateMandat: date.formatDate(row.dateMandat, 'YYYY-MM-DD'),
    exercice: row.exercice,
    chapitreId: row.chapitreId,
    sousChapitreId: row.sousChapitreId || null,
    bordereauMandatId: row.bordereauMandatId || null,
    beneficiaire: row.beneficiaire,
    rib: row.rib || '',
    patrimonial: row.patrimonial || '',
    objet: row.objet,
    montant: row.montant,
    numeroFacture: row.numeroFacture || '',
    dateFacture: row.dateFacture ? date.formatDate(row.dateFacture, 'YYYY-MM-DD') : '',
    modePaiement: row.modePaiement,
    statut: row.statut,
    observations: row.observations || '',
    motifAnnulation: row.motifAnnulation || '',
    // Nouveaux champs
    referenceMarche: row.referenceMarche || '',
    avisMunicipalite: row.avisMunicipalite || '',
    numeroDeliberation: row.numeroDeliberation || '',
    dateDeliberation: row.dateDeliberation
      ? date.formatDate(row.dateDeliberation, 'YYYY-MM-DD')
      : '',
    montantPrecompter: row.montantPrecompter || 0,
    typeBien: (row.typeBien as '' | 'immobilier' | 'mobilier' | 'incorporel') || '',
    projetId: row.projetId || null,
  };
  showAddDialog.value = true;
}

function deleteMandat(row: Mandat) {
  if (isYearLocked(row.exercice)) {
    $q.notify({ type: 'warning', message: 'Cet exercice est verrouillé. Suppression impossible.' });
    return;
  }
  $q.dialog({
    title: 'Confirmation',
    message: `Voulez-vous vraiment supprimer le mandat "${row.numeroMandat}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        const bordereauIdToUpdate = row.bordereauMandatId;
        await db.mandats.delete(row.id);

        // Recalculer les stats du bordereau si le mandat en avait un
        if (bordereauIdToUpdate) {
          await recalculateBordereauStats(bordereauIdToUpdate);
        }

        $q.notify({
          type: 'positive',
          message: 'Mandat supprimé avec succès',
        });
        await loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        $q.notify({
          type: 'negative',
          message: 'Erreur lors de la suppression',
        });
      }
    })();
  });
}

watch(
  () => formData.value.exercice,
  async (newExercice) => {
    if (newExercice && !editingId.value) {
      formData.value.numeroMandat = await getNextMandatNumber(newExercice);
    }
  },
);

const isDev = import.meta.env.VITE_ENV === 'development';

async function createFakeMandat() {
  try {
    const currentYear = new Date().getFullYear();
    if (isYearLocked(currentYear)) {
      $q.notify({ type: 'warning', message: 'Exercice verrouillé' });
      return;
    }
    const nextNum = await getNextMandatNumber(currentYear);
    const chapitre = chapitres.value[Math.floor(Math.random() * chapitres.value.length)];
    const sousChapitre =
      sousChapitres.value[Math.floor(Math.random() * sousChapitres.value.length)];
    if (!chapitre || !sousChapitre) {
      $q.notify({ type: 'warning', message: 'Aucun chapitre/sous-chapitre disponible' });
      return;
    }
    const now = new Date();
    const montant = Math.floor(Math.random() * 5000000) + 100000;
    await db.mandats.add({
      numeroMandat: nextNum,
      dateMandat: now,
      exercice: currentYear,
      chapitreId: chapitre.id!,
      sousChapitreId: sousChapitre.id!,
      beneficiaire: `Fournisseur Test ${nextNum}`,
      objet: `Objet test mandat ${nextNum}`,
      montant,
      modePaiement: 'virement',
      statut: 'paye',
      mairieId: 1,
      personnelId: 1,
      createdAt: now,
      updatedAt: now,
    } as Omit<Mandat, 'id'> & Record<string, unknown>);
    $q.notify({ type: 'positive', message: `Mandat fake #${nextNum} créé` });
    await loadData();
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur création fake' });
  }
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.mandats-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.overview-stat-card {
  min-height: 112px;
}

.overview-stat-label {
  margin-bottom: 8px;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.overview-stat-value {
  color: #0f172a;
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  font-weight: 800;
  line-height: 1.2;
}

.overview-stat-helper {
  margin-top: 6px;
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 600;
}

.compact-toolbar {
  margin-bottom: 14px;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.compact-toolbar-top {
  gap: 10px 0;
}

.compact-search :deep(.q-field__control) {
  min-height: 38px;
}

.compact-toolbar-summary {
  display: flex;
  align-items: center;
}

.compact-toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.compact-toolbar-actions :deep(.q-btn) {
  min-height: 36px;
  border-radius: 12px;
}

.compact-filter-panel {
  width: min(760px, 88vw);
  padding: 14px;
}

.compact-filter-panel-title {
  margin-bottom: 10px;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.import-preview-table {
  max-height: 60vh;

  :deep(.q-table__container) {
    max-height: 60vh;
  }
}

// Print styles
.print-container {
  .print-content {
    padding: 40px;
  }

  .mandat-document {
    max-width: 800px;
    margin: 0 auto;
    font-family: 'Times New Roman', serif;
  }

  .document-header {
    border-bottom: 2px solid #333;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }

  .document-title {
    border-top: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
    padding: 16px 0;
  }

  .details-table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;

    tr {
      border-bottom: 1px solid #eee;
    }

    .label-cell {
      padding: 12px 8px;
      width: 35%;
      font-weight: 500;
      color: #666;
    }

    .value-cell {
      padding: 12px 8px;
      color: #333;
    }
  }

  .montant-box {
    border: 2px solid #1976d2;
    border-radius: 8px;
    padding: 24px;
    text-align: center;
    background: #f5f5f5;
  }

  .signature-box {
    text-align: center;
    padding: 16px;
  }

  .signature-line {
    margin-top: 60px;
    border-top: 1px solid #333;
    width: 200px;
    margin-left: auto;
    margin-right: auto;
  }

  .observations {
    background: #f9f9f9;
    padding: 16px;
    border-left: 4px solid #1976d2;
    border-radius: 4px;
  }

  .document-footer {
    margin-top: 40px;
    padding-top: 16px;
    border-top: 1px solid #ccc;
    color: #999;
  }
}

// Media query for printing
@media print {
  .no-print {
    display: none !important;
  }

  .print-container {
    .print-content {
      padding: 0;
    }

    .mandat-document {
      max-width: 100%;
    }
  }

  // Optimize for A4 paper
  @page {
    size: A4 portrait;
    margin: 2cm;
  }

  body {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>
