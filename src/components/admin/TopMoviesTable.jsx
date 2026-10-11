import { formatCurrency } from "../../utils/formatters"
import AppIcon from "../ui/AppIcon"


const SORTS = [
  { id: "revenue", label: "By Revenue" },
  { id: "bookings", label: "By Bookings" }
]

const TopMoviesTable = ({ movies = [], loading, error, sortBy, onSortChange, onRetry }) => {
  if (loading) {
    return (
      <section className="admin-panel" data-panel="top-movies" aria-label="Top movies">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title">Top Movies</h2>
        </div>
        <p className="admin-loading">Loading top movies…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="admin-panel" data-panel="top-movies" aria-label="Top movies">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title">Top Movies</h2>
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
    <section className="admin-panel" data-panel="top-movies" aria-label="Top movies">
      <div className="admin-panel-head">
        <div>
          <h2 className="admin-panel-title">Top Movies</h2>
          <p className="admin-panel-sub">Based on paid bookings.</p>
        </div>

        <div className="admin-segmented" role="group" aria-label="Sort top movies">
          {SORTS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`admin-segmented-btn ${sortBy === s.id ? "active" : ""}`}
              onClick={() => onSortChange(s.id)}
              aria-pressed={sortBy === s.id}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {movies.length === 0 ? (
        <p className="admin-empty">No paid bookings yet, so there is no movie performance to rank.</p>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <caption className="visually-hidden">
              Top movies ranked by {sortBy === "bookings" ? "bookings" : "revenue"}
            </caption>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Movie</th>
                <th scope="col" className="admin-num">Bookings</th>
                <th scope="col" className="admin-num">Tickets Sold</th>
                <th scope="col" className="admin-num">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((m, index) => (
                <tr key={m.movieId || m.title}>
                  <td className="admin-rank">{index + 1}</td>
                  <td>
                    <div className="admin-movie-cell">
                      {m.posterUrl ? (
                        <img
                          src={m.posterUrl}
                          alt=""
                          className="admin-movie-thumb"
                          loading="lazy"
                          aria-hidden="true"
                        />
                      ) : (
                        <span className="admin-movie-thumb admin-movie-thumb--empty" aria-hidden="true">
                          <AppIcon name="film" size={24} />
                        </span>
                      )}
                      <span className="admin-cell-strong">{m.title || "—"}</span>
                    </div>
                  </td>
                  <td className="admin-num">{Number(m.bookings) || 0}</td>
                  <td className="admin-num">{Number(m.ticketsSold) || 0}</td>
                  <td className="admin-num admin-num--money">{formatCurrency(Number(m.revenue) || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default TopMoviesTable
