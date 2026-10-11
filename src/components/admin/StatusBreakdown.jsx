/**
 * StatusBreakdown — labelled counts with proportional bars.
 *
 * Shared by BookingStatusSummary and PaymentStatusSummary so there is one
 * implementation of the "counts + relative bar" pattern rather than two.
 *
 * All-zero datasets are safe: bars fall back to 0% width.
 */
const StatusBreakdown = ({ title, rows = [], totalLabel, total, panelId }) => {
  const resolvedTotal =
    typeof total === "number" ? total : rows.reduce((sum, r) => sum + (Number(r.value) || 0), 0)

  // Scale bars against the largest single value so small datasets stay readable.
  const maxValue = rows.reduce((max, r) => Math.max(max, Number(r.value) || 0), 0)

  return (
    <section className="admin-panel" data-panel={panelId} aria-label={title}>
      <div className="admin-panel-head">
        <h2 className="admin-panel-title">{title}</h2>
        {totalLabel && (
          <span className="admin-panel-total">
            {totalLabel}: <strong>{resolvedTotal}</strong>
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="admin-empty">No data available.</p>
      ) : (
        <ul className="admin-breakdown">
          {rows.map((row) => {
            const value = Number(row.value) || 0
            const width = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0

            return (
              <li key={row.label} className="admin-breakdown-row">
                <div className="admin-breakdown-head">
                  <span className="admin-breakdown-label">
                    <span className={`admin-dot admin-dot--${row.tone || "default"}`} aria-hidden="true" />
                    {row.label}
                  </span>
                  <span className="admin-breakdown-value">
                    {value}
                    <span className="admin-breakdown-pct">
                      {resolvedTotal > 0 ? ` · ${Math.round((value / resolvedTotal) * 100)}%` : " · 0%"}
                    </span>
                  </span>
                </div>
                <div className="admin-bar-track">
                  <div
                    className={`admin-bar-fill admin-bar-fill--${row.tone || "default"}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default StatusBreakdown
