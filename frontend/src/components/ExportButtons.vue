<template>
  <q-btn-dropdown color="primary" icon="download" label="Exporter">
    <q-list>
      <q-item clickable v-close-popup @click="$emit('export-pdf')">
        <q-item-section avatar>
          <q-icon name="picture_as_pdf" color="red" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Exporter en PDF</q-item-label>
        </q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="$emit('export-excel')">
        <q-item-section avatar>
          <q-icon name="grid_on" color="green" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Exporter en Excel</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
defineEmits<{
  'export-pdf': [];
  'export-excel': [];
}>();
</script>
