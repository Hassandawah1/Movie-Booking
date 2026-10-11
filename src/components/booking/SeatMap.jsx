import SeatButton from "./SeatButton"

const SeatMap = ({
  layout = [],
  selectedSeats = [],
  onToggleSeat,
  screenName
}) => {
  const selectedSet = new Set(selectedSeats)

  if (!layout || layout.length === 0) {
    return (
      <div className="seat-map-empty">
        <p>No seat layout data available for this screen.</p>
      </div>
    )
  }

  return (
    <div className="seat-map-wrapper">
      {/* Cinema Screen Indicator */}
      <div className="screen-indicator-container">
        <div className="screen-curve" />
        <div className="screen-label">
          <span>CINEMA SCREEN</span>
          {screenName && <small className="screen-subname">({screenName})</small>}
        </div>
      </div>

      {/* Seat Rows Scrollable Container */}
      <div className="seat-map-scroll-area">
        <div className="seat-grid-container">
          {layout.map((rowObj) => (
            <div key={rowObj.row} className="seat-row">
              {/* Row Label (Left) */}
              <div className="row-label" aria-hidden="true">
                {rowObj.row}
              </div>

              {/* Seats in Row */}
              <div className="row-seats">
                {rowObj.seats.map((seat) => (
                  <SeatButton
                    key={seat.seatNumber}
                    seatNumber={seat.seatNumber}
                    status={seat.status}
                    isSelected={selectedSet.has(seat.seatNumber)}
                    onToggle={onToggleSeat}
                    price={seat.price}
                    ticketType={seat.ticketType}
                  />
                ))}
              </div>

              {/* Row Label (Right) */}
              <div className="row-label" aria-hidden="true">
                {rowObj.row}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SeatMap
