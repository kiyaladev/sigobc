from pathlib import Path

p = Path(r'frontend/src/pages/app6/MandatsRecettePage.vue')
text = p.read_text(encoding='utf-8', errors='ignore')
marker = "watch(\n  () => formData.value.exercice,"
idx = text.find(marker)
if idx == -1:
    marker = "watch(\r\n  () => formData.value.exercice,"
    idx = text.find(marker)
if idx == -1:
    raise SystemExit('marker not found')

prefix = text[:idx]
suffix = '''watch(
  () => formData.value.exercice,
  async (newExercice) => {
    if (newExercice && !editingId.value) {
      formData.value.numeroMandat = await getNextMandatNumber(newExercice);
    }
  },
);

const isDev = import.meta.env.VITE_ENV === 'development';

async function createFakeMandat() {
  try {
    const currentYear = new Date().getFullYear();
    const taxe = taxes.value[Math.floor(Math.random() * taxes.value.length)];
    if (!taxe) {
      $q.notify({ type: 'warning', message: 'Aucune taxe disponible' });
      return;
    }

    const nextNum = await getNextMandatNumber(currentYear);
    const now = new Date();
    const montant = Math.floor(Math.random() * 5000000) + 100000;

    await db.mandatsRecette.add({
      numeroMandat: nextNum,
      dateMandat: now,
      exercice: currentYear,
      taxeId: taxe.id!,
      partieVersante: `Contribuable Test ${nextNum}`,
      objet: `Objet test mandat recette ${nextNum}`,
      montant,
      modePaiement: 'virement',
      statut: 'paye',
      mairieId: DEFAULT_MAIRIE_ID,
      personnelId: 1,
      createdAt: now,
      updatedAt: now,
    } as MandatRecette);

    $q.notify({ type: 'positive', message: `Mandat recette fake #${nextNum} créé` });
    await loadData();
  } catch (error) {
    console.error('Erreur:', error);
    $q.notify({ type: 'negative', message: 'Erreur création fake' });
  }
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.mandats-recette-page {
  max-width: 1400px;
  margin: 0 auto;
}

.main-card {
  border-radius: 24px;
}

.compact-toolbar {
  margin-bottom: 14px;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.compact-toolbar-top {
  gap: 10px 0;
}

.compact-search :deep(.q-field__control) {
  min-height: 38px;
}

.compact-toolbar-summary {
  display: flex;
  align-items: center;
}

.compact-toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.compact-toolbar-actions :deep(.q-btn) {
  min-height: 36px;
  border-radius: 12px;
}

.compact-filter-panel {
  width: min(760px, 88vw);
  padding: 14px;
}

.compact-filter-panel-title {
  margin-bottom: 10px;
  color: #334155;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>
'''

p.write_text(prefix + suffix, encoding='utf-8')
print('repaired')
