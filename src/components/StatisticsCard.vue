<template>
  <q-card class="stat-card" :style="{ borderLeft: `4px solid ${borderColor}` }">
    <q-card-section>
      <div class="row items-center">
        <div class="col">
          <div class="text-h4 text-grey-8">{{ displayValue }}</div>
          <div class="text-subtitle2 text-grey-6">{{ title }}</div>
          <div v-if="subtitle" class="text-caption text-grey-5 q-mt-xs">
            {{ subtitle }}
          </div>
        </div>
        <div class="col-auto">
          <q-icon :name="icon" size="56px" :color="iconColor" style="opacity: 0.2" />
        </div>
      </div>
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
.stat-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
}
</style>
