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
        <!-- Filtros limpios por red social -->
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

    <!-- Estado de carga (Skeletons integrados al Timeline) -->
    <div v-if="isLoading && !displayedPosts.length" class="q-px-md q-py-lg">
      <q-timeline :layout="timelineLayout" color="secondary">
        <q-timeline-entry v-for="n in 4" :key="`skeleton-${n}`" :side="n % 2 === 0 ? 'right' : 'left'">
          <q-card flat bordered class="timeline-card row no-wrap">
            <q-skeleton width="150px" height="100%" square />
            <q-card-section class="col flex flex-center">
              <div class="full-width text-center">
                <q-skeleton type="text" class="q-mb-xs q-mx-auto" width="60%" />
                <q-skeleton type="text" class="q-mx-auto" width="80%" />
              </div>
            </q-card-section>
          </q-card>
        </q-timeline-entry>
      </q-timeline>
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

    <!-- Timeline de publicaciones establecidas -->
    <div v-else-if="displayedPosts.length" class="q-px-sm q-px-md-md q-py-lg q-mt-md text-blue-grey-2">
      <q-timeline :layout="timelineLayout" color="primary">
        <q-timeline-entry
          v-for="(post, index) in displayedPosts"
          :key="getPostKey(post, index)"
          :title="isInstagramPost(post) ? 'Instagram' : 'Facebook'"
          :subtitle="formatDate(post.created_time || post.createdAt)"
          :side="index % 2 === 0 ? 'left' : 'right'"
          :icon="isInstagramPost(post) ? 'photo_camera' : 'campaign'"
          :color="isInstagramPost(post) ? 'pink-8' : 'blue-8'"
        >
          <!-- Contenedor principal (Fila para imagen y texto a la par) -->
          <article class="timeline-card cursor-pointer row no-wrap" @click="goToPost(post)">
            
            <!-- Contenedor multimedia redimensionado a la izquierda -->
            <div class="media-container">
              <!-- Indicador de múltiples fotos -->
              <div class="media-top-bar" v-if="getPostImagesList(post).length > 1">
                <span class="multi-photo-pill" title="Varias fotografías">
                  <q-icon name="collections" size="12px" />
                  {{ getActiveImageIndex(post, index) + 1 }}/{{ getPostImagesList(post).length }}
                </span>
              </div>

              <!-- Caso A: Múltiples imágenes -->
              <template v-if="getPostImagesList(post).length > 1">
                <q-carousel
                  :model-value="getActiveSlide(post, index)"
                  swipeable
                  animated
                  infinite
                  arrows
                  control-color="white"
                  class="post-media-carousel full-height"
                  @update:model-value="(val) => setActiveSlide(post, index, val)"
                  @click.stop
                >
                  <q-carousel-slide
                    v-for="(imgUrl, imgIdx) in getPostImagesList(post)"
                    :key="`${getPostKey(post, index)}-img-${imgIdx}`"
                    :name="imgIdx"
                    class="q-pa-none bg-black flex flex-center"
                  >
                    <q-img
                      :src="imgUrl"
                      fit="contain"
                      class="post-media-img"
                      no-spinner
                      @error="handleImageError(post, imgUrl)"
                    >
                      <template #error>
                        <div class="media-placeholder">
                          <q-icon name="broken_image" size="24px" />
                        </div>
                      </template>
                    </q-img>
                  </q-carousel-slide>
                </q-carousel>
              </template>

              <!-- Caso B: Una sola imagen -->
              <template v-else-if="getPostImagesList(post).length === 1">
                <div class="bg-black full-height full-width flex flex-center">
                  <q-img
                    :src="getPostImagesList(post)[0]"
                    fit="contain"
                    class="post-media-img post-media-img--single"
                    no-spinner
                    @error="handleImageError(post, getPostImagesList(post)[0])"
                  >
                    <template #error>
                      <div class="media-placeholder">
                        <q-icon name="broken_image" size="24px" />
                      </div>
                    </template>
                  </q-img>
                </div>
              </template>

              <!-- Caso C: Solo texto -->
              <div v-else class="media-placeholder media-placeholder--institutional full-height">
                <q-icon name="account_balance" size="28px" class="q-mb-xs opacity-80" />
                <span class="text-caption text-weight-medium">Aviso</span>
              </div>
            </div>

            <!-- Cuerpo de texto y pie a la derecha (Texto centrado) -->
            <div class="content-container col column justify-between">
              <div class="card-body flex column justify-center items-center text-center">
                <p
                  class="post-text q-my-none"
                  :class="{ 'post-text--expanded': isExpanded(getPostKey(post, index)) }"
                >
                  {{ getCleanMessage(post) }}
                </p>

                <button
                  v-if="shouldShowExpand(post)"
                  type="button"
                  class="read-more-btn q-mt-sm"
                  @click.stop="toggleExpand(getPostKey(post, index))"
                >
                  {{ isExpanded(getPostKey(post, index)) ? 'Mostrar menos' : 'Leer más' }}
                </button>
              </div>

              <!-- Pie de la tarjeta oscura -->
              <div class="card-footer">
                <div v-if="!isInstagramPost(post) && hasReactions(post)" class="reaction-summary">
                  <span class="reaction-item" title="Me gusta">
                    <q-icon name="thumb_up_off_alt" size="14px" />
                    {{ formatCount(post.likes_count) }}
                  </span>
                  <span class="reaction-item" title="Comentarios">
                    <q-icon name="chat_bubble_outline" size="14px" />
                    {{ formatCount(post.comments_count) }}
                  </span>
                  <span class="reaction-item" title="Compartidos">
                    <q-icon name="share" size="14px" />
                    {{ formatCount(post.shares_count) }}
                  </span>
                </div>
                <div v-else class="reaction-summary reaction-summary--muted">
                  <span class="reaction-item">Canal oficial</span>
                </div>
                
                <div class="card-action-link">
                  <span class="gt-xs">Ir al post</span>
                  <q-icon name="arrow_forward" size="14px" />
                </div>
              </div>
            </div>
          </article>
        </q-timeline-entry>
      </q-timeline>
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
import { useQuasar } from 'quasar'
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
  maxPosts: {
    type: Number,
    default: 10,
  },
})

