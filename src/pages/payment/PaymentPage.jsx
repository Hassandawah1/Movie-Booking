import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { getBookingById } from "../../services/booking.service"
import { initializePayment } from "../../services/payment.service"
import PaymentSummary from "../../components/payment/PaymentSummary"
import PaymentStatus from "../../components/payment/PaymentStatus"
import ReservationTimer from "../../components/booking/ReservationTimer"
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters"
import AppIcon from "../../components/ui/AppIcon"


const PaymentPage = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState("")
  const [isTimerExpired, setIsTimerExpired] = useState(false)

  
  
  const isSubmittingRef = useRef(false)

  
  const loadBooking = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const data = await getBookingById(bookingId)

      if (!data?.success || !data?.booking) {
        setError(data?.message || "Booking details could not be found.")
        setBooking(null)
        return
      }

      const b = data.booking
      setBooking(b)

      
      if (b.paymentStatus === "paid" || b.bookingStatus === "confirmed") {
        navigate(`/booking/${bookingId}/success`, { replace: true })
        return
      }

      
      if (b.bookingStatus === "expired") {
        setIsTimerExpired(true)
      }
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        setError("Access denied. You are not authorized to pay for this booking.")
      } else if (status === 404) {
        setError("Booking not found. Please check your booking link.")
      } else if (!err.response) {
        setError("We couldn't reach the server. Please check your connection and try again.")
      } else {
        setError(err.response?.data?.message || "Unable to load booking details.")
      }
    } finally {
      setLoading(false)
    }
  }, [bookingId, navigate])

  useEffect(() => {
    loadBooking()
  }, [loadBooking])

  
  const handleTimerExpire = useCallback(() => {
    setIsTimerExpired(true)
    
    loadBooking()
  }, [loadBooking])

  
  const handlePay = async () => {
    if (!booking || isInitializing || isSubmittingRef.current) return

    
    if (booking.bookingStatus === "cancelled") {
      setError("This reservation has been cancelled and can no longer be paid for.")
      return
    }

    if (booking.bookingStatus === "confirmed" || booking.paymentStatus === "paid") {
      navigate(`/booking/${bookingId}/success`, { replace: true })
      return
    }

    if (hasHoldElapsed(booking)) {
      setIsTimerExpired(true)
      setError("Your seat reservation has expired. Please choose your seats again.")
      return
    }

    isSubmittingRef.current = true
    setIsInitializing(true)
    setError("")

    try {
      const callbackUrl = `${window.location.origin}/payment/callback`
      const res = await initializePayment(bookingId, callbackUrl)

      if (res?.success && res.payment?.authorizationUrl) {
        
        
        window.location.href = res.payment.authorizationUrl
        return
      }

      setError(res?.message || "Payment gateway returned an unexpected response. Please try again.")
      setIsInitializing(false)
      isSubmittingRef.current = false
    } catch (err) {
      setIsInitializing(false)
      isSubmittingRef.current = false

      const status = err.response?.status
      const backendMessage = err.response?.data?.message

      if (!err.response) {
        setError("We couldn't reach the payment server. Please check your connection and try again.")
      } else if (status === 400 && /expired/i.test(backendMessage || "")) {
        setIsTimerExpired(true)
        setError("Your seat reservation has expired. Please choose your seats again.")
      } else if (status === 403) {
        setError("Access denied. You are not authorized to pay for this booking.")
      } else {
        setError(backendMessage || "Could not start the payment. Please try again.")
      }
    }
  }

  
  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading booking…</p>
      </div>
    )
  }

  
  if (!booking) {
    const isAccessDenied = /access denied/i.test(error)

    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger mx-auto mb-4" style={{ maxWidth: "560px" }}>
          <AppIcon name="alert" size={16} /> {error || "Booking could not be loaded."}
        </div>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <button type="button" className="btn btn-outline-light" onClick={loadBooking}>
            <AppIcon name="refresh" size={16} /> Try Again
          </button>
          <Link to="/movies" className="btn btn-primary">
            Browse Movies
          </Link>
          {isAccessDenied && (
            <Link to="/" className="btn btn-outline-secondary">
              Return Home
            </Link>
          )}
        </div>
      </div>
    )
  }

  const bookingStatus = booking.bookingStatus
  const paymentStatus = booking.paymentStatus
  const isCancelled = bookingStatus === "cancelled"
  const isExpired = isTimerExpired || bookingStatus === "expired" || hasHoldElapsed(booking)
  const isConfirmed = bookingStatus === "confirmed" || paymentStatus === "paid"

  
  const canPay = !isExpired && !isCancelled && !isConfirmed && !isInitializing

  const showtimeId = booking.showtime?._id || booking.showtime?.id || booking.showtime

  return (
    <div className="container py-5 payment-page">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-light">Complete Your Payment</h2>
            <p className="text-muted mb-2">
              Secure checkout via Paystack. Your booking is confirmed as soon as our
              server verifies the transaction.
            </p>
            <PaymentStatus
              paymentStatus={paymentStatus}
              bookingStatus={bookingStatus}
              failureReason={booking.paymentFailureReason}
            />
          </div>

          {error && <div className="alert alert-danger mb-4"><AppIcon name="alert" size={16} /> {error}</div>}

          
          {isCancelled && (
            <div className="alert alert-warning text-center mb-4">
              <h5 className="mb-2">This reservation has been cancelled.</h5>
              <p className="mb-3">
                The seats on this booking have been released and it can no longer be paid for.
              </p>
              <Link to="/movies" className="btn btn-primary">
                Browse Movies
              </Link>
            </div>
          )}

          
          {isExpired && !isCancelled && (
            <div className="alert alert-danger text-center mb-4">
              <h5 className="mb-2">Your seat reservation has expired.</h5>
              <p className="mb-3">
                The hold window on these seats has elapsed and the seats were released.
              </p>
              {showtimeId && (
                <Link to={`/booking/${showtimeId}/seats`} className="btn btn-primary">
                  Choose Seats Again
                </Link>
              )}
            </div>
          )}

          
          {!isExpired && !isCancelled && !isConfirmed && booking.expiresAt && (
            <div className="mb-4">
              <ReservationTimer expiresAt={booking.expiresAt} onExpire={handleTimerExpire} />
            </div>
          )}

          
          <PaymentSummary booking={booking} />

          
          <div
            className="p-3 rounded-3 mb-4"
            style={{ background: "rgba(var(--color-neutral-rgb), 0.04)", border: "1px solid rgba(var(--color-neutral-rgb), 0.08)" }}
          >
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Booking Reference:</span>
              <strong className="text-light font-monospace">{booking.bookingReference}</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Reservation Expires:</span>
              <span className="text-light">
                {booking.expiresAt
                  ? `${formatDate(booking.expiresAt)} at ${formatTime(expiryClock(booking.expiresAt))}`
                  : "—"}
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Amount Due:</span>
              <strong className="text-warning">{formatCurrency(booking.totalAmount)}</strong>
            </div>
          </div>

          
          {canPay && (
            <div className="d-grid gap-2">
              <button
                type="button"
                className="btn btn-primary btn-lg rounded-3 fw-bold"
                onClick={handlePay}
                disabled={isInitializing}
              >
                {isInitializing ? (
                  <span>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Initializing payment…
                  </span>
                ) : (
                  `Pay ${formatCurrency(booking.totalAmount)}`
                )}
              </button>

              <div className="text-center mt-2">
                <small className="text-muted">
                  <AppIcon name="lock" size={15} /> Secured by Paystack. You will be redirected to Paystack to complete the
                  payment. Card, bank transfer, USSD & QR are supported.
                </small>
              </div>
            </div>
          )}

          <div className="text-center mt-4">
            <Link to={`/booking/${bookingId}/reservation`} className="text-decoration-none text-muted">
              <AppIcon name="arrowLeft" size={16} /> Back to Reservation
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


function hasHoldElapsed(booking) {
  if (!booking?.expiresAt) return false
  const expiry = new Date(booking.expiresAt).getTime()
  if (Number.isNaN(expiry)) return false
  return expiry <= Date.now()
}


function expiryClock(isoString) {
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return ""
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export default PaymentPage
