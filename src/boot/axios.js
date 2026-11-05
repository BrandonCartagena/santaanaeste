import { boot } from 'quasar/wrappers';
import axios from 'axios';
import { Notify } from 'quasar';

const CLOUD_WORKER_URL = 'https://meta-feed-proxy.brandonsteven2017.workers.dev';

const workerUrl =
  import.meta.env.VITE_NEWS_API_URL ||
  import.meta.env.VITE_WORKER_URL ||
  CLOUD_WORKER_URL;

const BASE_URL = workerUrl.replace(/\/$/, '');

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ---- Interceptor de REQUEST ----
api.interceptors.request.use(
  (config) => {
    // Si en el futuro agregas tokens (ej. para panel admin)
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Interceptor de RESPONSE ----
api.interceptors.response.use(
  (response) => response.data, // devolvemos directo el body
  (error) => {
    let message = 'Error inesperado al conectar con el servidor.';

    if (error.code === 'ECONNABORTED') {
      message = 'La solicitud tardó demasiado. Intenta nuevamente.';
    } else if (error.response) {
      const { status, data } = error.response;
      message = data?.message || `Error ${status}`;

      // Manejo centralizado por código
      switch (status) {
        case 401:
          message = 'No autorizado. Inicia sesión nuevamente.';
          // router.push('/login')  // cuando exista
          break;
        case 403:
          message = 'No tienes permisos para esta acción.';
          break;
        case 404:
          message = 'Recurso no encontrado.';
          break;
        case 500:
          message = 'Error interno del servidor.';
          break;
      }
    } else if (error.request) {
      message = 'Sin respuesta del servidor. Verifica tu conexión.';
    }

    // Notificación global (puedes silenciarla con config.silent = true)
    if (!error.config?.silent) {
      Notify.create({
        type: 'negative',
        message,
        position: 'top',
        timeout: 4000,
      });
    }

    return Promise.reject({ message, original: error });
  }
);

export default boot(({ app }) => {
  app.config.globalProperties.$api = api;
  app.config.globalProperties.$axios = axios;
});

export { api };