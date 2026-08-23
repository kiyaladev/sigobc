<template>
  <q-page class="fournisseurs-page q-pa-md">
    <PageHeader
      title="Fournisseurs"
      subtitle="Gestion des fournisseurs et prestataires"
      icon="business"
    />

    <q-card class="main-card">
      <q-card-section>
        <div class="listing-toolbar row items-center justify-between q-mb-md">
          <div class="col-12 col-md-6 listing-search">
            <q-input
              v-model="filter"
              placeholder="Rechercher un fournisseur..."
              outlined
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto q-mt-sm q-mt-md-none listing-actions">
            <q-btn
              color="primary"
              icon="add"
              label="Nouveau Fournisseur"
              unelevated
              data-visite="personnel-nouveau-fournisseur"
              @click="openAddDialog"
            />
          </div>
        </div>

        <DataTable
          :rows="filteredFournisseurs"
          :columns="columns"
          :loading="loading"
          show-export-csv
          export-filename="fournisseurs"
          data-visite-edit="personnel-modifier-fournisseur"
          @edit="editFournisseur"
          @delete="deleteFournisseur"
        >
          <template v-slot:body-cell-actif="props">
            <q-td :props="props">
              <q-chip
                :color="props.row.actif ? 'positive' : 'grey'"
                text-color="white"
                size="sm"
                dense
              >
                {{ props.row.actif ? 'Actif' : 'Inactif' }}
              </q-chip>
            </q-td>
          </template>
        </DataTable>
      </q-card-section>
    </q-card>

    <!-- Dialog d'ajout/modification -->
    <q-dialog v-model="showDialog" persistent>
      <q-card class="dialog-card" style="width: min(700px, 96vw); max-width: 96vw">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            {{ editingId ? 'Modifier le fournisseur' : 'Nouveau fournisseur' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <q-form @submit="saveFournisseur" class="q-gutter-sm">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-8">
                <q-input
                  v-model="formData.nom"
                  label="Nom de l'entreprise ou du fournisseur *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Nom requis']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="formData.sigle" label="Sigle" outlined dense />
              </div>
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.compteContribuable"
                  label="Compte contribuable *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'Compte contribuable requis']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="formData.registreCommerce"
                  label="Registre du commerce"
                  outlined
                  dense
                />
              </div>
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-3">
                <q-input
                  v-model="formData.compteBancaire"
                  label="Numero de compte bancaire"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-3">
                <q-select
                  v-model="formData.banqueId"
                  :options="banqueOptions"
                  label="Banque"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                >
                  <template v-slot:prepend>
                    <q-icon name="account_balance" />
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="formData.telephone" label="N telephone" outlined dense />
              </div>
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-6">
                <q-input v-model="formData.email" label="Email" outlined dense type="email" />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="formData.siege" label="Siege" outlined dense />
              </div>
            </div>

            <q-toggle v-model="formData.actif" label="Actif" color="positive" />

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
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { db, type Fournisseur, type Banque, DEFAULT_MAIRIE_ID } from 'src/database/db';
import PageHeader from 'src/components/PageHeader.vue';
import DataTable from 'src/components/DataTable.vue';

const $q = useQuasar();
const loading = ref(false);
const filter = ref('');
const showDialog = ref(false);
const editingId = ref<number | null>(null);
const fournisseurs = ref<Fournisseur[]>([]);
const banques = ref<Banque[]>([]);

const banqueOptions = computed(() =>
  banques.value.map((b) => ({ label: `${b.code} - ${b.nom}`, value: b.id! })),
);

const formData = ref({
  nom: '',
  sigle: '',
  compteContribuable: '',
  registreCommerce: '',
  compteBancaire: '',
  banqueId: null as number | null,
  telephone: '',
  email: '',
  siege: '',
  actif: true,
  observations: '',
});

const columns = [
  { name: 'nom', label: 'Nom', align: 'left' as const, field: 'nom', sortable: true },
  { name: 'sigle', label: 'Sigle', align: 'left' as const, field: 'sigle', sortable: true },
  {
    name: 'compteContribuable',
    label: 'Compte Contribuable',
    align: 'left' as const,
    field: 'compteContribuable',
    sortable: true,
  },
  {
    name: 'registreCommerce',
    label: 'RCCM',
    align: 'left' as const,
    field: 'registreCommerce',
    sortable: true,
  },
  {
    name: 'compteBancaire',
    label: 'Compte Bancaire',
    align: 'left' as const,
    field: 'compteBancaire',
    sortable: true,
  },
  {
    name: 'telephone',
    label: 'Telephone',
    align: 'left' as const,
    field: 'telephone',
    sortable: true,
  },
  { name: 'actif', label: 'Statut', align: 'center' as const, field: 'actif', sortable: true },
  { name: 'actions', label: 'Actions', align: 'center' as const, field: 'id' },
];

const filteredFournisseurs = computed(() => {
  if (!filter.value) return fournisseurs.value;
  const search = filter.value.toLowerCase();
  return fournisseurs.value.filter(
    (f) =>
      f.nom.toLowerCase().includes(search) ||
      (f.sigle && f.sigle.toLowerCase().includes(search)) ||
      f.compteContribuable.toLowerCase().includes(search) ||
      (f.telephone && f.telephone.includes(search)) ||
      (f.email && f.email.toLowerCase().includes(search)),
  );
});

async function loadData() {
  loading.value = true;
  try {
    [fournisseurs.value, banques.value] = await Promise.all([
      db.fournisseurs.toArray(),
      db.banques.toArray(),
    ]);
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  editingId.value = null;
  formData.value = {
    nom: '',
    sigle: '',
    compteContribuable: '',
    registreCommerce: '',
    compteBancaire: '',
    banqueId: null,
    telephone: '',
    email: '',
    siege: '',
    actif: true,
    observations: '',
  };
}

function openAddDialog() {
  resetForm();
  showDialog.value = true;
}

function editFournisseur(row: Fournisseur) {
  editingId.value = row.id || null;
  formData.value = {
    nom: row.nom,
    sigle: row.sigle || '',
    compteContribuable: row.compteContribuable,
    registreCommerce: row.registreCommerce || '',
    compteBancaire: row.compteBancaire || '',
    banqueId: row.banqueId || null,
    telephone: row.telephone || '',
    email: row.email || '',
    siege: row.siege || '',
    actif: row.actif,
    observations: row.observations || '',
  };
  showDialog.value = true;
}

async function saveFournisseur() {
  try {
    const now = new Date();
    // `banqueId` est écrit tel quel, à null si vidé : sinon on ne pourrait plus
    // retirer la banque d'un fournisseur qui en avait une.
    const data = {
      ...formData.value,
      mairieId: DEFAULT_MAIRIE_ID,
    };

    if (editingId.value) {
      await db.fournisseurs.update(editingId.value, { ...data, updatedAt: now });
      $q.notify({ type: 'positive', message: 'Fournisseur modifie' });
    } else {
      await db.fournisseurs.add({ ...data, createdAt: now, updatedAt: now } as Omit<
        Fournisseur,
        'id'
      >);
      $q.notify({ type: 'positive', message: 'Fournisseur ajoute' });
    }

    showDialog.value = false;
    resetForm();
    await loadData();
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement" });
  }
}

function deleteFournisseur(row: Fournisseur) {
  $q.dialog({
    title: 'Confirmation',
    message: `Supprimer le fournisseur "${row.nom}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await db.fournisseurs.delete(row.id);
        $q.notify({ type: 'positive', message: 'Fournisseur supprime' });
        await loadData();
      } catch (error) {
        console.error('Erreur:', error);
        $q.notify({ type: 'negative', message: 'Erreur lors de la suppression' });
      }
    })();
  });
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.fournisseurs-page {
  max-width: 1400px;
  margin: 0 auto;
}
.main-card {
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
</style>
