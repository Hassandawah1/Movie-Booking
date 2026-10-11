import { useState, useEffect, useCallback } from "react"
import { Outlet, useLocation } from "react-router-dom"
import AdminSidebar from "./AdminSidebar"

/**
 * AdminLayout — shell for every /admin route.
 *
 * Desktop: persistent sidebar + main content area.
 * Mobile/tablet: the sidebar becomes an off-canvas drawer with a scrim, so it
 * can never widen the viewport.
 *
 * The drawer state is shared with pages through the Outlet context, so each page
 * renders its own AdminHeader with the toggle wired up.
 */
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setSidebarOpen((open) => !open), [])

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!sidebarOpen) return
    const onKeyDown = (e) => {
      if (e.key === "Escape") setSidebarOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [sidebarOpen])

  return (
    <div className={`admin-shell ${sidebarOpen ? "admin-shell--drawer-open" : ""}`}>
      <AdminSidebar id="admin-sidebar" onNavigate={closeSidebar} />

      {/* Scrim: only rendered while the drawer is open on small screens */}
      {sidebarOpen && (
        <button
          type="button"
          className="admin-scrim"
          aria-label="Close admin navigation"
          onClick={closeSidebar}
        />
      )}

      <div className="admin-main">
        <Outlet context={{ sidebarOpen, toggleSidebar }} />
      </div>
    </div>
  )
}

export default AdminLayout
