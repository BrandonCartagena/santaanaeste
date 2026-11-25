<template>
  <q-header elevated class="bg-primary text-white">
    <q-toolbar class="q-px-sm q-px-md-md">
      <q-toolbar-title class="feed-title text-weight-bold">
         <span @click="$router.push('/')" class="cursor-pointer">
          SAE
        </span>
      </q-toolbar-title>

      <q-space />

      <!-- Se agregó la clase nav-btn para controlar su tamaño en móviles -->
      <q-btn flat no-caps label="Inicio" to="/" class="nav-btn" />
      <q-btn flat no-caps label="Transparencia" to="/reporte_antisoborno" class="nav-btn" />
      <q-btn flat no-caps label="Contacto" to="/contacto" class="nav-btn" />
    </q-toolbar>
  </q-header>
</template>

<script setup>
defineOptions({
  name: 'HeaderNav',
})
</script>

<style lang="css">
/* Ajuste dinámico del título */
.feed-title { 
  /* clamp(MÍNIMO, PREFERIDO, MÁXIMO) */
  /* Baja el mínimo a 1.2rem para que en móviles reduzca su tamaño */
  font-size: clamp(1.6rem, 5.4vw, 2.65rem); 
  font-weight: 900; /* 900 es el máximo en CSS */
  line-height: 1.5; 
  letter-spacing: -0.04em; 
  /* Evita que el título flexione y empuje al resto en pantallas extremadamente pequeñas */
  white-space: nowrap; 
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 22px;
}

/* Comportamiento por defecto de los botones en PC/Tablets */
.nav-btn {
  font-family: 'Noto Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.nav-btn:hover {
  opacity: 0.75;
}

/* Ajustes específicos para móviles (pantallas menores a 600px) */
@media (max-width: 599px) {
  .nav-btn {
    font-size: 11px !important; /* Reduce el texto del botón */
    padding: 4px 8px !important; /* Reduce el espaciado interno del botón */
    min-height: 32px; /* Evita que los botones sean muy altos */
  }
}
</style>