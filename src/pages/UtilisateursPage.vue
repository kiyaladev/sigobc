<template>
  <q-page class="q-pa-md">
    <PageHeader
      title="Gestion des Utilisateurs"
      subtitle="Administration des comptes utilisateurs"
      icon="manage_accounts"
    >
      <template #actions>
        <q-btn color="primary" icon="add" label="Nouvel Utilisateur" @click="openDialog()" />
      </template>
    </PageHeader>

    <!-- Recherche et filtres -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <q-input
              v-model="search"
              filled
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
              filled
              dense
              :options="roleOptions"
              label="Rôle"
              clearable
            />
          </div>
          <div class="col-12 col-sm-3">
            <q-select
              v-model="filterActif"
              filled
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
    <q-card>
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
      <q-card style="min-width: 700px">
        <q-card-section class="accent-left">
          <div class="text-h6">{{ isEditing ? 'Modifier' : 'Nouvel' }} Utilisateur</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.username"
                  filled
                  label="Nom d'utilisateur *"
                  lazy-rules
                  :rules="[(val) => !!val || 'Le nom d\'utilisateur est requis']"
                  :disable="isEditing"
                />
              </div>

              <div class="col-12 col-sm-6" v-if="!isEditing">
                <q-input
                  v-model="form.password"
                  filled
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
                  filled
                  label="Nom *"
                  lazy-rules
                  :rules="[(val) => !!val || 'Le nom est requis']"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.prenom"
                  filled
                  label="Prénom *"
                  lazy-rules
                  :rules="[(val) => !!val || 'Le prénom est requis']"
                />
              </div>

              <div class="col-12">
                <q-input
                  v-model="form.email"
                  filled
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
                  filled
                  :options="roleOptions"
                  label="Rôle *"
                  :rules="[(val) => !!val || 'Le rôle est requis']"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.mairieId"
                  filled
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
import { useQuasar, date } from 'quasar';
import { db, type Utilisateur, type Mairie } from 'src/database/db';
import { useAuthStore } from 'src/stores/auth-store';
import PageHeader from 'src/components/PageHeader.vue';

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

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Administrateur',
    gestionnaire: 'Gestionnaire',
    operateur: 'Opérateur',
  };
  return labels[role] || role;
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
