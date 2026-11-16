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
<style lang="css">

/* HeaderNav.vue */

.app-header {
  background: #3F6077;
  color: #FFFFFF;

  box-shadow:
    0 3px 12px rgba(32, 57, 77, 0.16);
  
}

.app-toolbar {
  min-height: clamp ;
  padding: 0 28px;
}

.app-brand {
  font-family: 'Noto Sans', sans-serif;
  font-size: 23px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.app-nav-link {
  font-family: 'Noto Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
  transition: opacity 0.2s ease;
}

.app-nav-link:hover {
  opacity: 0.75;
}

</style>