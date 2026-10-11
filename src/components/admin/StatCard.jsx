import AppIcon from "../ui/AppIcon"

/**
 * StatCard — one headline metric.
 *
 * Values are rendered exactly as given (already formatted by the caller) so a
 * genuine 0 shows as "0"/"₦0" and never as undefined, NaN or Infinity.
 */
const StatCard = ({ label, value, hint, icon, tone = "default" }) => {
  const display =
    value === null || value === undefined || value === "" || Number.isNaN(value) ? "—" : value

  return (
    <div className={`admin-stat-card admin-stat-card--${tone}`}>
      {icon && (
        <span className="admin-stat-icon" aria-hidden="true">
          {icon === "naira" ? "₦" : <AppIcon name={icon} size={22} />}
        </span>
      )}
      <p className="admin-stat-label">{label}</p>
      <p className="admin-stat-value">{display}</p>
      {hint && <p className="admin-stat-hint">{hint}</p>}
    </div>
  )
}

export default StatCard
