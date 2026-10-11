import { BookingStatusBadge, PaymentStatusBadge } from "../../payment/PaymentStatus"
import { formatCurrency, formatDate, formatTime } from "../../../utils/formatters"
import AppIcon from "../../ui/AppIcon"


const clockOf = (value) => {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ""
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

const Row = ({ label, children }) => (
  <div className="detail-item-row">
    <span className="detail-label">{label}:</span>
    <span className="detail-value">{children}</span>
  </div>
)


const AdminBookingDetails = ({ booking, cancelling, onCancel }) => {
  if (!booking) return null

  const {
    bookingReference,
    user,
    movie,
    screen,
    showtime,
    seats = [],
    totalAmount,
    bookingStatus,
    paymentStatus,
    paymentReference,
    paymentChannel,
    paidAt,
    confirmedAt,
    createdAt,
    expiresAt
  } = booking

  const isPaid = bookingStatus === "confirmed" || paymentStatus === "paid"
  const canCancel = bookingStatus === "pending-payment" && paymentStatus !== "paid"

  return (
    <section className="admin-panel admin-panel--wide" data-panel="booking-details" aria-label="Booking details">
      <div className="admin-panel-head">
        <div>
          <h2 className="admin-panel-title">Booking {bookingReference}</h2>
          <p className="admin-panel-sub">
            Created {formatDate(createdAt)} at {formatTime(clockOf(createdAt))}
          </p>
        </div>
        <div className="booking-details-badges">
          <BookingStatusBadge status={bookingStatus} />
          <PaymentStatusBadge status={paymentStatus} />
        </div>
      </div>

      <div className="admin-detail-grid">
        <div className="reservation-details-box">
          <h3 className="admin-detail-heading">Customer</h3>
          <Row label="Name">{user?.name || "Unknown"}</Row>
          <Row label="Email">{user?.email || "—"}</Row>
        </div>

        <div className="reservation-details-box">
          <h3 className="admin-detail-heading">Screening</h3>
          <Row label="Movie">{movie?.title || "—"}</Row>
          <Row label="Screen">
            {screen?.name || "—"}
            {screen?.screenType ? ` (${screen.screenType.toUpperCase()})` : ""}
          </Row>
          <Row label="Showtime">
            {formatDate(showtime?.showDate)} at {formatTime(showtime?.startTime)}
          </Row>
        </div>

        <div className="reservation-details-box">
          <h3 className="admin-detail-heading">Seats</h3>
          <Row label="Count">
            {seats.length} {seats.length === 1 ? "ticket" : "tickets"}
          </Row>
          <Row label="Seats">
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
          </Row>
          {seats.length > 0 && (
            <Row label="Seat Prices">
              {seats.map((s) => `${s.seatNumber} ${formatCurrency(s.price)}`).join(" · ")}
            </Row>
          )}
        </div>

        <div className="reservation-details-box">
          <h3 className="admin-detail-heading">Payment</h3>
          <Row label="Total Amount">
            <strong className="admin-detail-amount">{formatCurrency(totalAmount)}</strong>
          </Row>
          <Row label="Payment Reference">{paymentReference || "—"}</Row>
          <Row label="Payment Channel">{paymentChannel || "—"}</Row>
          <Row label="Paid At">
            {paidAt ? `${formatDate(paidAt)} at ${formatTime(clockOf(paidAt))}` : "—"}
          </Row>
          <Row label="Confirmed At">
            {confirmedAt ? `${formatDate(confirmedAt)} at ${formatTime(clockOf(confirmedAt))}` : "—"}
          </Row>
          {bookingStatus === "pending-payment" && expiresAt && (
            <Row label="Hold Expires">
              {formatDate(expiresAt)} at {formatTime(clockOf(expiresAt))}
            </Row>
          )}
        </div>
      </div>

      <div className="admin-detail-actions">
        {canCancel && (
          <button
            type="button"
            className="admin-btn admin-btn--danger"
            onClick={() => onCancel(booking)}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling…" : "Cancel Booking"}
          </button>
        )}

        {isPaid && (
          <p className="admin-detail-note" data-panel="refund-notice">
            Paid bookings require the refund workflow. Refunds are not available in this phase —
            the booking cannot be cancelled from here.
          </p>
        )}

        {!canCancel && !isPaid && (
          <p className="admin-detail-note">
            This booking is {bookingStatus} and cannot be cancelled.
          </p>
        )}
      </div>
    </section>
  )
}

export default AdminBookingDetails
