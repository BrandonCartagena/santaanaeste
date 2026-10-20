<template>
  <q-page>
    <HeroBanner>
      <QuickServicesGrid />
    </HeroBanner>

    <div class="container q-pa-md q-pa-lg-md">
      <NewsFeed
        :posts="newsStore.posts"
        :loading="newsStore.loading"
        :error="newsStore.error"
        @refresh="newsStore.fetchNews"
      />
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import HeroBanner from '../components/HeroBanner.vue'
import NewsFeed from '../components/NewsFeed.vue'
import QuickServicesGrid from '../components/QuickServicesGrid.vue'
import { useNewsStore } from '../stores/newsStore'

defineOptions({
  name: 'IndexPage',
})

const newsStore = useNewsStore()

onMounted(() => {
  newsStore.fetchNews()
})
</script>

<style scoped>
.container {
  max-width: 1180px;
  margin: 0 auto;
}

</style>