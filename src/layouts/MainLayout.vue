<template>
  <q-layout
    view="hHh lpR fFf"
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
  const maxScroll = Math.max(doc.scrollHeight - window.innerHeight, 1)
  targetProgress.value = clamp(window.scrollY / maxScroll, 0, 1)
}

function animateBackground() {
  const delta = targetProgress.value - scrollProgress.value

  if (Math.abs(delta) < 0.001) {
    scrollProgress.value = targetProgress.value
    animationFrameId = 0
    return
  }

  scrollProgress.value += delta * 0.08
  animationFrameId = window.requestAnimationFrame(animateBackground)
}

function handleScroll() {
  updateTargetProgress()

  if (animationFrameId === 0) {
    animationFrameId = window.requestAnimationFrame(animateBackground)
  }
}

const layoutStyle = computed(() => {
  const progress = scrollProgress.value

  return {
    '--page-bg-opacity': `${0.06 + progress * 0.2}`,
    '--page-bg-tint': `${210 + progress * 26}`,
    '--page-bg-glow': `${0.08 + progress * 0.28}`,
  }
})

onMounted(() => {
  handleScroll()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleScroll, { passive: true })
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
      circle at top,
      hsl(var(--page-bg-tint, 210) 34% 97% / 0.96),
      transparent 42%
    ),
    linear-gradient(
      180deg,
      #eff1f4 0%,
      #eef0f3 26%,
      hsl(var(--page-bg-tint, 210) 55% 95% / calc(0.65 + var(--page-bg-opacity, 0.06))) 58%,
      hsl(calc(var(--page-bg-tint, 210) + 18) 58% 89% / calc(0.5 + var(--page-bg-glow, 0.08))) 100%
    );
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-size: cover;
  overflow-x: hidden;
}
</style>