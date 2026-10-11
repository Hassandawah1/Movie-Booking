import { formatCurrency, formatDate, formatTime } from "../../utils/formatters"
import AppIcon from "../ui/AppIcon"


const UpcomingShowtimesTable = ({ showtimes = [], loading, error, onRetry }) => {
  if (loading) {
    return (
      <section className="admin-panel admin-panel--wide" data-panel="upcoming-showtimes" aria-label="Upcoming showtimes">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title">Upcoming Showtimes</h2>
        </div>
        <p className="admin-loading">Loading upcoming showtimes…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="admin-panel admin-panel--wide" data-panel="upcoming-showtimes" aria-label="Upcoming showtimes">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title">Upcoming Showtimes</h2>
        </div>
        <p className="admin-section-error"><AppIcon name="alert" size={16} /> {error}</p>
        {onRetry && (
          <button type="button" className="admin-link-btn" onClick={onRetry}>
            <AppIcon name="refresh" size={16} /> Retry
          </button>
        )}
      </section>
    )
  }

  return (
    <section className="admin-panel admin-panel--wide" data-panel="upcoming-showtimes" aria-label="Upcoming showtimes">
      <div className="admin-panel-head">
        <div>
          <h2 className="admin-panel-title">Upcoming Showtimes</h2>
          <p className="admin-panel-sub">Next {showtimes.length} scheduled screenings.</p>
        </div>
      </div>

      {showtimes.length === 0 ? (
        <p className="admin-empty">No upcoming showtimes are scheduled.</p>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <caption className="visually-hidden">Upcoming showtimes with seat occupancy</caption>
            <thead>
              <tr>
                <th scope="col">Movie</th>
                <th scope="col">Date</th>
                <th scope="col">Start</th>
                <th scope="col">Screen</th>
                <th scope="col" className="admin-num">Standard</th>
                <th scope="col" className="admin-num">VIP</th>
                <th scope="col">Seats</th>
                <th scope="col">Occupancy</th>
              </tr>
            </thead>
            <tbody>
              {showtimes.map((st) => {
                const booked = Number(st.bookedSeatsCount) || 0
                const total = Number(st.totalSeats) || 0
                
                const pct = total > 0 ? Math.round((booked / total) * 100) : 0

                return (
                  <tr key={st.id}>
                    <td className="admin-cell-strong">{st.movie?.title || "—"}</td>
                    <td className="admin-nowrap">{formatDate(st.showDate)}</td>
                    <td className="admin-nowrap">
                      {formatTime(st.startTime)}
                      {st.endTime ? ` – ${formatTime(st.endTime)}` : ""}
                    </td>
                    <td>
                      {st.screen?.name || "—"}
                      {st.screen?.screenType && (
                        <span className="admin-cell-sub">{st.screen.screenType.toUpperCase()}</span>
                      )}
                    </td>
                    <td className="admin-num admin-num--money">
                      {formatCurrency(st.pricing?.standard ?? 0)}
                    </td>
                    <td className="admin-num admin-num--money">
                      {formatCurrency(st.pricing?.vip ?? 0)}
                    </td>
                    <td className="admin-nowrap">
                      {booked} / {total}
                    </td>
                    <td className="admin-occupancy-cell">
                      <div className="admin-occupancy">
                        <div className="admin-bar-track admin-bar-track--slim">
                          <div
                            className={`admin-bar-fill admin-bar-fill--${pct >= 75 ? "success" : pct >= 40 ? "warning" : "default"}`}
                            style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                          />
                        </div>
                        <span className="admin-occupancy-pct">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default UpcomingShowtimesTable
