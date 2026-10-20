<template>
  <q-footer class="bg-grey-10 text-grey-2" style="position: static">
    <div class="q-pa-lg">
      <!-- Bloque principal -->
      <div class="row q-col-gutter-lg q-col-gutter-y-xl">
        <!-- Marca -->
        <div class="col-12 col-md-5">
          <div class="row no-wrap items-center q-gutter-md">
            <q-avatar rounded size="64px" class="bg-white" style="flex-shrink: 0">
              <img
                alt="Logo Alcaldía"
                src="../../public/logo_SAe.webp"
                style="object-fit: contain; width: 100%; height: 100%;"
              />
            </q-avatar>
            <div>
              <div class="text-h6 text-weight-bold text-white">
                Alcaldía Municipal
              </div>
              <div class="text-body2 text-grey-5">
                Distrito Santa Ana Este
              </div>
            </div>
          </div>
          <p class="text-body2 text-grey-5 q-mt-md q-mb-none" style="max-width: 340px;">
            Trabajando por el desarrollo y el bienestar de nuestra comunidad.
          </p>
        </div>

        <!-- Contacto -->
        <div class="col-12 col-sm-6 col-md-3">
          <div class="text-overline text-grey-5 text-weight-bold q-mb-sm">
            Contacto
          </div>
          <q-list dense class="text-grey-3">
            <q-item class="q-pa-none q-mb-xs">
              <q-item-section avatar class="q-pr-sm" style="min-width: 0">
                <q-icon name="email" size="18px" color="primary" />
              </q-item-section>
              <q-item-section>
                <a href="mailto:atencion@alcaldia.gob.sv" class="footer-link">
                  atencion@alcaldia.gob.sv
                </a>
              </q-item-section>
            </q-item>
            <q-item class="q-pa-none">
              <q-item-section avatar class="q-pr-sm" style="min-width: 0">
                <q-icon name="phone" size="18px" color="primary" />
              </q-item-section>
              <q-item-section>
                <a href="tel:+50325000000" class="footer-link">
                  +503 2500-0000
                </a>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Dirección + redes -->
        <div class="col-12 col-sm-6 col-md-4">
          <div class="text-overline text-grey-5 text-weight-bold q-mb-sm">
            Dirección
          </div>
          <q-list dense class="text-grey-3">
            <q-item class="q-pa-none q-mb-xs">
              <q-item-section avatar class="q-pr-sm" style="min-width: 0">
                <q-icon name="place" size="18px" color="primary" />
              </q-item-section>
              <q-item-section>
                <a 
                  href="https://www.google.com/maps/dir/?api=1&destination=13.9046,-89.49697&travelmode=driving&dir_action=navigate" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="direccion-link text-grey-3"
                >
                  Alcaldía Municipal, Bo. El Centro, El Congo
                </a>
              </q-item-section>
            </q-item>
            <q-item class="q-pa-none">
              <q-item-section avatar class="q-pr-sm" style="min-width: 0">
                <q-icon name="schedule" size="18px" color="primary" />
              </q-item-section>
              <q-item-section>
                Lunes a Viernes · 8:00 – 16:00
              </q-item-section>
            </q-item>
          </q-list>

          <div class="row q-gutter-sm q-mt-md">
            <q-btn
              round flat dense
              icon="facebook"
              size="sm"
              color="grey-4"
              aria-label="Facebook"
              href="https://www.facebook.com/share/1HrLFqEx6k/"
              target="_blank"
            />
            <q-btn
              round flat dense
              icon="public"
              size="sm"
              color="grey-4"
              aria-label="Sitio web"
              href="https://www.alcaldiasantaanaeste.gob.sv"
              target="_blank"
            />
            <q-btn
              round flat dense
              icon="alternate_email"
              size="sm"
              color="grey-4"
              aria-label="Correo"
            />
          </div>
        </div>
      </div>

      <q-separator dark class="q-my-lg" />

      <!-- Barra inferior -->
      <div
        class="row items-center justify-center justify-sm-between
               q-col-gutter-sm text-body2 text-grey-5"
      >
        <div class="col-12 col-sm-auto text-center text-sm-left">
          © {{ currentYear }} Alcaldía Municipal de Santa Ana Este
        </div>
        <div class="col-12 col-sm-auto">
          <div class="row justify-center justify-sm-end q-gutter-md">
            <a href="#" class="footer-link">Aviso de privacidad</a>
            <a href="#" class="footer-link">Términos de uso</a>
          </div>
        </div>
      </div>
    </div>
  </q-footer>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'FooterSection',
})

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.direccion-link {
  text-decoration: none !important;
  color: inherit;
}
.direccion-link:hover {
  text-decoration: underline !important;
}
.footer-link {
  color: inherit;
  text-decoration: none;
  transition: color 0.15s ease;
}
.footer-link:hover,
.footer-link:focus-visible {
  color: #fff;
}
</style>