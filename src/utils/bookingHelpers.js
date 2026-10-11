/**
 * Booking helpers — showtime date/time and customer-facing status grouping.
 *
 * The backend keeps `showDate` (a date) and `startTime`/`endTime` ("HH:MM")
 * as separate fields, so they are combined here for comparison only.
 *
 * Nothing in this file writes back to the backend: "Past" and "Completed" are
 * presentation groupings derived from real backend values.
 */

/** Combine showtime.showDate + showtime.startTime into a Date, or null. */
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

  // Build in LOCAL time on the calendar date the backend stored.
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

/** Has the showtime already started? */
export const hasShowtimeStarted = (showtime, now = new Date()) => {
  const startsAt = getShowtimeDateTime(showtime)
  if (!startsAt) return false
  return startsAt.getTime() <= now.getTime()
}

/** Is a confirmed booking still upcoming (showtime in the future)? */
export const isUpcomingBooking = (booking, now = new Date()) => {
  if (!booking || booking.bookingStatus !== "confirmed") return false
  return !hasShowtimeStarted(booking.showtime, now)
}

/** Is this a confirmed booking whose showtime has already passed? */
export const isPastConfirmedBooking = (booking, now = new Date()) => {
  if (!booking || booking.bookingStatus !== "confirmed") return false
  return hasShowtimeStarted(booking.showtime, now)
}

/** Has the temporary seat hold elapsed? */
export const hasHoldElapsed = (booking, now = new Date()) => {
  if (!booking?.expiresAt) return false
  const expiry = new Date(booking.expiresAt).getTime()
  if (Number.isNaN(expiry)) return false
  return expiry <= now.getTime()
}

/**
 * Is this booking waiting for the customer to pay?
 * Includes holds that have technically elapsed but that the backend has not yet
 * swept to `expired` — those are surfaced as "expired" by displayGrouping.
 */
export const isAwaitingPayment = (booking) => {
  if (!booking) return false
  return booking.bookingStatus === "pending-payment" && booking.paymentStatus !== "paid"
}

/** Can this booking still be paid? The backend only accepts pending-payment. */
export const canContinuePayment = (booking, now = new Date()) => {
  if (!isAwaitingPayment(booking)) return false
  return !hasHoldElapsed(booking, now)
}

/** Can this booking be cancelled? The backend only allows pending-payment. */
export const canCancelBooking = (booking) => {
  if (!booking) return false
  return booking.bookingStatus === "pending-payment" && booking.paymentStatus !== "paid"
}

/**
 * Is this booking effectively expired?
 * Either the backend said so, or the seat hold ran out and the backend has not
 * swept it yet. Purely a display grouping — nothing is written back.
 */
export const isEffectivelyExpired = (booking, now = new Date()) => {
  if (!booking) return false
  if (booking.bookingStatus === "expired") return true
  return booking.bookingStatus === "pending-payment" && hasHoldElapsed(booking, now)
}

/**
 * Is this a genuine, valid ticket?
 * Requires BOTH confirmed booking status AND paid payment status, so an
 * inconsistent backend state can never produce a valid-looking ticket.
 */
export const isTicketValid = (booking) => {
  if (!booking) return false
  return booking.bookingStatus === "confirmed" && booking.paymentStatus === "paid"
}

/**
 * Is the backend state internally inconsistent?
 * confirmed-but-unpaid, or paid-but-not-confirmed.
 */
export const isPaymentInconsistent = (booking) => {
  if (!booking) return false
  const { bookingStatus, paymentStatus } = booking
  const confirmedButUnpaid = bookingStatus === "confirmed" && paymentStatus !== "paid"
  const paidButNotConfirmed = paymentStatus === "paid" && bookingStatus !== "confirmed"
  return confirmedButUnpaid || paidButNotConfirmed
}

/** Short presentation grouping for a booking (never written to the backend). */
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

/**
 * Client-side filter tabs. Simple predicates over the already-fetched list —
 * the backend has no filter endpoint for these groupings.
 */
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

/** Count of bookings per filter id, for the tab labels. */
export const countByFilter = (bookings, now = new Date()) =>
  BOOKING_FILTERS.reduce((acc, f) => {
    acc[f.id] = bookings.filter((b) => f.match(b, now)).length
    return acc
  }, {})
