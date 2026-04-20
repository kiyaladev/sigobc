from pathlib import Path
import re

root = Path(r'C:\Users\Coumbassa Stephane\Documents\GitHub\declarapp\frontend\src')

# ----- Utilisateurs dialog polish -----
util = root / 'pages' / 'UtilisateursPage.vue'
text = util.read_text(encoding='utf-8')
text = text.replace(
'''      <q-dialog v-model="dialogVisible" persistent>
        <q-card class="dialog-card" style="min-width: 700px">
          <q-card-section class="accent-left">
            <div class="text-h6">{{ isEditing ? 'Modifier' : 'Nouvel' }} Utilisateur</div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">''',
'''      <q-dialog v-model="dialogVisible" persistent>
        <q-card class="dialog-card" style="min-width: 700px">
          <q-card-section class="dialog-card-header">
            <div class="row items-center justify-between q-col-gutter-md">
              <div class="col">
                <div class="text-h6">{{ isEditing ? 'Modifier' : 'Nouvel' }} Utilisateur</div>
                <div class="text-caption text-grey-7 q-mt-xs">
                  Configurez les accès et les informations du compte utilisateur.
                </div>
              </div>
              <div class="col-auto dialog-card-chips">
                <q-chip dense outline color="primary" icon="manage_accounts">Administration</q-chip>
                <q-chip dense outline color="secondary" icon="shield">Accès sécurisé</q-chip>
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">''')

for old, new in [
    ('v-model="form.username"\n                  filled', 'v-model="form.username"\n                  outlined\n                  dense'),
    ('v-model="form.password"\n                  filled', 'v-model="form.password"\n                  outlined\n                  dense'),
    ('v-model="form.nom"\n                  filled', 'v-model="form.nom"\n                  outlined\n                  dense'),
    ('v-model="form.prenom"\n                  filled', 'v-model="form.prenom"\n                  outlined\n                  dense'),
    ('v-model="form.email"\n                  filled', 'v-model="form.email"\n                  outlined\n                  dense'),
    ('v-model="form.role"\n                  filled', 'v-model="form.role"\n                  outlined\n                  dense'),
    ('v-model="form.mairieId"\n                  filled', 'v-model="form.mairieId"\n                  outlined\n                  dense'),
]:
    text = text.replace(old, new)

text = text.replace(
'''        <q-card-actions align="right">
          <q-btn flat label="Annuler" color="grey" v-close-popup />
          <q-btn label="Enregistrer" color="primary" @click="onSubmit" :loading="saving" />
        </q-card-actions>''',
'''        <q-card-actions align="right" class="dialog-card-actions">
          <q-btn flat label="Annuler" color="grey-7" v-close-popup />
          <q-btn
            label="Enregistrer"
            color="primary"
            unelevated
            @click="onSubmit"
            :loading="saving"
          />
        </q-card-actions>''')

text = text.replace(
'''.dialog-card {
  border-radius: 24px;
}''',
'''.dialog-card {
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
}''')
util.write_text(text, encoding='utf-8')

# ----- Parametrage dialog card class -----
param = root / 'pages' / 'admin' / 'ParametragePage.vue'
text = param.read_text(encoding='utf-8')
text = text.replace('<q-card style="min-width: 400px">', '<q-card class="dialog-card" style="min-width: 400px">')
text = text.replace(
'''.parametrage-page :deep(.q-table thead tr) {
  background: linear-gradient(180deg, #f8fafc 0%, #eef4f8 100%);
}''',
'''.parametrage-page :deep(.q-table thead tr) {
  background: linear-gradient(180deg, #f8fafc 0%, #eef4f8 100%);
}

.dialog-card {
  border-radius: 24px;
  overflow: hidden;
}''')
param.write_text(text, encoding='utf-8')

# ----- MainLayout admin badges -----
layout = root / 'layouts' / 'MainLayout.vue'
text = layout.read_text(encoding='utf-8')
replacements = {
'''              <q-item-section>
                <q-item-label>Utilisateurs</q-item-label>
              </q-item-section>''': '''              <q-item-section>
                <q-item-label>Utilisateurs</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge class="admin-nav-badge" color="primary" text-color="white">Admin</q-badge>
              </q-item-section>''',
'''              <q-item-section>
                <q-item-label>Statistiques Globales</q-item-label>
              </q-item-section>''': '''              <q-item-section>
                <q-item-label>Statistiques Globales</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge class="admin-nav-badge" color="teal" text-color="white">Vue</q-badge>
              </q-item-section>''',
'''              <q-item-section>
                <q-item-label>Seeders (Test)</q-item-label>
              </q-item-section>''': '''              <q-item-section>
                <q-item-label>Seeders (Test)</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge class="admin-nav-badge" color="orange" text-color="white">DB</q-badge>
              </q-item-section>''',
'''              <q-item-section>
                <q-item-label>Sauvegarde</q-item-label>
              </q-item-section>''': '''              <q-item-section>
                <q-item-label>Sauvegarde</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge class="admin-nav-badge" color="positive" text-color="white">Safe</q-badge>
              </q-item-section>''',
'''              <q-item-section>
                <q-item-label>Paramétrage</q-item-label>
              </q-item-section>''': '''              <q-item-section>
                <q-item-label>Paramétrage</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge class="admin-nav-badge" color="secondary" text-color="white">Config</q-badge>
              </q-item-section>''',
}
for old, new in replacements.items():
    text = text.replace(old, new)
text = text.replace(
'''.accordion-header {
  border-radius: 14px;
  padding: 10px 12px;

  &:hover {
    background: rgba(15, 23, 42, 0.04);
  }
}''',
'''.accordion-header {
  border-radius: 14px;
  padding: 10px 12px;

  &:hover {
    background: rgba(15, 23, 42, 0.04);
  }
}

.admin-nav-badge {
  min-width: 52px;
  justify-content: center;
  border-radius: 999px;
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .admin-nav-badge {
    min-width: 44px;
    font-size: 0.62rem;
  }
}''')
layout.write_text(text, encoding='utf-8')

print('patched admin finish')
