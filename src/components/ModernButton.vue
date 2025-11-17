<template>
  <q-btn
    :label="label"
    :icon="icon"
    :icon-right="iconRight"
    :color="color"
    :size="size"
    :outline="outline"
    :flat="flat"
    :unelevated="!outline && !flat"
    :loading="loading"
    :disable="disable"
    class="modern-btn"
    :class="btnClasses"
    @click="$emit('click', $event as MouseEvent)"
  >
    <slot></slot>

    <template v-if="loading" v-slot:loading>
      <q-spinner-dots />
    </template>
  </q-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  label?: string;
  icon?: string;
  iconRight?: string;
  color?: string;
  size?: string;
  outline?: boolean;
  flat?: boolean;
  loading?: boolean;
  disable?: boolean;
  glow?: boolean;
  pulse?: boolean;
  gradient?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  size: 'md',
  outline: false,
  flat: false,
  loading: false,
  disable: false,
  glow: false,
  pulse: false,
  gradient: false,
});

defineEmits<{
  click: [event: MouseEvent];
}>();

const btnClasses = computed(() => ({
  'btn-glow': props.glow,
  'btn-pulse': props.pulse,
  'btn-gradient': props.gradient,
}));
</script>

<style scoped lang="scss">
.modern-btn {
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.025em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transform: translate(-50%, -50%);
    transition:
      width 0.6s,
      height 0.6s;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);

    &::before {
      width: 300px;
      height: 300px;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &.btn-glow {
    box-shadow: 0 0 20px rgba(255, 102, 0, 0.5);

    &:hover:not(:disabled) {
      box-shadow: 0 0 30px rgba(255, 102, 0, 0.7);
    }
  }

  &.btn-pulse {
    animation: pulse 2s ease-in-out infinite;
  }

  &.btn-gradient {
    background: linear-gradient(135deg, #ff6600 0%, #22c55e 100%);
    color: white;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #e65c00 0%, #1f9d57 100%);
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 102, 0, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(255, 102, 0, 0);
  }
}
</style>
