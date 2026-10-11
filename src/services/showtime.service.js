import api from "../api/axios"



export const getShowtimesByMovie = async (movieId) => {
  const response = await api.get(`/showtimes/movie/${movieId}`)
  return response.data
}

export const getShowtimesForMovie = getShowtimesByMovie

export const getShowtimeById = async (showtimeId) => {
  const response = await api.get(`/showtimes/${showtimeId}`)
  return response.data
}

export const getAllShowtimes = async (params = {}) => {
  const response = await api.get("/showtimes", { params })
  return response.data
}

export default {
  getShowtimesByMovie,
  getShowtimeById,
  getAllShowtimes
}
