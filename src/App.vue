<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { db, initializeDatabase } from 'src/database/db';
import { useAuthStore } from 'src/stores/auth-store';
import { seedTestData } from 'src/database/seeders';

// Initialiser la base de données au démarrage de l'application
onMounted(async () => {
  try {
    // Vérifier si des données de démonstration existent déjà
    const previsionsCount = await db.previsions.count();
    const declarationsCount = await db.declarations.count();

    if (previsionsCount === 0 && declarationsCount === 0) {
      // Supprimer entièrement la base pour réinitialiser les auto-incréments
      await db.delete();
      await db.open();
      console.log('🌱 Base vide détectée, chargement des données de démonstration...');
      await seedTestData();
      console.log('✅ Données de démonstration chargées avec succès');
    } else {
      await initializeDatabase();
    }

    // S'assurer que les comptes admin et démo existent
    const authStore = useAuthStore();
    await authStore.ensureAdminExists();

    console.log('Application initialisée avec succès');
  } catch (error) {
    console.error("Erreur lors de l'initialisation de l'application:", error);
  }
});
</script>
