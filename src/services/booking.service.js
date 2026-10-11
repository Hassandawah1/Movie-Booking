import api from "../api/axios"

/**
 * Booking Service — seat availability, reservations, and booking management
 * Connects directly to backend booking & showtime endpoints
 */

export const getSeatAvailability = async (showtimeId) => {
  const response = await api.get(`/showtimes/${showtimeId}/seats`)
  return response.data
}

export const createBooking = async ({ showtimeId, seats }) => {
  // Body must contain ONLY showtimeId and seats array
  const response = await api.post("/bookings", { showtimeId, seats })
  return response.data
}

export const getBookingById = async (id) => {
  const response = await api.get(`/bookings/${id}`)
  return response.data
}

export const cancelBooking = async (id) => {
  const response = await api.patch(`/bookings/${id}/cancel`)
  return response.data
}

export const getMyBookings = async () => {
  const response = await api.get("/bookings/my")
  return response.data
}

export default {
  getSeatAvailability,
  createBooking,
  getBookingById,
  cancelBooking,
  getMyBookings
}
