import { Link } from "react-router-dom"
import AppIcon from "../ui/AppIcon"

/**
 * BookingEmptyState — shown when a customer has no bookings, or when a filter
 * matches nothing. Always offers a way forward instead of a blank page.
 */
const BookingEmptyState = ({
  icon = "ticket",
  title = "No bookings yet",
  message = "When you reserve seats, your bookings and tickets will appear here.",
  ctaLabel = "Browse Movies",
  ctaTo = "/movies",
  onClearFilter = null
}) => {
  return (
    <div className="empty-state-box">
      <div className="empty-icon" aria-hidden="true">
        <AppIcon name={icon} size={36} />
      </div>
      <h2 className="booking-empty-title">{title}</h2>
      <p className="empty-text mb-4">{message}</p>

      <div className="d-flex justify-content-center gap-3 flex-wrap">
        {onClearFilter && (
          <button type="button" className="btn-secondary-custom" onClick={onClearFilter}>
            View All Bookings
          </button>
        )}
        <Link to={ctaTo} className="btn-primary-grad booking-empty-cta">
          {ctaLabel}
        </Link>
      </div>
    </div>
  )
}

export default BookingEmptyState
