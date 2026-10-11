import { BookingStatusBadge as SharedBookingStatusBadge } from "../payment/PaymentStatus"

/**
 * BookingStatusBadge
 *
 * Re-exported wrapper around the shared Phase 12 status badge so the bookings
 * feature has a single, discoverable import without duplicating the mapping
 * logic (which already lives in components/payment/PaymentStatus.jsx).
 *
 * `showCompleted` labels a confirmed booking whose showtime has already passed
 * as "Completed". That label is derived presentation only — the backend value
 * remains `confirmed`.
 */
const BookingStatusBadge = ({ status, showCompleted = false }) => {
  if (showCompleted) {
    return (
      <span className="badge bg-secondary" style={{ padding: "0.45rem 0.75rem", fontSize: "0.8rem" }}>
        Completed
      </span>
    )
  }

  return <SharedBookingStatusBadge status={status} />
}

export default BookingStatusBadge
