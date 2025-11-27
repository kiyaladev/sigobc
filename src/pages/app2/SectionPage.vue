<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- En-tête avec titre -->
      <div class="col-12">
        <div class="row items-center justify-between q-mb-md">
          <div class="col">
            <div class="text-h4">Sections de Trésorerie</div>
            <div class="text-subtitle1 text-grey-7">
              Gestion des flux de trésorerie et des timbres fiscaux
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard des soldes -->
      <div class="col-12">
        <q-card flat bordered class="bg-gradient-primary">
          <q-card-section>
            <div class="text-h6 text-white q-mb-md">
              <q-icon name="account_balance_wallet" class="q-mr-sm" />
              Vue d'ensemble des soldes
            </div>
            <div class="row q-col-gutter-md">
              <!-- Section I -->
              <div class="col-12 col-md-4">
                <q-card flat class="bg-white">
                  <q-card-section>
                    <div class="row items-center">
                      <div class="col">
                        <div class="text-caption text-grey-7">Section I</div>
                        <div class="text-subtitle2">Timbres Fiscaux</div>
                        <div class="text-h5 text-primary q-mt-sm">
                          {{ formatMontant(soldeSectionI) }}
                        </div>
                      </div>
                      <div class="col-auto">
                        <q-icon name="receipt" size="48px" color="primary" />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Section II -->
              <div class="col-12 col-md-4">
                <q-card flat class="bg-white">
                  <q-card-section>
                    <div class="row items-center">
                      <div class="col">
                        <div class="text-caption text-grey-7">Section II</div>
                        <div class="text-subtitle2">Remises & Versements</div>
                        <div class="text-h5 text-primary q-mt-sm">
                          {{ formatMontant(soldeSectionII) }}
                        </div>
                      </div>
                      <div class="col-auto">
                        <q-icon name="swap_horiz" size="48px" color="primary" />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Section III -->
              <div class="col-12 col-md-4">
                <q-card flat class="bg-white">
                  <q-card-section>
                    <div class="row items-center">
                      <div class="col">
                        <div class="text-caption text-grey-7">Section III</div>
                        <div class="text-subtitle2">Versements finaux</div>
                        <div class="text-h5 text-secondary q-mt-sm">
                          {{ formatMontant(soldeSectionIII) }}
                        </div>
                      </div>
                      <div class="col-auto">
                        <q-icon name="payments" size="48px" color="secondary" />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Flux de trésorerie -->
            <div class="row items-center justify-center q-mt-md">
              <div class="col-auto text-white text-center">
                <div class="text-caption">Section I</div>
                <q-icon name="receipt" size="24px" />
                <div class="text-caption">Timbres</div>
              </div>
              <div class="col-auto">
                <q-icon name="arrow_forward" size="32px" class="text-white" />
                <div class="text-caption text-white">Remises</div>
              </div>
              <div class="col-auto text-white text-center">
                <div class="text-caption">Section II</div>
                <q-icon name="swap_horiz" size="24px" />
                <div class="text-caption">Transit</div>
              </div>
              <div class="col-auto">
                <q-icon name="arrow_forward" size="32px" class="text-white" />
                <div class="text-caption text-white">Versements</div>
              </div>
              <div class="col-auto text-white text-center">
                <div class="text-caption">Section III</div>
                <q-icon name="payments" size="24px" />
                <div class="text-caption">Caisse</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Filtres et Actions -->
      <div class="col-12">
        <q-card flat bordered>
          <q-card-section class="row q-col-gutter-md items-center">
            <div class="col-12 col-md-3">
              <q-select
                v-model="selectedExercice"
                :options="exerciceOptions"
                label="Exercice"
                outlined
                dense
                emit-value
                map-options
              />
            </div>
            <div class="col-12 col-md-3">
              <q-btn
                color="primary"
                label="Actualiser"
                icon="refresh"
                @click="loadData"
                class="full-width"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-btn
                color="secondary"
                label="Imprimer section"
                icon="print"
                @click="printCurrentSection"
                class="full-width"
                outline
              />
            </div>
            <div class="col-12 col-md-3">
              <q-btn
                color="accent"
                label="Imprimer tout"
                icon="print"
                @click="printAllSections"
                class="full-width"
                outline
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tabs pour les sections -->
      <div class="col-12">
        <q-card>
          <q-tabs
            v-model="activeTab"
            dense
            class="text-primary bg-white"
            active-color="primary"
            indicator-color="primary"
            align="left"
            animated
          >
            <q-tab name="section1" label="Section I - Timbres Fiscaux" icon="receipt" />
            <q-tab name="section2" label="Section II - Remises & Versements" icon="swap_horiz" />
            <q-tab name="section3" label="Section III - Versements" icon="payments" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated>
            <!-- Section 1 - Approvisionnement -->
            <q-tab-panel name="section1">
              <div class="q-pa-md" id="section1-print">
                <div class="row items-center justify-between q-mb-md">
                  <div class="col">
                    <div class="text-h6">
                      <q-icon name="receipt" color="primary" class="q-mr-sm" />
                      Section I - Timbres Fiscaux (Balance d'entrée + Remises)
                    </div>
                  </div>
                  <div class="col-auto no-print">
                    <q-btn
                      color="primary"
                      label="Imprimer"
                      icon="print"
                      @click="printSection('section1')"
                      flat
                      dense
                    />
                  </div>
                </div>

                <q-table
                  :rows="sectionIData"
                  :columns="sectionIColumns"
                  row-key="id"
                  :rows-per-page-options="[10, 20, 50, 0]"
                  :loading="loading"
                  flat
                  bordered
                  class="sticky-header-table"
                  :pagination="{ rowsPerPage: 20 }"
                >
                  <template v-slot:body-cell-date="props">
                    <q-td :props="props">
                      {{ formatDate(props.row.date) }}
                    </q-td>
                  </template>

                  <template v-slot:body-cell-type="props">
                    <q-td :props="props">
                      <q-badge
                        :color="
                          props.row.type === 'BE-S1' || props.row.type === 'Stock initial'
                            ? 'info'
                            : props.row.type === 'Remise'
                              ? 'negative'
                              : 'positive'
                        "
                        :label="props.row.type"
                      />
                    </q-td>
                  </template>

                  <template v-slot:body-cell-500="props">
                    <q-td :props="props">
                      <span :class="props.row.denominations[500] < 0 ? 'text-negative' : ''">
                        {{ formatNumber(props.row.denominations[500]) }}
                      </span>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-1000="props">
                    <q-td :props="props">
                      <span :class="props.row.denominations[1000] < 0 ? 'text-negative' : ''">
                        {{ formatNumber(props.row.denominations[1000]) }}
                      </span>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-1500="props">
                    <q-td :props="props">
                      <span :class="props.row.denominations[1500] < 0 ? 'text-negative' : ''">
                        {{ formatNumber(props.row.denominations[1500]) }}
                      </span>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-3000="props">
                    <q-td :props="props">
                      <span :class="props.row.denominations[3000] < 0 ? 'text-negative' : ''">
                        {{ formatNumber(props.row.denominations[3000]) }}
                      </span>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-4500="props">
                    <q-td :props="props">
                      <span :class="props.row.denominations[4500] < 0 ? 'text-negative' : ''">
                        {{ formatNumber(props.row.denominations[4500]) }}
                      </span>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-5000="props">
                    <q-td :props="props">
                      <span :class="props.row.denominations[5000] < 0 ? 'text-negative' : ''">
                        {{ formatNumber(props.row.denominations[5000]) }}
                      </span>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-approv="props">
                    <q-td :props="props">
                      <div v-if="props.row.approvisionnement" class="text-info text-weight-bold">
                        {{ formatMontant(props.row.approvisionnement) }}
                      </div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-remise="props">
                    <q-td :props="props">
                      <div v-if="props.row.remise" class="text-negative text-weight-bold">
                        {{ formatMontant(props.row.remise) }}
                      </div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-solde="props">
                    <q-td :props="props">
                      <div class="text-primary text-weight-bold">
                        {{ formatMontant(props.row.solde) }}
                      </div>
                    </q-td>
                  </template>
                </q-table>
              </div>
            </q-tab-panel>

            <!-- Section 2 - Remises et Versements -->
            <q-tab-panel name="section2">
              <div class="q-pa-md" id="section2-print">
                <div class="row items-center justify-between q-mb-md">
                  <div class="col">
                    <div class="text-h6">
                      <q-icon name="swap_horiz" color="primary" class="q-mr-sm" />
                      Section II - Timbres (BE - Versement + Remise)
                    </div>
                  </div>
                  <div class="col-auto no-print">
                    <q-btn
                      color="primary"
                      label="Imprimer"
                      icon="print"
                      @click="printSection('section2')"
                      flat
                      dense
                    />
                  </div>
                </div>

                <q-table
                  :rows="sectionIIData"
                  :columns="sectionIIColumns"
                  row-key="id"
                  :rows-per-page-options="[10, 20, 50, 0]"
                  :loading="loading"
                  flat
                  bordered
                  class="sticky-header-table"
                  :pagination="{ rowsPerPage: 20 }"
                >
                  <template v-slot:body-cell-date="props">
                    <q-td :props="props">
                      {{ formatDate(props.row.date) }}
                    </q-td>
                  </template>

                  <template v-slot:body-cell-type="props">
                    <q-td :props="props">
                      <q-badge
                        :color="
                          props.row.type === 'BE-S2' || props.row.type === 'Stock initial'
                            ? 'info'
                            : props.row.type === 'Remise'
                              ? 'positive'
                              : props.row.type === 'Versement'
                                ? 'negative'
                                : 'info'
                        "
                        :label="props.row.type"
                      />
                    </q-td>
                  </template>

                  <template v-slot:body-cell-500="props">
                    <q-td :props="props">
                      <span :class="props.row.denominations[500] < 0 ? 'text-negative' : ''">
                        {{ formatNumber(props.row.denominations[500]) }}
                      </span>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-1000="props">
                    <q-td :props="props">
                      <span :class="props.row.denominations[1000] < 0 ? 'text-negative' : ''">
                        {{ formatNumber(props.row.denominations[1000]) }}
                      </span>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-1500="props">
                    <q-td :props="props">
                      <span :class="props.row.denominations[1500] < 0 ? 'text-negative' : ''">
                        {{ formatNumber(props.row.denominations[1500]) }}
                      </span>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-3000="props">
                    <q-td :props="props">
                      <span :class="props.row.denominations[3000] < 0 ? 'text-negative' : ''">
                        {{ formatNumber(props.row.denominations[3000]) }}
                      </span>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-4500="props">
                    <q-td :props="props">
                      <span :class="props.row.denominations[4500] < 0 ? 'text-negative' : ''">
                        {{ formatNumber(props.row.denominations[4500]) }}
                      </span>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-5000="props">
                    <q-td :props="props">
                      <span :class="props.row.denominations[5000] < 0 ? 'text-negative' : ''">
                        {{ formatNumber(props.row.denominations[5000]) }}
                      </span>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-remise="props">
                    <q-td :props="props">
                      <div v-if="props.row.remise" class="text-positive text-weight-bold">
                        {{ formatMontant(props.row.remise) }}
                      </div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-versement="props">
                    <q-td :props="props">
                      <div v-if="props.row.versement" class="text-negative text-weight-bold">
                        {{ formatMontant(props.row.versement) }}
                      </div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-solde="props">
                    <q-td :props="props">
                      <div class="text-primary text-weight-bold">
                        {{ formatMontant(props.row.solde) }}
                      </div>
                    </q-td>
                  </template>
                </q-table>
              </div>
            </q-tab-panel>

            <!-- Section 3 - Versements -->
            <q-tab-panel name="section3">
              <div class="q-pa-md" id="section3-print">
                <div class="row items-center justify-between q-mb-md">
                  <div class="col">
                    <div class="text-h6">
                      <q-icon name="payments" color="secondary" class="q-mr-sm" />
                      Section III - Timbres (BE + Versements)
                    </div>
                  </div>
                  <div class="col-auto no-print">
                    <q-btn
                      color="primary"
                      label="Imprimer"
                      icon="print"
                      @click="printSection('section3')"
                      flat
                      dense
                    />
                  </div>
                </div>

                <q-table
                  :rows="sectionIIIData"
                  :columns="sectionIIIColumns"
                  row-key="id"
                  :rows-per-page-options="[10, 20, 50, 0]"
                  :loading="loading"
                  flat
                  bordered
                  class="sticky-header-table"
                  :pagination="{ rowsPerPage: 20 }"
                >
                  <template v-slot:body-cell-date="props">
                    <q-td :props="props">
                      {{ formatDate(props.row.date) }}
                    </q-td>
                  </template>

                  <template v-slot:body-cell-type="props">
                    <q-td :props="props">
                      <q-badge
                        :color="
                          props.row.type === 'BE-S3' || props.row.type === 'Stock initial'
                            ? 'info'
                            : props.row.type === 'Versement'
                              ? 'negative'
                              : 'info'
                        "
                        :label="props.row.type"
                      />
                    </q-td>
                  </template>

                  <template v-slot:body-cell-500="props">
                    <q-td :props="props">
                      <span :class="props.row.denominations[500] < 0 ? 'text-negative' : ''">
                        {{ formatNumber(props.row.denominations[500]) }}
                      </span>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-1000="props">
                    <q-td :props="props">
                      <span :class="props.row.denominations[1000] < 0 ? 'text-negative' : ''">
                        {{ formatNumber(props.row.denominations[1000]) }}
                      </span>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-1500="props">
                    <q-td :props="props">
                      <span :class="props.row.denominations[1500] < 0 ? 'text-negative' : ''">
                        {{ formatNumber(props.row.denominations[1500]) }}
                      </span>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-3000="props">
                    <q-td :props="props">
                      <span :class="props.row.denominations[3000] < 0 ? 'text-negative' : ''">
                        {{ formatNumber(props.row.denominations[3000]) }}
                      </span>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-4500="props">
                    <q-td :props="props">
                      <span :class="props.row.denominations[4500] < 0 ? 'text-negative' : ''">
                        {{ formatNumber(props.row.denominations[4500]) }}
                      </span>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-5000="props">
                    <q-td :props="props">
                      <span :class="props.row.denominations[5000] < 0 ? 'text-negative' : ''">
                        {{ formatNumber(props.row.denominations[5000]) }}
                      </span>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-approvisionnement="props">
                    <q-td :props="props">
                      <div v-if="props.row.approvisionnement" class="text-info text-weight-bold">
                        {{ formatMontant(props.row.approvisionnement) }}
                      </div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-versement="props">
                    <q-td :props="props">
                      <div v-if="props.row.versement" class="text-negative text-weight-bold">
                        {{ formatMontant(props.row.versement) }}
                      </div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-solde="props">
                    <q-td :props="props">
                      <div class="text-primary text-weight-bold">
                        {{ formatMontant(props.row.solde) }}
                      </div>
                    </q-td>
                  </template>
                </q-table>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
/**
 * PAGE DES SECTIONS DE TRÉSORERIE - GESTION DES TIMBRES FISCAUX
 *
 * Cette page gère les 3 sections de trésorerie pour les timbres fiscaux :
 *
 * SECTION I - TIMBRES FISCAUX (Stock)
 * - Balance d'entrée initiale (BE-S1)
 * - Remises vers Section II (sorties négatives)
 * - Formule : Solde = BE-S1 - Remises
 *
 * SECTION II - TRANSIT (Remises et Versements)
 * - Balance d'entrée (BE-S2)
 * - Reçoit les remises de Section I (entrées positives, en vert)
 * - Envoie des versements vers Section III (sorties négatives, en rouge)
 * - Formule : Solde = BE-S2 - Versements + Remises
 *
 * SECTION III - CAISSE (Versements finaux)
 * - Balance d'entrée (BE-S3)
 * - Reçoit les versements de Section II (sorties négatives)
 * - Formule : Solde = BE-S3 + Versements
 *
 * LES 4 TYPES DE BALANCE D'ENTRÉE PAR EXERCICE :
 * 1. Stock initial - Stock de départ de l'année
 * 2. BE-S1 - Balance d'entrée Section I (Timbres Fiscaux)
 * 3. BE-S2 - Balance d'entrée Section II (Transit)
 * 4. BE-S3 - Balance d'entrée Section III (Caisse)
 *
 * COLONNES DES TIMBRES (Valeurs) :
 * - 100 F, 200 F, 300 F, 600 F, 900 F, 1000 F
 *
 * FLUX DE TRÉSORERIE :
 * Section I (Timbres) → Remises → Section II (Transit) → Versements → Section III (Caisse)
 */
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const activeTab = ref('section1');
const loading = ref(false);
const selectedExercice = ref(new Date().getFullYear());

// Options d'exercice (5 dernières années)
const exerciceOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 5; i++) {
    const year = currentYear - i;
    years.push({
      label: `Exercice ${year}`,
      value: year,
    });
  }
  return years;
});

