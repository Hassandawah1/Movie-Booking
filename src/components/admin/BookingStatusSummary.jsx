import StatusBreakdown from "./StatusBreakdown"
import AppIcon from "../ui/AppIcon"


const BookingStatusSummary = ({ data, loading, error, onRetry }) => {
  if (loading) {
    return (
      <section className="admin-panel" data-panel="booking-status" aria-label="Booking status">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title">Bookings by Status</h2>
        </div>
        <p className="admin-loading">Loading booking analytics…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="admin-panel" data-panel="booking-status" aria-label="Booking status">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title">Bookings by Status</h2>
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

  const rows = [
    { label: "Confirmed", value: data?.confirmed ?? 0, tone: "success" },
    { label: "Awaiting Payment", value: data?.pendingPayment ?? 0, tone: "warning" },
    { label: "Cancelled", value: data?.cancelled ?? 0, tone: "neutral" },
    { label: "Expired", value: data?.expired ?? 0, tone: "neutral" }
  ]

  return (
    <StatusBreakdown
      title="Bookings by Status"
      panelId="booking-status"
      rows={rows}
      total={data?.total ?? 0}
      totalLabel="Total bookings"
    />
  )
}

export default BookingStatusSummary
