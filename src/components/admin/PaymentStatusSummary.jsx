import StatusBreakdown from "./StatusBreakdown"
import { formatPaymentStatus } from "../payment/PaymentStatus"
import AppIcon from "../ui/AppIcon"

/**
 * PaymentStatusSummary — payment counts by backend paymentStatus.
 *
 * Semantics follow Phase 12: a Paystack checkout the customer abandoned is
 * recorded as paymentStatus "failed" and must not be presented as a refused
 * payment. The aggregate endpoint cannot separate abandoned from declined, so
 * this label stays deliberately neutral and says so in the footnote.
 */
const PaymentStatusSummary = ({ data, loading, error, onRetry }) => {
  if (loading) {
    return (
      <section className="admin-panel" data-panel="payment-status" aria-label="Payment status">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title">Payments by Status</h2>
        </div>
        <p className="admin-loading">Loading payment analytics…</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="admin-panel" data-panel="payment-status" aria-label="Payment status">
        <div className="admin-panel-head">
          <h2 className="admin-panel-title">Payments by Status</h2>
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

  // "Unpaid" is used verbatim because that is the backend value an admin is
  // auditing; the other labels reuse the shared formatter so admin wording
  // cannot drift from the customer-facing wording.
  const rows = [
    { label: "Paid", value: data?.paid ?? 0, tone: "success" },
    { label: "Unpaid", value: data?.unpaid ?? 0, tone: "warning" },
    { label: "Not Completed", value: data?.failed ?? 0, tone: "danger" },
    { label: formatPaymentStatus("refunded"), value: data?.refunded ?? 0, tone: "neutral" }
  ]

  const total = rows.reduce((sum, r) => sum + (Number(r.value) || 0), 0)

  return (
    <div className="admin-panel-stack">
      <StatusBreakdown
        title="Payments by Status"
        panelId="payment-status"
        rows={rows}
        total={total}
        totalLabel="Total payments"
      />
      <p className="admin-panel-note">
        “Not Completed” covers checkouts the customer did not finish as well as payments the
        gateway declined; the analytics endpoint does not separate the two.
      </p>
    </div>
  )
}

export default PaymentStatusSummary
