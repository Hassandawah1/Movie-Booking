import { useState } from "react"
import { formatCurrency } from "../../utils/formatters"
import AppIcon from "../ui/AppIcon"



const toLocalInputDate = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

const todayIso = () => toLocalInputDate(new Date())

const firstOfMonthIso = () => {
  const d = new Date()
  d.setDate(1)
  return toLocalInputDate(d)
}

const RevenueDateRange = ({ range, data, loading, error, onApply, onRetry }) => {
  const [startDate, setStartDate] = useState(range?.startDate || firstOfMonthIso())
  const [endDate, setEndDate] = useState(range?.endDate || todayIso())
  const [validationError, setValidationError] = useState("")

  const handleApply = (e) => {
    e.preventDefault()

    if (!startDate || !endDate) {
      setValidationError("Please choose both a start and an end date.")
      return
    }

    
    if (startDate > endDate) {
      setValidationError("The start date must be on or before the end date.")
      return
    }

    setValidationError("")
    onApply({ startDate, endDate })
  }

  const handleReset = () => {
    const start = firstOfMonthIso()
    const end = todayIso()
    setStartDate(start)
    setEndDate(end)
    setValidationError("")
    onApply({ startDate: start, endDate: end })
  }

  return (
    <section className="admin-panel" data-panel="revenue-range" aria-label="Revenue by date range">
      <div className="admin-panel-head">
        <div>
          <h2 className="admin-panel-title">Revenue by Date Range</h2>
          <p className="admin-panel-sub">Paid bookings only.</p>
        </div>
      </div>

      <form className="admin-daterange" onSubmit={handleApply}>
        <div className="admin-field">
          <label htmlFor="revenue-start">Start date</label>
          <input
            id="revenue-start"
            type="date"
            className="admin-input"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => {
              setStartDate(e.target.value)
              setValidationError("")
            }}
          />
        </div>

        <div className="admin-field">
          <label htmlFor="revenue-end">End date</label>
          <input
            id="revenue-end"
            type="date"
            className="admin-input"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => {
              setEndDate(e.target.value)
              setValidationError("")
            }}
          />
        </div>

        <div className="admin-daterange-actions">
          <button type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
            {loading ? "Calculating…" : "Apply"}
          </button>
          <button type="button" className="admin-btn" onClick={handleReset} disabled={loading}>
            This Month
          </button>
        </div>
      </form>

      {validationError && (
        <p className="admin-field-error" role="alert">
          <AppIcon name="alert" size={16} /> {validationError}
        </p>
      )}

      {!validationError && error && (
        <>
          <p className="admin-section-error"><AppIcon name="alert" size={16} /> {error}</p>
          {onRetry && (
            <button type="button" className="admin-link-btn" onClick={onRetry}>
              <AppIcon name="refresh" size={16} /> Retry
            </button>
          )}
        </>
      )}

      {!validationError && !error && (
        <div className="admin-daterange-result" aria-live="polite">
          <div className="admin-daterange-stat">
            <span className="admin-daterange-label">Total revenue</span>
            <span className="admin-daterange-value admin-daterange-value--money">
              {loading ? "…" : formatCurrency(data?.totalRevenue ?? 0)}
            </span>
          </div>
          <div className="admin-daterange-stat">
            <span className="admin-daterange-label">Paid bookings</span>
            <span className="admin-daterange-value">{loading ? "…" : (data?.totalPaidBookings ?? 0)}</span>
          </div>
          <div className="admin-daterange-stat">
            <span className="admin-daterange-label">Period</span>
            <span className="admin-daterange-value admin-daterange-value--small">
              {data?.startDate || startDate} to {data?.endDate || endDate}
            </span>
          </div>
        </div>
      )}
    </section>
  )
}

export default RevenueDateRange