const emit = defineEmits(['refresh'])

const $q = useQuasar()
const instance = getCurrentInstance()
const newsStore = useNewsStore()

const activeFilter = ref('all')
const activeSlidesByPost = reactive({})
const expandedPosts = reactive({})

// Layout denso en móviles, espaciado a los lados en pantallas grandes
const timelineLayout = computed(() => ($q.screen.lt.md ? 'dense' : 'loose'))

const sourcePosts = computed(() => {
  const rawList = Array.isArray(props.posts) && props.posts.length ? props.posts : newsStore.posts
  return rawList.slice(0, props.maxPosts)
})

const isLoading = computed(() => props.loading || newsStore.loading)
const errorMessage = computed(() => props.error || newsStore.error)

const hasBothPlatforms = computed(() => {
  const hasFb = sourcePosts.value.some((post) => !isInstagramPost(post))
  const hasIg = sourcePosts.value.some((post) => isInstagramPost(post))
  return hasFb && hasIg
})

const displayedPosts = computed(() => {
  if (activeFilter.value === 'facebook') {
    return sourcePosts.value.filter((post) => !isInstagramPost(post))
  }
  if (activeFilter.value === 'instagram') {
    return sourcePosts.value.filter((post) => isInstagramPost(post))
  }
  return sourcePosts.value
})

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

function shouldShowExpand(post) {
  return getCleanMessage(post).length > 150
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
  --muni-primary-soft: #eaf0f4;
  --muni-surface: #ffffff;
  --muni-border: rgba(53, 83, 104, 0.14);
  --muni-text-main: #1e293b;
  --muni-text-muted: #64748b;
}

.feed-header {
  border-bottom: 1px solid rgba(53, 83, 104, 0.12);
  padding-bottom: 18px;
}

