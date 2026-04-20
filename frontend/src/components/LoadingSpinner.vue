<template>
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
