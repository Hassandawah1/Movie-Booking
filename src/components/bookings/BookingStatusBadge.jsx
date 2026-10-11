import { BookingStatusBadge as SharedBookingStatusBadge } from "../payment/PaymentStatus"


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
