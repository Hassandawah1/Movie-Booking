import { formatCurrency } from "../../utils/formatters"
import AppIcon from "../ui/AppIcon"

/**
 * RevenueTrend — daily revenue/booking counts as lightweight CSS bars.
 *
 * Deliberately no chart library: each day is a row with its date, revenue,
 * booking count and a bar scaled to the largest value in the returned dataset.
 * An all-zero dataset renders flat bars instead of dividing by zero.
 */
const PERIODS = [
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" }
]

/** "2026-10-06" → "6 Oct" without adding a date library. */
const shortDate = (isoDate) => {
  if (!isoDate) return "—"
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(d)
}

const RevenueTrend = ({ data = [], loading, error, period, onPeriodChange, onRetry }) => {
  const rows = Array.isArray(data) ? data : []

  const maxRevenue = rows.reduce((max, r) => Math.max(max, Number(r.revenue) || 0), 0)
  const totalRevenue = rows.reduce((sum, r) => sum + (Number(r.revenue) || 0), 0)
  const totalBookings = rows.reduce((sum, r) => sum + (Number(r.bookings) || 0), 0)
  const activeDays = rows.filter((r) => (Number(r.revenue) || 0) > 0).length

  // Report the period length from the dataset itself so the figure always
  // matches the selected range, even when every day is zero.
  const periodDays = rows.length

  return (
    <section className="admin-panel admin-panel--wide" data-panel="revenue-trend" aria-label="Revenue trend">
      <div className="admin-panel-head">
        <div>
          <h2 className="admin-panel-title">Revenue Trend</h2>
          <p className="admin-panel-sub">
            Daily paid revenue · {formatCurrency(totalRevenue)} across {periodDays}{" "}
            {periodDays === 1 ? "day" : "days"} · {totalBookings}{" "}
            {totalBookings === 1 ? "booking" : "bookings"}
            {activeDays === 0 ? " · no paid revenue in this period" : ""}
          </p>
        </div>

        <div className="admin-segmented" role="group" aria-label="Revenue trend period">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`admin-segmented-btn ${period === p.id ? "active" : ""}`}
              onClick={() => onPeriodChange(p.id)}
              aria-pressed={period === p.id}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="admin-loading">Loading revenue trend…</p>}

      {!loading && error && (
        <>
          <p className="admin-section-error"><AppIcon name="alert" size={16} /> Unable to load revenue trend. {error}</p>
          {onRetry && (
            <button type="button" className="admin-link-btn" onClick={onRetry}>
              <AppIcon name="refresh" size={16} /> Retry
            </button>
          )}
        </>
      )}

      {!loading && !error && rows.length === 0 && (
        <p className="admin-empty">No revenue recorded for this period.</p>
      )}

      {!loading && !error && rows.length > 0 && (
        <>
          {/* Visual bars — most recent day last, matching the backend order */}
          <div className="admin-trend" role="img" aria-label={`Daily revenue for the ${period === "30d" ? "last 30 days" : "last 7 days"}`}>
            {rows.map((row) => {
              const revenue = Number(row.revenue) || 0
              const width = maxRevenue > 0 ? Math.max(revenue > 0 ? 4 : 0, Math.round((revenue / maxRevenue) * 100)) : 0

              return (
                <div className="admin-trend-row" key={row.date}>
                  <span className="admin-trend-date">{shortDate(row.date)}</span>
                  <span className="admin-trend-track">
                    <span
                      className={`admin-trend-bar ${revenue > 0 ? "has-value" : ""}`}
                      style={{ width: `${width}%` }}
                    />
                  </span>
                  <span className="admin-trend-revenue">{formatCurrency(revenue)}</span>
                  <span className="admin-trend-bookings">
                    {Number(row.bookings) || 0}
                    <span className="admin-trend-bookings-unit"> bkgs</span>
                  </span>
                </div>
              )
            })}
          </div>

          {/* Accessible tabular equivalent of the same data */}
          <details className="admin-trend-table">
            <summary>View as table</summary>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <caption className="visually-hidden">
                  Daily revenue and booking counts for the selected period
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col" className="admin-num">Bookings</th>
                    <th scope="col" className="admin-num">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={`t-${row.date}`}>
                      <td>{shortDate(row.date)}</td>
                      <td className="admin-num">{Number(row.bookings) || 0}</td>
                      <td className="admin-num">{formatCurrency(Number(row.revenue) || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  )
}

export default RevenueTrend
