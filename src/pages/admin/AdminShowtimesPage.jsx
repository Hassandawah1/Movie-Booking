import { useState, useEffect, useCallback, useRef } from "react"
import { useOutletContext } from "react-router-dom"
import AdminHeader from "../../components/admin/AdminHeader"
import AppIcon from "../../components/ui/AppIcon"
import ShowtimeForm from "../../components/admin/showtimes/ShowtimeForm"
import { AdminBanner, AdminLoading, AdminSectionError, AdminEmpty } from "../../components/admin/AdminUi"
import { describeApiError } from "../../components/admin/adminUtils"
import { formatCurrency, formatDate, formatTime } from "../../utils/formatters"
import {
  getShowtimes,
  getShowtimeById,
  createShowtime,
  updateShowtime,
  deleteShowtime,
  getAllMovies,
  getScreens
} from "../../services/admin.service"
const hasScreeningStarted = (showtime) => {
  if (!showtime.showDate || !showtime.startTime) return false
  return new Date(`${showtime.showDate.slice(0, 10)}T${showtime.startTime}:00+01:00`) <= new Date()
}


const STATUS_FILTERS = [
  { id: "", label: "All" },
  { id: "scheduled", label: "Scheduled" },
  { id: "cancelled", label: "Cancelled" },
  { id: "completed", label: "Completed" }
]