// Soldes des sections
const soldeSectionI = ref(256940000);
const soldeSectionII = ref(840000);
const soldeSectionIII = ref(253680000);

// Données de Section I
const sectionIData = ref<SectionIEntry[]>([]);
const sectionIIData = ref<SectionIIEntry[]>([]);
const sectionIIIData = ref<SectionIIIEntry[]>([]);

// Types
type DenominationsType = {
  500: number;
  1000: number;
  1500: number;
  3000: number;
  4500: number;
  5000: number;
  [key: number]: number;
};

interface SectionIEntry {
  id: number;
  date: string;
  type: string;
  denominations: DenominationsType;
  approvisionnement?: number;
  remise?: number;
  solde: number;
}

interface SectionIIEntry {
  id: number;
  date: string;
  type: string;
  denominations: DenominationsType;
  remise?: number;
  versement?: number;
  solde: number;
}

interface SectionIIIEntry {
  id: number;
  date: string;
  type: string;
  denominations: DenominationsType;
  approvisionnement?: number;
  versement?: number;
  solde: number;
}

// Combined type for print function
type AnySectionEntry = SectionIEntry | SectionIIEntry | SectionIIIEntry;

// Colonnes Section I (Balance d'entrée + Remises uniquement)
const sectionIColumns = [
  {
    name: 'date',
    label: 'Date',
    field: 'date',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'type',
    label: 'Type',
    field: 'type',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: '500',
    label: '100',
    field: (row: SectionIEntry) => row.denominations[500],
    align: 'right' as const,
    sortable: true,
  },
  {
    name: '1000',
    label: '200',
    field: (row: SectionIEntry) => row.denominations[1000],
    align: 'right' as const,
    sortable: true,
  },
  {
    name: '1500',
    label: '300',
    field: (row: SectionIEntry) => row.denominations[1500],
    align: 'right' as const,
    sortable: true,
  },
  {
    name: '3000',
    label: '600',
    field: (row: SectionIEntry) => row.denominations[3000],
    align: 'right' as const,
    sortable: true,
  },
  {
    name: '4500',
    label: '900',
    field: (row: SectionIEntry) => row.denominations[4500],
    align: 'right' as const,
    sortable: true,
  },
  {
    name: '5000',
    label: '1000',
    field: (row: SectionIEntry) => row.denominations[5000],
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'approv',
    label: 'Approv',
    field: 'approvisionnement',
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'remise',
    label: 'Remise',
    field: 'remise',
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'solde',
    label: 'Solde',
    field: 'solde',
    align: 'right' as const,
    sortable: true,
  },
];

