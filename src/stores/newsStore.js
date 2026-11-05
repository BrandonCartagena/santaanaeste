import { defineStore } from 'pinia'
import { api } from '../boot/axios'

const NEWS_LIMIT = 6
const CACHE_TTL_MS = 5 * 60 * 1000

function normalizePlatform(post) {
  const permalink = String(post?.permalink_url || post?.permalink || '').toLowerCase()
  const currentSource = String(post?.source || '').toLowerCase()
  const currentPlatform = String(post?.platform || '').toLowerCase()

  if (currentSource.includes('instagram') || currentPlatform.includes('instagram') || permalink.includes('instagram.com')) {
    return { ...post, source: 'instagram', platform: 'instagram' }
  }

  if (currentSource.includes('facebook') || currentPlatform.includes('facebook') || permalink.includes('facebook.com')) {
    return { ...post, source: 'facebook', platform: 'facebook' }
  }

  return { ...post, source: 'facebook', platform: 'facebook' }
}

export const useNewsStore = defineStore('news', {
  state: () => ({
    posts: [],
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
  },

  persist: {
    key: 'news-store',
    storage: localStorage,
    pick: ['posts', 'source', 'lastUpdated'],
  },

  actions: {
    async fetchNews({ force = false } = {}) {
      if (Array.isArray(this.posts) && this.posts.length) {
        this.posts = this.posts.map(normalizePlatform)
      }

      if (!force && this.isCacheFresh) {
        return
      }

      this.loading = true
      this.error = ''

      try {
        const response = await api.get('/api/news', {
          params: { limit: NEWS_LIMIT },
        })

        const posts = Array.isArray(response?.posts) ? response.posts.map(normalizePlatform) : []

        this.posts = posts
        this.source = response?.source || 'cloudflare-worker'
        this.lastUpdated = new Date().toISOString()
      } catch (error) {
        const message = error?.response?.data?.error || error?.message || 'No fue posible cargar las noticias.'
        this.error = message
      } finally {
        this.loading = false
      }
    },
  },
})