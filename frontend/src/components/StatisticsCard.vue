<template>
  <q-card flat class="listing-stat-card overview-stat-card statistics-card">
    <q-card-section class="row items-center no-wrap">
      <div class="col">
        <div class="overview-stat-label">{{ title }}</div>
        <div class="overview-stat-value">{{ displayValue }}</div>
        <div v-if="subtitle" class="overview-stat-helper">{{ subtitle }}</div>
      </div>
      <q-icon :name="icon" size="30px" :color="iconColor" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  value: number | string;
  title: string;
  subtitle?: string;
  icon: string;
  iconColor?: string;
  borderColor?: string;
  format?: 'number' | 'currency' | 'percentage' | 'none';
  currency?: string;
}

const props = withDefaults(defineProps<Props>(), {
  iconColor: 'primary',
  borderColor: 'var(--q-primary)',
  format: 'number',
  currency: 'XOF',
});

const displayValue = computed(() => {
  if (props.format === 'none' || typeof props.value === 'string') {
    return props.value;
  }

  const numValue = Number(props.value);

  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: props.currency,
        minimumFractionDigits: 0,
      }).format(numValue);

    case 'percentage':
      return `${numValue}%`;

    case 'number':
    default:
      return new Intl.NumberFormat('fr-FR').format(numValue);
  }
});
</script>

<style scoped lang="scss">
.statistics-card {
  min-height: 112px;
  border-left: 4px solid v-bind(borderColor);
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
</style>
