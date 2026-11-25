<template>
  <section class="municipal-feed q-mb-xl">
    <!-- Encabezado institucional -->
    <div class="feed-header row items-end justify-between q-mb-lg q-col-gutter-md">
      <div class="col-12 col-md-auto">
        <div class="feed-eyebrow text-white">COMUNICACIÓN MUNICIPAL</div>
        <h2 class="feed-title text-white q-my-none">Noticias y Avisos Oficiales</h2>
        <p class="feed-subtitle text-grey-4 q-mt-xs q-mb-none">
          Mantente al día con las gestiones, obras y servicios para nuestra comunidad.
        </p>
      </div>

      <div class="col-12 col-md-auto row items-center q-gutter-sm justify-between justify-md-end">
        <!-- Filtros por red social -->
        <div v-if="hasBothPlatforms" class="filter-pills" role="tablist" aria-label="Filtrar por red social">
          <button
            type="button"
            class="filter-pill"
            :class="{ 'filter-pill--active': activeFilter === 'all' }"
            @click="activeFilter = 'all'"
          >
            Todas
          </button>
          <button
            type="button"
            class="filter-pill"
            :class="{ 'filter-pill--active': activeFilter === 'facebook' }"
            @click="activeFilter = 'facebook'"
          >
            <q-icon name="campaign" size="16px" class="q-mr-xs" />
            Facebook
          </button>
          <button
            type="button"
            class="filter-pill"
            :class="{ 'filter-pill--active': activeFilter === 'instagram' }"
            @click="activeFilter = 'instagram'"
          >
            <q-icon name="photo_camera" size="16px" class="q-mr-xs" />
            Instagram
          </button>
        </div>

        <q-btn
          unelevated
          no-caps
          icon="refresh"
          label="Actualizar"
          :loading="isLoading"
          class="refresh-btn"
          @click="handleRefresh"
        />
      </div>
    </div>

    <!-- Estado de carga -->
    <div v-if="isLoading && !displayedPosts.length" class="row q-col-gutter-lg q-mt-sm items-start">
      <!-- Skeleton Post Destacado -->
      <div class="col-12 col-md-7">
        <q-card flat bordered class="feed-card full-height column no-wrap">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <q-skeleton type="QAvatar" size="32px" class="q-mr-sm" />
              <q-skeleton type="text" width="150px" />
            </div>
            <q-skeleton type="text" class="q-mb-xs" width="90%" />
            <q-skeleton type="text" class="q-mb-md" width="70%" />
          </q-card-section>
          <q-skeleton height="400px" square />
        </q-card>
      </div>
      <!-- Skeleton Posts Laterales -->
      <div class="col-12 col-md-5 column q-gutter-y-md">
        <q-card v-for="n in 3" :key="`skeleton-${n}`" flat bordered class="feed-card q-pa-sm">
          <q-card-section>
            <div class="row items-center q-mb-sm">
              <q-skeleton type="QAvatar" size="24px" class="q-mr-sm" />
              <q-skeleton type="text" width="120px" />
            </div>
            <q-skeleton type="text" class="q-mb-xs" width="100%" />
            <q-skeleton type="text" width="60%" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Banner de error -->
    <q-banner
      v-else-if="errorMessage && !displayedPosts.length"
      class="feed-error-banner rounded-borders q-pa-md"
    >
      <template #avatar>
        <q-icon name="error_outline" color="negative" size="28px" />
      </template>
      <div class="text-weight-medium">{{ errorMessage }}</div>
      <template #action>
        <q-btn flat no-caps color="negative" label="Reintentar" @click="handleRefresh" />
      </template>
    </q-banner>

    <!-- Layout Principal: Destacado + Tarjetas Laterales -->
    <div v-else-if="displayedPosts.length" class="row q-col-gutter-lg q-mt-sm items-start">
      
      <!-- PUBLICACIÓN DESTACADA (Última publicación CON IMAGEN) -->
      <div v-if="featuredPost" class="col-12 col-md-7">
        <article 
          class="feed-card featured-card cursor-pointer full-width flex column no-wrap" 
          :class="getPlatformBorderClass(featuredPost)"
          @click="goToPost(featuredPost)"
        >
          <!-- Cabecera -->
          <div class="card-header row items-center q-px-md q-pt-md q-pb-sm">
            <q-avatar size="38px" class="q-mr-md" :color="isInstagramPost(featuredPost) ? 'pink-1' : 'blue-1'">
              <q-icon 
                :name="isInstagramPost(featuredPost) ? 'photo_camera' : 'campaign'" 
                :color="isInstagramPost(featuredPost) ? 'pink-6' : 'blue-8'"
                size="20px" 
              />
            </q-avatar>
            <div class="column">
              <span class="platform-name text-weight-bold">
                Alcaldía Municipal - {{ isInstagramPost(featuredPost) ? 'Instagram' : 'Facebook' }}
              </span>
              <span class="post-date">{{ formatDate(featuredPost.created_time || featuredPost.createdAt) }}</span>
            </div>
          </div>

          <!-- Texto -->
          <div class="card-body q-px-md q-pb-md">
            <p class="post-text q-my-none" :class="{ 'post-text--expanded': isExpanded(getPostKey(featuredPost)) }">
              {{ getCleanMessage(featuredPost) }}
            </p>
            <button
              v-if="shouldShowExpand(featuredPost)"
              type="button"
              class="read-more-btn q-mt-sm"
              @click.stop="toggleExpand(getPostKey(featuredPost))"
            >
              {{ isExpanded(getPostKey(featuredPost)) ? 'Mostrar menos' : 'Leer más' }}
            </button>
          </div>

          <!-- Imagen Destacada -->
          <div class="media-container col">
            <div class="media-top-bar" v-if="getPostImagesList(featuredPost).length > 1">
              <span class="multi-photo-pill" title="Varias fotografías">
                <q-icon name="collections" size="14px" />
                {{ getActiveImageIndex(featuredPost) + 1 }}/{{ getPostImagesList(featuredPost).length }}
              </span>
            </div>

            <template v-if="getPostImagesList(featuredPost).length > 1">
              <q-carousel
                :model-value="getActiveSlide(featuredPost)"
                swipeable
                animated
                infinite
                arrows
                control-color="white"
                class="post-media-carousel full-height"
                @update:model-value="(val) => setActiveSlide(featuredPost, 0, val)"
                @click.stop
              >
                <q-carousel-slide
                  v-for="(imgUrl, imgIdx) in getPostImagesList(featuredPost)"
                  :key="`${getPostKey(featuredPost)}-img-${imgIdx}`"
                  :name="imgIdx"
                  class="q-pa-none bg-black flex flex-center"
                >
                  <q-img :src="imgUrl" fit="contain" class="post-media-img" no-spinner @error="handleImageError(featuredPost, imgUrl)">
                    <template #error>
                      <div class="media-placeholder"><q-icon name="broken_image" size="32px" /></div>
                    </template>
                  </q-img>
                </q-carousel-slide>
              </q-carousel>
            </template>
            <template v-else-if="getPostImagesList(featuredPost).length === 1">
              <div class="bg-black full-height full-width flex flex-center">
                <q-img :src="getPostImagesList(featuredPost)[0]" fit="contain" class="post-media-img" no-spinner @error="handleImageError(featuredPost, getPostImagesList(featuredPost)[0])">
                  <template #error>
                    <div class="media-placeholder"><q-icon name="broken_image" size="32px" /></div>
                  </template>
                </q-img>
              </div>
            </template>
            <div v-else class="media-placeholder media-placeholder--institutional full-height">
              <q-icon name="account_balance" size="48px" class="q-mb-sm opacity-60" />
              <span class="text-subtitle1 text-weight-medium">Comunicado Oficial</span>
            </div>
          </div>

          <!-- Pie (Reacciones) -->
          <div class="card-footer q-px-md q-py-sm">
            <div v-if="!isInstagramPost(featuredPost) && hasReactions(featuredPost)" class="reaction-summary">
              <span class="reaction-item"><q-icon name="thumb_up_off_alt" size="16px" /> {{ formatCount(featuredPost.likes_count) }}</span>
              <span class="reaction-item"><q-icon name="chat_bubble_outline" size="16px" /> {{ formatCount(featuredPost.comments_count) }}</span>
              <span class="reaction-item"><q-icon name="share" size="16px" /> {{ formatCount(featuredPost.shares_count) }}</span>
            </div>
            <div v-else class="reaction-summary reaction-summary--muted">
              <span class="reaction-item">Canal oficial municipal</span>
            </div>
          </div>
        </article>
      </div>

      <!-- PUBLICACIONES LATERALES -->
      <div v-if="sidePosts.length" class="col-12 col-md-5 column q-gutter-y-md">
        <article
          v-for="(post, index) in sidePosts"
          :key="getPostKey(post, index)"
          class="feed-card side-card cursor-pointer column"
          :class="getPlatformBorderClass(post)"
          @click="goToPost(post)"
        >
          <!-- Cabecera Pequeña -->
          <div class="card-header row items-center q-px-md q-pt-md q-pb-xs">
            <q-avatar size="28px" class="q-mr-sm" :color="isInstagramPost(post) ? 'pink-1' : 'blue-1'">
              <q-icon 
                :name="isInstagramPost(post) ? 'photo_camera' : 'campaign'" 
                :color="isInstagramPost(post) ? 'pink-6' : 'blue-8'"
                size="14px" 
              />
            </q-avatar>
            <div class="column">
              <span class="platform-name text-weight-bold" style="font-size: 0.85rem;">
                {{ isInstagramPost(post) ? 'Instagram' : 'Facebook' }}
              </span>
              <span class="post-date" style="font-size: 0.75rem;">{{ formatDate(post.created_time || post.createdAt) }}</span>
            </div>
          </div>

          <!-- Texto resumido y botón Leer más -->
          <div class="card-body q-px-md q-pb-sm">
            <p 
              class="post-text post-text--side q-my-none" 
              :class="{ 'post-text--expanded': isExpanded(getPostKey(post, index)) }"
            >
              {{ getCleanMessage(post) }}
            </p>
            <button
              v-if="shouldShowExpand(post, 120)"
              type="button"
              class="read-more-btn q-mt-xs inline-block"
              style="font-size: 0.75rem;"
              @click.stop="toggleExpand(getPostKey(post, index))"
            >
              {{ isExpanded(getPostKey(post, index)) ? 'Mostrar menos' : 'Leer más' }}
            </button>
          </div>

          <!-- Pie (Reacciones) -->
          <div class="card-footer q-px-md q-py-sm q-mt-auto">
            <div v-if="!isInstagramPost(post) && hasReactions(post)" class="reaction-summary" style="font-size: 0.75rem;">
              <span class="reaction-item"><q-icon name="thumb_up_off_alt" size="14px" /> {{ formatCount(post.likes_count) }}</span>
              <span class="reaction-item"><q-icon name="chat_bubble_outline" size="14px" /> {{ formatCount(post.comments_count) }}</span>
            </div>
            <div v-else class="reaction-summary reaction-summary--muted" style="font-size: 0.75rem;">
              <span class="reaction-item">Canal oficial</span>
            </div>
          </div>
        </article>
      </div>

    </div>

    <!-- Estado vacío -->
    <div v-else class="empty-feed-state text-center q-pa-xl rounded-borders">
      <q-icon name="newspaper" size="48px" class="empty-icon q-mb-sm" />
      <div class="text-subtitle1 text-weight-bold text-slate-dark">
        No hay publicaciones disponibles en este momento
      </div>
      <div class="text-body2 text-grey-7 q-mt-xs">
        Intenta actualizar el panel o cambia el filtro seleccionado.
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, getCurrentInstance, reactive, ref } from 'vue'
import { extractPostImages, resolvePostId, useNewsStore } from '../stores/newsStore'

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

