import api from "../api/axios"



export const getSeatAvailability = async (showtimeId) => {
  const response = await api.get(`/showtimes/${showtimeId}/seats`)
  return response.data
}

export const createBooking = async ({ showtimeId, seats }) => {
  
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

export const verifyTicket = async (token, signal) => {
  const response = await api.post("/bookings/tickets/verify", { token }, { signal })
  return response.data
}
