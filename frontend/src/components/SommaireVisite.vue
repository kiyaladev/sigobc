<template>
  <q-dialog :model-value="modelValue" @update:model-value="onUpdate">
    <q-card class="sommaire-card">
      <q-card-section class="sommaire-heading">
        <div>
          <p class="eyebrow">Sommaire des visites</p>
          <h2>Choisissez un parcours</h2>
          <p class="sommaire-intro">
            Chaque parcours commente uniquement les écrans utiles à un module, en quelques minutes
            et sans rien modifier à vos données.
          </p>
        </div>
        <q-btn flat round dense icon="close" aria-label="Fermer le sommaire" @click="fermer" />
      </q-card-section>
      <q-separator />
      <q-list separator class="sommaire-list">
        <q-item
          v-for="scenario in scenarios"
          :key="scenario.id"
          clickable
          v-close-popup
          @click="choisir(scenario.id)"
        >
          <q-item-section avatar>
            <q-avatar color="green-1" text-color="primary" :icon="scenario.icone" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold">{{ scenario.titre }}</q-item-label>
            <q-item-label caption>{{ scenario.description }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge outline color="primary" :label="scenario.duree" />
          </q-item-section>
          <q-item-section side>
            <q-icon name="arrow_forward" color="grey-6" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { SCENARIOS_VISITE, demarrerVisite } from 'src/composables/visiteGuidee';

defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [valeur: boolean] }>();

const scenarios = SCENARIOS_VISITE;

function onUpdate(valeur: boolean) {
  emit('update:modelValue', valeur);
}

function fermer() {
  emit('update:modelValue', false);
}

function choisir(scenarioId: string) {
  emit('update:modelValue', false);
  demarrerVisite(scenarioId);
}
</script>

<style scoped lang="scss">
.sommaire-card {
  width: min(560px, calc(100vw - 24px));
  max-height: min(680px, calc(100vh - 30px));
  border-radius: var(--radius-md, 14px);
  overflow: hidden;
}

.sommaire-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 22px 16px;
}

.sommaire-heading .eyebrow {
  margin: 0 0 4px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #1b5e3b;
}

.sommaire-heading h2 {
  margin: 0 0 6px;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: #262626;
}

.sommaire-intro {
  margin: 0;
  color: var(--text-soft, #64748b);
  line-height: 1.5;
  font-size: 0.875rem;
}

.sommaire-list {
  max-height: min(540px, calc(100vh - 170px));
  overflow-y: auto;
}
</style>
