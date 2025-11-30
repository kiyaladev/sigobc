<template>
  <q-card class="stat-card hover-lift" :style="{ animationDelay: `${delay}s` }">
    <q-card-section class="stat-card-content">
      <div class="row items-center no-wrap">
        <div class="col">
          <div class="stat-value">{{ value }}</div>
          <div class="stat-label">{{ label }}</div>
          <div v-if="subtitle" class="stat-subtitle">{{ subtitle }}</div>
        </div>
        <div class="col-auto">
          <div class="stat-icon-wrapper">
            <q-icon :name="icon" class="stat-icon" />
          </div>
        </div>
      </div>

      <!-- Indicateur de progression -->
      <q-linear-progress
        v-if="showProgress"
        :value="progress"
        color="positive"
        class="stat-progress q-mt-md"
        :class="{ 'pulse-animation': progress < 1 }"
      />

      <!-- Tendance -->
      <div v-if="trend" class="trend-indicator q-mt-sm">
        <q-icon
          :name="trend > 0 ? 'trending_up' : 'trending_down'"
          :class="trend > 0 ? 'text-positive' : 'text-negative'"
          size="20px"
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
  color: 'info',
  progress: 1,
  showProgress: true,
  delay: 0,
});
</script>

<style scoped lang="scss">
.stat-card {
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  animation: slideInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;

  &:hover {
    .stat-icon {
      transform: scale(1.1) rotate(5deg);
    }
  }
}

.stat-card-content {
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
    animation: pulse 4s infinite;
  }
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.95;
  margin-top: 4px;
  position: relative;
  z-index: 1;
}

.stat-subtitle {
  font-size: 0.75rem;
  opacity: 0.85;
  margin-top: 2px;
  position: relative;
  z-index: 1;
}

.stat-icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
}

.stat-icon {
  font-size: 48px;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.stat-progress {
  border-radius: 4px;
  height: 4px;
  position: relative;
  z-index: 1;
}

.trend-indicator {
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
}

.pulse-animation {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

@media (max-width: 1024px) {
  .stat-value {
    font-size: 1.75rem;
  }

  .stat-icon {
    font-size: 40px;
  }
}

@media (max-width: 600px) {
  .stat-value {
    font-size: 1.5rem;
  }

  .stat-icon {
    font-size: 36px;
  }
}
</style>