.feed-eyebrow {
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muni-primary);
  margin-bottom: 4px;
}

.feed-title {
  font-size: clamp(1.45rem, 2.2vw, 1.85rem);
  font-weight: 800;
  line-height: 1.2;
  color: var(--muni-text-main);
  letter-spacing: -0.02em;
}

.feed-subtitle {
  font-size: 0.95rem;
  color: var(--muni-text-muted);
}

/* Filtros */
.filter-pills {
  display: inline-flex;
  align-items: center;
  background: #eef2f6;
  padding: 4px;
  border-radius: 10px;
  gap: 4px;
}
.filter-pill {
  appearance: none;
  border: none;
  background: transparent;
  color: #475569;
  font-size: 0.84rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 7px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.2s ease;
}
.filter-pill:hover { color: var(--muni-primary-dark); }
.filter-pill--active {
  background: #ffffff;
  color: var(--muni-primary-dark);
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
}
.refresh-btn { background: var(--muni-primary); color: #ffffff; border-radius: 9px; font-weight: 600; padding: 6px 14px; transition: background 0.2s ease, transform 0.15s ease; }
.refresh-btn:hover { background: var(--muni-primary-dark); }


/* TARJETA OSCURA EN DISEÑO DE FILA */
.timeline-card {
  background: #1e293b; /* Fondo oscuro */
  color: #f1f5f9; /* Texto general claro */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-height: 150px;
}

.timeline-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  border-color: rgba(255, 255, 255, 0.2);
}

/* Sección de la imagen (Izquierda) */
.media-container {
  position: relative;
  width: 140px;
  flex-shrink: 0;
  background: #000000;
  display: flex;
  flex-direction: column;
}

@media (min-width: 600px) {
  .media-container {
    width: 180px; 
  }
}

.post-media-carousel,
.post-media-img {
  width: 100%;
  height: 100%;
  flex-grow: 1;
}

.post-media-carousel :deep(.q-carousel__prev-arrow),
.post-media-carousel :deep(.q-carousel__next-arrow) {
  background: rgba(15, 23, 42, 0.52);
  backdrop-filter: blur(6px);
  margin: 0 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.media-container:hover .post-media-carousel :deep(.q-carousel__prev-arrow),
.media-container:hover .post-media-carousel :deep(.q-carousel__next-arrow) { opacity: 1; }

.media-top-bar {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 3;
  pointer-events: none;
}
.multi-photo-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #ffffff;
  background: rgba(15, 23, 42, 0.68);
  backdrop-filter: blur(6px);
}

.media-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}
.media-placeholder--institutional {
  background: linear-gradient(135deg, #355368 0%, #263e4f 100%);
  color: rgba(255, 255, 255, 0.9);
}

/* Sección de Contenido (Derecha) */
.content-container {
  min-width: 0; 
}

.card-body {
  padding: 16px 20px;
  flex: 1;
}

.post-text {
  font-size: 0.92rem;
  line-height: 1.5;
  color: #e2e8f0; /* Texto claro */
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: pre-line;
}
.post-text--expanded {
  display: block;
  line-clamp: unset;
  -webkit-line-clamp: unset;
}
.read-more-btn {
  background: none;
  border: none;
  padding: 0;
  color: #93c5fd; /* Azul claro para destacar en fondo oscuro */
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}
.read-more-btn:hover { text-decoration: underline; }

/* Pie de tarjeta en fondo oscuro */
.card-footer {
  padding: 8px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.reaction-summary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8; /* Gris claro */
  font-size: 0.72rem;
  font-weight: 600;
}
.reaction-summary--muted { color: #64748b; font-weight: 500; }
.reaction-item { display: inline-flex; align-items: center; gap: 4px; }
.card-action-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #93c5fd;
}

/* Otros */
.feed-error-banner { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
.empty-feed-state { background: #f8fafc; border: 1px dashed rgba(53, 83, 104, 0.25); }
.empty-icon { color: var(--muni-primary); opacity: 0.7; }
</style>