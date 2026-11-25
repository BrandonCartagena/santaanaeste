<template>
  <section>
    <div class="row q-col-gutter-md">
      <div
        v-for="service in services"
        :key="service.label"
        class="col-12 col-sm-6"
      >
        <!-- 🟢 Se añade el binding de clase dinámica para la animación -->
        <q-card 
          class="service-card fit full-height"
          :class="{ 'halo-active': isHaloActive }"
        >
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
import { ref, onMounted, onUnmounted } from 'vue'

defineOptions({ name: 'QuickServicesGrid' })

const services = [
  { label: 'Impuestos', description: 'Consulta y pago de tasas municipales.', icon: 'request_quote', cta: 'Ver servicio', to: '/impuestos' },
  { label: 'Registro Civil', description: 'Partidas, constancias y certificaciones.', icon: 'badge', cta: 'Ver servicio', to: '/registro_civil' },
  { label: 'Atencion Ciudadana', description: 'Reportes, consultas y seguimiento.', icon: 'support_agent', cta: 'Contactar', to: '/contacto' },
  { label: 'Portal de Transparencia', description: 'Documentos, informes y rendicion de cuentas.', icon: 'fact_check', cta: 'Explorar', to: '/reporte_antisoborno' },
]

const isHaloActive = ref(false)

// Listener para encender la animación cuando presionan "Comenzar"
const triggerHalo = () => {
  isHaloActive.value = false // Resetea por si clickean varias veces rápido
  setTimeout(() => {
    isHaloActive.value = true
    // Apaga la animación después de 1.5s
    setTimeout(() => {
      isHaloActive.value = false
    }, 1500)
  }, 50) 
}

onMounted(() => {
  window.addEventListener('activar-halo-servicios', triggerHalo)
})

onUnmounted(() => {
  window.removeEventListener('activar-halo-servicios', triggerHalo)
})
</script>

<style scoped>
.service-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
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

.glass-separator {
  background: rgba(255, 255, 255, 0.18) !important;
}

/* 🟢 Animación del Halo (Glow effect) adaptada al estilo Glassmorphism */
@keyframes glowingHalo {
  0% { 
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); 
    border-color: rgba(255, 255, 255, 0.18); 
  }
  50% { 
    /* Un brillo blanco elegante que combina con el overlay oscuro del hero */
    box-shadow: 0 0 25px 5px rgba(255, 255, 255, 0.6); 
    border-color: rgba(255, 255, 255, 0.9); 
    transform: scale(1.02); 
  }
  100% { 
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); 
    border-color: rgba(255, 255, 255, 0.18); 
  }
}

.halo-active {
  animation: glowingHalo 1.5s ease-out forwards;
}
</style>