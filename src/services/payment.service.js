import api from "../api/axios"

/**
 * Payment Service — communicates only with our backend (never exposes Paystack secret key)
 */

export const initializePayment = async (bookingId) => {
  const response = await api.post(`/payments/initialize/${bookingId}`)
  return response.data
}

export const verifyPayment = async (reference) => {
  const response = await api.get(`/payments/verify/${reference}`)
  return response.data
}

export const getBookingPaymentStatus = async (bookingId) => {
  const response = await api.get(`/payments/booking/${bookingId}`)
  return response.data
}

export default {
  initializePayment,
  verifyPayment,
  getBookingPaymentStatus
}
