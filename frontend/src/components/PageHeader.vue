<template>
  <q-card class="page-header-card" :class="{ 'with-actions': hasActions }">
    <q-card-section class="q-pa-lg">
      <div class="row items-center justify-between">
        <div class="col">
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
            <q-icon v-if="icon" :name="icon" size="32px" class="q-mr-sm" />
            {{ title }}
          </h1>

          <p v-if="subtitle" class="page-subtitle text-grey-6">
            {{ subtitle }}
          </p>
        </div>

        <div class="col-auto" v-if="hasActions">
          <slot name="actions"></slot>
        </div>
      </div>

      <!-- Statistiques supplémentaires -->
      <div v-if="hasStats" class="row q-col-gutter-md q-mt-md">
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
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  animation: slideDown 0.5s ease-out;
  background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(249, 250, 251, 1) 100%);

  &.with-actions {
    .page-title {
      margin-bottom: 0;
    }
  }
}

.breadcrumbs {
  animation: fadeIn 0.5s ease-out;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
  display: flex;
  align-items: center;
  animation: slideInRight 0.5s ease-out;

  .q-icon {
    animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.gradient-text {
  background: linear-gradient(135deg, #e67e22 0%, #2e7d32 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-subtitle {
  font-size: 1rem;
  margin: 8px 0 0 0;
  animation: fadeIn 0.6s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;

    .q-icon {
      font-size: 24px;
    }
  }

  .page-subtitle {
    font-size: 0.875rem;
  }
}
</style>
