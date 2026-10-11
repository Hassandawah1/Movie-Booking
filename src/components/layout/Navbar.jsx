import { Link, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import AppIcon from "../ui/AppIcon"

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const navLinkStyle = ({ isActive }) => ({
    color: isActive ? "#ffe27a" : "#d0d0d0",
    fontWeight: isActive ? 600 : 400,
    transition: "color 0.2s"
  })

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        background: "#1a1b1d",
        borderBottom: "1px solid rgba(255, 255, 255, 0.16)",
        padding: "0.75rem 0",
        position: "sticky",
        top: 0,
        zIndex: 1000
      }}
    >
      <div className="container">
        {/* Brand */}
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center gap-2"
          style={{ textDecoration: "none" }}
        >
          <AppIcon name="film" size={24} />
          <span
            style={{
              fontWeight: 800,
              fontSize: "1.25rem",
              color: "#ffd43b"
            }}
          >
            CineBook
          </span>
        </Link>

        {/* Hamburger Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <AppIcon name="menu" size={22} color="#ffe27a" />
        </button>

        {/* Nav Links */}
        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-lg-2">
            <li className="nav-item">
              <NavLink to="/" className="nav-link" style={navLinkStyle}>
                Home
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/movies" className="nav-link" style={navLinkStyle}>
                Movies
              </NavLink>
            </li>

            {/* Available to any signed-in user (the backend returns the
                authenticated user's own bookings, admins included). */}
            {isAuthenticated && (
              <li className="nav-item">
                <NavLink to="/bookings" className="nav-link" style={navLinkStyle}>
                  My Bookings
                </NavLink>
              </li>
            )}

            {isAdmin && (
              <li className="nav-item">
                <NavLink to="/admin" className="nav-link" style={navLinkStyle}>
                  Admin Dashboard
                </NavLink>
              </li>
            )}
          </ul>

          {/* Right-side Auth Controls */}
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-2">
            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <NavLink to="/login" className="nav-link" style={navLinkStyle}>
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <Link
                    to="/register"
                    className="btn btn-sm px-3 py-1"
                    style={{
                      background: "#ffd43b",
                      color: "#111213",
                      borderRadius: "20px",
                      fontWeight: 600,
                      border: "none",
                      textDecoration: "none"
                    }}
                  >
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/profile"
                    className="nav-link d-flex align-items-center gap-2"
                    style={navLinkStyle}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "#ffd43b",
                        color: "#111213",
                        fontSize: "0.75rem",
                        fontWeight: 700
                      }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                    <span>{user?.name?.split(" ")[0] || "Profile"}</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <button
                    onClick={handleLogout}
                    className="btn btn-sm px-3 py-1"
                    style={{
                      border: "1px solid rgba(255, 255, 255, 0.16)",
                      color: "#ffe27a",
                      borderRadius: "20px",
                      fontWeight: 600,
                      background: "transparent",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(255, 212, 59, 0.15)"
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "transparent"
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