const AdminShowtimesPage = () => {
  const outletContext = useOutletContext()
  const requestVersion = useRef(0)

  const [showtimes, setShowtimes] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState("")
  const [banner, setBanner] = useState(null)

  const [movies, setMovies] = useState([])
  const [screens, setScreens] = useState([])
  const [optionsError, setOptionsError] = useState("")

  
  const [filterMovie, setFilterMovie] = useState("")
  const [filterDate, setFilterDate] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [filterScreen, setFilterScreen] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [busyAction, setBusyAction] = useState("")

  const loadShowtimes = useCallback(async () => {
    const version = ++requestVersion.current
    setLoading(true)
    setListError("")
    try {
      const data = await getShowtimes({
        movieId: filterMovie || undefined,
        screenId: filterScreen || undefined,
        date: filterDate || undefined,
        status: filterStatus || undefined
      })
      if (version !== requestVersion.current) return
      if (data?.success && Array.isArray(data.showtimes)) {
        setShowtimes(data.showtimes)
      } else {
        setListError(data?.message || "We couldn't load the showtimes.")
      }
    } catch (err) {
      if (version !== requestVersion.current) return
      setListError(describeApiError(err, "We couldn't load the showtimes."))
      setShowtimes([])
    } finally {
      if (version === requestVersion.current) setLoading(false)
    }
  }, [filterMovie, filterScreen, filterDate, filterStatus])

  useEffect(() => {
    loadShowtimes()
  }, [loadShowtimes])

  
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [movieData, screenData] = await Promise.all([getAllMovies(), getScreens()])
        if (movieData?.success) setMovies(movieData.movies || [])
        if (screenData?.success) setScreens(screenData.screens || [])
      } catch (err) {
        setOptionsError(describeApiError(err, "Movie and screen options could not be loaded. Refresh to try again."))
      }
    }
    loadOptions()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setShowForm(true)
    setBanner(null)
  }

  const openEdit = async (showtime) => {
    setBanner(null)
    
    try {
      const data = await getShowtimeById(showtime._id)
      setEditing(data?.showtime || showtime)
    } catch {
      setEditing(showtime)
    }
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
  }

  const handleSubmit = async (payload) => {
    setSubmitting(true)
    setBanner(null)
    try {
      const data = editing ? await updateShowtime(editing._id, payload) : await createShowtime(payload)

      if (data?.success) {
        setBanner({
          tone: "success",
          message: editing ? "Showtime updated successfully." : "Showtime created successfully."
        })
        closeForm()
        await loadShowtimes()
      } else {
        setBanner({ tone: "error", message: data?.message || "The showtime could not be saved." })
      }
    } catch (err) {
      
      setBanner({ tone: "error", message: describeApiError(err, "The showtime could not be saved.") })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelShowtime = async (showtime) => {
    const confirmed = window.confirm(
      "Cancel this showtime? It will no longer be bookable by customers."
    )
    if (!confirmed) return

    setBusyId(showtime._id)
    setBusyAction("cancel")
    setBanner(null)
    try {
      const data = await updateShowtime(showtime._id, { status: "cancelled" })
      if (data?.success) {
        setBanner({ tone: "success", message: "Showtime cancelled." })
        await loadShowtimes()
      } else {
        setBanner({ tone: "error", message: data?.message || "The showtime could not be cancelled." })
      }
    } catch (err) {
      setBanner({ tone: "error", message: describeApiError(err, "The showtime could not be cancelled.") })
    } finally {
      setBusyId(null)
      setBusyAction("")
    }
  }

  const handleDelete = async (showtime) => {
    const confirmed = window.confirm(
      "Delete this showtime permanently? This cannot be undone."
    )
    if (!confirmed) return

    setBusyId(showtime._id)
    setBusyAction("delete")
    setBanner(null)
    try {
      const data = await deleteShowtime(showtime._id)
      if (data?.success) {
        setBanner({ tone: "success", message: "Showtime deleted." })
        await loadShowtimes()
      } else {
        setBanner({ tone: "error", message: data?.message || "The showtime could not be deleted." })
      }
    } catch (err) {
      
      setBanner({ tone: "error", message: describeApiError(err, "The showtime could not be deleted.") })
    } finally {
      setBusyId(null)
      setBusyAction("")
    }
  }

  const clearFilters = () => {
    setFilterMovie("")
    setFilterScreen("")
    setFilterDate("")
    setFilterStatus("")
  }

  const hasFilters = Boolean(filterMovie || filterScreen || filterDate || filterStatus)

  const occupancyOf = (st) => {
    const booked = Array.isArray(st.bookedSeats) ? st.bookedSeats.length : st.bookedSeatsCount
    const capacity = st.screen?.totalSeats
    if (booked == null || capacity == null) return "—"
    return `${booked} / ${capacity}`
  }

  const canDeleteShowtime = (st) => {
    const booked = Array.isArray(st.bookedSeats) ? st.bookedSeats.length : 0
    return booked === 0
  }

  return (
    <div className="admin-page">
      <AdminHeader
        title="Showtimes"
        subtitle="Schedule screenings and manage ticket pricing"
        sidebarOpen={outletContext?.sidebarOpen}
        onToggleSidebar={outletContext?.toggleSidebar}
        actions={
          <>
            <button type="button" className="admin-btn" onClick={loadShowtimes} disabled={loading}>
              {loading ? "Refreshing…" : <><AppIcon name="refresh" size={16} /> Refresh</>}
            </button>
            <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate} disabled={submitting}>
              + Schedule Showtime
            </button>
          </>
        }
      />

      <div className="admin-content">
        {optionsError && <AdminSectionError message={optionsError} onRetry={() => window.location.reload()} />}
        {banner && <AdminBanner tone={banner.tone} message={banner.message} onDismiss={() => setBanner(null)} />}

        {showForm && (
          <section className="admin-panel" aria-label="Showtime form">
            <ShowtimeForm
              initial={editing}
              movies={movies}
              screens={screens}
              submitting={submitting}
              onCancel={closeForm}
              onSubmit={handleSubmit}
            />
          </section>
        )}

        {showtimes.some(st => st.status === "scheduled" && hasScreeningStarted(st)) && (
          <AdminBanner tone="warning" message="Some listed screenings are in the past. Customers only see upcoming sessions. Schedule a new screening to make those movies bookable again." />
        )}

        <section className="admin-panel admin-panel--wide" data-panel="showtime-list" aria-label="Showtime list">
          <div className="admin-panel-head">
            <div>
              <h2 className="admin-panel-title">Scheduled Screenings</h2>
              <p className="admin-panel-sub">
                {loading ? "Loading showtimes…" : `${showtimes.length} ${showtimes.length === 1 ? "showtime" : "showtimes"}.`}
              </p>
            </div>
          </div>

          
          <div className="admin-filter-bar" data-panel="showtime-filters">
            <div className="admin-field">
              <label htmlFor="filter-showtime-movie">Movie</label>
              <select
                id="filter-showtime-movie"
                className="admin-input"
                value={filterMovie}
                onChange={(e) => setFilterMovie(e.target.value)}
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
              <label htmlFor="filter-showtime-screen">Screen</label>
              <select
                id="filter-showtime-screen"
                className="admin-input"
                value={filterScreen}
                onChange={(e) => setFilterScreen(e.target.value)}
              >
                <option value="">All screens</option>
                {screens.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label htmlFor="filter-showtime-date">Date</label>
              <input
                id="filter-showtime-date"
                type="date"
                className="admin-input"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="filter-showtime-status">Status</label>
              <select
                id="filter-showtime-status"
                className="admin-input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                {STATUS_FILTERS.map((f) => (
                  <option key={f.id || "all"} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {hasFilters && (
              <button type="button" className="admin-btn" onClick={clearFilters}>
                Clear Filters
              </button>
            )}
          </div>

          {loading && <AdminLoading>Loading showtimes…</AdminLoading>}
          {!loading && listError && <AdminSectionError message={listError} onRetry={loadShowtimes} />}
          {!loading && !listError && showtimes.length === 0 && (
            <AdminEmpty>
              No showtimes {hasFilters ? "match these filters" : "scheduled yet"}. Use “Schedule Showtime” to add one.
            </AdminEmpty>
          )}

          {!loading && !listError && showtimes.length > 0 && (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <caption className="visually-hidden">Scheduled showtimes</caption>
                <thead>
                  <tr>
                    <th scope="col">Movie</th>
                    <th scope="col">Date</th>
                    <th scope="col">Start</th>
                    <th scope="col">Screen</th>
                    <th scope="col" className="admin-num">Standard</th>
                    <th scope="col" className="admin-num">VIP</th>
                    <th scope="col">Seats</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {showtimes.map((st) => (
                    <tr key={st._id}>
                      <td>
                        <div className="admin-showtime-movie">
                          {st.movie?.posterUrl ? (
                            <img
                              src={st.movie.posterUrl}
                              alt=""
                              className="admin-showtime-poster"
                            />
                          ) : null}
                          <span className="admin-cell-strong">{st.movie?.title || "—"}</span>
                        </div>
                      </td>
                      <td className="admin-nowrap">{formatDate(st.showDate)}</td>
                      <td className="admin-nowrap">
                        {formatTime(st.startTime)}
                        {st.endTime ? ` – ${formatTime(st.endTime)}` : ""}
                      </td>
                      <td>
                        {st.screen?.name || "—"}
                        <span className="admin-cell-sub">
                          {(st.screen?.screenType || "").toUpperCase()}
                        </span>
                      </td>
                      <td className="admin-num admin-num--money">{formatCurrency(st.standardPrice)}</td>
                      <td className="admin-num admin-num--money">
                        {st.vipPrice != null ? formatCurrency(st.vipPrice) : "—"}
                      </td>
                      <td className="admin-nowrap">{occupancyOf(st)}</td>
                      <td>
                        {st.status === "scheduled" && hasScreeningStarted(st) && <span className="admin-cell-sub">Past screening · hidden from customers</span>}
                        <span
                          className={`admin-badge ${
                            st.status === "scheduled"
                              ? "admin-badge--ok"
                              : st.status === "cancelled"
                              ? "admin-badge--danger"
                              : "admin-badge--muted"
                          }`}
                        >
                          {st.status === "scheduled"
                            ? "Scheduled"
                            : st.status === "cancelled"
                            ? "Cancelled"
                            : "Completed"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button type="button" className="admin-link-btn" onClick={() => openEdit(st)} disabled={submitting || busyId !== null}>
                            Edit
                          </button>
                          {st.status === "scheduled" && (
                            <button
                              type="button"
                              className="admin-link-btn"
                              onClick={() => handleCancelShowtime(st)}
                              disabled={submitting || busyId !== null}
                            >
                              {busyId === st._id && busyAction === "cancel" ? "Cancelling…" : "Cancel"}
                            </button>
                          )}
                          {canDeleteShowtime(st) && (
                            <button
                              type="button"
                              className="admin-link-btn admin-link-btn--danger"
                              onClick={() => handleDelete(st)}
                              disabled={submitting || busyId !== null}
                            >
                              {busyId === st._id && busyAction === "delete" ? "Deleting…" : "Delete"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminShowtimesPage
