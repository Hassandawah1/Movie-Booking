


export const getShowtimeDateTime = (showtime) => {
  if (!showtime) return null

  const { showDate, startTime } = showtime
  if (!showDate || !startTime) return null

  const base = new Date(showDate)
  if (Number.isNaN(base.getTime())) return null

  const [hoursRaw, minutesRaw] = String(startTime).split(":")
  const hours = Number.parseInt(hoursRaw, 10)
  const minutes = Number.parseInt(minutesRaw, 10)
  if (Number.isNaN(hours)) return null

  
  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate(),
    hours,
    Number.isNaN(minutes) ? 0 : minutes,
    0,
    0
  )
}


export const hasShowtimeStarted = (showtime, now = new Date()) => {
  const startsAt = getShowtimeDateTime(showtime)
  if (!startsAt) return false
  return startsAt.getTime() <= now.getTime()
}


export const isUpcomingBooking = (booking, now = new Date()) => {
  if (!booking || booking.bookingStatus !== "confirmed") return false
  return !hasShowtimeStarted(booking.showtime, now)
}


export const isPastConfirmedBooking = (booking, now = new Date()) => {
  if (!booking || booking.bookingStatus !== "confirmed") return false
  return hasShowtimeStarted(booking.showtime, now)
}


export const hasHoldElapsed = (booking, now = new Date()) => {
  if (!booking?.expiresAt) return false
  const expiry = new Date(booking.expiresAt).getTime()
  if (Number.isNaN(expiry)) return false
  return expiry <= now.getTime()
}


export const isAwaitingPayment = (booking) => {
  if (!booking) return false
  return booking.bookingStatus === "pending-payment" && booking.paymentStatus !== "paid"
}


export const canContinuePayment = (booking, now = new Date()) => {
  if (!isAwaitingPayment(booking)) return false
  return !hasHoldElapsed(booking, now)
}


export const canCancelBooking = (booking) => {
  if (!booking) return false
  return booking.bookingStatus === "pending-payment" && booking.paymentStatus !== "paid"
}


export const isEffectivelyExpired = (booking, now = new Date()) => {
  if (!booking) return false
  if (booking.bookingStatus === "expired") return true
  return booking.bookingStatus === "pending-payment" && hasHoldElapsed(booking, now)
}


export const isTicketValid = (booking) => {
  if (!booking) return false
  return booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid"
}


export const isPaymentInconsistent = (booking) => {
  if (!booking) return false
  const { bookingStatus, paymentStatus } = booking
  const confirmedButUnpaid = bookingStatus === "confirmed" && paymentStatus !== "paid"
  const paidButNotConfirmed = paymentStatus === "paid" && bookingStatus !== "confirmed"
  return confirmedButUnpaid || paidButNotConfirmed
}


export const displayGrouping = (booking, now = new Date()) => {
  if (!booking) return "unknown"
  if (booking.bookingStatus === "confirmed") {
    return hasShowtimeStarted(booking.showtime, now) ? "completed" : "upcoming"
  }
  if (booking.bookingStatus === "pending-payment") {
    return hasHoldElapsed(booking, now) ? "expired" : "awaiting-payment"
  }
  return booking.bookingStatus
}


export const BOOKING_FILTERS = [
  { id: "all", label: "All", match: () => true },
  { id: "upcoming", label: "Upcoming", match: (b, now) => isUpcomingBooking(b, now) },
  { id: "awaiting", label: "Awaiting Payment", match: (b) => isAwaitingPayment(b) },
  { id: "past", label: "Past", match: (b, now) => isPastConfirmedBooking(b, now) },
  { id: "expired", label: "Expired", match: (b, now) => isEffectivelyExpired(b, now) },
  { id: "cancelled", label: "Cancelled", match: (b) => b.bookingStatus === "cancelled" }
]

export const filterBookings = (bookings, filterId, now = new Date()) => {
  const filter = BOOKING_FILTERS.find((f) => f.id === filterId) || BOOKING_FILTERS[0]
  return bookings.filter((b) => filter.match(b, now))
}


export const countByFilter = (bookings, now = new Date()) =>
  BOOKING_FILTERS.reduce((acc, f) => {
    acc[f.id] = bookings.filter((b) => f.match(b, now)).length
    return acc
  }, {})
