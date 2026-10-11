import api from "../api/axios"

/**
 * Admin Service — read-only analytics/dashboard endpoints from Phase 7.
 *
 * Every function maps to an existing backend route in Backend/routes/admin.routes.js.
 * No URL is hardcoded: the shared Axios instance supplies the base URL.
 *
 * All of these require an admin JWT; the backend's admin middleware is the real
 * security boundary, not the frontend route guard.
 */

/** GET /api/admin/dashboard — top-level counts and revenue. */
export const getDashboardSummary = async () => {
  const response = await api.get("/admin/dashboard")
  return response.data
}

/**
 * GET /api/admin/analytics/revenue — revenue for a date range.
 * Backend defaults to the current month when no dates are supplied.
 * @param {{ startDate?: string, endDate?: string }} params — YYYY-MM-DD values
 */
export const getRevenueAnalytics = async (params = {}) => {
  const query = {}
  if (params.startDate) query.startDate = params.startDate
  if (params.endDate) query.endDate = params.endDate

  const response = await api.get("/admin/analytics/revenue", { params: query })
  return response.data
}

/**
 * GET /api/admin/analytics/revenue-trend — daily revenue for "7d" or "30d".
 * The backend returns a continuous daily series, zero-filled.
 */
export const getRevenueTrend = async (period = "7d") => {
  const response = await api.get("/admin/analytics/revenue-trend", {
    params: { period: period === "30d" ? "30d" : "7d" }
  })
  return response.data
}

/**
 * GET /api/admin/analytics/top-movies — best performing movies.
 * @param {"revenue"|"bookings"} sortBy
 */
export const getTopMovies = async (sortBy = "revenue", limit = 10) => {
  const response = await api.get("/admin/analytics/top-movies", {
    params: { sortBy: sortBy === "bookings" ? "bookings" : "revenue", limit }
  })
  return response.data
}

/** GET /api/admin/analytics/bookings — booking status breakdown. */
export const getBookingAnalytics = async () => {
  const response = await api.get("/admin/analytics/bookings")
  return response.data
}

/** GET /api/admin/analytics/payments — payment status breakdown. */
export const getPaymentAnalytics = async () => {
  const response = await api.get("/admin/analytics/payments")
  return response.data
}

/** GET /api/admin/bookings/recent — latest bookings platform-wide. */
export const getRecentBookings = async (limit = 10) => {
  const response = await api.get("/admin/bookings/recent", { params: { limit } })
  return response.data
}

/** GET /api/admin/showtimes/upcoming — next scheduled showtimes with seat fill. */
export const getUpcomingShowtimes = async (limit = 10) => {
  const response = await api.get("/admin/showtimes/upcoming", { params: { limit } })
  return response.data
}

/** GET /api/admin/showtimes/:id/occupancy — single showtime occupancy. */
export const getShowtimeOccupancy = async (showtimeId) => {
  const response = await api.get(`/admin/showtimes/${showtimeId}/occupancy`)
  return response.data
}

/* ══════════════════════════════════════════════════════════════════════════
   PHASE 15 — MANAGEMENT (CRUD)
   These map to the existing Phase 3/4/5/7 backend routes:
     /api/movies, /api/screens, /api/showtimes, /api/bookings, /api/admin/users
   ══════════════════════════════════════════════════════════════════════════ */

/* ── Movies ─────────────────────────────────────────────────────────────── */

/**
 * GET /api/movies/search?query=... — search the EXTERNAL provider.
 * Only our backend talks to the provider; the API key never reaches the browser.
 */
export const searchExternalMovies = async (query) => {
  const response = await api.get("/movies/search", { params: { query } })
  return response.data
}

/** GET /api/movies/external/:externalMovieId — preview one external title. */
export const getExternalMovieDetails = async (externalMovieId) => {
  const response = await api.get(`/movies/external/${encodeURIComponent(externalMovieId)}`)
  return response.data
}

/** GET /api/movies?status=... — cinema catalogue (public endpoint). */
export const getAllMovies = async (params = {}) => {
  const query = {}
  if (params.status) query.status = params.status
  const response = await api.get("/movies", { params: query })
  return response.data
}

/**
 * POST /api/movies — import an external title into our catalogue.
 * Only `externalMovieId` is sent: the backend fetches and stores canonical
 * metadata, so no client-supplied film data (or pricing) is trusted.
 */
export const addMovieToCinema = async (externalMovieId) => {
  const response = await api.post("/movies", { externalMovieId })
  return response.data
}

/** PUT /api/movies/:id — update status (and optionally title/overview). */
export const updateMovie = async (movieId, updates) => {
  const response = await api.put(`/movies/${movieId}`, updates)
  return response.data
}

/** DELETE /api/movies/:id — remove a movie from the catalogue. */
export const deleteMovie = async (movieId) => {
  const response = await api.delete(`/movies/${movieId}`)
  return response.data
}