// Colonnes Section II (BE - Versement + Remise)
const sectionIIColumns = [
  {
    name: 'date',
    label: 'Date',
    field: 'date',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'type',
    label: 'Type',
    field: 'type',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: '500',
    label: '100',
    field: (row: SectionIIEntry) => row.denominations[500],
    align: 'right' as const,
    sortable: true,
  },
  {
    name: '1000',
    label: '200',
    field: (row: SectionIIEntry) => row.denominations[1000],
    align: 'right' as const,
    sortable: true,
  },
  {
    name: '1500',
    label: '300',
    field: (row: SectionIIEntry) => row.denominations[1500],
    align: 'right' as const,
    sortable: true,
  },
  {
    name: '3000',
    label: '600',
    field: (row: SectionIIEntry) => row.denominations[3000],
    align: 'right' as const,
    sortable: true,
  },
  {
    name: '4500',
    label: '900',
    field: (row: SectionIIEntry) => row.denominations[4500],
    align: 'right' as const,
    sortable: true,
  },
  {
    name: '5000',
    label: '1000',
    field: (row: SectionIIEntry) => row.denominations[5000],
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'remise',
    label: 'Remise',
    field: 'remise',
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'versement',
    label: 'Versement',
    field: 'versement',
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'solde',
    label: 'Solde',
    field: 'solde',
    align: 'right' as const,
    sortable: true,
  },
];

