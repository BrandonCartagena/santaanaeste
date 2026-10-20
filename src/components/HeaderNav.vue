<template>
  <q-header elevated class="bg-primary text-white">
    <q-toolbar class="q-px-md">
      <q-toolbar-title class="text-weight-bold">
        Mi Alcaldia App
      </q-toolbar-title>

      <q-space />

      <q-btn flat no-caps label="Inicio" to="/" />
      <q-btn flat no-caps label="Transparencia" to="/transparencia" />
      <q-btn flat no-caps label="Contacto" to="/contacto" />
    </q-toolbar>
  </q-header>
</template>

<script setup>
defineOptions({
  name: 'HeaderNav',
})
</script>