<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
  >
    <q-card style="min-width: 700px">
      <q-card-section class="accent-left">
        <div class="text-h6">{{ isEditing ? 'Modifier' : 'Nouvelle' }} Déclaration</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-sm">
            <!-- Exercice -->
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="localForm.exercice"
                filled
                dense
                type="number"
                label="Exercice (Année) *"
                :rules="[(val) => !!val || 'Requis']"
              />
            </div>

            <!-- Article N° (Taxe) -->
            <div class="col-12">
              <q-select
                v-model="localForm.taxeId"
                filled
                dense
                :options="filteredTaxeOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                use-input
                input-debounce="0"
                label="Article N° (Taxe) *"
                :rules="[(val) => !!val || 'Requis']"
                @filter="filterTaxe"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">Aucun résultat</q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- Numéro de la pièce -->
            <div class="col-12 col-sm-6">
              <q-input
                v-model="localForm.numeroPiece"
                filled
                dense
                label="Numéro de la pièce *"
                :rules="[(val) => !!val || 'Requis']"
              />
            </div>

            <!-- Nom de la partie versante -->
            <div class="col-12 col-sm-6">
              <q-input
                v-model="localForm.nomPartieVersante"
                filled
                dense
                label="Nom de la partie versante *"
                :rules="[(val) => !!val || 'Requis']"
              />
            </div>

            <!-- Adresse -->
            <div class="col-12">
              <q-input
                v-model="localForm.adresse"
                filled
                dense
                label="Adresse *"
                :rules="[(val) => !!val || 'Requis']"
              />
            </div>

            <!-- Date encaissement -->
            <div class="col-12 col-sm-6">
              <q-input
                v-model="dateStr"
                filled
                dense
                type="date"
                label="Date encaissement *"
                :rules="[(val) => !!val || 'Requis']"
              />
            </div>

            <!-- N° Livre -->
            <div class="col-12 col-sm-6">
              <q-input
                v-model="localForm.numeroLivre"
                filled
                dense
                label="N° Livre *"
                :rules="[(val) => !!val || 'Requis']"
              />
            </div>

            <!-- N° Encaissement -->
            <div class="col-12 col-sm-6">
              <q-input
                v-model="localForm.numeroEncaissement"
                filled
                dense
                label="N° Encaissement *"
                :rules="[(val) => !!val || 'Requis']"
              />
            </div>

            <!-- Montant de la recette -->
            <div class="col-12 col-sm-6">
              <q-input
                v-model.number="localForm.montantRecette"
                filled
                dense
                type="number"
                label="Montant de la recette *"
                :rules="[(val) => val > 0 || 'Requis']"
                suffix="FCFA"
              />
            </div>

            <!-- Bordereau -->
            <div class="col-12 col-sm-6">
              <q-select
                v-model="localForm.bordereauId"
                filled
                dense
                :options="bordereauOptions"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                label="Bordereau *"
                :rules="[(val) => !!val || 'Requis']"
                hint="Sélectionnez un bordereau ouvert"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      Aucun bordereau ouvert disponible
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- Statut -->
            <div class="col-12 col-sm-6">
              <q-select
                v-model="localForm.statut"
                filled
                dense
                :options="statutOptions"
                label="Statut *"
                :rules="[(val) => !!val || 'Requis']"
              />
            </div>

            <!-- Observations -->
            <div class="col-12">
              <q-input
                v-model="localForm.observations"
                filled
                dense
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
import { date } from 'quasar';
import { DEFAULT_MAIRIE_ID } from 'src/database/db';
import type { Declaration } from 'src/database/db';

interface Props {
  modelValue: boolean;
  declaration?: Declaration | null;
  isEditing?: boolean;
  nextNumeroPiece?: number;
  taxeOptions: Array<{ label: string; value: number }>;
  bordereauOptions: Array<{ label: string; value: number }>;
  statutOptions: string[];
  readonly?: boolean;
  loading?: boolean;
  defaultAdresse?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  readonly: false,
  loading: false,
  defaultAdresse: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  submit: [form: Partial<Declaration>, dateStr: string];
}>();

const localForm = ref<Partial<Declaration>>({});
const dateStr = ref('');
const filteredTaxeOptions = ref(props.taxeOptions);

watch(
  () => props.taxeOptions,
  (newOptions) => {
    filteredTaxeOptions.value = newOptions;
  },
);

function filterTaxe(val: string, update: (callback: () => void) => void) {
  if (val === '') {
    update(() => {
      filteredTaxeOptions.value = props.taxeOptions;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    filteredTaxeOptions.value = props.taxeOptions.filter((v) =>
      v.label.toLowerCase().includes(needle),
    );
  });
}

// Initialiser le formulaire quand la dialog s'ouvre
watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      if (props.declaration) {
        localForm.value = { ...props.declaration };
        dateStr.value = props.declaration.dateEncaissement
          ? date.formatDate(props.declaration.dateEncaissement, 'YYYY-MM-DD')
          : '';
      } else {
        // Auto-assigner la Mairie d'Azaguié
        localForm.value = {
          mairieId: DEFAULT_MAIRIE_ID,
          exercice: new Date().getFullYear(),
          taxeId: 0,
          numeroPiece: String(props.nextNumeroPiece || 1),
          nomPartieVersante: 'Régisseur',
          adresse: props.defaultAdresse,
          dateEncaissement: new Date(),
          numeroLivre: 'T31T',
          numeroEncaissement: '',
          montantRecette: 0,
          statut: 'validee' as const,
          observations: '',
        };
        dateStr.value = date.formatDate(new Date(), 'YYYY-MM-DD');
      }
    }
  },
);

function handleSubmit() {
  emit('submit', localForm.value, dateStr.value);
}
</script>
