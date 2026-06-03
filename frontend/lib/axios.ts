import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Agregar token a las solicitudes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Manejar renovación de token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // No intentar renovación si la solicitud es para obtener token o no hay token
    const isTokenRequest = originalRequest.url?.includes('/auth/token/')
    const hasToken = localStorage.getItem('access_token')

    if (error.response?.status === 401 && !originalRequest._retry && !isTokenRequest && hasToken) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        })

        const { access } = response.data
        localStorage.setItem('access_token', access)

        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshError) {
        // La renovación falló, redirigir a login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