/* ── Screens ────────────────────────────────────────────────────────────── */

/** GET /api/screens — all screens (admin only). */
export const getScreens = async () => {
  const response = await api.get("/screens")
  return response.data
}

/** GET /api/screens/:id */
export const getScreenById = async (screenId) => {
  const response = await api.get(`/screens/${screenId}`)
  return response.data
}

/**
 * POST /api/screens — create a screen.
 * totalSeats is deliberately NOT sent: the backend calculates it from
 * totalRows x seatsPerRow and must stay the authority.
 */
export const createScreen = async ({ name, screenType, totalRows, seatsPerRow }) => {
  const response = await api.post("/screens", { name, screenType, totalRows, seatsPerRow })
  return response.data
}

/** PUT /api/screens/:id — update name/type/dimensions/status. */
export const updateScreen = async (screenId, updates) => {
  const response = await api.put(`/screens/${screenId}`, updates)
  return response.data
}

/** DELETE /api/screens/:id — backend refuses (409) when showtimes exist. */
export const deleteScreen = async (screenId) => {
  const response = await api.delete(`/screens/${screenId}`)
  return response.data
}

/* ── Showtimes ──────────────────────────────────────────────────────────── */

/**
 * GET /api/showtimes — filter by movieId, screenId, date, status.
 * Public endpoint, but used here for administration.
 */
export const getShowtimes = async (params = {}) => {
  const query = {}
  if (params.movieId) query.movieId = params.movieId
  if (params.screenId) query.screenId = params.screenId
  if (params.date) query.date = params.date
  if (params.status) query.status = params.status
  const response = await api.get("/showtimes", { params: query })
  return response.data
}

/** GET /api/showtimes/:id */
export const getShowtimeById = async (showtimeId) => {
  const response = await api.get(`/showtimes/${showtimeId}`)
  return response.data
}

/**
 * POST /api/showtimes — schedule a screening.
 * bookedSeats is never sent; seat allocation belongs to the booking flow.
 */
export const createShowtime = async (payload) => {
  const response = await api.post("/showtimes", payload)
  return response.data
}

/** PUT /api/showtimes/:id — update schedule, pricing or status. */
export const updateShowtime = async (showtimeId, updates) => {
  const response = await api.put(`/showtimes/${showtimeId}`, updates)
  return response.data
}

/** DELETE /api/showtimes/:id — backend refuses (409) with active bookings. */
export const deleteShowtime = async (showtimeId) => {
  const response = await api.delete(`/showtimes/${showtimeId}`)
  return response.data
}

/* ── Bookings (admin view) ──────────────────────────────────────────────── */

/**
 * GET /api/bookings — paginated, filterable list of all bookings (admin only).
 * Filters are applied server-side; the client never downloads the whole table.
 */
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

/** GET /api/bookings/:id — admins may read any booking. */
export const getBookingById = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}`)
  return response.data
}

/** PATCH /api/bookings/:id/cancel — only unpaid/pending bookings are accepted. */
export const cancelBooking = async (bookingId) => {
  const response = await api.patch(`/bookings/${bookingId}/cancel`)
  return response.data
}

/* ── Users (admin view) ─────────────────────────────────────────────────── */

/** GET /api/admin/users — paginated users with role filter and search. */
export const getUsers = async (params = {}) => {
  const query = {}
  if (params.role) query.role = params.role
  if (params.search) query.search = params.search
  query.page = params.page || 1
  query.limit = params.limit || 20

  const response = await api.get("/admin/users", { params: query })
  return response.data
}

/** GET /api/admin/users/:id — user plus booking/spending metrics. */
export const getUserById = async (userId) => {
  const response = await api.get(`/admin/users/${userId}`)
  return response.data
}

/** PATCH /api/admin/users/:id/role — promote or demote. */
export const updateUserRole = async (userId, role) => {
  const response = await api.patch(`/admin/users/${userId}/role`, { role })
  return response.data
}

export default {
  // dashboard / analytics
  getDashboardSummary,
  getRevenueAnalytics,
  getRevenueTrend,
  getTopMovies,
  getBookingAnalytics,
  getPaymentAnalytics,
  getRecentBookings,
  getUpcomingShowtimes,
  getShowtimeOccupancy,
  // movies
  searchExternalMovies,
  getExternalMovieDetails,
  getAllMovies,
  addMovieToCinema,
  updateMovie,
  deleteMovie,
  // screens
  getScreens,
  getScreenById,
  createScreen,
  updateScreen,
  deleteScreen,
  // showtimes
  getShowtimes,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime,
  // bookings
  getAllBookings,
  getBookingById,
  cancelBooking,
  // users
  getUsers,
  getUserById,
  updateUserRole
}
