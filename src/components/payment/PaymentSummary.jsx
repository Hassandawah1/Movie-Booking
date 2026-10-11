import { formatCurrency, formatDate, formatTime } from "../../utils/formatters"
import AppIcon from "../ui/AppIcon"

const PaymentSummary = ({ booking }) => {
  if (!booking) return null

  const movie = booking.movie || {}
  const screen = booking.screen || {}
  const showtime = booking.showtime || {}
  const seats = booking.seats || []
  const totalAmount = booking.totalAmount || 0

  return (
    <div className="card border-0 rounded-4 p-4 mb-4" style={{ background: "#1a1b1d", border: "1px solid rgba(255, 255, 255, 0.16)" }}>
      <h4 className="fw-bold text-primary mb-3">Order & Payment Summary</h4>

      <div className="mb-3">
        <h5 className="fw-bold mb-1" style={{ color: "#ffe27a" }}>
          {movie.title || "Cinema Movie"}
        </h5>
        <div className="text-muted small">
          <div><AppIcon name="building" size={15} /> Screen: {screen.name || "Main Screen"} ({(screen.screenType || "standard").toUpperCase()})</div>
          <div><AppIcon name="calendar" size={15} /> Showtime: {formatDate(showtime.showDate)} at {formatTime(showtime.startTime)}</div>
        </div>
      </div>

      <hr style={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

      <div className="d-flex justify-content-between mb-2">
        <span className="text-muted">Booking Reference:</span>
        <strong className="text-light">{booking.bookingReference}</strong>
      </div>

      <div className="d-flex justify-content-between mb-2">
        <span className="text-muted">Selected Seats:</span>
        <div>
          {seats.map((s) => (
            <span
              key={s.seatNumber}
              className="badge bg-primary me-1"
              style={{ fontSize: "0.8rem" }}
            >
              {s.seatNumber}
            </span>
          ))}
        </div>
      </div>

      <div className="d-flex justify-content-between mb-2">
        <span className="text-muted">Tickets Count:</span>
        <span className="text-light">{seats.length} {seats.length === 1 ? "ticket" : "tickets"}</span>
      </div>

      <hr style={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

      <div className="d-flex justify-content-between align-items-center pt-2">
        <span className="fw-bold fs-5">Total Amount:</span>
        <span className="fw-bold fs-4 text-warning">{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  )
}

export default PaymentSummary
