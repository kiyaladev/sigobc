<template>
  <q-card
    flat
    class="listing-stat-card overview-stat-card stat-card"
    :style="{ animationDelay: `${delay}s` }"
  >
    <q-card-section class="stat-card-content">
      <div class="row items-start no-wrap q-col-gutter-md">
        <div class="col">
          <div class="overview-stat-label">{{ label }}</div>
          <div class="overview-stat-value">{{ value }}</div>
          <div v-if="subtitle" class="overview-stat-helper">{{ subtitle }}</div>
        </div>
        <div class="col-auto">
          <div class="stat-icon-wrapper" :class="`text-${color}`">
            <q-icon :name="icon" class="stat-icon" />
          </div>
        </div>
      </div>

      <q-linear-progress
        v-if="showProgress"
        :value="progress"
        :color="color"
        track-color="blue-grey-1"
        class="stat-progress q-mt-md"
      />

      <div v-if="trend !== undefined" class="trend-indicator q-mt-sm">
        <q-icon
          :name="trend >= 0 ? 'trending_up' : 'trending_down'"
          :class="trend >= 0 ? 'text-positive' : 'text-negative'"
          size="18px"
        />
        <span class="q-ml-xs">{{ Math.abs(trend) }}%</span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  value: string | number;
  label: string;
  subtitle?: string;
  icon: string;
  color?: string;
  progress?: number;
  showProgress?: boolean;
  trend?: number;
  delay?: number;
}

withDefaults(defineProps<Props>(), {
  color: 'primary',
  progress: 1,
  showProgress: true,
  delay: 0,
});
</script>

<style scoped lang="scss">
.stat-card {
  height: 100%;
  animation: slideInUp 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.stat-card-content {
  padding: 16px;
}

.stat-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(59, 130, 246, 0.08);
}

.stat-icon {
  font-size: 24px;
}

.stat-progress {
  height: 6px;
  border-radius: 999px;
}

.trend-indicator {
  display: inline-flex;
  align-items: center;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 700;
}

@keyframes slideInUp {
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
