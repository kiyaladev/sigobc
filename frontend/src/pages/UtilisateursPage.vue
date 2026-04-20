<template>
  <q-page class="utilisateurs-page q-pa-md">
    <PageHeader
      title="Gestion des Utilisateurs"
      subtitle="Administration des comptes utilisateurs"
      icon="manage_accounts"
    >
      <template #actions>
        <q-btn color="primary" icon="add" label="Nouvel Utilisateur" @click="openDialog()" />
      </template>
      <template #stats>
        <div v-for="(stat, index) in headerStats" :key="index" class="col-12 col-sm-6 col-lg-3">
          <q-card flat class="listing-stat-card overview-stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="col">
                <div class="overview-stat-label">{{ stat.label }}</div>
                <div class="overview-stat-value">{{ stat.value }}</div>
                <div v-if="stat.helper" class="overview-stat-helper">{{ stat.helper }}</div>
              </div>
              <q-icon :name="stat.icon" size="30px" :color="stat.color" />
            </q-card-section>
          </q-card>
        </div>
      </template>
    </PageHeader>

    <!-- Recherche et filtres -->
    <q-card flat bordered class="listing-filter-card compact-toolbar q-mb-md">
      <q-card-section class="q-pa-md">
        <div class="listing-filter-title">
          <q-icon name="tune" size="18px" />
          <span>Filtres</span>
        </div>
        <div class="listing-filter-grid row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="search"
              outlined
              placeholder="Rechercher un utilisateur..."
              dense
              clearable
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filterRole"
              outlined
              dense
              :options="roleOptions"
              label="Rôle"
              clearable
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filterActif"
              outlined
              dense
              :options="actifOptions"
              label="Statut"
              clearable
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Table des utilisateurs -->
    <q-card class="main-card">
      <q-card-section class="q-pb-none">
        <div class="row justify-end">
          <q-btn
            flat
            color="primary"
            icon="download"
            label="Exporter CSV"
            @click="exportCsv"
            no-caps
          />
        </div>
      </q-card-section>
      <q-table
        :rows="filteredUtilisateurs"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        binary-state-sort
      >
        <template v-slot:body-cell-role="props">
          <q-td :props="props">
            <q-chip :color="'primary'" text-color="white" size="sm">
              {{ getRoleLabel(props.row.role) }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-actif="props">
          <q-td :props="props">
            <q-chip :color="props.row.actif ? 'primary' : 'grey'" text-color="white" size="sm">
              {{ props.row.actif ? 'Actif' : 'Inactif' }}
            </q-chip>
          </q-td>
        </template>

        <template v-slot:body-cell-derniereConnexion="props">
          <q-td :props="props">
            {{ formatDate(props.row.derniereConnexion) }}
          </q-td>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round dense icon="edit" color="grey-7" @click="openDialog(props.row)">
              <q-tooltip>Modifier</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="vpn_key" color="grey-7" @click="resetPassword(props.row)">
              <q-tooltip>Réinitialiser mot de passe</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="delete"
              color="negative"
              @click="confirmDelete(props.row)"
              :disable="props.row.id === authStore.currentUser?.id"
            >
              <q-tooltip>Supprimer</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog de création/modification -->
    <q-dialog v-model="dialogVisible" persistent>
      <q-card class="dialog-card" style="width: min(700px, 96vw); max-width: 96vw">
        <q-card-section class="accent-left">
          <div class="text-h6">{{ isEditing ? 'Modifier' : 'Nouvel' }} Utilisateur</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.username"
                  outlined
                  dense
                  label="Nom d'utilisateur *"
                  lazy-rules
                  :rules="[(val) => !!val || 'Le nom d\'utilisateur est requis']"
                  :disable="isEditing"
                />
              </div>

              <div class="col-12 col-sm-6" v-if="!isEditing">
                <q-input
                  v-model="form.password"
                  outlined
                  dense
                  type="password"
                  label="Mot de passe *"
                  lazy-rules
                  :rules="[
                    (val) => !!val || 'Le mot de passe est requis',
                    (val) => val.length >= 6 || 'Au moins 6 caractères',
                  ]"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.nom"
                  outlined
                  dense
                  label="Nom *"
                  lazy-rules
                  :rules="[(val) => !!val || 'Le nom est requis']"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.prenom"
                  outlined
                  dense
                  label="Prénom *"
                  lazy-rules
                  :rules="[(val) => !!val || 'Le prénom est requis']"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="form.email"
                  outlined
                  dense
                  type="email"
                  label="Email *"
                  lazy-rules
                  :rules="[
                    (val) => !!val || 'L\'email est requis',
                    (val) => /.+@.+\..+/.test(val) || 'Email invalide',
                  ]"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.role"
                  outlined
                  dense
                  :options="roleOptions"
                  label="Rôle *"
                  :rules="[(val) => !!val || 'Le rôle est requis']"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.mairieId"
                  outlined
                  dense
                  :options="mairieOptions"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  label="Mairie"
                  clearable
                />
              </div>

              <div class="col-12">
                <q-toggle v-model="form.actif" label="Utilisateur actif" color="green" />
              </div>

              <div class="col-12">
                <q-banner rounded>
                  <template v-slot:avatar>
                    <q-icon name="info" />
                  </template>
                  <div class="text-caption">
                    <strong>Admin :</strong> Accès complet<br />
                    <strong>Gestionnaire :</strong> Gestion des données<br />
                    <strong>Opérateur :</strong> Saisie uniquement
                  </div>
                </q-banner>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="dialog-card-actions">
          <q-btn flat label="Annuler" color="grey-7" v-close-popup />
          <q-btn
            label="Enregistrer"
            color="primary"
            unelevated
            @click="onSubmit"
            :loading="saving"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar, date } from 'quasar';
