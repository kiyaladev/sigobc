<template>
  <q-btn 
    flat 
    round 
    dense 
    :icon="isDark ? 'light_mode' : 'dark_mode'" 
    @click="toggleDarkMode"
    class="theme-toggle-btn hover-scale"
  >
    <q-tooltip>{{ isDark ? 'Mode clair' : 'Mode sombre' }}</q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const isDark = ref(false);

// Charger la préférence depuis le localStorage
onMounted(() => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    isDark.value = true;
    $q.dark.set(true);
  } else if (savedTheme === 'light') {
    isDark.value = false;
    $q.dark.set(false);
  } else {
    // Utiliser la préférence système
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    $q.dark.set(isDark.value);
  }
});

// Sauvegarder la préférence
watch(isDark, (newValue) => {
  localStorage.setItem('theme', newValue ? 'dark' : 'light');
});

function toggleDarkMode() {
  isDark.value = !isDark.value;
  $q.dark.set(isDark.value);
  
  // Animation de transition
  document.documentElement.classList.add('theme-transitioning');
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transitioning');
  }, 300);
}
</script>

<style scoped lang="scss">
.theme-toggle-btn {
  transition: all 0.3s ease;
  
  &:hover {
    transform: rotate(180deg);
  }
}
</style>
