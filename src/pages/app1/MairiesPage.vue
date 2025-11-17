<template>
  <q-page class="q-pa-md">
    <div class="row q-mb-md justify-between items-center">
      <div class="text-h5">Gestion des Mairies</div>
      <q-btn color="primary" icon="add" label="Nouvelle Mairie" @click="openDialog()" />
    </div>

    <!-- Recherche et filtres -->
    <q-card class="q-mb-md">
      <q-card-section>
        <q-input v-model="search" filled placeholder="Rechercher une mairie..." dense clearable>
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-card-section>
    </q-card>

    <!-- Table des mairies -->
    <q-card>
      <q-table
        :rows="filteredMairies"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        binary-state-sort
      >
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round dense icon="edit" color="primary" @click="openDialog(props.row)">
              <q-tooltip>Modifier</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Supprimer</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog de création/modification -->
    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="min-width: 600px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">{{ isEditing ? 'Modifier' : 'Nouvelle' }} Mairie</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.nom"
                  filled
                  label="Nom *"
                  lazy-rules
                  :rules="[(val) => !!val || 'Le nom est requis']"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.code"
                  filled
                  label="Code *"
                  lazy-rules
                  :rules="[(val) => !!val || 'Le code est requis']"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="form.adresse"
                  filled
                  label="Adresse *"
                  lazy-rules
                  :rules="[(val) => !!val || 'L\'adresse est requise']"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.ville"
                  filled
                  label="Ville *"
                  lazy-rules
                  :rules="[(val) => !!val || 'La ville est requise']"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.codePostal"
                  filled
                  label="Code Postal *"
                  lazy-rules
                  :rules="[(val) => !!val || 'Le code postal est requis']"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input v-model="form.telephone" filled label="Téléphone" />
              </div>

              <div class="col-12 col-sm-6">
                <q-input v-model="form.email" filled label="Email" type="email" />
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Annuler" color="grey" v-close-popup />
          <q-btn label="Enregistrer" color="primary" @click="onSubmit" :loading="saving" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { db, type Mairie } from 'src/database/db';

const $q = useQuasar();

const mairies = ref<Mairie[]>([]);
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);
const search = ref('');

const form = ref<Partial<Mairie>>({
  nom: '',
  code: '',
  adresse: '',
  ville: '',
  codePostal: '',
  telephone: '',
  email: '',
});

const columns = [
  { name: 'code', label: 'Code', field: 'code', align: 'left' as const, sortable: true },
  { name: 'nom', label: 'Nom', field: 'nom', align: 'left' as const, sortable: true },
  { name: 'ville', label: 'Ville', field: 'ville', align: 'left' as const, sortable: true },
  { name: 'telephone', label: 'Téléphone', field: 'telephone', align: 'left' as const },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

const filteredMairies = computed(() => {
  if (!search.value) return mairies.value;
  const searchLower = search.value.toLowerCase();
  return mairies.value.filter(
    (m) =>
      m.nom.toLowerCase().includes(searchLower) ||
      m.code.toLowerCase().includes(searchLower) ||
      m.ville.toLowerCase().includes(searchLower),
  );
});

async function loadMairies() {
  loading.value = true;
  try {
    mairies.value = await db.mairies.toArray();
  } catch (error) {
    console.error('Erreur lors du chargement des mairies:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  } finally {
    loading.value = false;
  }
}

function openDialog(mairie?: Mairie) {
  isEditing.value = !!mairie;
  if (mairie) {
    form.value = { ...mairie };
  } else {
    form.value = {
      nom: '',
      code: '',
      adresse: '',
      ville: '',
      codePostal: '',
      telephone: '',
      email: '',
    };
  }
  dialogVisible.value = true;
}

async function onSubmit() {
  saving.value = true;
  try {
    const now = new Date();
    if (isEditing.value && form.value.id) {
      await db.mairies.update(form.value.id, {
        ...form.value,
        updatedAt: now,
      });
      $q.notify({ type: 'positive', message: 'Mairie modifiée avec succès' });
    } else {
      await db.mairies.add({
        ...form.value,
        createdAt: now,
        updatedAt: now,
      } as Mairie);
      $q.notify({ type: 'positive', message: 'Mairie créée avec succès' });
    }
    dialogVisible.value = false;
    await loadMairies();
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement" });
  } finally {
    saving.value = false;
  }
}

function confirmDelete(mairie: Mairie) {
  $q.dialog({
    title: 'Confirmation',
    message: `Voulez-vous vraiment supprimer la mairie "${mairie.nom}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await db.mairies.delete(mairie.id);
        $q.notify({ type: 'positive', message: 'Mairie supprimée avec succès' });
        await loadMairies();
      } catch (error) {
        console.error('Erreur:', error);
        $q.notify({ type: 'negative', message: 'Erreur lors de la suppression' });
      }
    })();
  });
}

onMounted(() => {
  void loadMairies();
});
</script>
