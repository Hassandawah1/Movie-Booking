import { Link } from "react-router-dom"
import BookingStatusBadge from "./BookingStatusBadge"
import { PaymentStatusBadge, formatPaymentStatus, formatBookingStatus } from "../payment/PaymentStatus"
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters"
import AppIcon from "../ui/AppIcon"
import {
  canContinuePayment,
  isPastConfirmedBooking,
  isTicketValid,
  displayGrouping
} from "../../utils/bookingHelpers"

/**
 * BookingCard — summary of a single booking for the My Bookings list.
 * Presentation only: every status comes from the backend values.
 */
const BookingCard = ({ booking }) => {
  if (!booking) return null

  const {
    _id,
    bookingReference,
    movie,
    screen,
    showtime,
    seats = [],
    totalAmount,
    bookingStatus,
    paymentStatus,
    paymentFailureReason
  } = booking

  const past = isPastConfirmedBooking(booking)
  const ticketReady = isTicketValid(booking)
  const payable = canContinuePayment(booking)
  const grouping = displayGrouping(booking)

  const seatLabel = seats.map((s) => s.seatNumber).join(", ")

  return (
    <article className={`booking-card booking-card--${grouping}`}>
      <div className="booking-card-media">
        {movie?.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={`${movie?.title || "Movie"} poster`}
            className="booking-card-poster"
            loading="lazy"
          />
        ) : (
          <div className="booking-card-poster booking-card-poster--placeholder" aria-hidden="true">
            <AppIcon name="film" size={32} />
          </div>
        )}

        <div className="booking-card-badges">
          <BookingStatusBadge status={bookingStatus} showCompleted={past} />
          <PaymentStatusBadge status={paymentStatus} failureReason={paymentFailureReason} />
        </div>
      </div>

      <div className="booking-card-body">
        <h2 className="booking-card-title">{movie?.title || "Movie"}</h2>

        <p className="booking-card-ref">
          Reference: <strong className="booking-ref-code">{bookingReference}</strong>
        </p>

        <dl className="booking-card-meta">
          <div className="booking-card-meta-row">
            <dt>Date</dt>
            <dd>{formatDate(showtime?.showDate)}</dd>
          </div>
          <div className="booking-card-meta-row">
            <dt>Time</dt>
            <dd>{formatTime(showtime?.startTime)}</dd>
          </div>
          <div className="booking-card-meta-row">
            <dt>Screen</dt>
            <dd>
              {screen?.name || "—"}
              {screen?.screenType ? (
                <span className="screen-type-tag ms-2">{screen.screenType.toUpperCase()}</span>
              ) : null}
            </dd>
          </div>
          <div className="booking-card-meta-row">
            <dt>Seats</dt>
            <dd>
              {seats.length > 0 ? (
                <span className="booking-card-seats">
                  {seats.map((s) => (
                    <span key={s.seatNumber} className="seat-badge-chip">
                      {s.seatNumber}
                    </span>
                  ))}
                </span>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>

        <div className="booking-card-footer">
          <div className="booking-card-total">
            <span className="booking-card-total-label">Total</span>
            <span className="booking-card-total-value">{formatCurrency(totalAmount)}</span>
          </div>

          <div className="booking-card-actions">
            {ticketReady ? (
              <Link to={`/bookings/${_id}/ticket`} className="btn-primary-grad booking-card-cta">
                View Ticket
              </Link>
            ) : payable ? (
              <Link to={`/booking/${_id}/payment`} className="btn-primary-grad booking-card-cta">
                Continue Payment
              </Link>
            ) : null}

            <Link to={`/bookings/${_id}`} className="btn-secondary-custom booking-card-cta">
              View Details
            </Link>
          </div>
        </div>

        {/* Screen-reader summary so status never relies on colour alone.
            Uses the same human-readable labels as the visual badges. */}
        <p className="visually-hidden">
          Booking {bookingReference}: {past ? "Completed" : formatBookingStatus(bookingStatus)},{" "}
          {formatPaymentStatus(paymentStatus, paymentFailureReason).toLowerCase()}
          {seatLabel ? `, seats ${seatLabel}` : ""}, total {formatCurrency(totalAmount)}.
        </p>
      </div>
    </article>
  )
}

export default BookingCard
