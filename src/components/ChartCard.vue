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
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import {
  Chart,
  type ChartConfiguration,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  DoughnutController,
  BarController,
  LineController,
  PieController,
  Filler,
} from 'chart.js';

// Enregistrer tous les composants Chart.js nécessaires
Chart.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  DoughnutController,
  BarController,
  LineController,
  PieController,
  Filler,
);

interface Props {
  title: string;
  chartConfig?: ChartConfiguration;
  headerClass?: string;
  containerClass?: string;
  height?: string;
}

const props = withDefaults(defineProps<Props>(), {
  headerClass: 'text-grey-8',
  containerClass: 'chart-container',
  height: '300px',
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

/**
 * Clone les données du chart sans les fonctions (pour éviter que Chart.js ne mute les objets réactifs Vue)
 */
function cloneChartData(data: ChartConfiguration['data']): ChartConfiguration['data'] {
  return JSON.parse(JSON.stringify(data));
}

const createChart = () => {
  destroyChart();
  if (canvasRef.value && props.chartConfig) {
    const ctx = canvasRef.value.getContext('2d');
    if (ctx) {
      // Clone les données pour éviter la mutation des objets réactifs par Chart.js
      const config: ChartConfiguration = {
        type: props.chartConfig.type,
        data: cloneChartData(props.chartConfig.data),
        options: props.chartConfig.options, // Les options contiennent des fonctions, on garde la référence
      };
      chartInstance = new Chart(ctx, config);
    }
  }
};

const destroyChart = () => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
};

// Exposer les méthodes pour permettre la mise à jour depuis le parent
defineExpose({
  destroyChart,
  getChartInstance: () => chartInstance,
});

// Surveiller les changements de configuration - recréer le chart entier
watch(
  () => props.chartConfig,
  async () => {
    await nextTick();
    createChart();
  },
  { deep: true },
);

onMounted(() => {
  // Petit délai pour s'assurer que le canvas est rendu dans le DOM
  setTimeout(createChart, 150);
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
