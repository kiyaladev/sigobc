<template>
  <div class="mod-pat-wrapper">
    <!-- Titre principal -->
    <div class="main-title">
      TABLEAU DES MODIFICATIONS PREVUES DANS LA COMPOSITION DU PATRIMOINE
    </div>

    <!-- Sous-titre -->
    <div class="sub-header">
      <span>COMPTE ADMINISTRATIF</span>
      <span
        >ANNEE : <strong>{{ data.exercice.value }}</strong></span
      >
    </div>

    <q-markup-table dense bordered flat class="mod-pat-table q-mt-sm">
      <thead>
        <tr>
          <th rowspan="3" class="col-no">N°<br />D'ORD<br />RE</th>
          <th rowspan="3" class="col-ref">Ref.P<br />T 24-<br />26</th>
          <th rowspan="3" class="col-desc text-left">DESCRIPTION</th>
          <th colspan="2" rowspan="2">COMPTES</th>
          <th colspan="2">ACQUISITIONS PREVUES</th>
          <th colspan="3">ALIENATION PREVUES</th>
        </tr>
        <tr>
          <th rowspan="2" class="col-montant">MONTANT</th>
          <th rowspan="2" class="col-montant">REALISES</th>
          <th colspan="2">comptes</th>
          <th rowspan="2" class="col-montant">MONTANT</th>
        </tr>
        <tr>
          <th class="col-compte">Fonct</th>
          <th class="col-compte">Patrim</th>
          <th class="col-compte">Fonctionnel</th>
          <th class="col-compte">Patrimoniaux</th>
        </tr>
      </thead>
      <tbody>
        <!-- === IMMOBILIERS === -->
        <tr class="section-row">
          <td colspan="10"><strong>IMMOBILIERS</strong></td>
        </tr>
        <tr v-for="(p, idx) in projetsImmobiliers" :key="'immo-' + (p.id ?? idx)" class="data-row">
          <td class="text-center">{{ p.numeroOrdre ?? '' }}</td>
          <td class="text-center">{{ p.refPT ?? '' }}</td>
          <td class="text-left">{{ p.libelle }}</td>
          <td class="text-center">{{ getCompteFonctionnel(p.sousChapitreId) }}</td>
          <td class="text-center">{{ p.patrimoine || '' }}</td>
          <td class="text-right">{{ fmt(p.montant) }}</td>
          <td class="text-right">{{ getRealise(p.id) ? fmt(getRealise(p.id)) : '' }}</td>
          <td class="text-center">{{ p.alienationCompteFonctionnel || '' }}</td>
          <td class="text-center">{{ p.alienationComptePatrimonial || '' }}</td>
          <td class="text-right">{{ p.alienationMontant ? fmt(p.alienationMontant) : '' }}</td>
        </tr>
        <tr class="subtotal-row">
          <td colspan="5" class="text-center"><strong>Sous-total Immobiliers</strong></td>
          <td class="text-right">
            <strong>{{ fmt(totalImmobilierMontant) }}</strong>
          </td>
          <td class="text-right">
            <strong>{{ fmt(totalImmobilierRealise) }}</strong>
          </td>
          <td></td>
          <td></td>
          <td class="text-right">
            <strong>{{ totalImmobilierAlienation ? fmt(totalImmobilierAlienation) : '' }}</strong>
          </td>
        </tr>

        <!-- === MOBILIER === -->
        <tr class="section-row">
          <td colspan="10"><strong>MOBILIER</strong></td>
        </tr>
        <tr v-for="(p, idx) in projetsMobiliers" :key="'mob-' + (p.id ?? idx)" class="data-row">
          <td class="text-center">{{ p.numeroOrdre ?? '' }}</td>
          <td class="text-center">{{ p.refPT ?? '' }}</td>
          <td class="text-left">{{ p.libelle }}</td>
          <td class="text-center">{{ getCompteFonctionnel(p.sousChapitreId) }}</td>
          <td class="text-center">{{ p.patrimoine || '' }}</td>
          <td class="text-right">{{ fmt(p.montant) }}</td>
          <td class="text-right">{{ getRealise(p.id) ? fmt(getRealise(p.id)) : '' }}</td>
          <td class="text-center">{{ p.alienationCompteFonctionnel || '' }}</td>
          <td class="text-center">{{ p.alienationComptePatrimonial || '' }}</td>
          <td class="text-right">{{ p.alienationMontant ? fmt(p.alienationMontant) : '' }}</td>
        </tr>
        <tr class="subtotal-row">
          <td colspan="5" class="text-center"><strong>Sous-total mobiliers</strong></td>
          <td class="text-right">
            <strong>{{ fmt(totalMobilierMontant) }}</strong>
          </td>
          <td class="text-right">
            <strong>{{ fmt(totalMobilierRealise) }}</strong>
          </td>
          <td></td>
          <td></td>
          <td class="text-right">
            <strong>{{ totalMobilierAlienation ? fmt(totalMobilierAlienation) : '' }}</strong>
          </td>
        </tr>

        <!-- === TOTAL GENERAL === -->
        <tr class="grand-total-row">
          <td colspan="5" class="text-center"><strong>TOTAL GENERAL</strong></td>
          <td class="text-right">
            <strong>{{ fmt(totalGeneralMontant) }}</strong>
          </td>
          <td class="text-right">
            <strong>{{ fmt(totalGeneralRealise) }}</strong>
          </td>
          <td></td>
          <td></td>
          <td class="text-right">
            <strong>{{ totalGeneralAlienation ? fmt(totalGeneralAlienation) : '' }}</strong>
          </td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { useCompteAdmin } from 'src/composables/useCompteAdmin';

