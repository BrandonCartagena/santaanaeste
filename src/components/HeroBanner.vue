<template>
  <section class="hero-wrapper q-mb-lg">
    <q-carousel
        v-model="slide"
        animated
        infinite
        :autoplay="7500"
        transition-prev="fade"
        transition-next="fade"
        transition-duration="1500"
        class="hero-carousel"
        height="clamp(560px, 85vh, 900px)"
    >
      <q-carousel-slide
        v-for="item in items"
        :key="item.id"
        :name="item.id"
        :img-src="item.image"    
        class="hero-slide"
      >
        <div class="hero-overlay"></div>
      </q-carousel-slide>
    </q-carousel>
    <!-- 🔹 Contenido que vive SOBRE el carrusel -->
    <div class="hero-content">
      <div class="container q-pa-md q-pa-lg-md">
        <div class="row q-col-gutter-xl items-center">
          <!-- 🟢 Welcome a la izquierda (ya dentro del componente) -->
          <div class="col-12 col-md-5">
            <div class="welcome-text text-white">
              <div class="text-overline text-weight-bold" style="letter-spacing: 3px">
                BIENVENIDO
              </div>
              <h1 class="text-h2 text-weight-bold q-mt-sm q-mb-md welcome-title">
                Tu municipio,<br />más cerca de ti
              </h1>
              <p class="text-body1 text-grey-3 q-mb-lg welcome-subtitle">
                Accede a los servicios y trámites más consultados por los ciudadanos en un solo lugar.
              </p>
              <q-btn
                color="primary"
                unelevated
                no-caps
                label="Comenzar"
                icon-right="arrow_forward"
                to="/servicios"
              />
            </div>
          </div>

          <!-- 🟢 Grid (u otro contenido) entra por slot -->
          <div class="col-12 col-md-7">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({name: 'HeroBanner'})

const slide = ref('slide-1')

const items = [
  {
    id: 'slide-1',
    title: 'Avisos Municipales',
    subtitle: 'Informacion oficial y comunicados recientes.',
    image: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'slide-2',
    title: 'Proyectos Comunitarios',
    subtitle: 'Conoce las mejoras en tu distrito.',
    image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'slide-3',
    title: 'Servicios en Linea',
    subtitle: 'Accede a tramites y consultas desde casa.',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80',
  },
]
</script>

<style scoped>
.hero-wrapper {
  position: relative;
  isolation: isolate;
  height: clamp(560px, 85vh, 900px);  
  overflow: hidden;  
}

.hero-carousel {
  overflow: hidden;
}

/* Forzamos con !important para descartar problemas de especificidad */
:deep(.q-carousel__slide) {
  padding: 0 !important;
  background-size: cover !important;
  background-position: center !important;
  /* background: red !important; /* 👈 para ver si se aplica */
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.75) 0%,
    rgba(0, 0, 0, 0.25) 60%,
    transparent 100%
  );
  z-index: 1;
  pointer-events: none;  /* 👈 importante: no bloquea clics */
}

/* Capa de contenido: absolute sobre el carrusel, sin bloquear las flechas */
.hero-content {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  pointer-events: none;          /* deja pasar clics a flechas/dots */
  padding-top: 64px;
  padding-bottom: 24px;
  box-sizing: border-box;
}
.hero-content .container {
  pointer-events: auto;          /* reactiva clics donde hay contenido real */
  width: 100%;
}

.container {
  max-width: 1180px;
  margin: 0 auto;
}

.welcome-title {
  line-height: 1.05;
  text-shadow: 0 2px 24px rgba(0, 0, 0, 0.55);
}
.welcome-subtitle {
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.5);
  max-width: 46ch;
}

.hero-floating-top-right {
  position: absolute;
  top: clamp(1rem, 3vw, 2rem);
  right: clamp(3rem, 5vw, 4rem);
  z-index: 10;
}

@media (max-width: 1023px) {
  .hero-wrapper {
    height: auto;
    min-height: 100vh;
    min-height: 100dvh;                   /* mejor en móviles modernos */
  }

  /* El carrusel se vuelve absoluto para cubrir todo el wrapper creciente */
  .hero-carousel {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100% !important;              /* vence al prop `height` de Quasar */
  }

  /* El contenido vuelve al flujo normal y respeta el header */
  .hero-content {
    position: relative;
    inset: auto;
    height: auto;
    min-height: 100vh;
    min-height: 100dvh;
    display: block;
    padding-top: 88px;                    /* 👈 debajo del q-header */
    padding-bottom: 3rem;
  }

  .welcome-text { text-align: center; }
  .welcome-subtitle { margin-left: auto; margin-right: auto; }
  .welcome-title { font-size: 2rem !important; line-height: 1.15; }
}
</style>