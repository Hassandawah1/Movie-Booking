import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { verifyPayment, getBookingPaymentStatus } from "../../services/payment.service"
import PaymentProcessing from "../../components/payment/PaymentProcessing"
import AppIcon from "../../components/ui/AppIcon"

/**
 * PaymentCallbackPage — /payment/callback
 *
 * Paystack redirects the customer here with `?reference=...` (and usually
 * `trxref=...`). A reference in the URL proves NOTHING about the payment:
 * the reference is sent to OUR backend, which verifies it directly against
 * Paystack. Only the backend's answer is trusted.
 */
const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const reference = searchParams.get("reference") || searchParams.get("trxref")

  const [status, setStatus] = useState("verifying") // verifying | notice
  const [error, setError] = useState("")
  // "network" | "unverified" | "missing"
  const [failureKind, setFailureKind] = useState(null)
  const [bookingId, setBookingId] = useState(null)

  // React StrictMode runs effects twice in development — verify exactly once.
  const hasTriggeredRef = useRef(false)

  const goToFailedPage = useCallback(
    (message, kind, resolvedBookingId) => {
      const params = new URLSearchParams()
      if (resolvedBookingId) params.set("bookingId", resolvedBookingId)
      if (reference) params.set("reference", reference)
      if (message) params.set("message", message)
      if (kind) params.set("reason", kind)
      navigate(`/payment/failed?${params.toString()}`, { replace: true })
    },
    [navigate, reference]
  )

  const verify = useCallback(async () => {
    if (!reference) {
      setFailureKind("missing")
      setError("No transaction reference was found in the callback URL.")
      setStatus("notice")
      return
    }

    setStatus("verifying")
    setError("")
    setFailureKind(null)

    try {
      // Ask OUR backend to verify the transaction with Paystack.
      const data = await verifyPayment(reference)

      const verifiedBooking = data?.booking

      if (verifiedBooking?.id) setBookingId(verifiedBooking.id)

      if (verifiedBooking?.paymentStatus === "paid" && verifiedBooking?.bookingStatus === "confirmed") {
        navigate(`/booking/${verifiedBooking.id}/success`, { replace: true })
        return
      }

      // Backend replied, but the booking is not confirmed/paid.
      // Ask the booking-scoped payment status endpoint once for the final word.
      if (verifiedBooking?.id) {
        try {
          const statusData = await getBookingPaymentStatus(verifiedBooking.id)
          const payment = statusData?.payment

          if (payment?.paymentStatus === "paid" && payment?.bookingStatus === "confirmed") {
            navigate(`/booking/${verifiedBooking.id}/success`, { replace: true })
            return
          }

          goToFailedPage(
            statusData?.message ||
              data?.message ||
              "Your payment has not been confirmed yet.",
            "unverified",
            verifiedBooking.id
          )
          return
        } catch {
          // Fall through to the generic unverified handling below.
        }
      }

      goToFailedPage(
        data?.message || "Payment could not be confirmed.",
        "unverified",
        verifiedBooking?.id
      )
    } catch (err) {
      const res = err.response
      const backendMessage = res?.data?.message

      // Not a definitive failure — the payment may well have succeeded.
      if (!res) {
        setFailureKind("network")
        setError("We couldn't verify your payment right now.")
        setStatus("notice")
        return
      }

      // Invalid / unknown reference (404) or forbidden (403) — still not proof
      // that money moved, so route to the failed page with context.
      goToFailedPage(
        backendMessage || "We couldn't confirm this payment.",
        res.status === 400 ? "failed" : "unverified",
        res.data?.booking?.id
      )
    }
  }, [reference, navigate, goToFailedPage])

  useEffect(() => {
    if (hasTriggeredRef.current) return
    hasTriggeredRef.current = true
    verify()
  }, [verify])

  // ── Verifying ──────────────────────────────────────────────────────────────
  if (status === "verifying") {
    return (
      <div className="container py-5">
        <PaymentProcessing message="Verifying your payment…" />
      </div>
    )
  }

  // ── Cannot verify (network) or no reference ────────────────────────────────
  const isNetworkFailure = failureKind === "network"

  return (
    <div className="container py-5 text-center">
      <div
        className="card border-0 rounded-4 p-4 mx-auto"
        style={{ maxWidth: "560px", background: "#1a1b1d" }}
      >
        <div style={{ marginBottom: "1rem" }}><AppIcon name={isNetworkFailure ? "radio" : "alert"} size={48} /></div>

        <h3 className="fw-bold text-light mb-2">
          {isNetworkFailure ? "We couldn't verify your payment right now" : "Verification Notice"}
        </h3>

        <p className="text-muted mb-4">
          {isNetworkFailure
            ? "This does not necessarily mean the payment failed — your transaction may still have gone through. Please retry the verification."
            : error}
        </p>

        {isNetworkFailure ? (
          <div className="d-grid gap-2">
            <button type="button" className="btn btn-primary" onClick={verify}>
              <AppIcon name="refresh" size={16} /> Retry Verification
            </button>
            {bookingId && (
              <Link to={`/booking/${bookingId}/payment`} className="btn btn-outline-light">
                Return to Booking
              </Link>
            )}
            <Link to="/movies" className="btn btn-link text-muted">
              Browse Movies
            </Link>
          </div>
        ) : (
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            {reference && (
              <button type="button" className="btn btn-outline-light" onClick={verify}>
                <AppIcon name="refresh" size={16} /> Retry Verification
              </button>
            )}
            <Link to="/movies" className="btn btn-primary">
              Browse Movies
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentCallbackPage
