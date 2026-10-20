<template>
  <section>
    <div class="row q-col-gutter-md">
      <div
        v-for="service in services"
        :key="service.label"
        class="col-12 col-sm-6"
      >
        <q-card class="service-card fit full-height">
          <q-card-section class="text-center">
            <q-icon :name="service.icon" size="36px" color="white" class="q-mb-sm" />
            <div class="text-subtitle1 text-weight-medium text-white">{{ service.label }}</div>
            <div class="text-caption q-mt-xs service-desc">{{ service.description }}</div>
          </q-card-section>

          <q-separator class="glass-separator" />

          <q-card-actions align="right">
            <q-btn
              flat
              color="white"
              no-caps
              :label="service.cta"
              :to="service.to"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </section>
</template>

<script setup>
defineOptions({ name: 'QuickServicesGrid' })

const services = [
  { label: 'Impuestos', description: 'Consulta y pago de tasas municipales.', icon: 'request_quote', cta: 'Ver servicio', to: '/transparencia' },
  { label: 'Registro Civil', description: 'Partidas, constancias y certificaciones.', icon: 'badge', cta: 'Ver servicio', to: '/contacto' },
  { label: 'Atencion Ciudadana', description: 'Reportes, consultas y seguimiento.', icon: 'support_agent', cta: 'Contactar', to: '/contacto' },
  { label: 'Portal de Transparencia', description: 'Documentos, informes y rendicion de cuentas.', icon: 'fact_check', cta: 'Explorar', to: '/transparencia' },
]
</script>

<style scoped>
.service-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  /* 🔑 Glass: fondo translúcido + blur de lo que está detrás */
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  overflow: hidden;
}

.service-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.14);
  box-shadow: 0 12px 32px rgb(0 0 0 / 35%);
}

.service-desc {
  color: rgba(255, 255, 255, 0.75);
}

/* q-separator necesita !important porque trae su propio background */
.glass-separator {
  background: rgba(255, 255, 255, 0.18) !important;
}
</style>