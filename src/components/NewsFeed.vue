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

    <div v-if="loading" class="column q-gutter-md">
      <q-skeleton type="rect" class="rounded-borders" height="420px" />
      <q-skeleton type="rect" class="rounded-borders" height="420px" />
    </div>

    <q-banner v-else-if="error" class="bg-red-1 text-negative q-mb-md rounded-borders">
      {{ error }}
    </q-banner>

    <template v-else>
      <div v-if="facebookPosts.length" class="platform-section">
        <div class="row items-center q-mb-sm">
          <q-avatar color="primary" text-color="white" icon="campaign" size="30px" class="q-mr-sm" />
          <div class="text-subtitle1 text-weight-bold">Publicaciones de Facebook</div>
          <q-space />
          <q-badge color="primary" outline>{{ facebookPosts.length }} publicaciones</q-badge>
        </div>

        <div @mouseenter="isFacebookHovered = true" @mouseleave="isFacebookHovered = false">
          <q-carousel
            v-model="facebookSlide"
            swipeable
            animated
            infinite
            arrows
            :autoplay="isFacebookHovered ? false : autoplayMs"
            control-color="primary"
            class="news-carousel bg-transparent"
          >
            <q-carousel-slide
              v-for="(post, index) in facebookPosts"
              :key="getSlideName(post, index)"
              :name="getSlideName(post, index)"
              class="q-pa-none slide-center"
            >
              <q-card
                bordered
                flat
                class="post-card post-card--clickable"
                tag="a"
                :href="getPermalink(post)"
                target="_blank"
                rel="noopener noreferrer"
              >
                <q-img
                  v-if="getImage(post)"
                  :src="getImage(post)"
                  :ratio="16 / 9"
                  class="post-image"
                  fit="cover"
                  no-spinner
                />
                <div v-else class="post-image post-image--empty">
                  <q-icon name="image_not_supported" size="40px" color="grey-6" />
                </div>

                <q-card-section class="q-pb-sm">
                  <div class="post-message">{{ post.message || 'Publicación sin descripción.' }}</div>
                  <div class="text-caption text-grey-7 q-mt-sm">
                    {{ formatDate(post.created_time || post.createdAt) }}
                  </div>

                  <div class="reaction-strip q-mt-md" aria-label="Reacciones de Facebook">
                    <q-chip dense square color="blue-1" text-color="blue-10" icon="thumb_up">
                      {{ formatCount(post.likes_count) }}
                    </q-chip>
                    <q-chip dense square color="grey-2" text-color="grey-9" icon="comment">
                      {{ formatCount(post.comments_count) }}
                    </q-chip>
                    <q-chip dense square color="amber-2" text-color="brown-8" icon="share">
                      {{ formatCount(post.shares_count) }}
                    </q-chip>
                  </div>
                </q-card-section>
              </q-card>
            </q-carousel-slide>
          </q-carousel>
        </div>
      </div>

      <div v-if="instagramPosts.length" class="platform-section">
        <div class="row items-center q-mb-sm">
          <q-avatar color="negative" text-color="white" icon="photo_camera" size="30px" class="q-mr-sm" />
          <div class="text-subtitle1 text-weight-bold">Publicaciones de Instagram</div>
          <q-space />
          <q-badge color="negative" outline>{{ instagramPosts.length }} publicaciones</q-badge>
        </div>

        <div @mouseenter="isInstagramHovered = true" @mouseleave="isInstagramHovered = false">
          <q-carousel
            v-model="instagramSlide"
            swipeable
            animated
            infinite
            arrows
            :autoplay="isInstagramHovered ? false : autoplayMs"
            control-color="negative"
            class="news-carousel bg-transparent"
          >
            <q-carousel-slide
              v-for="(post, index) in instagramPosts"
              :key="getSlideName(post, index)"
              :name="getSlideName(post, index)"
              class="q-pa-none slide-center"
            >
              <q-card
                bordered
                flat
                class="post-card post-card--clickable"
                tag="a"
                :href="getPermalink(post)"
                target="_blank"
                rel="noopener noreferrer"
              >
                <q-img
                  v-if="getImage(post)"
                  :src="getImage(post)"
                  :ratio="16 / 9"
                  class="post-image"
                  fit="cover"
                  no-spinner
                />
                <div v-else class="post-image post-image--empty">
                  <q-icon name="image_not_supported" size="40px" color="grey-6" />
                </div>

                <q-card-section class="q-pb-sm">
                  <div class="post-message">{{ post.message || 'Publicación sin descripción.' }}</div>
                  <div class="text-caption text-grey-7 q-mt-sm">
                    {{ formatDate(post.created_time || post.createdAt) }}
                  </div>
                </q-card-section>
              </q-card>
            </q-carousel-slide>
          </q-carousel>
        </div>
      </div>
    </template>

    <q-banner v-if="!loading && !error && posts.length === 0" class="bg-grey-2 q-mt-md rounded-borders">
      No hay noticias disponibles por el momento.
    </q-banner>
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

