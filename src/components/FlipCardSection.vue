<template>
  <div class="flip-container" @click="volteado = !volteado">
    <div class="flipper" :class="{ 'is-flipped': volteado }">
      
      <!-- Cara Frontal -->
      <q-card-section class="front" :class="frontClass">
        <slot name="front">Texto por defecto frontal</slot>
      </q-card-section>

      <!-- Cara Trasera -->
      <q-card-section class="back" :class="backClass">
        <slot name="back">Texto por defecto trasero</slot>
      </q-card-section>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  frontClass: { type: String, default: 'bg-primary text-white' },
  backClass: { type: String, default: 'bg-secondary text-white' }
})

// Estado aislado: cada tarjeta tendrá su propia copia de esta variable
const volteado = ref(false)
</script>

<style scoped>
.flip-container {
  perspective: 1000px;
  cursor: pointer;
}

.flipper {
  position: relative;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flipper.is-flipped {
  transform: rotateY(180deg);
}

.front, .back {
  width: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden; /* Necesario para Chrome/Safari */
  overflow: hidden;
}

/* Estado inicial (sin voltear) */
.front {
  position: relative;
  z-index: 2;
  transform: rotateY(0deg); /* Fuerza la aceleración 3D para que backface-visibility funcione */
  visibility: visible;
  transition: visibility 0s 0.3s;
}

.back {
  position: absolute;
  top: 0;
  left: 0;
  transform: rotateY(180deg);
  visibility: hidden;
  transition: visibility 0s 0.3s;
}

/* Estado volteado */
.flipper.is-flipped .front {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  visibility: hidden;
}

.flipper.is-flipped .back {
  position: relative;
  z-index: 2;
  visibility: visible;
}
</style>