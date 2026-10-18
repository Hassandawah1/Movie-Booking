import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.DEV
    ? "/api"
    : import.meta.env.VITE_API_BASE_URL || "https://movie-booking-backend-sable.vercel.app/api",
  headers: {
    "Content-Type": "application/json"
  }
})


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("movieBookingToken")
    if (token && token.trim() && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      
      const isAuthEndpoint =
        error.config?.url?.includes("/users/login") ||
        error.config?.url?.includes("/users/register")

      if (!isAuthEndpoint) {
        localStorage.removeItem("movieBookingToken")
      }
    }
    return Promise.reject(error)
  }
)

export default api
