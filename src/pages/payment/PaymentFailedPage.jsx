import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { getBookingById } from "../../services/booking.service"
import PaymentStatus from "../../components/payment/PaymentStatus"
import AppIcon from "../../components/ui/AppIcon"

/**
 * PaymentFailedPage — /payment/failed
 *
 * Reached when a payment genuinely failed, or when the backend could not
 * confirm it. The booking is re-fetched from OUR backend so the page shows the
 * real current state instead of whatever the redirect claimed.
 */
const PaymentFailedPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const reference = searchParams.get("reference")
  const reason = searchParams.get("reason") // "failed" | "unverified" | null
  const bookingId = searchParams.get("bookingId")

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(Boolean(bookingId))
  const [notice, setNotice] = useState("")

  // Backend-provided message is the most accurate; fall back to a safe generic.
  const backendMessage = searchParams.get("message")

  const loadBooking = useCallback(async () => {
    if (!bookingId) return

    setLoading(true)
    try {
      const data = await getBookingById(bookingId)

      if (data?.success && data.booking) {
        const b = data.booking
        setBooking(b)

        // If it turns out the payment actually succeeded, do not show a
        // failure page at all.
        if (b.paymentStatus === "paid" && b.bookingStatus === "confirmed") {
          navigate(`/booking/${bookingId}/success`, { replace: true })
        }
      } else {
        setNotice(data?.message || "")
      }
    } catch (err) {
      // Ownership / not-found problems are not worth blocking the page for.
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

  // Retry is only offered for a still-valid, unpaid, pending reservation.
  const canRetry =
    Boolean(bookingId) &&
    !isConfirmed &&
    !isCancelled &&
    !isExpired &&
    bookingStatus === "pending-payment" &&
    paymentStatus !== "paid"

  const showtimeId = booking?.showtime?._id || booking?.showtime?.id || booking?.showtime

  // Never say "payment failed" when all we know is that it was not completed,
  // and never surface a raw gateway string to the customer.
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
              background: "#1a1b1d",
              border: "1px solid rgba(239, 68, 68, 0.35)",
            }}
          >
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mx-auto mb-3"
              style={{
                width: "72px",
                height: "72px",
                background: "rgba(239, 68, 68, 0.15)",
                color: "#f87171",
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
                style={{ background: "rgba(255, 255, 255, 0.04)" }}
              >
                Reference: {reference}
              </div>
            )}

            {/* ── Current booking state (authoritative, from backend) ─────── */}
            {loading && (
              <div className="text-muted small mb-4">
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Checking your booking status…
              </div>
            )}

            {!loading && booking && (
              <div
                className="p-3 rounded-3 text-start mb-4"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
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

            {/* ── State-specific guidance ─────────────────────────────────── */}
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

            {/* ── CTAs ────────────────────────────────────────────────────── */}
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

/**
 * Turn backend/gateway signals into honest, non-technical customer copy.
 * A raw gateway string like "Gateway reported status 'abandoned'" is never
 * shown directly.
 */
function describeFailure({ reason, failureReason, backendMessage }) {
  // Amount mismatch is a real problem the customer should not retry blindly.
  if (failureReason === "amount-mismatch") {
    return {
      heading: "Payment could not be confirmed",
      bodyText:
        "The amount received did not match this booking, so it has not been confirmed. If you were charged, please contact support with the reference below."
    }
  }

  // The checkout was opened but never completed — not a decline.
  if (failureReason === "abandoned" || reason === "failed") {
    return {
      heading: "Payment not completed",
      bodyText:
        "Your transaction was not completed, so you have not been charged for this booking."
    }
  }

  // Explicit gateway decline.
  if (failureReason && failureReason !== "abandoned") {
    return {
      heading: "Payment was declined",
      bodyText: "The payment provider declined this transaction, so your booking has not been charged."
    }
  }

  // Unverified / unclear outcome: the money may still have moved.
  return {
    heading: "Payment could not be confirmed",
    bodyText:
      backendMessage && /amount|duplicate|cancel/i.test(backendMessage)
        ? backendMessage
        : "We were unable to confirm this transaction with the payment provider. If money left your account it is not lost — retry the verification or contact support with the reference below."
  }
}

export default PaymentFailedPage
