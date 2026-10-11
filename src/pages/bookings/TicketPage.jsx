import { useState, useEffect, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { getBookingById } from "../../services/booking.service"
import TicketCard from "../../components/bookings/TicketCard"
import AppIcon from "../../components/ui/AppIcon"
import BookingStatusBadge from "../../components/bookings/BookingStatusBadge"
import { PaymentStatusBadge } from "../../components/payment/PaymentStatus"
import { useAuth } from "../../context/AuthContext"
import { formatCurrency } from "../../utils/formatters"
import { isTicketValid, isPaymentInconsistent, hasShowtimeStarted } from "../../utils/bookingHelpers"


const TicketPage = () => {
  const { bookingId } = useParams()
  const { user } = useAuth()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [accessDenied, setAccessDenied] = useState(false)

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
        setError("Booking not found.")
      } else if (!err.response) {
        setError("We couldn't reach the server. Please check your connection and try again.")
      } else {
        setError(err.response?.data?.message || "We couldn't load your ticket.")
      }
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => {
    loadBooking()
  }, [loadBooking])

  const handlePrint = () => {
    window.print()
  }

  
  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container py-5 text-center">
          <div className="spinner" />
          <p className="text-muted">Loading your ticket…</p>
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
    bookingReference,
    movie,
    showtime,
    seats = [],
    totalAmount,
    bookingStatus,
    paymentStatus,
    paymentFailureReason
  } = booking

  const ticketReady = isTicketValid(booking)
  const inconsistent = isPaymentInconsistent(booking)
  const showtimeStarted = hasShowtimeStarted(showtime)
  const showtimeId = showtime?._id || showtime?.id || showtime
  const movieId = movie?._id || movie?.id || movie

  
  if (!ticketReady) {
    return (
      <div className="page-wrapper">
        <div className="container py-5">
          <div className="ticket-blocked mx-auto">
            <div className="ticket-blocked-icon" aria-hidden="true">
              <AppIcon name={inconsistent ? "alert" : "ticket"} size={26} />
            </div>

            <h1 className="ticket-blocked-title">
              {inconsistent
                ? "Your booking status needs verification"
                : "No ticket available yet"}
            </h1>

            <p className="ticket-blocked-text">
              {inconsistent
                ? "The booking and payment records don't agree, so we can't issue a valid ticket. Please contact support with the reference below."
                : "This booking isn't confirmed and paid, so there's no ticket to show. A ticket is only issued once payment is verified."}
            </p>

            <div className="ticket-blocked-badges">
              <BookingStatusBadge status={bookingStatus} />
              <PaymentStatusBadge status={paymentStatus} failureReason={paymentFailureReason} />
            </div>

            <div className="ticket-blocked-summary">
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
              {bookingStatus === "pending-payment" && (
                <Link
                  to={`/booking/${bookingId}/payment`}
                  className="btn-primary-grad booking-action-primary"
                >
                  Continue Payment <AppIcon name="arrowRight" size={16} />
                </Link>
              )}

              {(bookingStatus === "expired" || bookingStatus === "cancelled") && showtimeId && (
                <Link
                  to={`/booking/${showtimeId}/seats`}
                  className="btn-primary-grad booking-action-primary"
                >
                  Choose Seats Again
                </Link>
              )}

              <Link to={`/bookings/${bookingId}`} className="btn-secondary-custom booking-action-secondary">
                View Booking Details
              </Link>

              <Link to="/bookings" className="btn-secondary-custom booking-action-secondary">
                All My Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  
  return (
    <div className="page-wrapper ticket-page">
      <div className="container py-4">
        
        <div className="ticket-toolbar no-print">
          <div>
            <h1 className="ticket-toolbar-title">Your Ticket</h1>
            <p className="ticket-toolbar-sub">
              {showtimeStarted
                ? "This showtime has already taken place — this is your booking record."
                : "Show this ticket at the entrance, printed or on your phone."}
            </p>
          </div>

          <div className="ticket-toolbar-actions">
            <button type="button" className="btn-primary-grad booking-action-primary" onClick={handlePrint}>
              <AppIcon name="printer" size={16} /> Print Ticket
            </button>
            <Link to="/bookings" className="btn-secondary-custom booking-action-secondary">
              All My Bookings
            </Link>
          </div>
        </div>

        <div className="ticket-stage">
          <TicketCard booking={booking} customerName={user?.name} />
        </div>

        
        <div className="ticket-footer-links no-print">
          {movieId && (
            <Link to={`/movies/${movieId}`} className="btn-secondary-custom booking-action-secondary">
              View Movie
            </Link>
          )}
          <Link to={`/bookings/${bookingId}`} className="btn-secondary-custom booking-action-secondary">
            Booking Details
          </Link>
          <span className="ticket-seat-count">
            {seats.length} {seats.length === 1 ? "seat" : "seats"}
          </span>
        </div>
      </div>
    </div>
  )
}

export default TicketPage
