import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import AppIcon from "../ui/AppIcon"


const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: "dashboard", end: true },
  { to: "/admin/movies", label: "Movies", icon: "film" },
  { to: "/admin/screens", label: "Screens", icon: "building" },
  { to: "/admin/showtimes", label: "Showtimes", icon: "clock" },
  { to: "/admin/bookings", label: "Bookings", icon: "ticket" },
  { to: "/admin/users", label: "Users", icon: "users" }
]

const AdminSidebar = ({ onNavigate, id }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <nav className="admin-sidebar" id={id} aria-label="Admin navigation">
      <div className="admin-sidebar-brand">
        <span className="admin-sidebar-mark" aria-hidden="true">
          <AppIcon name="film" size={24} />
        </span>
        <div>
          <p className="admin-sidebar-name">CineBook</p>
          <p className="admin-sidebar-role">Admin Console</p>
        </div>
      </div>

      {user?.name && (
        <div className="admin-sidebar-user">
          <span className="admin-sidebar-avatar" aria-hidden="true">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="admin-sidebar-user-info">
            <span className="admin-sidebar-user-name">{user.name}</span>
            <span className="admin-sidebar-user-role">Administrator</span>
          </div>
        </div>
      )}

      <ul className="admin-nav-list">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
              onClick={onNavigate}
            >
              <span className="admin-nav-icon" aria-hidden="true">
                <AppIcon name={item.icon} />
              </span>
              <span className="admin-nav-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="admin-sidebar-footer">
        <button type="button" className="admin-nav-link admin-nav-link--button" onClick={handleLogout}>
          <span className="admin-nav-icon" aria-hidden="true">
            <AppIcon name="logout" />
          </span>
          <span className="admin-nav-label">Logout</span>
        </button>
      </div>
    </nav>
  )
}

export default AdminSidebar