// Colonnes Section III (BE + Versements)
const sectionIIIColumns = [
  {
    name: 'date',
    label: 'Date',
    field: 'date',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'type',
    label: 'Nature',
    field: 'type',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: '500',
    label: '100',
    field: (row: SectionIIIEntry) => row.denominations[500],
    align: 'right' as const,
    sortable: true,
  },
  {
    name: '1000',
    label: '200',
    field: (row: SectionIIIEntry) => row.denominations[1000],
    align: 'right' as const,
    sortable: true,
  },
  {
    name: '1500',
    label: '300',
    field: (row: SectionIIIEntry) => row.denominations[1500],
    align: 'right' as const,
    sortable: true,
  },
  {
    name: '3000',
    label: '600',
    field: (row: SectionIIIEntry) => row.denominations[3000],
    align: 'right' as const,
    sortable: true,
  },
  {
    name: '4500',
    label: '900',
    field: (row: SectionIIIEntry) => row.denominations[4500],
    align: 'right' as const,
    sortable: true,
  },
  {
    name: '5000',
    label: '1000',
    field: (row: SectionIIIEntry) => row.denominations[5000],
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'approvisionnement',
    label: 'Approv°',
    field: 'approvisionnement',
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'versement',
    label: 'Versement',
    field: 'versement',
    align: 'right' as const,
    sortable: true,
  },
  {
    name: 'solde',
    label: 'Solde',
    field: 'solde',
    align: 'right' as const,
    sortable: true,
  },
];

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('fr-FR');
};

