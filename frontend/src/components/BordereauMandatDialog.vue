<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
  >
    <q-card style="min-width: 600px">
      <q-card-section class="accent-left">
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

            <!-- Total Précédent -->
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="localForm.totalPrecedent"
                filled
                type="number"
                label="Total Précédent"
                hint="Montant total du bordereau précédent"
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
                :model-value="
                  localForm.dateEmission
                    ? quasarDate.formatDate(localForm.dateEmission, 'YYYY-MM-DD')
                    : ''
                "
                @update:model-value="
                  (val: string | number | null) => {
                    if (val && typeof val === 'string') {
                      localForm.dateEmission = new Date(val);
                    } else {
                      delete localForm.dateEmission;
                    }
                  }
                "
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
        <q-btn flat label="Annuler" color="grey-7" @click="$emit('update:modelValue', false)" />
        <q-btn label="Enregistrer" color="primary" @click="handleSubmit" :loading="loading" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { DEFAULT_MAIRIE_ID } from 'src/database/db';
import type { BordereauMandat } from 'src/database/db';
import { date as quasarDate } from 'quasar';

interface Props {
  modelValue: boolean;
  bordereau?: BordereauMandat | null;
  isEditing?: boolean;
  nextNumero?: number;
  statutOptions: string[];
  readonly?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  readonly: false,
  loading: false,
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
        // Auto-assigner la Mairie de Vavoua
        localForm.value = {
          numero: nextNum,
          exercice: currentYear,
          mairieId: DEFAULT_MAIRIE_ID,
          montantTotal: 0,
          totalPrecedent: 0,
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