import { db, type Utilisateur, type Mairie } from 'src/database/db';
import { useAuthStore } from 'src/stores/auth-store';
import PageHeader from 'src/components/PageHeader.vue';
import { exportToCsv } from 'src/utils/exportCsv';

const $q = useQuasar();
const authStore = useAuthStore();

const utilisateurs = ref<Utilisateur[]>([]);
const mairies = ref<Mairie[]>([]);
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const isEditing = ref(false);
const search = ref('');
const filterRole = ref('');
const filterActif = ref('');

const roleOptions = ['admin', 'gestionnaire', 'operateur'];
const actifOptions = ['Actif', 'Inactif'];

const form = ref<Partial<Utilisateur>>({
  username: '',
  password: '',
  nom: '',
  prenom: '',
  email: '',
  role: 'operateur',
  actif: true,
});

const columns = [
  {
    name: 'username',
    label: 'Username',
    field: 'username',
    align: 'left' as const,
    sortable: true,
  },
  { name: 'nom', label: 'Nom', field: 'nom', align: 'left' as const, sortable: true },
  { name: 'prenom', label: 'Prénom', field: 'prenom', align: 'left' as const, sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left' as const },
  { name: 'role', label: 'Rôle', field: 'role', align: 'center' as const, sortable: true },
  { name: 'actif', label: 'Statut', field: 'actif', align: 'center' as const, sortable: true },
  {
    name: 'derniereConnexion',
    label: 'Dernière Connexion',
    field: 'derniereConnexion',
    align: 'left' as const,
  },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

const mairieOptions = computed(() => mairies.value.map((m) => ({ label: m.nom, value: m.id! })));

const filteredUtilisateurs = computed(() => {
  let result = utilisateurs.value;

  if (filterRole.value) {
    result = result.filter((u) => u.role === filterRole.value);
  }

  if (filterActif.value) {
    const isActif = filterActif.value === 'Actif';
    result = result.filter((u) => u.actif === isActif);
  }

  if (search.value) {
    const searchLower = search.value.toLowerCase();
    result = result.filter(
      (u) =>
        u.username.toLowerCase().includes(searchLower) ||
        u.nom.toLowerCase().includes(searchLower) ||
        u.prenom.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower),
    );
  }

  return result;
});

const headerStats = computed(() => {
  const totalActifs = utilisateurs.value.filter((u) => u.actif).length;
  const totalAdmins = utilisateurs.value.filter((u) => u.role === 'admin').length;

  return [
    {
      label: 'Utilisateurs visibles',
      value: filteredUtilisateurs.value.length,
      helper: `Total : ${utilisateurs.value.length}`,
      icon: 'dataset',
      color: 'primary',
    },
    {
      label: 'Administrateurs',
      value: totalAdmins,
      helper: 'Accès complet à la plateforme',
      icon: 'admin_panel_settings',
      color: 'secondary',
    },
    {
      label: 'Comptes actifs',
      value: totalActifs,
      helper: `Inactifs : ${utilisateurs.value.length - totalActifs}`,
      icon: 'task_alt',
      color: 'teal',
    },
    {
      label: 'Mairies',
      value: mairies.value.length,
      helper: 'Référentiel disponible',
      icon: 'location_city',
      color: 'positive',
    },
  ];
});

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Administrateur',
    gestionnaire: 'Gestionnaire',
    operateur: 'Opérateur',
  };
  return labels[role] || role;
}

function exportCsv() {
  exportToCsv(filteredUtilisateurs.value as Record<string, unknown>[], columns, 'utilisateurs');
}

//

function formatDate(dateValue: Date | undefined): string {
  if (!dateValue) return 'Jamais';
  return date.formatDate(dateValue, 'DD/MM/YYYY HH:mm');
}

async function loadData() {
  loading.value = true;
  try {
    [utilisateurs.value, mairies.value] = await Promise.all([
      db.utilisateurs.toArray(),
      db.mairies.toArray(),
    ]);
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    $q.notify({ type: 'negative', message: 'Erreur lors du chargement' });
  } finally {
    loading.value = false;
  }
}