defineOptions({
  name: 'NewsFeed',
})

const props = defineProps({
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

const facebookSlide = ref('')
const instagramSlide = ref('')
const autoplayMs = 4500
const isFacebookHovered = ref(false)
const isInstagramHovered = ref(false)

const instagramPosts = computed(() => props.posts.filter((post) => isInstagramPost(post)))
const facebookPosts = computed(() => props.posts.filter((post) => !isInstagramPost(post)))

watch(
  facebookPosts,
  (items) => {
    const slideNames = items.map((post, index) => getSlideName(post, index))
    facebookSlide.value = slideNames.includes(facebookSlide.value) ? facebookSlide.value : (slideNames[0] || '')
  },
  { immediate: true },
)

watch(
  instagramPosts,
  (items) => {
    const slideNames = items.map((post, index) => getSlideName(post, index))
    instagramSlide.value = slideNames.includes(instagramSlide.value) ? instagramSlide.value : (slideNames[0] || '')
  },
  { immediate: true },
)

function getSlideName(post, index) {
  return `${post.id || post.created_time || 'post'}-${index}`
}

function getImage(post) {
  return post.full_picture || post.image || post.media_url || ''
}

function getPermalink(post) {
  return post.permalink_url || post.permalink || '#'
}

function getPlatform(post) {
  const source = String(post?.source || '').toLowerCase()
  const platform = String(post?.platform || '').toLowerCase()
  const permalink = String(getPermalink(post) || '').toLowerCase()

  if (source.includes('instagram') || platform.includes('instagram') || permalink.includes('instagram.com')) {
    return 'instagram'
  }

  if (source.includes('facebook') || platform.includes('facebook') || permalink.includes('facebook.com')) {
    return 'facebook'
  }

  return source || platform || 'facebook'
}

function isInstagramPost(post) {
  return getPlatform(post) === 'instagram'
}

function formatCount(value) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? new Intl.NumberFormat('es-SV').format(numericValue) : 'Sin dato'
}

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

<style scoped>
.platform-section {
  margin-bottom: 32px;
}

.news-carousel {
  border-radius: 14px;
  overflow: hidden;
}

.slide-center {
  display: flex;
  justify-content: center;
  align-items: stretch;
  padding: 0 8px;
}

.post-card {
  border-radius: 14px;
  width: 100%;
  max-width: 350px;
  min-height: 100%;
}

.post-card--clickable {
  color: inherit;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.post-card--clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.1);
}

.post-image {
  background: #f3f4f6;
}

.post-image--empty {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #f7f7f7, #e9ecef);
}

.post-message {
  font-size: 0.98rem;
  line-height: 1.45;
  display: -webkit-box;
  line-clamp: 4;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.reaction-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
}

@media (max-width: 768px) {
  .post-card {
    max-width: 100%;
  }

  .post-message {
    line-clamp: 3;
    -webkit-line-clamp: 3;
    font-size: 0.94rem;
  }
}
</style>