const emit = defineEmits(['refresh'])
const instance = getCurrentInstance()
const newsStore = useNewsStore()

const activeFilter = ref('all')
const activeSlidesByPost = reactive({})
const expandedPosts = reactive({})

// 1. Obtenemos TODOS los posts disponibles
const rawPosts = computed(() => {
  return Array.isArray(props.posts) && props.posts.length ? props.posts : newsStore.posts
})

const isLoading = computed(() => props.loading || newsStore.loading)
const errorMessage = computed(() => props.error || newsStore.error)

const hasBothPlatforms = computed(() => {
  const hasFb = rawPosts.value.some((post) => !isInstagramPost(post))
  const hasIg = rawPosts.value.some((post) => isInstagramPost(post))
  return hasFb && hasIg
})

// 2. Filtramos la lista dependiendo de la pestaña seleccionada
const displayedPosts = computed(() => {
  const fbPosts = rawPosts.value.filter((post) => !isInstagramPost(post))
  const igPosts = rawPosts.value.filter((post) => isInstagramPost(post))

  // Si se selecciona red social específica, mostrar hasta 5 publicaciones
  if (activeFilter.value === 'facebook') {
    return fbPosts.slice(0, 5)
  }
  if (activeFilter.value === 'instagram') {
    return igPosts.slice(0, 5)
  }

  // Si está en "Todas", intentamos mostrar 4 en total equilibradas. 
  // Si una red no tiene 2, la otra compensa hasta llegar a 4.
  let topFb = fbPosts.slice(0, 2)
  let topIg = igPosts.slice(0, 2)
  
  if (topFb.length < 2) {
      topIg = igPosts.slice(0, 4 - topFb.length)
  } else if (topIg.length < 2) {
      topFb = fbPosts.slice(0, 4 - topIg.length)
  }
  
  const combined = [...topFb, ...topIg]

  // Las ordenamos por fecha descendente para la línea del tiempo
  combined.sort((a, b) => {
    const dateA = new Date(a.created_time || a.createdAt).getTime() || 0
    const dateB = new Date(b.created_time || b.createdAt).getTime() || 0
    return dateB - dateA
  })

  return combined
})

