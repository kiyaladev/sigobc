<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
  >
    <q-card style="min-width: 600px">
      <q-card-section class="bg-purple text-white">
        <div class="text-h6">{{ isEditing ? 'Modifier' : 'Nouveau' }} Bordereau de Mandats</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <!-- Numéro Bordereau -->
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="localNumeroInput"
                filled
                type="number"
                label="Numéro *"
                :rules="[(val) => val > 0 || 'Requis']"
                placeholder="1"
                hint="Numéro séquentiel du bordereau"
                @update:model-value="updateNumero"
              />
            </div>

            <!-- Exercice -->
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="localForm.exercice"
                filled
                type="number"
                label="Exercice *"
                :rules="[(val) => val >= 2000 || 'Requis']"
                hint="Année du bordereau"
              />
            </div>

            <!-- Mairie -->
            <div class="col-12 col-sm-6">
              <q-select
                v-model="localForm.mairieId"
                filled
                :options="mairieOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                label="Mairie *"
                :rules="[(val) => !!val || 'Requis']"
                :readonly="readonly"
              />
            </div>

            <!-- Statut -->
            <div class="col-12 col-sm-6">
              <q-select
                v-model="localForm.statut"
                filled
                :options="statutOptions"
                label="Statut *"
                :rules="[(val) => !!val || 'Requis']"
              />
            </div>

            <!-- Montant Total (readonly) -->
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="localForm.montantTotal"
                filled
                type="number"
                label="Montant Total"
                readonly
                suffix="FCFA"
                hint="Calculé automatiquement"
              />
            </div>

            <!-- Nombre de Mandats (readonly) -->
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="localForm.nombreMandats"
                filled
                type="number"
                label="Nombre de Mandats"
                readonly
                hint="Calculé automatiquement"
              />
            </div>

            <!-- Date d'émission -->
            <div class="col-12">
              <q-input
                :model-value="localForm.dateEmission ? quasarDate.formatDate(localForm.dateEmission, 'YYYY-MM-DD') : ''"
                @update:model-value="(val: string | number | null) => {
                  if (val && typeof val === 'string') {
                    localForm.dateEmission = new Date(val);
                  } else {
                    delete localForm.dateEmission;
                  }
                }"
                filled
                type="date"
                label="Date d'émission"
                hint="Date d'émission du bordereau (optionnel)"
              />
            </div>

            <!-- Observations -->
            <div class="col-12">
              <q-input
                v-model="localForm.observations"
                filled
                type="textarea"
                label="Observations"
                rows="3"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Annuler" color="grey" @click="$emit('update:modelValue', false)" />
        <q-btn label="Enregistrer" color="purple" @click="handleSubmit" :loading="loading" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { BordereauMandat } from 'src/database/db';
import { date as quasarDate } from 'quasar';

interface Props {
  modelValue: boolean;
  bordereau?: BordereauMandat | null;
  isEditing?: boolean;
  mairieOptions: Array<{ label: string; value: number }>;
  nextNumero?: number;
  statutOptions: string[];
  readonly?: boolean;
  loading?: boolean;
  defaultMairieId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  readonly: false,
  loading: false,
  defaultMairieId: 0,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  submit: [form: Partial<BordereauMandat>];
}>();

const localForm = ref<Partial<BordereauMandat>>({});
const localNumeroInput = ref(1);

// Initialiser le formulaire quand la dialog s'ouvre
watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      if (props.bordereau) {
        localForm.value = { ...props.bordereau };
        localNumeroInput.value = props.bordereau.numero;
        // Convertir la date si elle existe
        if (props.bordereau.dateEmission) {
          localForm.value.dateEmission = quasarDate.formatDate(
            props.bordereau.dateEmission,
            'YYYY-MM-DD',
          ) as unknown as Date;
        }
      } else {
        const currentYear = new Date().getFullYear();
        const nextNum = props.nextNumero || 1;
        const firstMairieId =
          (props.mairieOptions.length > 0
            ? props.mairieOptions[0]?.value
            : props.defaultMairieId) || 0;
        localForm.value = {
          numero: nextNum,
          exercice: currentYear,
          mairieId: firstMairieId,
          montantTotal: 0,
          nombreMandats: 0,
          statut: 'ouvert' as const,
          observations: '',
        };
        localNumeroInput.value = nextNum;
      }
    }
  },
);

function updateNumero() {
  localForm.value.numero = localNumeroInput.value || 1;
}

function handleSubmit() {
  emit('submit', localForm.value);
}
</script>
