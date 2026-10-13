import api from "../api/axios"




export const getDashboardSummary = async () => {
  const response = await api.get("/admin/dashboard")
  return response.data
}


export const getRevenueAnalytics = async (params = {}) => {
  const query = {}
  if (params.startDate) query.startDate = params.startDate
  if (params.endDate) query.endDate = params.endDate

  const response = await api.get("/admin/analytics/revenue", { params: query })
  return response.data
}


export const getRevenueTrend = async (period = "7d") => {
  const response = await api.get("/admin/analytics/revenue-trend", {
    params: { period: period === "30d" ? "30d" : "7d" }
  })
  return response.data
}


export const getTopMovies = async (sortBy = "revenue", limit = 10) => {
  const response = await api.get("/admin/analytics/top-movies", {
    params: { sortBy: sortBy === "bookings" ? "bookings" : "revenue", limit }
  })
  return response.data
}


export const getBookingAnalytics = async () => {
  const response = await api.get("/admin/analytics/bookings")
  return response.data
}


export const getPaymentAnalytics = async () => {
  const response = await api.get("/admin/analytics/payments")
  return response.data
}


export const getRecentBookings = async (limit = 10) => {
  const response = await api.get("/admin/bookings/recent", { params: { limit } })
  return response.data
}


export const getUpcomingShowtimes = async (limit = 10) => {
  const response = await api.get("/admin/showtimes/upcoming", { params: { limit } })
  return response.data
}


export const getShowtimeOccupancy = async (showtimeId) => {
  const response = await api.get(`/admin/showtimes/${showtimeId}/occupancy`)
  return response.data
}






export const searchExternalMovies = async (query) => {
  const response = await api.get("/movies/search", { params: { query } })
  return response.data
}


export const getExternalMovieDetails = async (externalMovieId) => {
  const response = await api.get(`/movies/external/${encodeURIComponent(externalMovieId)}`)
  return response.data
}


export const getAllMovies = async (params = {}) => {
  const query = {}
  if (params.status) query.status = params.status
  const response = await api.get("/movies", { params: query })
  return response.data
}


export const addMovieToCinema = async (externalMovieId, movieData = {}) => {
  const payload =
    typeof externalMovieId === "object"
      ? externalMovieId
      : { externalMovieId, ...movieData }
  const response = await api.post("/movies", payload)
  return response.data
}


export const updateMovie = async (movieId, updates) => {
  const response = await api.put(`/movies/${movieId}`, updates)
  return response.data
}


export const deleteMovie = async (movieId) => {
  const response = await api.delete(`/movies/${movieId}`)
  return response.data
}




export const getScreens = async () => {
  const response = await api.get("/screens")
  return response.data
}


export const getScreenById = async (screenId) => {
  const response = await api.get(`/screens/${screenId}`)
  return response.data
}


export const createScreen = async ({ name, screenType, totalRows, seatsPerRow }) => {
  const response = await api.post("/screens", { name, screenType, totalRows, seatsPerRow })
  return response.data
}


export const updateScreen = async (screenId, updates) => {
  const response = await api.put(`/screens/${screenId}`, updates)
  return response.data
}


export const deleteScreen = async (screenId) => {
  const response = await api.delete(`/screens/${screenId}`)
  return response.data
}




export const getShowtimes = async (params = {}) => {
  const query = {}
  if (params.movieId) query.movieId = params.movieId
  if (params.screenId) query.screenId = params.screenId
  if (params.date) query.date = params.date
  if (params.status) query.status = params.status
  const response = await api.get("/showtimes", { params: query })
  return response.data
}


export const getShowtimeById = async (showtimeId) => {
  const response = await api.get(`/showtimes/${showtimeId}`)
  return response.data
}


export const createShowtime = async (payload) => {
  const response = await api.post("/showtimes", payload)
  return response.data
}


export const updateShowtime = async (showtimeId, updates) => {
  const response = await api.put(`/showtimes/${showtimeId}`, updates)
  return response.data
}


export const deleteShowtime = async (showtimeId) => {
  const response = await api.delete(`/showtimes/${showtimeId}`)
  return response.data
}




export const getAllBookings = async (params = {}) => {
  const query = {}
  if (params.bookingStatus) query.bookingStatus = params.bookingStatus
  if (params.paymentStatus) query.paymentStatus = params.paymentStatus
  if (params.movieId) query.movieId = params.movieId
  if (params.showtimeId) query.showtimeId = params.showtimeId
  if (params.userId) query.userId = params.userId
  if (params.search) query.search = params.search
  query.page = params.page || 1
  query.limit = params.limit || 20

  const response = await api.get("/bookings", { params: query })
  return response.data
}


export const getBookingById = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}`)
  return response.data
}


export const cancelBooking = async (bookingId) => {
  const response = await api.patch(`/bookings/${bookingId}/cancel`)
  return response.data
}




export const getUsers = async (params = {}) => {
  const query = {}
  if (params.role) query.role = params.role
  if (params.search) query.search = params.search
  query.page = params.page || 1
  query.limit = params.limit || 20

  const response = await api.get("/admin/users", { params: query })
  return response.data
}


export const getUserById = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`)
  return response.data
}


export const updateUserRole = async (userId, role) => {
  const response = await api.patch(`/admin/users/${userId}/role`, { role })
  return response.data
}

export default {
  
  getDashboardSummary,
  getRevenueAnalytics,
  getRevenueTrend,
  getTopMovies,
  getBookingAnalytics,
  getPaymentAnalytics,
  getRecentBookings,
  getUpcomingShowtimes,
  getShowtimeOccupancy,
  
  searchExternalMovies,
  getExternalMovieDetails,
  getAllMovies,
  addMovieToCinema,
  updateMovie,
  deleteMovie,
  
  getScreens,
  getScreenById,
  createScreen,
  updateScreen,
  deleteScreen,
  
  getShowtimes,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime,
  
  getAllBookings,
  getBookingById,
  cancelBooking,
  
  getUsers,
  getUserById,
  updateUserRole
}