// 3. Validar que la publicación destacada siempre tenga imagen
const featuredPost = computed(() => {
  if (!displayedPosts.value.length) return null
  const postWithImage = displayedPosts.value.find(post => getPostImagesList(post).length > 0)
  return postWithImage || displayedPosts.value[0]
})

// 4. Las publicaciones laterales simplemente renderizan lo que sobre de la lista 'displayedPosts'
const sidePosts = computed(() => {
  if (!featuredPost.value) return []
  const featuredId = getPostKey(featuredPost.value)
  // Devuelve todas las publicaciones filtradas, excluyendo la destacada
  return displayedPosts.value.filter(post => getPostKey(post) !== featuredId)
})

function getPlatformBorderClass(post) {
  return isInstagramPost(post) ? 'border-instagram' : 'border-facebook'
}

function getPostKey(post, index = 0) {
  return resolvePostId(post, index)
}

function getPostImagesList(post) {
  if (!post) return []
  const fromStore = newsStore.getPostImages(post)
  if (Array.isArray(fromStore) && fromStore.length) return fromStore
  if (Array.isArray(post.images) && post.images.length) return post.images
  return extractPostImages(post)
}

function getActiveSlide(post, index = 0) {
  const key = getPostKey(post, index)
  const total = getPostImagesList(post).length
  const current = activeSlidesByPost[key] ?? 0
  return current >= 0 && current < total ? current : 0
}

