import { useState, useEffect, useRef } from "react"
import AppIcon from "../ui/AppIcon"

/**
 * ReservationTimer — live countdown for the temporary seat hold.
 *
 * The timer is purely visual. The backend remains the single source of truth
 * for whether a reservation has actually expired.
 */
const ReservationTimer = ({ expiresAt, onExpire }) => {
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(() => {
    if (!expiresAt) return 0
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
    return Math.max(0, diff)
  })

  // Keep the latest callback in a ref so an inline `onExpire` prop does not
  // tear down / rebuild the interval on every parent render.
  const onExpireRef = useRef(onExpire)
  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  // Ensure the expiry callback fires at most once per expiry timestamp.
  const hasFiredRef = useRef(false)

  useEffect(() => {
    if (!expiresAt) return

    hasFiredRef.current = false

    let intervalId = null
    let isCleared = false

    const clearTimer = () => {
      if (!isCleared && intervalId) {
        clearInterval(intervalId)
        isCleared = true
      }
    }

    const updateTimer = () => {
      const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      const remaining = Math.max(0, diff)
      setTimeLeftSeconds(remaining)

      if (remaining <= 0) {
        clearTimer()
        if (!hasFiredRef.current) {
          hasFiredRef.current = true
          onExpireRef.current?.()
        }
      }
    }

    // Update once immediately so a already-near-expiry hold renders correctly.
    updateTimer()

    // Only start ticking if there is still time left on the hold.
    if (!hasFiredRef.current) {
      intervalId = setInterval(updateTimer, 1000)
    }

    return clearTimer
  }, [expiresAt])

  const minutes = Math.floor(timeLeftSeconds / 60)
  const seconds = timeLeftSeconds % 60
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

  const isExpired = timeLeftSeconds <= 0
  const isUrgent = timeLeftSeconds > 0 && timeLeftSeconds <= 120 // under 2 mins

  return (
    <div className={`reservation-timer-container ${isExpired ? "expired" : isUrgent ? "urgent" : ""}`}>
      <div className="timer-icon"><AppIcon name="timer" size={24} /></div>
      <div className="timer-content">
        <span className="timer-label">
          {isExpired ? "Seat Hold Expired" : "Time Remaining to Complete Payment"}
        </span>
        <span className="timer-countdown" aria-live="polite">
          {isExpired ? "00:00 — Expired" : formattedTime}
        </span>
      </div>
    </div>
  )
}

export default ReservationTimer
