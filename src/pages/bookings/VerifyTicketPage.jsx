import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { verifyTicket } from "../../services/booking.service"
import { formatDate, formatTime, formatStatus } from "../../utils/formatters"
import AppIcon from "../../components/ui/AppIcon"

const VerifyTicketPage = () => {
  const { hash } = useLocation()
  const token = new URLSearchParams(hash.slice(1)).get("token")
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      setLoading(true)
      setResult(null)
      setError("")
      try {
        if (!token) throw new Error("No ticket code was found. Please scan the QR code on your ticket.")
        const data = await verifyTicket(token, controller.signal)
        if (!data.success || !data.ticket) throw new Error(data.message || "Unable to verify this ticket.")
        if (!controller.signal.aborted) setResult(data)
      } catch (err) {
        if (!controller.signal.aborted) setError(err.response?.data?.message || err.message || "Unable to reach the cinema. Please try again.")
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [token, attempt])

  const ticket = result?.ticket
  return (
    <div className="page-wrapper">
      <title>Verify ticket | CineBook</title>
      <meta name="robots" content="noindex, nofollow" />
      <meta name="referrer" content="no-referrer" />
      <div className="container py-5">
        <section className="ticket-verification" aria-labelledby="verification-title" aria-busy={loading}>
          <p className="eyebrow"><AppIcon name="ticket" size={18} /> CINEBOOK TICKET VERIFICATION</p>
          <h1 id="verification-title">Ticket details</h1>
          {loading && <p role="status">Checking this ticket with the cinema…</p>}
          {error && <div role="alert" className="alert-error">{error}</div>}
          {result && <>
            <div className={`verification-status ${result.valid ? "is-valid" : "is-invalid"}`} role="status">
              <AppIcon name={result.valid ? "badgeCheck" : "alert"} size={24} />
              <strong>{result.message}</strong>
            </div>
            <h2>{ticket.movie?.title || "Movie unavailable"}</h2>
            <dl className="verification-details">
              <div><dt>Ticket holder</dt><dd>{ticket.customerName}</dd></div>
              <div><dt>Booking reference</dt><dd>{ticket.bookingReference}</dd></div>
              <div><dt>Date</dt><dd>{formatDate(ticket.showtime?.showDate, { year: "numeric", timeZone: "Africa/Lagos" })}</dd></div>
              <div><dt>Time</dt><dd>{formatTime(ticket.showtime?.startTime)}</dd></div>
              <div><dt>Screen</dt><dd>{ticket.screen?.name || "Unavailable"}</dd></div>
              <div><dt>Seats</dt><dd>{ticket.seats.map(seat => `${seat.seatNumber}${seat.ticketType === "vip" ? " (VIP)" : ""}`).join(", ")}</dd></div>
              <div><dt>Booking status</dt><dd>{formatStatus(ticket.bookingStatus)}</dd></div>
              <div><dt>Payment status</dt><dd>{formatStatus(ticket.paymentStatus)}</dd></div>
            </dl>
            <p className="text-muted">Status checked live with CineBook. Present this ticket to cinema staff for admission.</p>
          </>}
          {!loading && token && <button type="button" className="btn-primary-grad" onClick={() => setAttempt(value => value + 1)}>{error ? "Try again" : "Check status again"}</button>}
          <Link className="verification-home" to="/">Back to CineBook</Link>
        </section>
      </div>
    </div>
  )
}

export default VerifyTicketPage
