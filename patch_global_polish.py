from pathlib import Path
import re

root = Path(r'C:\Users\Coumbassa Stephane\Documents\GitHub\declarapp\frontend\src')

# ---- app.scss ----
app = root / 'css' / 'app.scss'
text = app.read_text(encoding='utf-8')
insert_after = '''.q-chip,
.q-badge {
  border-radius: 999px;
  font-weight: 700;
}
'''
addition = '''.q-chip {
  letter-spacing: 0.01em;
}

.q-banner {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.05);
}

.q-tabs {
  gap: 6px;
}

.q-tab {
  min-height: 42px;
  border-radius: 12px 12px 0 0;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.q-tab--active {
  background: linear-gradient(180deg, rgba(27, 94, 59, 0.12), rgba(197, 168, 77, 0.08));
}

.q-tab-panels {
  background: transparent;
}
'''
if insert_after in text:
    text = text.replace(insert_after, insert_after + '\n' + addition)

text = text.replace(
'''.q-dialog .q-card > .q-card-section:first-child:not(.bg-warning):not(.bg-negative):not(.bg-positive) {
  background: linear-gradient(135deg, rgba(27, 94, 59, 0.08), rgba(197, 168, 77, 0.12));
}
''',
'''.q-dialog .q-card > .q-card-section:first-child:not(.bg-warning):not(.bg-negative):not(.bg-positive) {
  background: linear-gradient(135deg, rgba(27, 94, 59, 0.08), rgba(197, 168, 77, 0.12));
}

.q-dialog .q-card-section.row.items-center.q-pb-none {
  gap: 10px;
}
''')

text = text.replace(
'''  .q-list .q-item:hover,
  .nav-item:hover,
  .accordion-header:hover,
  .menu-item:hover {
    background-color: rgba(255, 255, 255, 0.06);
  }
''',
'''  .q-list .q-item:hover,
  .nav-item:hover,
  .accordion-header:hover,
  .menu-item:hover {
    background-color: rgba(255, 255, 255, 0.06);
  }

  .q-banner,
  .q-dialog .q-card,
  .q-tab--active {
    border-color: rgba(255, 255, 255, 0.1);
  }
''')

app.write_text(text, encoding='utf-8')

# ---- EmptyState ----
empty_state = root / 'components' / 'EmptyState.vue'
empty_state.write_text('''<template>
  <div class="empty-state" :class="{ compact: compact }">
    <div class="empty-state-content fade-in">
      <div class="empty-icon-shell q-mb-md">
        <q-icon :name="icon" :size="iconSize" :color="iconColor" class="empty-icon" />
      </div>
      <div class="empty-title" :class="`text-${titleColor}`">
        {{ title }}
      </div>
      <div class="empty-description" v-if="description">
        {{ description }}
      </div>
      <slot name="action">
        <q-btn
          v-if="actionLabel"
          :label="actionLabel"
          :icon="actionIcon"
          color="primary"
          unelevated
          @click="$emit('action')"
          class="empty-action-btn"
        />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: string;
  iconColor?: string;
  titleColor?: string;
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'inbox',
  iconColor: 'primary',
  titleColor: 'grey-8',
  compact: false,
});

defineEmits<{
  action: [];
}>();

const iconSize = computed(() => (props.compact ? '36px' : '54px'));
</script>

<style scoped lang="scss">
.empty-state {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;

  &.compact {
    min-height: 200px;
    padding: 28px 16px;
  }
}

.empty-state-content {
  max-width: 460px;
  padding: 28px 24px;
  border: 1px dashed rgba(148, 163, 184, 0.3);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.92));
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.05);
  text-align: center;
}

.empty-icon-shell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 84px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(27, 94, 59, 0.1), rgba(197, 168, 77, 0.14));
}

.empty-icon {
  animation: float 3s ease-in-out infinite;
}

.empty-title {
  margin-bottom: 10px;
  font-size: 1.15rem;
  font-weight: 800;
  line-height: 1.3;
}

.empty-description {
  margin-bottom: 18px;
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.6;
}

.empty-action-btn {
  min-height: 42px;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
''', encoding='utf-8')

