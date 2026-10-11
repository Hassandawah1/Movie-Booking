import { formatCurrency, formatDate, formatTime } from "../../utils/formatters"
import AppIcon from "../ui/AppIcon"

const BookingSummary = ({
  showtime,
  selectedSeats = [],
  unitPrice = 0,
  isSubmitting = false,
  onReserve
}) => {
  if (!showtime) return null

  const movieTitle = showtime.movie?.title || "Movie"
  const screenName = showtime.screen?.name || "Main Screen"
  const screenType = (showtime.screen?.screenType || "standard").toUpperCase()
  const showDate = showtime.showDate
  const startTime = showtime.startTime

  const seatCount = selectedSeats.length
  const estimatedTotal = unitPrice * seatCount

  return (
    <div className="booking-summary-card">
      <h3 className="summary-title">Booking Summary</h3>

      <div className="summary-movie-info mb-3">
        <h4 className="movie-heading">{movieTitle}</h4>
        <div className="summary-meta">
          <span><AppIcon name="building" size={15} /> {screenName} ({screenType})</span>
          <span><AppIcon name="calendar" size={15} /> {formatDate(showDate)} at {formatTime(startTime)}</span>
        </div>
      </div>

      <div className="summary-divider" />

      {/* Selected Seats List */}
      <div className="summary-row mb-2">
        <span className="summary-label">Selected Seats:</span>
        <span className="summary-value seats-list">
          {seatCount > 0 ? (
            selectedSeats.map((seat) => (
              <span key={seat} className="selected-seat-pill">
                {seat}
              </span>
            ))
          ) : (
            <em className="text-muted">None selected</em>
          )}
        </span>
      </div>

      {/* Ticket Pricing Breakdown */}
      <div className="summary-row mb-2">
        <span className="summary-label">Price per Ticket:</span>
        <span className="summary-value">{formatCurrency(unitPrice)}</span>
      </div>

      <div className="summary-row mb-3">
        <span className="summary-label">Quantity:</span>
        <span className="summary-value">
          {seatCount} {seatCount === 1 ? "seat" : "seats"}
        </span>
      </div>

      <div className="summary-divider" />

      {/* Total Calculation (Informational) */}
      <div className="summary-total-row mb-3">
        <span className="total-label">Estimated Total:</span>
        <span className="total-amount">{formatCurrency(estimatedTotal)}</span>
      </div>

      <p className="summary-footnote mb-3">
        <AppIcon name="lock" size={15} /> Seats are temporarily held for 10 minutes upon reservation. Backend verifies final amount and availability.
      </p>

      {/* Reserve Action Button */}
      <button
        type="button"
        className="btn-reserve-seats"
        disabled={seatCount === 0 || isSubmitting}
        onClick={onReserve}
        aria-label={`Reserve ${seatCount} seats for ${formatCurrency(estimatedTotal)}`}
      >
        {isSubmitting ? (
          <span className="d-flex align-items-center justify-content-center gap-2">
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            <span>Reserving Seats…</span>
          </span>
        ) : (
          `Reserve ${seatCount > 0 ? `${seatCount} Seat${seatCount > 1 ? "s" : ""}` : "Seats"}`
        )}
      </button>
    </div>
  )
}

export default BookingSummary
