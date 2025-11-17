<template>
  <q-layout view="hHh lpR fFf" class="login-layout">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// Layout pour les pages d'authentification (login, etc.)
</script>

<style scoped lang="scss">
.login-layout {
  background: linear-gradient(135deg, #ff6600 0%, #22c55e 100%);
  min-height: 100vh;
}
</style>