const props = defineProps<{ data: ReturnType<typeof useCompteAdmin> }>();

// Build map: projetId → sum of mandat montants (réalisés)
const realiseParProjet = computed(() => {
  const map = new Map<number, number>();
  for (const m of props.data.mandats.value) {
    if (m.projetId) {
      map.set(m.projetId, (map.get(m.projetId) ?? 0) + m.montant);
    }
  }
  return map;
});

function getRealise(projetId?: number): number {
  if (!projetId) return 0;
  return realiseParProjet.value.get(projetId) ?? 0;
}

const projetsImmobiliers = computed(() =>
  props.data.projets.value.filter((p) => p.typeBien === 'immobilier'),
);

const projetsMobiliers = computed(() =>
  props.data.projets.value.filter((p) => p.typeBien === 'mobilier' || p.typeBien === 'incorporel'),
);

const totalImmobilierMontant = computed(() =>
  projetsImmobiliers.value.reduce((s, p) => s + p.montant, 0),
);
const totalImmobilierRealise = computed(() =>
  projetsImmobiliers.value.reduce((s, p) => s + getRealise(p.id), 0),
);
const totalImmobilierAlienation = computed(() =>
  projetsImmobiliers.value.reduce((s, p) => s + (p.alienationMontant ?? 0), 0),
);

const totalMobilierMontant = computed(() =>
  projetsMobiliers.value.reduce((s, p) => s + p.montant, 0),
);
const totalMobilierRealise = computed(() =>
  projetsMobiliers.value.reduce((s, p) => s + getRealise(p.id), 0),
);
const totalMobilierAlienation = computed(() =>
  projetsMobiliers.value.reduce((s, p) => s + (p.alienationMontant ?? 0), 0),
);

const totalGeneralMontant = computed(
  () => totalImmobilierMontant.value + totalMobilierMontant.value,
);
const totalGeneralRealise = computed(
  () => totalImmobilierRealise.value + totalMobilierRealise.value,
);
const totalGeneralAlienation = computed(
  () => totalImmobilierAlienation.value + totalMobilierAlienation.value,
);

function getCompteFonctionnel(sousChapitreId?: number): string {
  if (!sousChapitreId) return '';
  const sc = props.data.sousChapitreMap.value.get(sousChapitreId);
  return sc ? sc.code : '';
}

function fmt(v: number) {
  return new Intl.NumberFormat('fr-FR').format(v);
}
</script>

<style scoped lang="scss">
.mod-pat-wrapper {
  max-width: 100%;
  margin: 0 auto;
  overflow-x: auto;
}

.main-title {
  text-align: center;
  font-weight: bold;
  font-size: 13px;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.sub-header {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  padding: 0 4px;
}

/* Table sizing */
.mod-pat-table {
  font-size: 11px;

  :deep(th),
  :deep(td) {
    font-size: 11px;
    padding: 2px 6px;
    border: 1px solid #aaa;
  }

  :deep(th) {
    background-color: #f0f0f0;
    font-weight: bold;
    text-align: center;
    font-size: 9px;
  }

  .col-no {
    width: 40px;
    text-align: center;
  }

  .col-ref {
    width: 50px;
    text-align: center;
  }

  .col-desc {
    min-width: 220px;
  }

  .col-compte {
    width: 60px;
  }

  .col-montant {
    width: 110px;
  }
}

/* Section headers (IMMOBILIERS, MOBILIER) */
.section-row td {
  text-align: center;
  background-color: #e3f2fd;
  font-size: 11px;
  font-weight: bold;
  padding: 3px 6px;
}

/* Data rows */
.data-row td {
  background-color: #fff;
  font-size: 10px;
}
.data-row:hover td {
  background-color: #f9f9f9;
}

/* Subtotal rows */
.subtotal-row td {
  background-color: #f5f5f5;
  font-weight: bold;
  font-size: 10px;
}

/* Grand total */
.grand-total-row td {
  background-color: #bdbdbd;
  font-weight: bold;
  font-size: 11px;
}
</style>
