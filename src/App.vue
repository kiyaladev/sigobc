<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { initializeDatabase } from 'src/database/db';
import { useAuthStore } from 'src/stores/auth-store';

// Initialiser la base de données au démarrage de l'application
onMounted(async () => {
  try {
    await initializeDatabase();

    // S'assurer que les comptes admin et démo existent
    const authStore = useAuthStore();
    await authStore.ensureAdminExists();

    console.log('Application initialisée avec succès');
  } catch (error) {
    console.error("Erreur lors de l'initialisation de l'application:", error);
  }
});
</script>
