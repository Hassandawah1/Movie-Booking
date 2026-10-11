import AppIcon from "../ui/AppIcon"

const SeatLegend = () => {
  return (
    <div className="seat-legend" aria-label="Seat state legend">
      <div className="legend-item">
        <span className="legend-badge available" aria-hidden="true" />
        <span className="legend-label">Available</span>
      </div>

      <div className="legend-item">
        <span className="legend-badge selected" aria-hidden="true" />
        <span className="legend-label">Selected</span>
      </div>

      <div className="legend-item">
        <span className="legend-badge unavailable" aria-hidden="true">
          <AppIcon name="close" size={11} strokeWidth={3} />
        </span>
        <span className="legend-label">Unavailable</span>
      </div>
    </div>
  )
}

export default SeatLegend