function getActiveImageIndex(post, index = 0) {
  return getActiveSlide(post, index)
}

function setActiveSlide(post, index, slideIndex) {
  const key = getPostKey(post, index)
  activeSlidesByPost[key] = slideIndex
}

function handleImageError(post, brokenUrl) {
  const postId = resolvePostId(post)
  newsStore.removeBrokenImage(postId, brokenUrl)
}

function handleRefresh() {
  const hasParentListener = Boolean(instance?.vnode?.props?.onRefresh)
  if (hasParentListener) {
    emit('refresh')
  } else {
    newsStore.fetchNews({ force: true })
  }
}

function getPermalink(post) {
  return post?.permalink_url || post?.permalink || '#'
}

function goToPost(post) {
  const url = getPermalink(post)
  if (url && url !== '#') {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

function getPlatform(post) {
  const source = String(post?.source || '').toLowerCase()
  const platform = String(post?.platform || '').toLowerCase()
  const permalink = String(getPermalink(post) || '').toLowerCase()

  if (source.includes('instagram') || platform.includes('instagram') || permalink.includes('instagram.com')) {
    return 'instagram'
  }
  return 'facebook'
}

function isInstagramPost(post) {
  return getPlatform(post) === 'instagram'
}

function getCleanMessage(post) {
  const raw = String(post?.message || post?.caption || '').trim()
  return raw || 'Publicación oficial compartida en nuestras redes sociales.'
}

// Límite de caracteres adaptativo
function shouldShowExpand(post, minLength = 250) {
  return getCleanMessage(post).length > minLength
}

function isExpanded(postKey) {
  return Boolean(expandedPosts[postKey])
}

function toggleExpand(postKey) {
  expandedPosts[postKey] = !expandedPosts[postKey]
}

function hasReactions(post) {
  return (
    Number.isFinite(Number(post?.likes_count)) ||
    Number.isFinite(Number(post?.comments_count)) ||
    Number.isFinite(Number(post?.shares_count))
  )
}

function formatCount(value) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue)
    ? new Intl.NumberFormat('es-SV').format(numericValue)
    : '0'
}

