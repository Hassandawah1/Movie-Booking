import { useState, useEffect, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { getBookingById, cancelBooking } from "../../services/booking.service"
import BookingStatusBadge from "../../components/bookings/BookingStatusBadge"
import { PaymentStatusBadge } from "../../components/payment/PaymentStatus"
import ReservationTimer from "../../components/booking/ReservationTimer"
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters"
import AppIcon from "../../components/ui/AppIcon"
import {
  canContinuePayment,
  isTicketValid,
  isPastConfirmedBooking,
  isEffectivelyExpired,
  hasHoldElapsed,
  isPaymentInconsistent
} from "../../utils/bookingHelpers"


const BookingDetailsPage = () => {
  const { bookingId } = useParams()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [accessDenied, setAccessDenied] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [notice, setNotice] = useState("")
  const [now, setNow] = useState(() => new Date())

  const loadBooking = useCallback(async () => {
    setLoading(true)
    setError("")
    setAccessDenied(false)

    try {
      const data = await getBookingById(bookingId)

      if (data?.success && data.booking) {
        setBooking(data.booking)
      } else {
        setError(data?.message || "We couldn't load this booking.")
      }
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        setAccessDenied(true)
        setError("You don't have access to this booking.")
      } else if (status === 404) {
        setError("Booking not found. Please check the link or open My Bookings.")
      } else if (status === 400) {
        setError("That booking reference doesn't look valid.")
      } else if (!err.response) {
        setError("We couldn't reach the server. Please check your connection and try again.")
      } else {
        setError(err.response?.data?.message || "We couldn't load this booking.")
      }
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => {
    loadBooking()
  }, [loadBooking])

  
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  
  const handleHoldExpired = useCallback(() => {
    setNotice("Your reservation hold has ended. Refreshing the latest status…")
    loadBooking()
  }, [loadBooking])

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Cancel this reservation? Your selected seats will be released."
    )
    if (!confirmed) return

    setIsCancelling(true)
    setError("")
    setNotice("")

    try {
      const res = await cancelBooking(bookingId)

      if (res?.success) {
        setNotice("Reservation cancelled. Your seats have been released.")
        await loadBooking()
      } else {
        setError(res?.message || "We couldn't cancel this reservation.")
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.response ? "We couldn't cancel this reservation." : "Network problem. Please try again.")
      )
    } finally {
      setIsCancelling(false)
    }
  }

  
  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container py-5 text-center">
          <div className="spinner" />
          <p className="text-muted">Loading booking details…</p>
        </div>
      </div>
    )
  }

  
  if (!booking) {
    return (
      <div className="page-wrapper">
        <div className="container py-5 text-center">
          <div className="alert-error mx-auto mb-4" style={{ maxWidth: "560px" }}>
            <AppIcon name={accessDenied ? "lock" : "alert"} size={16} /> {error}
          </div>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            {!accessDenied && (
              <button type="button" className="btn-secondary-custom" onClick={loadBooking}>
                <AppIcon name="refresh" size={16} /> Try Again
              </button>
            )}
            <Link to="/bookings" className="btn-primary-grad" style={{ maxWidth: "240px" }}>
              Go to My Bookings
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const {
    _id: bookingIdValue,
    bookingReference,
    movie,
    screen,
    showtime,
    seats = [],
    totalAmount,
    bookingStatus,
    paymentStatus,
    paymentFailureReason,
    paymentReference,
    paymentChannel,
    expiresAt,
    createdAt,
    paidAt,
    confirmedAt
  } = booking

  const past = isPastConfirmedBooking(booking, now)
  const ticketReady = isTicketValid(booking)
  const inconsistent = isPaymentInconsistent(booking)
  const payable = canContinuePayment(booking, now)
  const holdExpired = bookingStatus === "pending-payment" && hasHoldElapsed(booking, now)
  const effectivelyExpired = isEffectivelyExpired(booking, now)
  const isCancelled = bookingStatus === "cancelled"
  const showtimeId = showtime?._id || showtime?.id || showtime
  const movieId = movie?._id || movie?.id || movie

  const seatsTotal = seats.reduce((sum, s) => sum + (Number(s.price) || 0), 0)

  return (
    <div className="page-wrapper booking-details-page">
      <div className="container py-4">
        <div className="booking-details-card mx-auto">
          
          <header className="booking-details-header">
            <div className="booking-details-header-main">
              <h1 className="booking-details-title">{movie?.title || "Booking Details"}</h1>

              <p className="booking-details-ref">
                Reference: <strong className="booking-ref-code">{bookingReference}</strong>
              </p>

              <div className="booking-details-badges">
                <BookingStatusBadge status={bookingStatus} showCompleted={past} />
                <PaymentStatusBadge status={paymentStatus} failureReason={paymentFailureReason} />
              </div>
            </div>

            {movie?.posterUrl && (
              <img
                src={movie.posterUrl}
                alt={`${movie?.title || "Movie"} poster`}
                className="booking-details-poster"
              />
            )}
          </header>

          
          {notice && <div className="alert-success mb-4 text-center"><AppIcon name="check" size={16} /> {notice}</div>}
          {error && !accessDenied && <div className="alert-error mb-4 text-center"><AppIcon name="alert" size={16} /> {error}</div>}

          
          {effectivelyExpired && !isCancelled && (
            <div className="alert-expired-box mb-4 text-center">
              <h4>{bookingStatus === "expired" ? "Reservation Expired" : "Reservation Hold Ended"}</h4>
              <p>
                Your seats have been released. Please choose your seats again to make a new
                reservation.
              </p>
            </div>
          )}

          
          {isCancelled && (
            <div className="alert-warning-banner mb-4 text-center">
              <strong>This reservation was cancelled.</strong>
              <p className="mb-0 mt-1">
                The seats on this booking have been released. Start a new booking whenever you
                are ready.
              </p>
            </div>
          )}

          
          {inconsistent && (
            <div className="alert-error mb-4 text-center">
              <strong>Your booking status needs verification.</strong>
              <p className="mb-0 mt-1">
                The booking and payment records do not agree, so no ticket can be shown yet.
                Please contact support with the reference above.
              </p>
            </div>
          )}

          
          {paymentStatus === "failed" && !inconsistent && (
            <div className="alert-warning-banner mb-4 text-center">
              <strong>
                {paymentFailureReason === "abandoned"
                  ? "Your last payment was not completed."
                  : "Your last payment attempt did not go through."}
              </strong>
              {payable && <p className="mb-0 mt-1">You can still complete payment for this reservation.</p>}
            </div>
          )}

          
          {bookingStatus === "pending-payment" && !holdExpired && expiresAt && (
            <div className="mb-4">
              <ReservationTimer expiresAt={expiresAt} onExpire={handleHoldExpired} />
            </div>
          )}

          
          <div className="reservation-details-box mb-4">
            <div className="detail-item-row">
              <span className="detail-label">Movie:</span>
              <span className="detail-value">{movie?.title || "—"}</span>
            </div>

            <div className="detail-item-row">
              <span className="detail-label">Screen:</span>
              <span className="detail-value">
                {screen?.name || "—"}
                {screen?.screenType ? ` (${screen.screenType.toUpperCase()})` : ""}
              </span>
            </div>

            <div className="detail-item-row">
              <span className="detail-label">Showtime:</span>
              <span className="detail-value">
                {formatDate(showtime?.showDate)} at {formatTime(showtime?.startTime)}
                {showtime?.endTime ? ` – ${formatTime(showtime.endTime)}` : ""}
              </span>
            </div>

            <div className="detail-item-row">
              <span className="detail-label">Seats:</span>
              <span className="detail-value">
                {seats.length > 0 ? (
                  seats.map((s) => (
                    <span key={s.seatNumber} className="seat-badge-chip">
                      {s.seatNumber}
                      {s.ticketType === "vip" ? <> <AppIcon name="star" size={13} fill="currentColor" /></> : ""}
                    </span>
                  ))
                ) : (
                  "—"
                )}
              </span>
            </div>

            <div className="detail-item-row">
              <span className="detail-label">Tickets:</span>
              <span className="detail-value">
                {seats.length} {seats.length === 1 ? "ticket" : "tickets"}
              </span>
            </div>

            
            {seatsTotal > 0 && (
              <div className="detail-item-row">
                <span className="detail-label">Seat Prices:</span>
                <span className="detail-value">
                  {seats
                    .map((s) => `${s.seatNumber} ${formatCurrency(s.price)}`)
                    .join(" · ")}
                </span>
              </div>
            )}

            <div className="detail-item-row">
              <span className="detail-label">Booked On:</span>
              <span className="detail-value">
                {createdAt ? `${formatDate(createdAt)} at ${formatTime(clockOf(createdAt))}` : "—"}
              </span>
            </div>

            {paidAt && (
              <div className="detail-item-row">
                <span className="detail-label">Paid On:</span>
                <span className="detail-value">
                  {formatDate(paidAt)} at {formatTime(clockOf(paidAt))}
                </span>
              </div>
            )}

            {!paidAt && confirmedAt && (
              <div className="detail-item-row">
                <span className="detail-label">Confirmed On:</span>
                <span className="detail-value">
                  {formatDate(confirmedAt)} at {formatTime(clockOf(confirmedAt))}
                </span>
              </div>
            )}

            {paymentChannel && (
              <div className="detail-item-row">
                <span className="detail-label">Payment Method:</span>
                <span className="detail-value text-capitalize">{paymentChannel}</span>
              </div>
            )}

            {paymentReference && (
              <div className="detail-item-row">
                <span className="detail-label">Payment Reference:</span>
                <span className="detail-value small font-monospace">{paymentReference}</span>
              </div>
            )}

            {bookingStatus === "pending-payment" && expiresAt && (
              <div className="detail-item-row">
                <span className="detail-label">Hold Expires:</span>
                <span className="detail-value">
                  {formatDate(expiresAt)} at {formatTime(clockOf(expiresAt))}
                </span>
              </div>
            )}

            <div className="detail-item-row divider" />

            <div className="detail-item-row total-row">
              <span className="detail-label total">Total Amount:</span>
              <span className="detail-value total-price">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          
          <div className="booking-details-actions">
            
            {ticketReady && (
              <Link
                to={`/bookings/${bookingIdValue}/ticket`}
                className="btn-primary-grad booking-action-primary"
              >
                <AppIcon name="ticket" size={16} /> View Ticket
              </Link>
            )}

            
            {payable && (
              <>
                <Link
                  to={`/booking/${bookingIdValue}/payment`}
                  className="btn-primary-grad booking-action-primary"
                >
                  Continue Payment <AppIcon name="arrowRight" size={16} />
                </Link>

                <button
                  type="button"
                  className="btn-cancel-reservation booking-action-cancel"
                  onClick={handleCancel}
                  disabled={isCancelling}
                >
                  {isCancelling ? "Cancelling…" : "Cancel Reservation"}
                </button>
              </>
            )}

            
            {effectivelyExpired && !isCancelled && showtimeId && (
              <Link
                to={`/booking/${showtimeId}/seats`}
                className="btn-primary-grad booking-action-primary"
              >
                Choose Seats Again
              </Link>
            )}

            
            {isCancelled && (
              <Link to="/movies" className="btn-primary-grad booking-action-primary">
                Browse Movies
              </Link>
            )}

            
            <div className="booking-details-secondary-actions">
              {movieId && (
                <Link to={`/movies/${movieId}`} className="btn-secondary-custom booking-action-secondary">
                  View Movie
                </Link>
              )}

              <Link to="/bookings" className="btn-secondary-custom booking-action-secondary">
                All My Bookings
              </Link>

              
              {past && movieId && (
                <Link to={`/movies/${movieId}`} className="btn-secondary-custom booking-action-secondary">
                  Book Again
                </Link>
              )}
            </div>
          </div>

          <div className="text-center mt-4">
            <Link to="/bookings" className="back-link">
              <AppIcon name="arrowLeft" size={16} /> Back to My Bookings
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


function clockOf(value) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export default BookingDetailsPage
