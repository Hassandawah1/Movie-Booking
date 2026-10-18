import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { getBookingById } from "../../services/booking.service"
import PaymentStatus from "../../components/payment/PaymentStatus"
import AppIcon from "../../components/ui/AppIcon"


const PaymentFailedPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const reference = searchParams.get("reference")
  const reason = searchParams.get("reason") 
  const bookingId = searchParams.get("bookingId")

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(Boolean(bookingId))
  const [notice, setNotice] = useState("")

  
  const backendMessage = searchParams.get("message")

  const loadBooking = useCallback(async () => {
    if (!bookingId) return

    setLoading(true)
    try {
      const data = await getBookingById(bookingId)

      if (data?.success && data.booking) {
        const b = data.booking
        setBooking(b)

        
        
        if (b.paymentStatus === "paid" && b.bookingStatus === "confirmed") {
          navigate(`/booking/${bookingId}/success`, { replace: true })
        }
      } else {
        setNotice(data?.message || "")
      }
    } catch (err) {
      
      setNotice(err.response?.data?.message || "")
    } finally {
      setLoading(false)
    }
  }, [bookingId, navigate])

  useEffect(() => {
    loadBooking()
  }, [loadBooking])

  const bookingStatus = booking?.bookingStatus
  const paymentStatus = booking?.paymentStatus
  const failureReason = booking?.paymentFailureReason

  const isConfirmed = bookingStatus === "confirmed" || paymentStatus === "paid"
  const isCancelled = bookingStatus === "cancelled"
  const holdElapsed = booking?.expiresAt
    ? new Date(booking.expiresAt).getTime() <= Date.now()
    : false
  const isExpired = bookingStatus === "expired" || holdElapsed

  
  const canRetry =
    Boolean(bookingId) &&
    !isConfirmed &&
    !isCancelled &&
    !isExpired &&
    bookingStatus === "pending-payment" &&
    paymentStatus !== "paid"

  const showtimeId = booking?.showtime?._id || booking?.showtime?.id || booking?.showtime

  
  
  const { heading, bodyText } = describeFailure({
    reason,
    failureReason,
    backendMessage
  })

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <div
            className="card border-0 rounded-4 p-4 p-md-5 text-center"
            style={{
              background: "var(--color-surface)",
              border: "1px solid rgba(var(--color-alert-rgb), 0.35)",
            }}
          >
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
              style={{
                width: "72px",
                height: "72px",
                background: "rgba(var(--color-alert-rgb), 0.15)",
                color: "var(--color-error)",
                fontSize: "2.2rem"
              }}
            >
              <AppIcon name="close" size={36} />
            </div>

            <h2 className="fw-bold text-light mb-2">{heading}</h2>
            <p className="text-muted mb-4">{bodyText}</p>

            {reference && (
              <div
                className="p-3 rounded-3 text-muted small mb-4 font-monospace"
                style={{ background: "rgba(var(--color-neutral-rgb), 0.04)" }}
              >
                Reference: {reference}
              </div>
            )}

            
            {loading && (
              <div className="text-muted small mb-4">
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Checking your booking status…
              </div>
            )}

            {!loading && booking && (
              <div
                className="p-3 rounded-3 text-start mb-4"
                style={{ background: "rgba(var(--color-neutral-rgb), 0.04)", border: "1px solid rgba(var(--color-neutral-rgb), 0.08)" }}
              >
                <div className="d-flex justify-content-between mb-3">
                  <span className="text-muted">Current State:</span>
                  <PaymentStatus
                    paymentStatus={paymentStatus}
                    bookingStatus={bookingStatus}
                    failureReason={failureReason}
                  />
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Booking Reference:</span>
                  <strong className="text-light font-monospace">{booking.bookingReference}</strong>
                </div>

                {booking.movie?.title && (
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Movie:</span>
                    <span className="text-light">{booking.movie.title}</span>
                  </div>
                )}
              </div>
            )}

            {!loading && notice && !booking && (
              <p className="small text-muted mb-4">{notice}</p>
            )}

            
            {isCancelled && (
              <div className="alert alert-warning small text-start mb-4">
                This reservation has been cancelled. Please start a new booking.
              </div>
            )}

            {!isCancelled && isExpired && booking && (
              <div className="alert alert-danger small text-start mb-4">
                Your seat reservation has expired and the seats were released.
              </div>
            )}

            {canRetry && (
              <div className="alert alert-info small text-start mb-4">
                <AppIcon name="info" size={15} /> Your reservation is still active. You can try the payment again — your seats
                are still being held.
              </div>
            )}

            
            <div className="d-grid gap-2">
              {canRetry && (
                <button
                  type="button"
                  className="btn btn-primary btn-lg rounded-3 fw-bold"
                  onClick={() => navigate(`/booking/${bookingId}/payment`)}
                >
                  Try Payment Again
                </button>
              )}

              {!loading && isExpired && showtimeId && (
                <Link to={`/booking/${showtimeId}/seats`} className="btn btn-primary btn-lg rounded-3 fw-bold">
                  Choose Seats Again
                </Link>
              )}

              {isConfirmed ? (
                <Link to={`/booking/${bookingId}/success`} className="btn btn-success btn-lg rounded-3 fw-bold">
                  View Confirmed Booking
                </Link>
              ) : (
                <Link to="/movies" className="btn btn-outline-light">
                  Browse Movies
                </Link>
              )}

              <Link to="/" className="btn btn-link text-muted">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


function describeFailure({ reason, failureReason, backendMessage }) {
  
  if (failureReason === "amount-mismatch") {
    return {
      heading: "Payment could not be confirmed",
      bodyText:
        "The amount received did not match this booking, so it has not been confirmed. If you were charged, please contact support with the reference below."
    }
  }

  
  if (failureReason === "abandoned" || reason === "failed") {
    return {
      heading: "Payment not completed",
      bodyText:
        "Your transaction was not completed, so you have not been charged for this booking."
    }
  }

  
  if (failureReason && failureReason !== "abandoned") {
    return {
      heading: "Payment was declined",
      bodyText: "The payment provider declined this transaction, so your booking has not been charged."
    }
  }

  
  return {
    heading: "Payment could not be confirmed",
    bodyText:
      backendMessage && /amount|duplicate|cancel/i.test(backendMessage)
        ? backendMessage
        : "We were unable to confirm this transaction with the payment provider. If money left your account it is not lost — retry the verification or contact support with the reference below."
  }
}

export default PaymentFailedPage
