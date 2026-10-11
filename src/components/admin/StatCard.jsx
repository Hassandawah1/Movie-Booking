import AppIcon from "../ui/AppIcon"


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
