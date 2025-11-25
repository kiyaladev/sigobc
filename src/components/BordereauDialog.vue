<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
  >
    <q-card style="min-width: 600px">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">{{ isEditing ? 'Modifier' : 'Nouveau' }} Bordereau</div>
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

            <!-- Année -->
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="localForm.annee"
                filled
                type="number"
                label="Année *"
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

            <!-- Nombre de Déclarations (readonly) -->
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="localForm.nombreDeclarations"
                filled
                type="number"
                label="Nombre de Déclarations"
                readonly
                hint="Calculé automatiquement"
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
        <q-btn label="Enregistrer" color="primary" @click="handleSubmit" :loading="loading" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { BordereauRecette } from 'src/database/db';

interface Props {
  modelValue: boolean;
  bordereau?: BordereauRecette | null;
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
  submit: [form: Partial<BordereauRecette>];
}>();

const localForm = ref<Partial<BordereauRecette>>({});
const localNumeroInput = ref(1);

// Initialiser le formulaire quand la dialog s'ouvre
watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      if (props.bordereau) {
        localForm.value = { ...props.bordereau };
        localNumeroInput.value = props.bordereau.numero;
      } else {
        const currentYear = new Date().getFullYear();
        const nextNum = props.nextNumero || 1;
        // Première mairie par défaut
        const firstMairieId =
          (props.mairieOptions.length > 0
            ? props.mairieOptions[0]?.value
            : props.defaultMairieId) || 0;
        localForm.value = {
          numero: nextNum,
          annee: currentYear,
          mairieId: firstMairieId,
          montantTotal: 0,
          nombreDeclarations: 0,
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