function openDialog(utilisateur?: Utilisateur) {
  isEditing.value = !!utilisateur;
  if (utilisateur) {
    form.value = { ...utilisateur };
    delete form.value.password; // Ne pas afficher le mot de passe
  } else {
    form.value = {
      username: '',
      password: '',
      nom: '',
      prenom: '',
      email: '',
      role: 'operateur',
      actif: true,
    };
  }
  dialogVisible.value = true;
}

async function onSubmit() {
  saving.value = true;
  try {
    const now = new Date();
    if (isEditing.value && form.value.id) {
      const updateData: Partial<Utilisateur> = { ...form.value };
      delete updateData.password; // Ne pas mettre à jour le mot de passe lors de l'édition
      updateData.updatedAt = now;

      await db.utilisateurs.update(form.value.id, updateData);
      $q.notify({ type: 'positive', message: 'Utilisateur modifié avec succès' });
    } else {
      const payload: Omit<Utilisateur, 'id'> = {
        username: form.value.username!,
        password: form.value.password!,
        nom: form.value.nom!,
        prenom: form.value.prenom!,
        email: form.value.email!,
        role: form.value.role || 'operateur',
        actif: form.value.actif ?? true,
        createdAt: now,
        updatedAt: now,
      };
      if (form.value.mairieId != null) {
        payload.mairieId = form.value.mairieId;
      }
      if (form.value.derniereConnexion != null) {
        payload.derniereConnexion = form.value.derniereConnexion;
      }
      await db.utilisateurs.add(payload);
      $q.notify({ type: 'positive', message: 'Utilisateur créé avec succès' });
    }
    dialogVisible.value = false;
    await loadData();
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement" });
  } finally {
    saving.value = false;
  }
}

function resetPassword(utilisateur: Utilisateur) {
  $q.dialog({
    title: 'Réinitialiser le mot de passe',
    message: `Entrez le nouveau mot de passe pour "${utilisateur.username}" :`,
    prompt: {
      model: '',
      type: 'password',
    },
    cancel: true,
    persistent: true,
  }).onOk((newPassword: string) => {
    void (async () => {
      if (newPassword.length < 6) {
        $q.notify({
          type: 'negative',
          message: 'Le mot de passe doit contenir au moins 6 caractères',
        });
        return;
      }

      try {
        await db.utilisateurs.update(utilisateur.id, {
          password: newPassword,
          updatedAt: new Date(),
        });
        $q.notify({
          type: 'positive',
          message: 'Mot de passe réinitialisé avec succès',
        });
      } catch (error) {
        console.error('Erreur:', error);
        $q.notify({
          type: 'negative',
          message: 'Erreur lors de la réinitialisation',
        });
      }
    })();
  });
}

function confirmDelete(utilisateur: Utilisateur) {
  $q.dialog({
    title: 'Confirmation',
    message: `Voulez-vous vraiment supprimer l'utilisateur "${utilisateur.username}" ?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await db.utilisateurs.delete(utilisateur.id);
        $q.notify({ type: 'positive', message: 'Utilisateur supprimé avec succès' });
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
.utilisateurs-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 24px;
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.overview-stat-card {
  min-height: 112px;
}

.overview-stat-label {
  margin-bottom: 8px;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.overview-stat-value {
  color: #0f172a;
  font-size: clamp(1.05rem, 1.7vw, 1.45rem);
  font-weight: 800;
  line-height: 1.2;
}

.overview-stat-helper {
  margin-top: 6px;
  color: #64748b;
  font-size: 0.76rem;
  line-height: 1.35;
}

.compact-toolbar {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.compact-toolbar :deep(.q-card__section) {
  padding: 14px 16px;
}

.main-card :deep(.q-card__section.q-pb-none) {
  padding-bottom: 0;
}

.main-card :deep(.q-table) {
  border-radius: 18px;
  overflow: hidden;
}

.main-card :deep(.q-table thead tr) {
  background: linear-gradient(180deg, #f8fafc 0%, #eef4f8 100%);
}

.main-card :deep(.q-table tbody tr:nth-child(even)) {
  background: rgba(248, 250, 252, 0.72);
}

.main-card :deep(.q-table tbody tr:hover) {
  background: rgba(197, 168, 77, 0.08);
}

.dialog-card {
  border-radius: 24px;
  overflow: hidden;
}

.dialog-card-header {
  background: linear-gradient(135deg, rgba(27, 94, 59, 0.08), rgba(197, 168, 77, 0.12));
}

.dialog-card-chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.dialog-card-actions {
  padding: 0 24px 24px;
}

@media (max-width: 768px) {
  .dialog-card-chips {
    justify-content: flex-start;
  }
}
</style>
