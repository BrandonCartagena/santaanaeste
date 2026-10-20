<template>
  <q-page class="q-pa-md q-pa-lg-md">
    <div class="container">
      <h1 class="text-h4 text-weight-bold q-mb-sm">Portal de Transparencia</h1>
      <p class="text-body1 text-grey-8 q-mb-lg">
        Accede a informes de gestion, presupuesto municipal y rendicion de cuentas.
      </p>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4" v-for="item in blocks" :key="item.title">
          <q-card bordered class="fit">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">{{ item.title }}</div>
              <div class="text-body2 text-grey-7 q-mt-sm">{{ item.description }}</div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right">
              <q-btn flat color="primary" no-caps :label="item.cta" />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
defineOptions({
  name: 'TransparencyPage',
})

const blocks = [
  {
    title: 'Presupuesto',
    description: 'Detalle de ingresos, egresos y ejecucion presupuestaria por periodo.',
    cta: 'Ver documentos',
  },
  {
    title: 'Compras Publicas',
    description: 'Licitaciones, adjudicaciones y seguimiento de adquisiciones.',
    cta: 'Ver procesos',
  },
  {
    title: 'Informes de Gestion',
    description: 'Resultados institucionales y avance de planes municipales.',
    cta: 'Ver informes',
  },
]
</script>

<style scoped>
.container {
  max-width: 1180px;
  margin: 0 auto;
}
</style>