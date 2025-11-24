<template>
  <q-card>
    <q-card-section :class="headerClass">
      <div class="text-h6">{{ title }}</div>
    </q-card-section>
    <q-card-section>
      <div :class="containerClass">
        <canvas ref="canvasRef"></canvas>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { Chart, type ChartConfiguration } from 'chart.js';

interface Props {
  title: string;
  chartConfig?: ChartConfiguration;
  headerClass?: string;
  containerClass?: string;
  height?: string;
}

const props = withDefaults(defineProps<Props>(), {
  headerClass: 'bg-primary text-white',
  containerClass: 'chart-container',
  height: '300px',
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const createChart = () => {
  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d');
    if (ctx && props.chartConfig) {
      chartInstance = new Chart(ctx, props.chartConfig);
    }
  }
};

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
};

const updateChart = () => {
  if (chartInstance && props.chartConfig) {
    // Mettre à jour les données du graphique
    chartInstance.data = props.chartConfig.data;
    chartInstance.update();
  }
};

// Exposer les méthodes pour permettre la mise à jour depuis le parent
defineExpose({
  updateChart,
  destroyChart,
  getChartInstance: () => chartInstance,
});

// Surveiller les changements de configuration
watch(
  () => props.chartConfig,
  () => {
    if (chartInstance) {
      updateChart();
    }
  },
  { deep: true },
);

onMounted(() => {
  setTimeout(() => {
    createChart();
  }, 100);
});

onBeforeUnmount(() => {
  destroyChart();
});
</script>

<style scoped lang="scss">
.chart-container {
  position: relative;
  height: 300px;
}

.chart-container-large {
  position: relative;
  height: 400px;
}
</style>
