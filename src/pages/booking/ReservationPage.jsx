import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { getBookingById, cancelBooking } from "../../services/booking.service"
import ReservationTimer from "../../components/booking/ReservationTimer"
import { PaymentStatusBadge, BookingStatusBadge } from "../../components/payment/PaymentStatus"
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters"
import AppIcon from "../../components/ui/AppIcon"

const ReservationPage = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isExpired, setIsExpired] = useState(false)

  
  const loadBooking = useCallback(async () => {
    try {
      const data = await getBookingById(bookingId)
      if (data?.success && data.booking) {
        setBooking(data.booking)
        
        if (data.booking.bookingStatus === "expired") {
          setIsExpired(true)
        }
      } else {
        setError(data?.message || "Booking details could not be found.")
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Access Denied: You are not authorized to view this booking.")
      } else if (err.response?.status === 404) {
        setError("Booking not found. Please verify your reference or link.")
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load reservation. Please check your connection."
        )
      }
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => {
    loadBooking()
  }, [loadBooking])

  
  const handleTimerExpire = useCallback(() => {
    setIsExpired(true)
    
    loadBooking()
  }, [loadBooking])

  
  const handleCancelReservation = async () => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this reservation? The held seats will be released immediately."
      )
    ) {
      return
    }

    setIsCancelling(true)
    setError("")
    try {
      const res = await cancelBooking(bookingId)
      if (res?.success) {
        setSuccessMessage("Reservation cancelled successfully. The seats have been released.")
        await loadBooking()
      } else {
        setError(res?.message || "Could not cancel reservation.")
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to cancel reservation. Please try again."
      )
    } finally {
      setIsCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container py-5 text-center">
          <div className="spinner"></div>
          <p className="text-muted">Loading reservation details…</p>
        </div>
      </div>
    )
  }

  if (error && !booking) {
    return (
      <div className="page-wrapper">
        <div className="container py-5 text-center">
          <div className="alert-error mx-auto mb-4" style={{ maxWidth: "560px" }}>
            <AppIcon name="alert" size={16} /> {error}
          </div>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/movies" className="btn-primary-grad" style={{ maxWidth: "220px" }}>
              <AppIcon name="arrowLeft" size={16} /> Browse Movies
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const {
    bookingReference,
    movie,
    screen,
    showtime,
    seats = [],
    totalAmount,
    bookingStatus,
    paymentStatus,
    expiresAt
  } = booking || {}

  const showtimeId = showtime?._id || showtime?.id || showtime
  
  
  const holdElapsed = expiresAt ? new Date(expiresAt).getTime() <= Date.now() : false
  const reservationExpired = isExpired || bookingStatus === "expired" || holdElapsed
  const isPending = bookingStatus === "pending-payment" && !reservationExpired
  const isCancelled = bookingStatus === "cancelled"
  const isConfirmed = bookingStatus === "confirmed" || paymentStatus === "paid"

  return (
    <div className="page-wrapper reservation-page">
      <div className="container py-4">
        <div className="reservation-card mx-auto">
          
          <div className="reservation-header text-center mb-4">
            <div className="reservation-status-icon mb-2">
              <AppIcon name={isConfirmed ? "circleCheck" : isCancelled ? "ban" : reservationExpired ? "timer" : "ticket"} size={36} />
            </div>

            <div className="mb-2">
              <BookingStatusBadge status={bookingStatus} />
            </div>

            <h1 className="reservation-main-title mt-2 mb-1">
              {isConfirmed
                ? "Booking Confirmed"
                : isCancelled
                ? "Reservation Cancelled"
                : reservationExpired
                ? "Reservation Expired"
                : "Seats Reserved"}
            </h1>

            <p className="reservation-ref-text">
              Reference: <strong className="booking-ref-code">{bookingReference}</strong>
            </p>
          </div>

          
          {successMessage && (
            <div className="alert-success mb-4 text-center">
              <AppIcon name="check" size={16} /> {successMessage}
            </div>
          )}

          {error && (
            <div className="alert-error mb-4 text-center">
              <AppIcon name="alert" size={16} /> {error}
            </div>
          )}

          
          {isPending && expiresAt && (
            <div className="mb-4">
              <ReservationTimer
                expiresAt={expiresAt}
                onExpire={handleTimerExpire}
              />
            </div>
          )}

          
          {(isExpired || bookingStatus === "expired" || (reservationExpired && !isConfirmed)) && (
            <div className="alert-expired-box mb-4 text-center">
              <h4>Seat Reservation Expired</h4>
              <p>
                The 10-minute hold window for these seats has elapsed and the seats have been released back to the auditorium.
              </p>
              {showtimeId && (
                <Link
                  to={`/booking/${showtimeId}/seats`}
                  className="btn-primary-grad mt-2"
                  style={{ display: "inline-block", width: "auto" }}
                >
                  Choose Seats Again
                </Link>
              )}
            </div>
          )}

          
          <div className="reservation-details-box mb-4">
            <div className="detail-item-row">
              <span className="detail-label">Movie:</span>
              <span className="detail-value font-bold">{movie?.title || "Movie Session"}</span>
            </div>

            <div className="detail-item-row">
              <span className="detail-label">Auditorium / Screen:</span>
              <span className="detail-value">
                {screen?.name || "Main Screen"} ({(screen?.screenType || "standard").toUpperCase()})
              </span>
            </div>

            <div className="detail-item-row">
              <span className="detail-label">Showtime:</span>
              <span className="detail-value">
                {formatDate(showtime?.showDate)} at {formatTime(showtime?.startTime)}
              </span>
            </div>

            <div className="detail-item-row">
              <span className="detail-label">Reserved Seats:</span>
              <span className="detail-value">
                {seats.map((s) => (
                  <span key={s.seatNumber} className="seat-badge-chip">
                    {s.seatNumber}
                  </span>
                ))}
              </span>
            </div>

            <div className="detail-item-row">
              <span className="detail-label">Payment Status:</span>
              <span className="detail-value">
                <PaymentStatusBadge status={paymentStatus} />
              </span>
            </div>

            <div className="detail-item-row divider" />

            <div className="detail-item-row total-row">
              <span className="detail-label total">Total Amount:</span>
              <span className="detail-value total-price">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          
          <div className="reservation-actions-stack">
            {isPending && (
              <>
                <button
                  type="button"
                  className="btn-primary-grad btn-proceed-payment"
                  onClick={() => navigate(`/booking/${bookingId}/payment`)}
                >
                  Proceed to Payment <AppIcon name="arrowRight" size={16} />
                </button>

                <button
                  type="button"
                  className="btn-cancel-reservation"
                  onClick={handleCancelReservation}
                  disabled={isCancelling}
                >
                  {isCancelling ? "Cancelling…" : "Cancel Reservation"}
                </button>
              </>
            )}

            {isConfirmed && (
              <div className="text-center">
                <Link
                  to={`/bookings/${bookingId}/ticket`}
                  className="btn-primary-grad"
                  style={{ display: "inline-block", width: "auto" }}
                >
                  <AppIcon name="ticket" size={16} /> View Ticket
                </Link>
                <div className="mt-3">
                  <Link to={`/bookings/${bookingId}`} className="btn-secondary-custom">
                    View Booking Details
                  </Link>
                </div>
              </div>
            )}

            {(isCancelled || reservationExpired) && showtimeId && (
              <div className="text-center">
                <Link
                  to={`/booking/${showtimeId}/seats`}
                  className="btn-primary-grad"
                  style={{ display: "inline-block", width: "auto" }}
                >
                  Choose Seats Again
                </Link>
              </div>
            )}

            <div className="text-center mt-3">
              <Link to="/movies" className="back-link">
                <AppIcon name="arrowLeft" size={16} /> Return to Movies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReservationPage
