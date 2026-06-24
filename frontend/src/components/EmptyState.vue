<template>
  <div class="empty-state" :class="{ compact: compact }">
    <div class="empty-state-content fade-in">
      <div class="empty-icon-shell q-mb-md">
        <q-icon :name="icon" :size="iconSize" :color="iconColor" class="empty-icon" />
      </div>
      <div class="empty-title" :class="`text-${titleColor}`">
        {{ title }}
      </div>
      <div class="empty-description" v-if="description">
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
  iconColor: 'primary',
  titleColor: 'grey-8',
  compact: false,
});

defineEmits<{
  action: [];
}>();

const iconSize = computed(() => (props.compact ? '36px' : '54px'));
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
    padding: 28px 16px;
  }
}

.empty-state-content {
  max-width: 460px;
  padding: 28px 24px;
  border: 1px dashed rgba(148, 163, 184, 0.3);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.92));
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.05);
  text-align: center;
}

.empty-icon-shell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 84px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(27, 94, 59, 0.1), rgba(197, 168, 77, 0.14));
}

.empty-icon {
  animation: float 3s ease-in-out infinite;
}

.empty-title {
  margin-bottom: 10px;
  font-size: 1.15rem;
  font-weight: 800;
  line-height: 1.3;
}

.empty-description {
  margin-bottom: 18px;
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.6;
}

.empty-action-btn {
  min-height: 42px;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
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