function formatDate(value) {
  if (!value) return 'Publicación reciente'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Publicación reciente'
  return parsed.toLocaleString('es-SV', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
</script>

<style scoped>
/* Paleta institucional */
.municipal-feed {
  --muni-primary: #355368;
  --muni-primary-dark: #263e4f;
  --muni-surface: #ffffff;
  --muni-border: rgba(53, 83, 104, 0.14);
  --muni-text-main: #1e293b;
  --muni-text-muted: #64748b;
}

.feed-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  padding-bottom: 18px;
}
.feed-eyebrow { font-size: 0.76rem; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 4px; }
.feed-title { font-size: clamp(1.45rem, 2.2vw, 1.85rem); font-weight: 800; line-height: 1.2; letter-spacing: -0.02em; }

/* Filtros */
.filter-pills { display: inline-flex; align-items: center; background: rgba(255, 255, 255, 0.15); padding: 4px; border-radius: 10px; gap: 4px; }
.filter-pill { border: none; background: transparent; color: #ffffff; font-size: 0.84rem; font-weight: 600; padding: 6px 12px; border-radius: 7px; cursor: pointer; transition: all 0.2s ease; }
.filter-pill:hover { background: rgba(255, 255, 255, 0.1); }
.filter-pill--active { background: #ffffff; color: var(--muni-primary-dark); box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); }
.refresh-btn { background: #ffffff; color: var(--muni-primary-dark); border-radius: 9px; font-weight: 600; padding: 6px 14px; }

/* TARJETAS COMUNES */
.feed-card {
  background: var(--muni-surface);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--muni-border);
}

.feed-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* COLORES DE BORDES POR RED SOCIAL */
.border-facebook {
  border-left: 5px solid #1877f2 !important;
}

.border-instagram {
  position: relative;
}

.border-instagram::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 5px;
  background: linear-gradient(to bottom, #833ab4, #fd1d1d, #fcb045);
  z-index: 4;
  pointer-events: none;
}
/* TARJETA DESTACADA */
.featured-card {
  min-height: 500px; 
}

/* TARJETAS LATERALES */
.side-card {
  min-height: 120px;
}

/* Cabeceras y textos */
.platform-name { color: var(--muni-text-main); font-size: 0.95rem; }
.post-date { color: var(--muni-text-muted); font-size: 0.82rem; }

.post-text {
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--muni-text-main);
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-line;
}
.post-text--side {
  -webkit-line-clamp: 3; 
  font-size: 0.88rem;
}
.post-text--expanded { display: block; -webkit-line-clamp: unset; }

.read-more-btn {
  background: none;
  border: none;
  padding: 0;
  color: var(--muni-primary);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  align-self: flex-start;
}
.read-more-btn:hover { text-decoration: underline; }

/* Contenedor de Imagen en Destacado */
.media-container {
  position: relative;
  width: 100%;
  min-height: 350px;
  background: #000000;
  border-top: 1px solid rgba(0,0,0,0.05);
  border-bottom: 1px solid rgba(0,0,0,0.05);
}
.post-media-carousel, .post-media-img { width: 100%; height: 100%; }
.media-top-bar { position: absolute; top: 10px; right: 10px; z-index: 3; }
.multi-photo-pill { background: rgba(15, 23, 42, 0.68); color: white; padding: 4px 8px; border-radius: 999px; font-size: 0.75rem; font-weight: bold; }
.media-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94a3b8; }

/* Pies de tarjeta */
.card-footer {
  border-top: 1px solid rgba(53, 83, 104, 0.06);
  background: #f8fafc;
}
.reaction-summary { display: inline-flex; align-items: center; gap: 12px; color: #64748b; font-weight: 600; }
.reaction-item { display: inline-flex; align-items: center; gap: 4px; }

/* Errores */
.empty-feed-state { background: #f8fafc; border: 1px dashed rgba(53, 83, 104, 0.25); }
</style>