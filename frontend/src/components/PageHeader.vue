<template>
  <q-card class="page-header-card" :class="{ 'with-actions': hasActions }">
    <q-card-section class="page-header-content q-pa-lg">
      <div class="page-header-top row items-start justify-between q-col-gutter-lg">
        <div class="col page-header-copy">
          <div class="breadcrumbs q-mb-sm" v-if="breadcrumbs && breadcrumbs.length > 0">
            <q-breadcrumbs active-color="primary">
              <q-breadcrumbs-el
                v-for="(crumb, index) in breadcrumbs"
                :key="index"
                :label="crumb.label"
                :to="crumb.to"
                :icon="crumb.icon"
              />
            </q-breadcrumbs>
          </div>

          <h1 class="page-title" :class="{ 'gradient-text': gradient }">
            <span v-if="icon" class="page-title-icon">
              <q-icon :name="icon" size="30px" />
            </span>
            <span>{{ title }}</span>
          </h1>

          <p v-if="subtitle" class="page-subtitle text-grey-7">
            {{ subtitle }}
          </p>
        </div>

        <div class="col-auto page-actions" v-if="hasActions">
          <slot name="actions"></slot>
        </div>
      </div>

      <div v-if="hasStats" class="page-header-stats row q-col-gutter-md q-mt-lg">
        <slot name="stats"></slot>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { useSlots, computed } from 'vue';

interface Breadcrumb {
  label: string;
  to?: string;
  icon?: string;
}

interface Props {
  title: string;
  subtitle?: string;
  icon?: string;
  breadcrumbs?: Breadcrumb[];
  gradient?: boolean;
}

withDefaults(defineProps<Props>(), {
  gradient: false,
});

const slots = useSlots();
const hasActions = computed(() => !!slots.actions);
const hasStats = computed(() => !!slots.stats);
</script>

<style scoped lang="scss">
.page-header-card {
  position: relative;
  margin-bottom: 24px;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(27, 94, 59, 0.1);
  background:
    radial-gradient(circle at top right, rgba(197, 168, 77, 0.18), transparent 32%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.96) 100%);
  box-shadow: 0 22px 48px rgba(15, 23, 42, 0.08);

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 999px;
    pointer-events: none;
    filter: blur(6px);
  }

  &::before {
    top: -80px;
    right: -40px;
    width: 220px;
    height: 220px;
    background: radial-gradient(circle, rgba(197, 168, 77, 0.18), transparent 70%);
  }

  &::after {
    left: -60px;
    bottom: -80px;
    width: 180px;
    height: 180px;
    background: radial-gradient(circle, rgba(27, 94, 59, 0.12), transparent 70%);
  }
}

.page-header-content {
  position: relative;
  z-index: 1;
}

.page-header-top {
  gap: 20px 0;
}

.page-header-copy {
  min-width: 0;
}

.breadcrumbs :deep(.q-breadcrumbs__el),
.breadcrumbs :deep(.q-breadcrumbs__el .q-icon) {
  color: #64748b;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0;
  font-size: clamp(1.75rem, 3vw, 2.35rem);
  font-weight: 800;
  line-height: 1.1;
  color: #0f172a;
}

.page-title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(27, 94, 59, 0.12), rgba(197, 168, 77, 0.18));
  color: var(--q-primary);
  box-shadow: inset 0 0 0 1px rgba(27, 94, 59, 0.1);
}

.gradient-text {
  background: linear-gradient(135deg, #1b5e3b 0%, #c5a84d 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  max-width: 760px;
  margin: 12px 0 0;
  font-size: 1rem;
  line-height: 1.6;
}

.page-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.page-actions :deep(.q-btn) {
  min-height: 42px;
}

.page-actions :deep(.q-field),
.page-actions :deep(.q-select) {
  min-width: 120px;
}

.page-actions :deep(.q-field__control) {
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.82);
}

.page-header-stats {
  position: relative;
  z-index: 1;
}

@media (max-width: 900px) {
  .page-title-icon {
    width: 48px;
    height: 48px;
    border-radius: 15px;
  }
}

@media (max-width: 768px) {
  .page-header-card {
    border-radius: 20px;
  }

  .page-title {
    gap: 10px;
  }

  .page-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