# ---- LoadingSpinner ----
spinner = root / 'components' / 'LoadingSpinner.vue'
spinner.write_text('''<template>
  <div class="loading-spinner" :class="{ fullscreen: fullscreen }">
    <div class="spinner-content">
      <div class="spinner-shell">
        <q-spinner-dots v-if="type === 'dots'" :color="color" :size="size" />
        <q-spinner-rings v-else-if="type === 'rings'" :color="color" :size="size" />
        <q-spinner-gears v-else-if="type === 'gears'" :color="color" :size="size" />
        <q-spinner v-else :color="color" :size="size" />
      </div>

      <div v-if="message" class="loading-message q-mt-md">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'default' | 'dots' | 'rings' | 'gears';
  color?: string;
  size?: string;
  message?: string;
  fullscreen?: boolean;
}

withDefaults(defineProps<Props>(), {
  type: 'dots',
  color: 'primary',
  size: '50px',
  fullscreen: false,
});
</script>

<style scoped lang="scss">
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;

  &.fullscreen {
    position: fixed;
    inset: 0;
    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(8px);
    z-index: 9999;
  }
}

.spinner-content {
  min-width: 180px;
  padding: 24px 20px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94));
  box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
  text-align: center;
  animation: fadeIn 0.3s ease-out;
}

.spinner-shell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 82px;
  height: 82px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(27, 94, 59, 0.08), rgba(197, 168, 77, 0.12));
}

.loading-message {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 700;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
''', encoding='utf-8')

# ---- FilterBar ----
filterbar = root / 'components' / 'FilterBar.vue'
text = filterbar.read_text(encoding='utf-8')
text = text.replace('expand-separator\n    dense\n    default-opened', 'expand-separator\n    dense\n    default-opened\n    switch-toggle-side')
text = text.replace('class="listing-filter-card q-mb-md compact-filter-card"', 'class="listing-filter-card q-mb-md compact-filter-card fade-in"')
text = text.replace(
'''<style scoped lang="scss">
.compact-filter-card {
  border-radius: 16px;
  overflow: hidden;
}
''',
'''<style scoped lang="scss">
.compact-filter-card {
  border-radius: 18px;
  overflow: hidden;
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}
''')
text += '\n'
if '@keyframes fadeIn' not in text:
    text = text.replace('</style>', '''

.listing-filter-header {
  min-height: 46px;
  padding: 0 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(248, 250, 252, 0.32));
}

:deep(.listing-filter-header .q-item__section--main) {
  font-size: 0.84rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

:deep(.compact-filter-card .q-expansion-item__toggle-icon) {
  color: #64748b;
}

:deep(.compact-filter-card .q-card__section) {
  padding-top: 12px;
  padding-bottom: 14px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>''')
filterbar.write_text(text, encoding='utf-8')

# ---- DataTable ----
data_table = root / 'components' / 'DataTable.vue'
text = data_table.read_text(encoding='utf-8')
text = text.replace(
'''.data-table-shell {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.98));
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
}
''',
'''.data-table-shell {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.98));
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}
''')
text = text.replace(
''':deep(.data-table .q-table__top),
:deep(.data-table .q-table__bottom) {
  padding: 14px 18px;
}
''',
''':deep(.data-table .q-table__top),
:deep(.data-table .q-table__bottom) {
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.62);
}
''')
text = text.replace(
''':deep(.data-table .q-table__bottom .q-btn) {
  border-radius: 10px;
}
''',
''':deep(.data-table .q-table__bottom .q-btn) {
  border-radius: 10px;
}

:deep(.data-table .q-table__bottom .q-field__control) {
  border-radius: 10px;
}

:deep(.data-table .q-table__bottom .q-select),
:deep(.data-table .q-table__bottom .q-field) {
  min-width: 72px;
}
''')
data_table.write_text(text, encoding='utf-8')

print('patched global polish')
