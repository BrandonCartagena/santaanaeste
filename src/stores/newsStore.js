import { defineStore } from 'pinia'
import { api } from '../boot/axios'

const NEWS_LIMIT = 8
const CACHE_TTL_MS = 5 * 60 * 1000

const HTML_PERMALINK_PATTERNS = [
  /facebook\.com\/photo/i,
  /facebook\.com\/[^/]+\/(posts|photos|videos)\//i,
  /facebook\.com\/permalink\.php/i,
  /facebook\.com\/story\.php/i,
  /instagram\.com\/(p|reel|tv)\//i,
]

function cleanImageUrl(value) {
  if (typeof value !== 'string') {
    return ''
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  const isSupportedProtocol =
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image/')

  if (!isSupportedProtocol) {
    return ''
  }

  const isHtmlPermalink = HTML_PERMALINK_PATTERNS.some((pattern) => pattern.test(trimmed))
  return isHtmlPermalink ? '' : trimmed
}

function extractUrlFromMediaItem(item) {
  if (!item) {
    return ''
  }

  if (typeof item === 'string') {
    return cleanImageUrl(item)
  }

  if (typeof item !== 'object') {
    return ''
  }

  const mediaType = String(item.media_type || item.type || '').toUpperCase()

  if (mediaType === 'VIDEO' || mediaType.includes('VIDEO')) {
    return (
      cleanImageUrl(item.thumbnail_url) ||
      cleanImageUrl(item.media?.image?.src) ||
      cleanImageUrl(item.media?.image?.url) ||
      cleanImageUrl(item.image?.src) ||
      cleanImageUrl(item.image?.url) ||
      cleanImageUrl(typeof item.image === 'string' ? item.image : '') ||
      cleanImageUrl(item.picture) ||
      cleanImageUrl(item.full_picture)
    )
  }

  return (
    cleanImageUrl(item.media?.image?.src) ||
    cleanImageUrl(item.media?.image?.url) ||
    cleanImageUrl(item.image?.src) ||
    cleanImageUrl(item.image?.url) ||
    cleanImageUrl(typeof item.image === 'string' ? item.image : '') ||
    cleanImageUrl(item.media_url) ||
    cleanImageUrl(item.full_picture) ||
    cleanImageUrl(item.thumbnail_url) ||
    cleanImageUrl(item.picture) ||
    cleanImageUrl(item.src) ||
    cleanImageUrl(item.url)
  )
}

function deduplicateUrls(urls) {
  const seenExact = new Set()
  const result = []

  for (const rawUrl of urls) {
    const url = cleanImageUrl(rawUrl)
    if (!url || seenExact.has(url)) {
      continue
    }

    seenExact.add(url)
    result.push(url)
  }

  return result
}

export function extractPostImages(post) {
  if (!post || typeof post !== 'object') {
    return []
  }

  // 1. Facebook subattachments (álbumes o publicaciones con múltiples fotos)
  const subattachmentUrls = []
  const attachmentsList = Array.isArray(post.attachments?.data)
    ? post.attachments.data
    : Array.isArray(post.attachments)
      ? post.attachments
      : []

  for (const attachment of attachmentsList) {
    const subItems = Array.isArray(attachment?.subattachments?.data)
      ? attachment.subattachments.data
      : Array.isArray(attachment?.subattachments)
        ? attachment.subattachments
        : []

    for (const subItem of subItems) {
      const url = extractUrlFromMediaItem(subItem)
      if (url) {
        subattachmentUrls.push(url)
      }
    }
  }

  const directSubItems = Array.isArray(post.subattachments?.data)
    ? post.subattachments.data
    : Array.isArray(post.subattachments)
      ? post.subattachments
      : []

  for (const subItem of directSubItems) {
    const url = extractUrlFromMediaItem(subItem)
    if (url) {
      subattachmentUrls.push(url)
    }
  }

  // 2. Instagram CAROUSEL_ALBUM children / carousel_media
  const carouselUrls = []
  const childrenList = Array.isArray(post.children?.data)
    ? post.children.data
    : Array.isArray(post.children)
      ? post.children
      : Array.isArray(post.carousel_media)
        ? post.carousel_media
        : []

  for (const child of childrenList) {
    const url = extractUrlFromMediaItem(child)
    if (url) {
      carouselUrls.push(url)
    }
  }

  // 3. Arreglos normalizados directos del worker o del store (images, photos, gallery, media_urls, media)
  const directArrayCandidates = [
    post.images,
    post.photos,
    post.gallery,
    post.media_urls,
    Array.isArray(post.media?.data) ? post.media.data : Array.isArray(post.media) ? post.media : null,
  ]

  const explicitArrayUrls = []
  for (const candidateList of directArrayCandidates) {
    if (!Array.isArray(candidateList)) {
      continue
    }

    for (const entry of candidateList) {
      const url = extractUrlFromMediaItem(entry)
      if (url) {
        explicitArrayUrls.push(url)
      }
    }
  }

  // Priorizar colecciones multi-imagen para evitar duplicar la portada con full_picture
  const multiCollection = deduplicateUrls([
    ...subattachmentUrls,
    ...carouselUrls,
    ...explicitArrayUrls,
  ])

  if (multiCollection.length > 0) {
    return multiCollection
  }

  // 4. Adjunto individual en attachments (cuando no hay subattachments)
  const singleAttachmentUrls = []
  for (const attachment of attachmentsList) {
    const url = extractUrlFromMediaItem(attachment)
    if (url) {
      singleAttachmentUrls.push(url)
    }
  }

  if (singleAttachmentUrls.length > 1) {
    return deduplicateUrls(singleAttachmentUrls)
  }

  // 5. Fallback para publicación de una sola imagen
  const singleCandidate =
    singleAttachmentUrls[0] ||
    extractUrlFromMediaItem(post) ||
    cleanImageUrl(post.full_picture) ||
    cleanImageUrl(post.media_url) ||
    cleanImageUrl(post.image) ||
    cleanImageUrl(post.thumbnail_url) ||
    cleanImageUrl(post.picture)

  return singleCandidate ? [singleCandidate] : []
}

export function resolvePostId(post, fallbackIndex = 0) {
  return String(
    post?.id ||
      post?.post_id ||
      post?.permalink_url ||
      post?.permalink ||
      post?.created_time ||
      post?.createdAt ||
      `post-${fallbackIndex}`,
  )
}

function detectPlatform(post) {
  const permalink = String(post?.permalink_url || post?.permalink || '').toLowerCase()
  const currentSource = String(post?.source || '').toLowerCase()
  const currentPlatform = String(post?.platform || '').toLowerCase()

  if (
    currentSource.includes('instagram') ||
    currentPlatform.includes('instagram') ||
    permalink.includes('instagram.com')
  ) {
    return 'instagram'
  }

  return 'facebook'
}

export function normalizePost(post, index = 0, storedImagesMap = {}) {
  const id = resolvePostId(post, index)
  const platform = detectPlatform(post)
  const extractedImages = extractPostImages(post)
  const cachedImages = Array.isArray(storedImagesMap?.[id])
    ? deduplicateUrls(storedImagesMap[id])
    : []

  const images =
    extractedImages.length >= cachedImages.length ? extractedImages : cachedImages
  const coverImage = images[0] || ''

  return {
    ...post,
    id,
    source: platform,
    platform,
    images,
    image: coverImage,
    full_picture: post?.full_picture || coverImage,
    imageCount: images.length,
    hasMultipleImages: images.length > 1,
  }
}

function buildPostImagesMap(posts) {
  const map = {}
  for (const [index, post] of posts.entries()) {
    const id = resolvePostId(post, index)
    map[id] = Array.isArray(post?.images) ? [...post.images] : extractPostImages(post)
  }
  return map
}

export const useNewsStore = defineStore('news', {
  state: () => ({
    posts: [],
    postImages: {},
    loading: false,
    error: '',
    source: '',
    lastUpdated: null,
  }),

  getters: {
    isCacheFresh: (state) => {
      if (!state.lastUpdated || !state.posts.length) {
        return false
      }

      return Date.now() - new Date(state.lastUpdated).getTime() < CACHE_TTL_MS
    },

    facebookPosts: (state) =>
      state.posts.filter((post) => detectPlatform(post) === 'facebook'),

    instagramPosts: (state) =>
      state.posts.filter((post) => detectPlatform(post) === 'instagram'),

    getPostImages: (state) => (postOrId) => {
      if (!postOrId) {
        return []
      }

      if (typeof postOrId === 'string') {
        if (Array.isArray(state.postImages?.[postOrId]) && state.postImages[postOrId].length) {
          return state.postImages[postOrId]
        }

        const found = state.posts.find((item) => item.id === postOrId)
        return found ? extractPostImages(found) : []
      }

      const id = resolvePostId(postOrId)
      if (Array.isArray(state.postImages?.[id]) && state.postImages[id].length) {
        return state.postImages[id]
      }

      if (Array.isArray(postOrId.images) && postOrId.images.length) {
        return postOrId.images
      }

      return extractPostImages(postOrId)
    },

    allFeedImages: (state) => {
      const items = []
      for (const [postIndex, post] of state.posts.entries()) {
        const id = resolvePostId(post, postIndex)
        const urls =
          Array.isArray(state.postImages?.[id]) && state.postImages[id].length
            ? state.postImages[id]
            : extractPostImages(post)

        urls.forEach((url, imageIndex) => {
          items.push({
            postId: id,
            url,
            index: imageIndex,
            totalInPost: urls.length,
            platform: detectPlatform(post),
            permalink: post?.permalink_url || post?.permalink || '#',
          })
        })
      }
      return items
    },
  },

  persist: {
    key: 'news-store',
    storage: localStorage,
    pick: ['posts', 'postImages', 'source', 'lastUpdated'],
  },

  actions: {
    hydrateAndNormalizePosts() {
      if (!Array.isArray(this.posts) || !this.posts.length) {
        this.postImages = {}
        return
      }

      const normalized = this.posts
        .slice(0, NEWS_LIMIT)
        .map((post, index) => normalizePost(post, index, this.postImages))

      this.posts = normalized
      this.postImages = buildPostImagesMap(normalized)
    },

    setPostImages(postId, imageUrls = []) {
      if (!postId) {
        return
      }

      const cleaned = deduplicateUrls(imageUrls)
      this.postImages = {
        ...this.postImages,
        [postId]: cleaned,
      }

      this.posts = this.posts.map((post, index) => {
        const id = resolvePostId(post, index)
        if (id !== postId) {
          return post
        }

        const coverImage = cleaned[0] || ''
        return {
          ...post,
          images: cleaned,
          image: coverImage,
          full_picture: coverImage,
          imageCount: cleaned.length,
          hasMultipleImages: cleaned.length > 1,
        }
      })
    },

    removeBrokenImage(postId, brokenUrl) {
      if (!postId || !brokenUrl) {
        return
      }

      const current = this.getPostImages(postId)
      const filtered = current.filter((url) => url !== brokenUrl)
      this.setPostImages(postId, filtered)
    },

    async fetchNews({ force = false, limit = NEWS_LIMIT } = {}) {
      this.hydrateAndNormalizePosts()

      if (!force && this.isCacheFresh) {
        return
      }

      this.loading = true
      this.error = ''

      try {
        const response = await api.get('/api/news', {
          params: { limit },
        })

        const rawPosts = Array.isArray(response?.posts)
          ? response.posts
          : Array.isArray(response?.data)
            ? response.data
            : []

        const normalizedPosts = rawPosts
          .slice(0, limit)
          .map((post, index) => normalizePost(post, index, this.postImages))

        this.posts = normalizedPosts
        this.postImages = buildPostImagesMap(normalizedPosts)
        this.source = response?.source || 'cloudflare-worker'
        this.lastUpdated = new Date().toISOString()
      } catch (error) {
        const message =
          error?.response?.data?.error ||
          error?.message ||
          'No fue posible cargar las noticias.'
        this.error = message
      } finally {
        this.loading = false
      }
    },
  },
})