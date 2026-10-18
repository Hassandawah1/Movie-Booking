import AppIcon from "../ui/AppIcon"

const SeatButton = ({
  seatNumber,
  status = "available",
  isSelected = false,
  onToggle,
  price
}) => {
  const isUnavailable = status === "unavailable"

  const handleClick = () => {
    if (!isUnavailable && onToggle) {
      onToggle(seatNumber)
    }
  }

  const seatClass = isUnavailable
    ? "seat-btn unavailable"
    : isSelected
    ? "seat-btn selected"
    : "seat-btn available"

  const labelStatus = isUnavailable
    ? "unavailable"
    : isSelected
    ? "selected"
    : "available"

  return (
    <button
      type="button"
      className={seatClass}
      disabled={isUnavailable}
      onClick={handleClick}
      aria-label={`Seat ${seatNumber} ${labelStatus}${price ? `, ₦${price}` : ""}`}
      aria-pressed={isSelected}
      title={`Seat ${seatNumber} (${labelStatus})`}
    >
      {isUnavailable ? (
        <AppIcon name="close" size={16} strokeWidth={3} />
      ) : (
        <span className="seat-number">{seatNumber}</span>
      )}
    </button>
  )
}

export default SeatButton
