import { useState, useEffect, useMemo, useCallback } from "react"
import { Link } from "react-router-dom"
import { getMyBookings } from "../../services/booking.service"
import BookingCard from "../../components/bookings/BookingCard"
import BookingEmptyState from "../../components/bookings/BookingEmptyState"
import { BOOKING_FILTERS, filterBookings, countByFilter } from "../../utils/bookingHelpers"
import AppIcon from "../../components/ui/AppIcon"


const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  
  
  const [now, setNow] = useState(() => new Date())

  const loadBookings = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const data = await getMyBookings()

      if (data?.success && Array.isArray(data.bookings)) {
        
        setBookings(data.bookings)
      } else {
        setError(data?.message || "We couldn't load your bookings.")
        setBookings([])
      }
    } catch (err) {
      const status = err.response?.status
      if (status === 401) {
        setError("Your session has expired. Please sign in again.")
      } else if (!err.response) {
        setError("We couldn't reach the server. Please check your connection and try again.")
      } else {
        setError(err.response?.data?.message || "We couldn't load your bookings.")
      }
      setBookings([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  const counts = useMemo(() => countByFilter(bookings, now), [bookings, now])
  const visible = useMemo(() => filterBookings(bookings, activeFilter, now), [bookings, activeFilter, now])

  
  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container py-5 text-center">
          <div className="spinner" />
          <p className="text-muted">Loading your bookings…</p>
        </div>
      </div>
    )
  }

  
  if (error) {
    return (
      <div className="page-wrapper">
        <div className="container py-5 text-center">
          <div className="alert-error mx-auto mb-4" style={{ maxWidth: "560px" }}>
            <AppIcon name="alert" size={16} /> {error}
          </div>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <button type="button" className="btn-secondary-custom" onClick={loadBookings}>
              <AppIcon name="refresh" size={16} /> Try Again
            </button>
            <Link to="/movies" className="btn-primary-grad" style={{ maxWidth: "220px" }}>
              Browse Movies
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper my-bookings-page">
      <div className="container py-4">
        
        <header className="bookings-header">
          <div>
            <h1 className="bookings-title">My Bookings</h1>
            <p className="bookings-subtitle">
              {bookings.length === 0
                ? "Your reservations and tickets will appear here."
                : `${bookings.length} ${bookings.length === 1 ? "booking" : "bookings"} in total.`}
            </p>
          </div>
          <Link to="/movies" className="btn-secondary-custom bookings-header-cta">
            Browse Movies
          </Link>
        </header>

        
        {bookings.length === 0 ? (
          <BookingEmptyState />
        ) : (
          <>
            
            <nav className="filter-tabs bookings-filter-tabs" aria-label="Filter bookings">
              {BOOKING_FILTERS.map((filter) => {
                const count = counts[filter.id] || 0
                const isActive = activeFilter === filter.id

                return (
                  <button
                    key={filter.id}
                    type="button"
                    className={`filter-tab ${isActive ? "active" : ""}`}
                    onClick={() => setActiveFilter(filter.id)}
                    aria-pressed={isActive}
                  >
                    {filter.label}
                    <span className="filter-tab-count">{count}</span>
                  </button>
                )
              })}
            </nav>

            <p className="results-count-bar" aria-live="polite">
              Showing <strong>{visible.length}</strong>{" "}
              {visible.length === 1 ? "booking" : "bookings"}
            </p>

            
            {visible.length === 0 ? (
              <BookingEmptyState
                icon="search"
                title="No bookings in this view"
                message="Nothing matches this filter. Try another tab to see your other bookings."
                ctaLabel="Browse Movies"
                ctaTo="/movies"
                onClearFilter={() => setActiveFilter("all")}
              />
            ) : (
              <div className="bookings-list">
                {visible.map((booking) => (
                  <BookingCard key={booking._id} booking={booking} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MyBookingsPage
