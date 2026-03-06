<template>
  <div class="loading-spinner" :class="{ 'fullscreen': fullscreen }">
    <div class="spinner-content">
      <q-spinner-dots 
        v-if="type === 'dots'"
        :color="color" 
        :size="size" 
      />
      <q-spinner-rings 
        v-else-if="type === 'rings'"
        :color="color" 
        :size="size" 
      />
      <q-spinner-gears 
        v-else-if="type === 'gears'"
        :color="color" 
        :size="size" 
      />
      <q-spinner 
        v-else
        :color="color" 
        :size="size" 
      />
      
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
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(4px);
    z-index: 9999;
  }
}

.spinner-content {
  text-align: center;
  animation: fadeIn 0.3s ease-out;
}

.loading-message {
  color: #666;
  font-size: 0.875rem;
  font-weight: 500;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
