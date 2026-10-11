import { useMemo } from "react"
import { useAuth } from "../../context/AuthContext"
import AppIcon from "../ui/AppIcon"

/**
 * AdminHeader — title bar for a dashboard screen.
 *
 * Shows the section title, a human date, and the signed-in admin's name only.
 * No email, role internals, ids or tokens are exposed.
 */
const AdminHeader = ({ title, subtitle, onToggleSidebar, sidebarOpen, actions = null }) => {
  const { user } = useAuth()

  // Derived once per mount rather than read from the clock during render.
  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }).format(new Date()),
    []
  )

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          type="button"
          className="admin-menu-toggle"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? "Close admin navigation" : "Open admin navigation"}
          aria-expanded={Boolean(sidebarOpen)}
          aria-controls="admin-sidebar"
        >
          <AppIcon name={sidebarOpen ? "close" : "menu"} />
        </button>

        <div>
          <h1 className="admin-header-title">{title}</h1>
          {subtitle && <p className="admin-header-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="admin-header-right">
        {actions}

        <div className="admin-header-meta">
          <span className="admin-header-date">{todayLabel}</span>
          {user?.name && (
            <span className="admin-header-user">
              <span className="admin-header-avatar" aria-hidden="true">
                {user.name.charAt(0).toUpperCase()}
              </span>
              {user.name}
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
