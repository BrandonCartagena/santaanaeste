
<template>
  <q-layout
    view="hHh lpR fff"
    class="main-layout"
    :style="layoutStyle"
  >
    <HeaderNav />

    <q-page-container>
      <router-view />
    </q-page-container>

    <FooterSection />
  </q-layout>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import FooterSection from '../components/FooterSection.vue'
import HeaderNav from '../components/HeaderNav.vue'

defineOptions({
  name: 'MainLayout',
})

const scrollProgress = ref(0)
const targetProgress = ref(0)

let animationFrameId = 0

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function updateTargetProgress() {
  const doc = document.documentElement

  const maxScroll = Math.max(
    doc.scrollHeight - window.innerHeight,
    1
  )

  targetProgress.value = clamp(
    window.scrollY / maxScroll,
    0,
    1
  )
}

function animateBackground() {
  const delta = targetProgress.value - scrollProgress.value

  if (Math.abs(delta) < 0.001) {
    scrollProgress.value = targetProgress.value
    animationFrameId = 0
    return
  }

  scrollProgress.value += delta * 0.08

  animationFrameId = window.requestAnimationFrame(
    animateBackground
  )
}

function handleScroll() {
  updateTargetProgress()

  if (animationFrameId === 0) {
    animationFrameId = window.requestAnimationFrame(
      animateBackground
    )
  }
}

const layoutStyle = computed(() => {
  const progress = scrollProgress.value

  return {
    '--warm-opacity': 0.10 + progress * 0.18,
    '--glow-position': `${20 + progress * 45}%`,
  }
})

onMounted(() => {
  handleScroll()

  window.addEventListener('scroll', handleScroll, {
    passive: true,
  })

  window.addEventListener('resize', handleScroll, {
    passive: true,
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleScroll)

  if (animationFrameId !== 0) {
    window.cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped>
.main-layout {
  position: relative;
  min-height: 100vh;

  background:
    radial-gradient(
      ellipse at 50% var(--glow-position, 20%),
      rgba(243, 198, 158, var(--warm-opacity, 0.10)),
      transparent 55%
    ),
    linear-gradient(
      180deg,
      #8495A1 0%,
      #A5A4A0 28%,
      #C5A79C 55%,
      #E7B49A 80%,
      #F3C69E 100%
    );

  background-attachment: fixed;
  background-repeat: no-repeat;
  background-size: cover;

  overflow-x: hidden;
}
</style>
