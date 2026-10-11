import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { getSeatAvailability, createBooking } from "../../services/booking.service"
import SeatMap from "../../components/booking/SeatMap"
import SeatLegend from "../../components/booking/SeatLegend"
import BookingSummary from "../../components/booking/BookingSummary"
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters"
import AppIcon from "../../components/ui/AppIcon"

const MAX_SEATS_PER_BOOKING = 10
const POLLING_INTERVAL_MS = 12000 

const SeatSelectionPage = () => {
  const { showtimeId } = useParams()
  const navigate = useNavigate()

  const [showtime, setShowtime] = useState(null)
  const [layout, setLayout] = useState([])
  const [availability, setAvailability] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [conflictMessage, setConflictMessage] = useState("")

  const pollingRef = useRef(null)

  
  const fetchAvailability = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true)
      try {
        const data = await getSeatAvailability(showtimeId)
        if (data?.success && data.showtime) {
          const st = data.showtime
          setShowtime(st)
          setLayout(st.layout || [])
          setAvailability(st.availability || null)

          
          const unavailableSet = new Set()
          ;(st.layout || []).forEach((row) => {
            row.seats?.forEach((s) => {
              if (s.status === "unavailable") {
                unavailableSet.add(s.seatNumber)
              }
            })
          })

          setSelectedSeats((prev) =>
            prev.filter((seatNum) => !unavailableSet.has(seatNum))
          )
        } else {
          setError(data?.message || "Could not load seat availability.")
        }
      } catch (err) {
        if (!showtime) {
          setError(
            err.response?.data?.message ||
              "Failed to load showtime seats. Please verify the link or try again."
          )
        }
      } finally {
        setLoading(false)
        if (isManualRefresh) setRefreshing(false)
      }
    },
    [showtimeId, showtime]
  )

  
  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  
  useEffect(() => {
    pollingRef.current = setInterval(() => {
      fetchAvailability()
    }, POLLING_INTERVAL_MS)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [fetchAvailability])

  
  const handleToggleSeat = (seatNumber) => {
    setError("")
    setConflictMessage("")

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber))
    } else {
      if (selectedSeats.length >= MAX_SEATS_PER_BOOKING) {
        setConflictMessage(`You can select a maximum of ${MAX_SEATS_PER_BOOKING} seats per reservation.`)
        return
      }
      setSelectedSeats([...selectedSeats, seatNumber])
    }
  }

  
  const handleReserve = async () => {
    if (selectedSeats.length === 0 || isSubmitting) return

    setIsSubmitting(true)
    setError("")
    setConflictMessage("")

    try {
      
      const response = await createBooking({
        showtimeId,
        seats: selectedSeats
      })

      if (response?.success && response.booking) {
        const bookingId = response.booking.id || response.booking._id
        
        navigate(`/booking/${bookingId}/reservation`)
      } else {
        setError(response?.message || "Failed to create reservation.")
      }
    } catch (err) {
      if (err.response?.status === 409) {
        
        setConflictMessage(
          err.response.data?.message ||
            "One or more selected seats were just taken by another customer. Please choose different seats."
        )
        
        await fetchAvailability(true)
      } else if (err.response?.status === 400) {
        setError(err.response.data?.message || "Invalid reservation request.")
      } else if (err.response?.status === 401) {
        navigate("/login", {
          state: { from: `/booking/${showtimeId}/seats` }
        })
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to reserve seats. Please check your connection and try again."
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container py-5 text-center">
          <div className="spinner"></div>
          <p className="text-muted">Loading seat layout and availability…</p>
        </div>
      </div>
    )
  }

  if (error && !showtime) {
    return (
      <div className="page-wrapper">
        <div className="container py-5 text-center">
          <div className="alert-error mx-auto mb-4" style={{ maxWidth: "560px" }}>
            <AppIcon name="alert" size={16} /> {error}
          </div>
          <Link to="/movies" className="btn-primary-grad" style={{ maxWidth: "240px", display: "inline-block" }}>
            <AppIcon name="arrowLeft" size={16} /> Back to All Movies
          </Link>
        </div>
      </div>
    )
  }

  const unitPrice =
    showtime?.screen?.screenType === "vip" && showtime?.pricing?.vip != null
      ? showtime.pricing.vip
      : showtime?.pricing?.standard || 0

  return (
    <div className="page-wrapper seat-selection-page">
      <div className="container py-4">
        
        <div className="seat-page-header mb-4">
          <div className="showtime-headline-box">
            <div className="d-flex align-items-center gap-3">
              {showtime?.movie?.posterUrl && (
                <img
                  src={showtime.movie.posterUrl}
                  alt={showtime.movie.title}
                  className="header-thumb-poster"
                />
              )}
              <div>
                <span className="badge-cinema-screen">
                  {showtime?.screen?.name} • {(showtime?.screen?.screenType || "standard").toUpperCase()}
                </span>
                <h1 className="showtime-movie-title mb-1">
                  {showtime?.movie?.title}
                </h1>
                <p className="showtime-header-meta mb-0">
                  <AppIcon name="calendar" size={15} /> {formatDate(showtime?.showDate)} at {formatTime(showtime?.startTime)}
                  {showtime?.pricing?.standard && ` • Standard: ${formatCurrency(showtime.pricing.standard)}`}
                  {showtime?.pricing?.vip && ` • VIP: ${formatCurrency(showtime.pricing.vip)}`}
                </p>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
              <button
                type="button"
                className="btn-refresh-seats"
                onClick={() => fetchAvailability(true)}
                disabled={refreshing}
                title="Refresh real-time seat availability"
              >
                <AppIcon name="refresh" size={16} /> {refreshing ? "Refreshing…" : "Refresh Seats"}
              </button>
            </div>
          </div>
        </div>

        
        {conflictMessage && (
          <div className="alert-warning-banner mb-4" role="alert">
            <span className="alert-icon"><AppIcon name="alert" size={16} /></span>
            <div className="alert-text">
              <strong>Seat Availability Update:</strong> {conflictMessage}
            </div>
          </div>
        )}

        {error && (
          <div className="alert-error mb-4">
            <AppIcon name="alert" size={16} /> {error}
          </div>
        )}

        
        <div className="row g-4 align-items-start">
          
          <div className="col-lg-8">
            <div className="seat-selection-main-card">
              
              <SeatLegend />

              
              <SeatMap
                layout={layout}
                selectedSeats={selectedSeats}
                onToggleSeat={handleToggleSeat}
                screenName={showtime?.screen?.name}
              />

              
              {availability && (
                <div className="seat-availability-stats">
                  <span>Available: <strong>{availability.availableSeats}</strong></span>
                  <span>Booked: <strong>{availability.bookedSeats}</strong></span>
                  <span>Total: <strong>{availability.totalSeats}</strong></span>
                </div>
              )}
            </div>
          </div>

          
          <div className="col-lg-4">
            <BookingSummary
              showtime={showtime}
              selectedSeats={selectedSeats}
              unitPrice={unitPrice}
              isSubmitting={isSubmitting}
              onReserve={handleReserve}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeatSelectionPage
