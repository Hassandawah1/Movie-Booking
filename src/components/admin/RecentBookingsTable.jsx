import { BookingStatusBadge } from "../payment/PaymentStatus"
import { PaymentStatusBadge } from "../payment/PaymentStatus"
import { formatCurrency, formatDate } from "../../utils/formatters"
import AppIcon from "../ui/AppIcon"


const RecentBookingsTable = ({ bookings = [], loading, error, onRetry }) => {
  if (loading) {
    return (
      <section className="admin-panel admin-panel--wide" data-panel="recent-bookings" aria-label="Recent bookings">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title">Recent Bookings</h2>
        </div>
        <p className="admin-loading">Loading recent bookings…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="admin-panel admin-panel--wide" data-panel="recent-bookings" aria-label="Recent bookings">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title">Recent Bookings</h2>
        </div>
        <p className="admin-section-error"><AppIcon name="alert" size={16} /> {error}</p>
        {onRetry && (
          <button type="button" className="admin-link-btn" onClick={onRetry}>
            <AppIcon name="refresh" size={16} /> Retry
          </button>
        )}
      </section>
    )
  }

  return (
    <section className="admin-panel admin-panel--wide" data-panel="recent-bookings" aria-label="Recent bookings">
      <div className="admin-panel-head">
        <div>
          <h2 className="admin-panel-title">Recent Bookings</h2>
          <p className="admin-panel-sub">Latest {bookings.length} bookings across the platform.</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <p className="admin-empty">No bookings have been made yet.</p>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <caption className="visually-hidden">Most recent bookings</caption>
            <thead>
              <tr>
                <th scope="col">Reference</th>
                <th scope="col">Customer</th>
                <th scope="col">Movie</th>
                <th scope="col">Seats</th>
                <th scope="col">Showtime</th>
                <th scope="col" className="admin-num">Total</th>
                <th scope="col">Booking</th>
                <th scope="col">Payment</th>
                <th scope="col">Booked</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const seatNumbers = Array.isArray(b.seats)
                  ? b.seats.map((s) => s.seatNumber).filter(Boolean)
                  : []

                return (
                  <tr key={b.id || b.bookingReference}>
                    <td className="admin-ref">{b.bookingReference || "—"}</td>
                    <td>
                      <span className="admin-cell-strong">{b.customer?.name || "Unknown"}</span>
                      {b.customer?.email && (
                        <span className="admin-cell-sub">{b.customer.email}</span>
                      )}
                    </td>
                    <td>{b.movie?.title || "—"}</td>
                    <td>
                      <span className="admin-seat-count">
                        {seatNumbers.length} {seatNumbers.length === 1 ? "seat" : "seats"}
                      </span>
                      {seatNumbers.length > 0 && (
                        <span className="admin-cell-sub">{seatNumbers.join(", ")}</span>
                      )}
                    </td>
                    <td className="admin-nowrap">
                      {b.showtime?.showDate ? (
                        <>
                          {formatDate(b.showtime.showDate)}
                          {b.showtime.startTime ? ` · ${b.showtime.startTime}` : ""}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="admin-num admin-num--money">{formatCurrency(b.totalAmount)}</td>
                    <td>
                      <BookingStatusBadge status={b.bookingStatus} />
                    </td>
                    <td>
                      <PaymentStatusBadge status={b.paymentStatus} />
                    </td>
                    <td className="admin-nowrap">{formatDate(b.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default RecentBookingsTable
