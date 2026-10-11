import { useState, useEffect, useCallback, useRef } from "react"
import { Link, useOutletContext } from "react-router-dom"
import AdminHeader from "../../components/admin/AdminHeader"
import AppIcon from "../../components/ui/AppIcon"
import { BookingStatusBadge, PaymentStatusBadge } from "../../components/payment/PaymentStatus"
import {
  AdminLoading,
  AdminSectionError,
  AdminEmpty,
  AdminPagination
} from "../../components/admin/AdminUi"
import { describeApiError } from "../../components/admin/adminUtils"
import { formatCurrency, formatDate } from "../../utils/formatters"
import { getAllBookings, getAllMovies, getShowtimes } from "../../services/admin.service"

const BOOKING_STATUS_FILTERS = [
  { id: "", label: "All" },
  { id: "pending-payment", label: "Awaiting Payment" },
  { id: "confirmed", label: "Confirmed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "expired", label: "Expired" }
]

const PAYMENT_STATUS_FILTERS = [
  { id: "", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "unpaid", label: "Unpaid" },
  { id: "failed", label: "Not Completed" },
  { id: "refunded", label: "Refunded" }
]

const PAGE_SIZE = 20


const AdminBookingsPage = () => {
  const outletContext = useOutletContext()
  const requestVersion = useRef(0)

  const [bookings, setBookings] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: PAGE_SIZE })
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState("")

  const [bookingStatus, setBookingStatus] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [movieId, setMovieId] = useState("")
  const [showtimeId, setShowtimeId] = useState("")
  const [showtimes, setShowtimes] = useState([])
  const [optionsError, setOptionsError] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const [movies, setMovies] = useState([])

  const loadBookings = useCallback(async () => {
    const version = ++requestVersion.current
    setLoading(true)
    setListError("")
    try {
      const data = await getAllBookings({
        bookingStatus: bookingStatus || undefined,
        paymentStatus: paymentStatus || undefined,
        movieId: movieId || undefined,
        showtimeId: showtimeId || undefined,
        search: search || undefined,
        page,
        limit: PAGE_SIZE
      })

      if (version !== requestVersion.current) return
      if (data?.success && Array.isArray(data.bookings)) {
        setBookings(data.bookings)
        setPagination(data.pagination || { page, pages: 1, total: data.bookings.length, limit: PAGE_SIZE })
      } else {
        setListError(data?.message || "We couldn't load the bookings.")
      }
    } catch (err) {
      if (version !== requestVersion.current) return
      setListError(describeApiError(err, "We couldn't load the bookings."))
      setBookings([])
    } finally {
      if (version === requestVersion.current) setLoading(false)
    }
  }, [bookingStatus, paymentStatus, movieId, showtimeId, search, page])

  useEffect(() => {
    let active = true
    setShowtimes([])
    setOptionsError("")
    getShowtimes(movieId ? { movieId } : {}).then((data) => {
      if (active) setShowtimes(data.showtimes || [])
    }).catch((err) => {
      if (active) setOptionsError(describeApiError(err, "Showtime filters could not be loaded."))
    })
    return () => { active = false }
  }, [movieId])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  
  useEffect(() => {
    const loadMovies = async () => {
      try {
        const data = await getAllMovies()
        if (data?.success) setMovies(data.movies || [])
      } catch {
        
      }
    }
    loadMovies()
  }, [])

  
  const applyFilter = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearch(searchInput.trim())
    setPage(1)
  }

  const clearFilters = () => {
    setBookingStatus("")
    setPaymentStatus("")
    setMovieId("")
    setShowtimeId("")
    setSearchInput("")
    setSearch("")
    setPage(1)
  }

  const hasFilters = Boolean(bookingStatus || paymentStatus || movieId || showtimeId || search)

  return (
    <div className="admin-page">
      <AdminHeader
        title="Bookings"
        subtitle="Every reservation across the platform"
        sidebarOpen={outletContext?.sidebarOpen}
        onToggleSidebar={outletContext?.toggleSidebar}
        actions={
          <button type="button" className="admin-btn" onClick={loadBookings} disabled={loading}>
            {loading ? "Refreshing…" : <><AppIcon name="refresh" size={16} /> Refresh</>}
          </button>
        }
      />

      <div className="admin-content">
        <section className="admin-panel admin-panel--wide" data-panel="booking-list" aria-label="Booking list">
          <div className="admin-panel-head">
            <div>
              <h2 className="admin-panel-title">All Bookings</h2>
              <p className="admin-panel-sub">
                {loading ? "Loading bookings…" : `${pagination.total} ${pagination.total === 1 ? "booking" : "bookings"} found.`}
              </p>
            </div>
          </div>

          
          <form className="admin-filter-bar" data-panel="booking-filters" onSubmit={handleSearchSubmit}>
            <div className="admin-field">
              <label htmlFor="filter-booking-status">Booking Status</label>
              <select
                id="filter-booking-status"
                className="admin-input"
                value={bookingStatus}
                onChange={(e) => applyFilter(setBookingStatus)(e.target.value)}
              >
                {BOOKING_STATUS_FILTERS.map((f) => (
                  <option key={f.id || "all"} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label htmlFor="filter-payment-status">Payment Status</label>
              <select
                id="filter-payment-status"
                className="admin-input"
                value={paymentStatus}
                onChange={(e) => applyFilter(setPaymentStatus)(e.target.value)}
              >
                {PAYMENT_STATUS_FILTERS.map((f) => (
                  <option key={f.id || "all"} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label htmlFor="filter-booking-movie">Movie</label>
              <select
                id="filter-booking-movie"
                className="admin-input"
                value={movieId}
                onChange={(e) => { applyFilter(setMovieId)(e.target.value); setShowtimeId("") }}
              >
                <option value="">All movies</option>
                {movies.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label htmlFor="filter-booking-showtime">Showtime</label>
              <select id="filter-booking-showtime" className="admin-input" value={showtimeId}
                onChange={(e) => applyFilter(setShowtimeId)(e.target.value)}>
                <option value="">All showtimes</option>
                {showtimes.map((showtime) => (
                  <option key={showtime._id} value={showtime._id}>
                    {showtime.movie?.title || "Movie unavailable"} · {formatDate(showtime.showDate)} {showtime.startTime} · {showtime.screen?.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field admin-field--grow">
              <label htmlFor="filter-booking-search">Search</label>
              <input
                id="filter-booking-search"
                type="search"
                className="admin-input"
                placeholder="Reference, customer name or email"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <button type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
              Search
            </button>
            {hasFilters && (
              <button type="button" className="admin-btn" onClick={clearFilters}>
                Clear
              </button>
            )}
          </form>
          {optionsError && <AdminSectionError message={optionsError} />}

          {loading && <AdminLoading>Loading bookings…</AdminLoading>}
          {!loading && listError && <AdminSectionError message={listError} onRetry={loadBookings} />}
          {!loading && !listError && bookings.length === 0 && (
            <AdminEmpty>
              No bookings {hasFilters ? "match these filters" : "have been made yet"}.
            </AdminEmpty>
          )}

          {!loading && !listError && bookings.length > 0 && (
            <>
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <caption className="visually-hidden">All platform bookings</caption>
                  <thead>
                    <tr>
                      <th scope="col">Reference</th>
                      <th scope="col">Customer</th>
                      <th scope="col">Movie</th>
                      <th scope="col">Showtime</th>
                      <th scope="col">Screen</th>
                      <th scope="col">Seats</th>
                      <th scope="col" className="admin-num">Total</th>
                      <th scope="col">Booking</th>
                      <th scope="col">Payment</th>
                      <th scope="col">Created</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => {
                      const seatNumbers = Array.isArray(b.seats) ? b.seats.map((s) => s.seatNumber) : []
                      return (
                        <tr key={b._id}>
                          <td className="admin-ref">{b.bookingReference}</td>
                          <td>
                            <span className="admin-cell-strong">{b.user?.name || "Unknown"}</span>
                            <span className="admin-cell-sub">{b.user?.email || ""}</span>
                          </td>
                          <td>{b.movie?.title || "—"}</td>
                          <td className="admin-nowrap">
                            {b.showtime?.showDate ? formatDate(b.showtime.showDate) : "—"}
                            {b.showtime?.startTime ? ` · ${b.showtime.startTime}` : ""}
                          </td>
                          <td>{b.screen?.name || "—"}</td>
                          <td>
                            <span className="admin-seat-count">
                              {seatNumbers.length} {seatNumbers.length === 1 ? "seat" : "seats"}
                            </span>
                            {seatNumbers.length > 0 && (
                              <span className="admin-cell-sub">{seatNumbers.join(", ")}</span>
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
                          <td>
                            <Link to={`/admin/bookings/${b._id}`} className="admin-link-btn">
                              View
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <AdminPagination
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total}
                limit={pagination.limit || PAGE_SIZE}
                onPageChange={setPage}
                disabled={loading}
              />
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminBookingsPage
