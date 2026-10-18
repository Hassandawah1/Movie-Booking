import { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import AppIcon from "../ui/AppIcon"

const Navbar = () => {
  const [expanded, setExpanded] = useState(false)
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()
  const closeMenu = () => setExpanded(false)

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <nav className="site-nav" aria-label="Main navigation" onKeyDown={(event) => {
        if (event.key === "Escape") {
          closeMenu()
          event.currentTarget.querySelector(".site-nav-toggle")?.focus()
        }
      }}>
        <div className="container site-nav-inner">
          <Link to="/" className="site-brand" onClick={closeMenu} aria-label="CineBook home">
            <span className="brand-mark"><AppIcon name="ticket" size={24} /></span>
            CineBook<span className="brand-dot">.</span>
          </Link>
          <button className="site-nav-toggle" type="button" aria-expanded={expanded} aria-controls="site-navigation" aria-label={expanded ? "Close navigation" : "Open navigation"} onClick={() => setExpanded(!expanded)}>
            <AppIcon name={expanded ? "close" : "menu"} size={24} />
          </button>
          <div id="site-navigation" className={`site-navigation ${expanded ? "is-open" : ""}`}>
            <div className="site-nav-links">
              <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
              <NavLink to="/movies" onClick={closeMenu}>Explore movies</NavLink>
              {isAuthenticated && <NavLink to="/bookings" onClick={closeMenu}>My bookings</NavLink>}
              {isAdmin && <NavLink to="/admin" onClick={closeMenu}>Admin dashboard</NavLink>}
            </div>
            <div className="site-nav-account">
              {isAuthenticated ? <>
                <NavLink to="/profile" onClick={closeMenu}><AppIcon name="user" size={18} /> {user?.name?.split(" ")[0] || "Profile"}</NavLink>
                <button className="nav-secondary" onClick={() => { logout(); closeMenu(); navigate("/") }}>Log out</button>
              </> : <>
                <NavLink to="/login" onClick={closeMenu}>Log in</NavLink>
                <Link className="nav-primary" to="/register" onClick={closeMenu}>Create account <AppIcon name="arrowRight" size={16} /></Link>
              </>}
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Navbar
