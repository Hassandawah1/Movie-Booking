import api from "../api/axios"

/**
 * Movie Service — customer-facing movie operations
 * Connects to our backend Cinema API (not external providers)
 */

export const getMovies = async (params = {}) => {
  const response = await api.get("/movies", { params })
  return response.data
}

export const getMovieById = async (id) => {
  const response = await api.get(`/movies/${id}`)
  return response.data
}

export const getMoviesByStatus = async (status) => {
  const response = await api.get("/movies", { params: { status } })
  return response.data
}

export default {
  getMovies,
  getMovieById,
  getMoviesByStatus
}