const formatMontant = (montant: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(montant);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

// Charger les données
const loadData = () => {
  loading.value = true;
  try {
    // Données d'exemple pour Section I (Balance d'entrée + Remises uniquement)
    sectionIData.value = [
      {
        id: 1,
        date: '2025-01-01',
        type: 'BE-S1',
        denominations: {
          500: 98500,
          1000: 74670,
          1500: 0,
          3000: 45790,
          4500: 0,
          5000: 0,
        },
        approvisionnement: 261290000,
        solde: 261290000,
      },
      {
        id: 2,
        date: '2025-01-06',
        type: 'Remise',
        denominations: {
          500: -500,
          1000: -100,
          1500: 0,
          3000: -100,
          4500: 0,
          5000: 0,
        },
        remise: 650000,
        solde: 260640000,
      },
      {
        id: 3,
        date: '2025-01-10',
        type: 'Remise',
        denominations: {
          500: -500,
          1000: -250,
          1500: 0,
          3000: -100,
          4500: 0,
          5000: 0,
        },
        remise: 800000,
        solde: 259840000,
      },
      {
        id: 4,
        date: '2025-01-15',
        type: 'Remise',
        denominations: {
          500: -500,
          1000: -250,
          1500: 0,
          3000: -100,
          4500: 0,
          5000: 0,
        },
        remise: 800000,
        solde: 259040000,
      },
    ];

    // Données d'exemple pour Section II (Balance d'entrée + Remises/Versements)
    sectionIIData.value = [
      {
        id: 1,
        date: '2025-01-01',
        type: 'BE-S2',
        denominations: {
          500: 166,
          1000: 69,
          1500: 0,
          3000: 15,
          4500: 0,
          5000: 0,
        },
        remise: 197000,
        solde: 197000,
      },
      {
        id: 2,
        date: '2025-01-03',
        type: 'Versement',
        denominations: {
          500: -150,
          1000: 0,
          1500: 0,
          3000: 0,
          4500: 0,
          5000: 0,
        },
        versement: 75000,
        solde: 122000,
      },
      {
        id: 3,
        date: '2025-01-06',
        type: 'Remise',
        denominations: {
          500: 500,
          1000: 100,
          1500: 0,
          3000: 100,
          4500: 0,
          5000: 0,
        },
        remise: 650000,
        solde: 772000,
      },
    ];

    // Données d'exemple pour Section III (Balance d'entrée + Versements uniquement)
    sectionIIIData.value = [
      {
        id: 1,
        date: '2025-01-01',
        type: 'BE-S3',
        denominations: {
          500: 98666,
          1000: 74739,
          1500: 0,
          3000: 45805,
          4500: 0,
          5000: 0,
        },
        approvisionnement: 261487000,
        solde: 261487000,
      },
      {
        id: 2,
        date: '2025-01-03',
        type: 'Versement',
        denominations: {
          500: -150,
          1000: 0,
          1500: 0,
          3000: 0,
          4500: 0,
          5000: 0,
        },
        versement: 75000,
        solde: 261412000,
      },
      {
        id: 3,
        date: '2025-01-10',
        type: 'Versement',
        denominations: {
          500: -522,
          1000: -100,
          1500: 0,
          3000: -102,
          4500: 0,
          5000: 0,
        },
        versement: 667000,
        solde: 260745000,
      },
    ];

    // Mettre à jour les soldes
    if (sectionIData.value.length > 0) {
      soldeSectionI.value = sectionIData.value[sectionIData.value.length - 1]!.solde;
    }
    if (sectionIIData.value.length > 0) {
      soldeSectionII.value = sectionIIData.value[sectionIIData.value.length - 1]!.solde;
    }
    if (sectionIIIData.value.length > 0) {
      soldeSectionIII.value = sectionIIIData.value[sectionIIIData.value.length - 1]!.solde;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error);
    $q.notify({
      type: 'negative',
      message: 'Erreur lors du chargement des données',
    });
  } finally {
    loading.value = false;
  }
};

// Fonctions d'impression
const printSection = (sectionName: string) => {
  const printContent = document.getElementById(`${sectionName}-print`);
  if (!printContent) return;

  const sectionTitle =
    sectionName === 'section1'
      ? 'Section I - Approvisionnements et Remises'
      : sectionName === 'section2'
        ? 'Section II - Remises et Versements'
        : 'Section III - Approvisionnements et Versements';

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    $q.notify({
      type: 'negative',
      message: "Impossible d'ouvrir la fenêtre d'impression",
    });
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${sectionTitle}</title>
        <style>
          @media print {
            @page {
              size: A4 portrait;
              margin: 1cm;
            }
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #000;
            background: #fff;
            padding: 20px;
          }

          h1 {
            font-size: 18px;
            margin-bottom: 20px;
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }

          th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
          }

          td {
            text-align: right;
          }

          td:first-child, td:nth-child(2) {
            text-align: left;
          }

          .text-positive {
            color: #21BA45;
            font-weight: bold;
          }

          .text-negative {
            color: #C10015;
            font-weight: bold;
          }

          .text-primary {
            color: #1976D2;
            font-weight: bold;
          }

          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
          }

          .badge-positive {
            background-color: #21BA45;
            color: white;
          }

          .badge-negative {
            background-color: #C10015;
            color: white;
          }

          .badge-info {
            background-color: #31CCEC;
            color: white;
          }

          .badge-primary {
            background-color: #1976D2;
            color: white;
          }

          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
          }

          .no-print {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <h1>${sectionTitle}</h1>
        <div class="info">
          <p><strong>Date d'impression :</strong> ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}</p>
          <p><strong>Exercice :</strong> ${selectedExercice.value}</p>
        </div>
        ${getPrintableTable(sectionName)}
        <div class="footer">
          <p>Document généré automatiquement - Trésorerie</p>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

const getPrintableTable = (sectionName: string) => {
  let data: AnySectionEntry[] = [];
  let columns: typeof sectionIColumns | typeof sectionIIColumns | typeof sectionIIIColumns = [];

  if (sectionName === 'section1') {
    data = sectionIData.value;
    columns = sectionIColumns;
  } else if (sectionName === 'section2') {
    data = sectionIIData.value;
    columns = sectionIIColumns;
  } else if (sectionName === 'section3') {
    data = sectionIIIData.value;
    columns = sectionIIIColumns;
  }

  let tableHTML = '<table><thead><tr>';

  // En-têtes
  columns.forEach((col) => {
    tableHTML += `<th>${col.label}</th>`;
  });
  tableHTML += '</tr></thead><tbody>';

  // Lignes de données
  data.forEach((row) => {
    tableHTML += '<tr>';
    columns.forEach((col) => {
      let value = '';
      let className = '';

      if (col.name === 'date') {
        value = formatDate(row.date);
      } else if (col.name === 'type') {
        const badgeClass =
          row.type.startsWith('BE-') || row.type === 'Stock initial'
            ? 'badge-info'
            : row.type === 'Remise'
              ? sectionName === 'section1'
                ? 'badge-negative'
                : 'badge-positive'
              : row.type === 'Versement'
                ? 'badge-negative'
                : 'badge-info';
        value = `<span class="badge ${badgeClass}">${row.type}</span>`;
      } else if (col.name.match(/^\d+$/)) {
        // Dénominations
        const denom = row.denominations[parseInt(col.name)] ?? 0;
        className = denom < 0 ? 'text-negative' : '';
        value = formatNumber(denom);
      } else if (
        (col.name === 'approvisionnement' || col.name === 'approv') &&
        'approvisionnement' in row &&
        row.approvisionnement
      ) {
        className = 'text-info';
        value = formatMontant(row.approvisionnement);
      } else if (col.name === 'remise' && 'remise' in row && row.remise) {
        className = sectionName === 'section1' ? 'text-negative' : 'text-positive';
        value = formatMontant(row.remise);
      } else if (col.name === 'versement' && 'versement' in row && row.versement) {
        className = 'text-negative';
        value = formatMontant(row.versement);
      } else if (col.name === 'solde') {
        className = 'text-primary';
        value = formatMontant(row.solde);
      }

      tableHTML += `<td class="${className}">${value}</td>`;
    });
    tableHTML += '</tr>';
  });

  tableHTML += '</tbody></table>';
  return tableHTML;
};

const printCurrentSection = () => {
  printSection(activeTab.value);
};

const printAllSections = () => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    $q.notify({
      type: 'negative',
      message: "Impossible d'ouvrir la fenêtre d'impression",
    });
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Toutes les Sections - Trésorerie</title>
        <style>
          @media print {
            @page {
              size: A4 portrait;
              margin: 1cm;
            }

            .page-break {
              page-break-before: always;
            }
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #000;
            background: #fff;
            padding: 20px;
          }

          h1 {
            font-size: 20px;
            margin-bottom: 10px;
            text-align: center;
            border-bottom: 3px solid #333;
            padding-bottom: 10px;
          }

          h2 {
            font-size: 16px;
            margin-top: 30px;
            margin-bottom: 15px;
            padding: 10px;
            background-color: #f0f0f0;
            border-left: 4px solid #333;
          }

          .info {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 30px;
          }

          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }

          th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
          }

          td {
            text-align: right;
          }

          td:first-child, td:nth-child(2) {
            text-align: left;
          }

          .text-positive {
            color: #21BA45;
            font-weight: bold;
          }

          .text-negative {
            color: #C10015;
            font-weight: bold;
          }

          .text-primary {
            color: #1976D2;
            font-weight: bold;
          }

          .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
          }

          .badge-positive {
            background-color: #21BA45;
            color: white;
          }

          .badge-negative {
            background-color: #C10015;
            color: white;
          }

          .badge-info {
            background-color: #31CCEC;
            color: white;
          }

          .badge-primary {
            background-color: #1976D2;
            color: white;
          }

          .summary {
            margin: 20px 0;
            padding: 15px;
            background-color: #e8f5e9;
            border-left: 4px solid #21BA45;
          }

          .summary-item {
            margin: 5px 0;
            font-size: 14px;
          }

          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <h1>Rapport Complet - Sections de Trésorerie</h1>

        <div class="info">
          <p><strong>Date d'impression :</strong> ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}</p>
          <p><strong>Exercice :</strong> ${selectedExercice.value}</p>
        </div>

        <div class="summary">
          <h3>Résumé des Soldes</h3>
          <div class="summary-item"><strong>Section I :</strong> ${formatMontant(soldeSectionI.value)}</div>
          <div class="summary-item"><strong>Section II :</strong> ${formatMontant(soldeSectionII.value)}</div>
          <div class="summary-item"><strong>Section III :</strong> ${formatMontant(soldeSectionIII.value)}</div>
          <div class="summary-item"><strong>Total :</strong> ${formatMontant(soldeSectionI.value + soldeSectionII.value + soldeSectionIII.value)}</div>
        </div>

        <h2>Section I - Approvisionnements et Remises</h2>
        ${getPrintableTable('section1')}

        <div class="page-break"></div>

        <h2>Section II - Remises et Versements</h2>
        ${getPrintableTable('section2')}

        <div class="page-break"></div>

        <h2>Section III - Approvisionnements et Versements</h2>
        ${getPrintableTable('section3')}

        <div class="footer">
          <p>Document généré automatiquement - Trésorerie</p>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.sticky-header-table {
  /* height or max-height is important */
  max-height: 600px;

  :deep(.q-table__top),
  :deep(.q-table__bottom),
  :deep(thead tr:first-child th) {
    /* bg color is important for th; just specify one */
    background-color: #fff;
  }

  :deep(thead tr th) {
    position: sticky;
    z-index: 1;
  }

  :deep(thead tr:first-child th) {
    top: 0;
  }

  /* this is when the loading indicator appears */
  :deep(&.q-table--loading thead tr:last-child th) {
    /* height of all previous header rows */
    top: 48px;
  }
}

/* Styles pour l'impression */
@media print {
  .no-print,
  .q-page-container,
  .q-header,
  .q-footer,
  .q-drawer,
  button {
    display: none !important;
  }

  body {
    background: white;
  }

  .q-page {
    padding: 0 !important;
    margin: 0 !important;
  }

  table {
    page-break-inside: auto;
  }

  tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  thead {
    display: table-header-group;
  }

  tfoot {
    display: table-footer-group;
  }
}
</style>
