<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { db, initializeDatabase } from 'src/database/db';
import { useAuthStore } from 'src/stores/auth-store';
import {
  seedTestData,
  ensureCorrectMairieInfo,
  ensureSousChapitres9xxExist,
} from 'src/database/seeders';

// Initialiser la base de données au démarrage de l'application
onMounted(async () => {
  try {
    // Vérifier si l'utilisateur a explicitement vidé la base
    const dbCleared = localStorage.getItem('sigobc_db_cleared');

    // Vérifier si des données de démonstration existent déjà
    const previsionsCount = await db.previsions.count();
    const declarationsCount = await db.declarations.count();

    if (dbCleared === 'true') {
      // L'utilisateur a vidé la base, ne pas auto-seeder
      // Initialiser seulement la mairie et l'admin de base
      await initializeDatabase();
      console.log('Base vidée manuellement, pas de re-seed automatique.');
    } else if (previsionsCount === 0 && declarationsCount === 0) {
      // Supprimer entièrement la base pour réinitialiser les auto-incréments
      await db.delete();
      await db.open();
      console.log('🌱 Base vide détectée, chargement des données de démonstration...');
      await seedTestData();
      console.log('✅ Données de démonstration chargées avec succès');
    } else {
      await initializeDatabase();
    }

    // Migration: s'assurer que c'est bien la mairie de Vavoua
    await ensureCorrectMairieInfo();

    // Migration: s'assurer que les sous-chapitres 9xx (investissement) existent
    await ensureSousChapitres9xxExist();

    // S'assurer que les comptes admin et démo existent
    const authStore = useAuthStore();
    await authStore.ensureAdminExists();

    console.log('Application initialisée avec succès');
  } catch (error) {
    console.error("Erreur lors de l'initialisation de l'application:", error);
  }
});
</script>
