<template>
  <section class="q-mb-xl">
    <div class="row items-center q-mb-md">
      <div class="text-h5 text-weight-bold">Noticias Oficiales</div>
      <q-space />
      <q-btn
        flat
        color="primary"
        icon="refresh"
        no-caps
        label="Actualizar"
        :loading="loading"
        @click="$emit('refresh')"
      />
    </div>

    <q-skeleton v-if="loading" type="rect" class="q-mb-sm" height="100px" />
    <q-skeleton v-if="loading" type="rect" class="q-mb-sm" height="100px" />

    <q-banner v-else-if="error" class="bg-red-1 text-negative q-mb-md rounded-borders">
      {{ error }}
    </q-banner>

    <q-list v-else bordered separator class="rounded-borders">
      <q-item v-for="post in posts" :key="post.id" clickable :href="post.permalink_url" target="_blank">
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white" icon="campaign" />
        </q-item-section>

        <q-item-section>
          <q-item-label lines="2">{{ post.message || 'Publicacion sin descripcion.' }}</q-item-label>
          <q-item-label caption>{{ formatDate(post.created_time) }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

    <q-banner v-if="!loading && !error && posts.length === 0" class="bg-grey-2 q-mt-md rounded-borders">
      No hay noticias disponibles por el momento.
    </q-banner>
  </section>
</template>

<script setup>
defineOptions({
  name: 'NewsFeed',
})

defineProps({
  posts: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})

defineEmits(['refresh'])

function formatDate(value) {
  if (!value) {
    return 'Sin fecha disponible'
  }

  return new Date(value).toLocaleString('es-SV', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>