import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { formatCurrency, formatTime, formatDate } from "../../utils/formatters"

const ShowtimeCard = ({ showtime }) => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  if (!showtime) return null

  const id = showtime.id || showtime._id
  const dateStr = showtime.date || showtime.showDate
  const startTime = showtime.startTime
  const endTime = showtime.endTime
  const screen = showtime.screen || {}
  const standardPrice = showtime.pricing?.standard ?? showtime.standardPrice
  const vipPrice = showtime.pricing?.vip ?? showtime.vipPrice

  const handleSelectShowtime = () => {
    const targetRoute = `/booking/${id}/seats`

    if (isAuthenticated) {
      navigate(targetRoute)
    } else {
      navigate("/login", {
        state: { from: targetRoute }
      })
    }
  }

  return (
    <div className="showtime-card">
      <div className="showtime-header">
        <div className="showtime-screen-info">
          <span className="screen-name">{screen.name || "Main Screen"}</span>
          {screen.screenType && (
            <span className="screen-type-tag">
              {screen.screenType.toUpperCase()}
            </span>
          )}
        </div>
        <div className="showtime-date">{formatDate(dateStr)}</div>
      </div>

      <div className="showtime-time-block">
        <span className="showtime-start">{formatTime(startTime)}</span>
        {endTime && (
          <span className="showtime-end">ends {formatTime(endTime)}</span>
        )}
      </div>

      <div className="showtime-pricing">
        <div className="price-item">
          <span className="price-label">Standard</span>
          <span className="price-value">{formatCurrency(standardPrice)}</span>
        </div>
        {vipPrice && vipPrice > standardPrice ? (
          <div className="price-item vip">
            <span className="price-label">VIP</span>
            <span className="price-value">{formatCurrency(vipPrice)}</span>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className="btn-select-showtime"
        onClick={handleSelectShowtime}
        aria-label={`Select showtime at ${formatTime(startTime)}`}
      >
        Select Showtime
      </button>
    </div>
  )
}

export default ShowtimeCard
