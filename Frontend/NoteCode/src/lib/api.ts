import axios from 'axios'

const BACKEND = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '')

const api = axios.create({
  baseURL: BACKEND,
  withCredentials: true,
})

// Attempt a single refresh on 401 responses, then retry the original request once.
api.interceptors.response.use(
  (res) => res,
  async (error: any) => {
    const originalRequest = error?.config as any
    if (error?.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        await api.post('/user/refresh')
        return api(originalRequest)
      } catch (refreshErr) {
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

export default api
