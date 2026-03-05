<template>
  <div class="empty-state" :class="{ compact: compact }">
    <div class="empty-state-content fade-in">
      <q-icon :name="icon" :size="iconSize" :color="iconColor" class="empty-icon q-mb-md" />
      <div class="text-h6 text-weight-medium q-mb-sm" :class="`text-${titleColor}`">
        {{ title }}
      </div>
      <div class="text-body2 text-grey-6 q-mb-md" v-if="description">
        {{ description }}
      </div>
      <slot name="action">
        <q-btn
          v-if="actionLabel"
          :label="actionLabel"
          :icon="actionIcon"
          color="primary"
          unelevated
          @click="$emit('action')"
          class="empty-action-btn"
        />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: string;
  iconColor?: string;
  titleColor?: string;
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'inbox',
  iconColor: 'grey-4',
  titleColor: 'grey-7',
  compact: false,
});

defineEmits<{
  action: [];
}>();

const iconSize = computed(() => (props.compact ? '48px' : '72px'));
</script>

<style scoped lang="scss">
.empty-state {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;

  &.compact {
    min-height: 200px;
    padding: 32px 16px;
  }
}

.empty-state-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  opacity: 0.4;
  animation: float 3s ease-in-out infinite;
}

.empty-action-btn {
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 102, 0, 0.3);
  }
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
