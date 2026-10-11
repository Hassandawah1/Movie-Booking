import { useState, useEffect, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { getBookingById } from "../../services/booking.service"
import { getBookingPaymentStatus } from "../../services/payment.service"
import PaymentStatus from "../../components/payment/PaymentStatus"
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters"
import AppIcon from "../../components/ui/AppIcon"


const PaymentSuccessPage = () => {
  const { bookingId } = useParams()

  const [booking, setBooking] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadBooking = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const data = await getBookingById(bookingId)

      if (!data?.success || !data?.booking) {
        setError(data?.message || "Booking details could not be found.")
        return
      }

      setBooking(data.booking)

      
      
      try {
        const paymentData = await getBookingPaymentStatus(bookingId)
        if (paymentData?.success && paymentData.payment) {
          setPayment(paymentData.payment)
        }
      } catch {
        
      }
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        setError("Access denied. You are not authorized to view this booking.")
      } else if (status === 404) {
        setError("Booking not found.")
      } else if (!err.response) {
        setError("We couldn't load your booking right now. Please check your connection.")
      } else {
        setError(err.response?.data?.message || "Failed to load booking details.")
      }
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => {
    if (bookingId) loadBooking()
  }, [bookingId, loadBooking])

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading confirmation…</p>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger mx-auto mb-4" style={{ maxWidth: "540px" }}>
          <AppIcon name="alert" size={16} /> {error || "Booking not found"}
        </div>
        <div className="d-flex justify-content-center gap-3">
          <button type="button" className="btn btn-outline-light" onClick={loadBooking}>
            <AppIcon name="refresh" size={16} /> Try Again
          </button>
          <Link to="/movies" className="btn btn-primary">
            Browse Movies
          </Link>
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
  } = booking

  
  const effectivePaymentStatus = payment?.paymentStatus || paymentStatus
  const effectiveBookingStatus = payment?.bookingStatus || bookingStatus
  const effectiveReference = payment?.paymentReference || booking.paymentReference
  const effectiveChannel = payment?.paymentChannel || booking.paymentChannel
  const paidAt = payment?.paidAt || booking.paidAt
  const confirmedAt = payment?.confirmedAt || booking.confirmedAt

  const isConfirmed =
    effectivePaymentStatus === "paid" && effectiveBookingStatus === "confirmed"

  const showtimeId = showtime?._id || showtime?.id || showtime
  const holdElapsed = expiresAt ? new Date(expiresAt).getTime() <= Date.now() : false
  const holdReleased = effectiveBookingStatus === "expired" || holdElapsed
  const isCancelled = effectiveBookingStatus === "cancelled"

  
  if (!isConfirmed) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div
              className="card border-0 rounded-4 p-4 p-md-5 text-center"
              style={{ background: "#1a1b1d", border: "1px solid rgba(255, 255, 255, 0.16)" }}
            >
              <div style={{ marginBottom: "0.5rem" }}><AppIcon name="timer" size={48} /></div>

              <h2 className="fw-bold text-light mb-2">Payment Not Confirmed Yet</h2>
              <p className="text-muted mb-4">
                {isCancelled
                  ? "This reservation has been cancelled."
                  : holdReleased
                  ? "Your reservation hold has ended. If you completed a payment, it is still being processed — please check again shortly."
                  : "We have not received confirmation of payment for this booking from the payment gateway yet."}
              </p>

              <div className="d-flex justify-content-center mb-4">
                <PaymentStatus
                  paymentStatus={effectivePaymentStatus}
                  bookingStatus={effectiveBookingStatus}
                />
              </div>

              <div
                className="p-3 rounded-3 text-start mb-4"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Booking Reference:</span>
                  <strong className="text-light font-monospace">{bookingReference}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Amount:</span>
                  <strong className="text-warning">{formatCurrency(totalAmount)}</strong>
                </div>
              </div>

              <div className="d-grid gap-2">
                <button type="button" className="btn btn-outline-light" onClick={loadBooking}>
                  <AppIcon name="refresh" size={16} /> Refresh Status
                </button>

                {!isCancelled && !holdReleased && (
                  <Link to={`/booking/${bookingId}/payment`} className="btn btn-primary btn-lg rounded-3 fw-bold">
                    Try Payment Again
                  </Link>
                )}

                {holdReleased && showtimeId && (
                  <Link to={`/booking/${showtimeId}/seats`} className="btn btn-primary btn-lg rounded-3 fw-bold">
                    Choose Seats Again
                  </Link>
                )}

                <Link to={`/bookings/${bookingId}`} className="btn btn-outline-light">
                  View Booking Details
                </Link>

                <Link to="/bookings" className="btn btn-outline-secondary">
                  View My Bookings
                </Link>

                <Link to="/movies" className="btn btn-link text-muted">
                  Browse Movies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div
            className="card border-0 rounded-4 p-4 p-md-5 text-center"
            style={{
              background: "#1a1b1d",
              border: "1px solid rgba(16, 185, 129, 0.35)",
            }}
          >
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
              style={{
                width: "72px",
                height: "72px",
                background: "rgba(16, 185, 129, 0.15)",
                color: "#34d399",
                fontSize: "2.2rem"
              }}
            >
              <AppIcon name="circleCheck" size={42} />
            </div>

            <h2 className="fw-bold text-light mb-1">Payment Successful!</h2>
            <p className="text-success fw-semibold mb-2">Booking Confirmed</p>
            <p className="text-muted mb-4">Your booking has been confirmed. Enjoy the movie!</p>

            <div className="d-flex justify-content-center mb-4">
              <PaymentStatus
                paymentStatus={effectivePaymentStatus}
                bookingStatus={effectiveBookingStatus}
              />
            </div>

            <div
              className="p-3 rounded-3 text-start mb-4"
              style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}
            >
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Booking Reference:</span>
                <strong className="text-warning font-monospace fs-5">{bookingReference}</strong>
              </div>

              {effectiveReference && (
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Payment Ref:</span>
                  <small className="text-light font-monospace">{effectiveReference}</small>
                </div>
              )}

              <hr style={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

              <div className="mb-2">
                <span className="text-muted d-block small">Movie:</span>
                <strong className="text-light fs-5">{movie?.title || "—"}</strong>
              </div>

              <div className="row g-2 mb-2">
                <div className="col-6">
                  <span className="text-muted d-block small">Screen:</span>
                  <span className="text-light">{screen?.name || "—"}</span>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block small">Screen Type:</span>
                  <span className="badge bg-secondary">
                    {(screen?.screenType || "standard").toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="mb-2">
                <span className="text-muted d-block small">Date & Time:</span>
                <span className="text-light">
                  {formatDate(showtime?.showDate)} at {formatTime(showtime?.startTime)}
                </span>
              </div>

              <div className="mb-2">
                <span className="text-muted d-block small">Seats:</span>
                <div>
                  {seats.length > 0 ? (
                    seats.map((s) => (
                      <span key={s.seatNumber} className="badge bg-primary me-1">
                        {s.seatNumber}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </div>
              </div>

              {effectiveChannel && (
                <div className="mb-2">
                  <span className="text-muted d-block small">Payment Channel:</span>
                  <span className="text-light text-capitalize">{effectiveChannel}</span>
                </div>
              )}

              {(paidAt || confirmedAt) && (
                <div className="mb-2">
                  <span className="text-muted d-block small">Confirmed On:</span>
                  <span className="text-light">
                    {formatDate(confirmedAt || paidAt)} at {formatTime(clockOf(confirmedAt || paidAt))}
                  </span>
                </div>
              )}

              <hr style={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

              <div className="d-flex justify-content-between align-items-center pt-1">
                <span className="text-muted">Amount Paid:</span>
                <strong className="text-success fs-4">{formatCurrency(totalAmount)}</strong>
              </div>
            </div>

            <p className="small text-muted mb-4">
              <AppIcon name="mail" size={15} /> A confirmation email with these details has been sent to your registered email address.
            </p>

            <div className="d-grid gap-2">
              <Link to={`/bookings/${bookingId}/ticket`} className="btn btn-primary btn-lg rounded-3 fw-bold">
                <AppIcon name="ticket" size={16} /> View Ticket
              </Link>
              <Link to={`/bookings/${bookingId}`} className="btn btn-outline-light">
                View Booking Details
              </Link>
              <Link to="/bookings" className="btn btn-outline-secondary">
                View My Bookings
              </Link>
              <Link to="/movies" className="btn btn-link text-muted">
                Browse More Movies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


function clockOf(isoString) {
  if (!isoString) return ""
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return ""
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export default PaymentSuccessPage
