import { defineStore } from 'pinia'
import { api } from '../boot/axios'

export const useNewsStore = defineStore('news', {
  state: () => ({
    posts: [],
    loading: false,
    error: '',
    source: '',
    lastUpdated: null,
  }),

  actions: {
    async fetchNews() {
      this.loading = true
      this.error = ''

      try {
        const response = await api.get('/fetch-facebook')
        this.posts = Array.isArray(response?.posts) ? response.posts : []
        this.source = response?.source || 'unknown'
        this.lastUpdated = new Date().toISOString()
      } catch (error) {
        this.error = error?.message || 'No fue posible cargar las noticias.'
      } finally {
        this.loading = false
      }
    },
  },
})