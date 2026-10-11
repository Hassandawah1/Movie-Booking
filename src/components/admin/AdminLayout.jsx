import { useState, useEffect, useCallback } from "react"
import { Outlet, useLocation } from "react-router-dom"
import AdminSidebar from "./AdminSidebar"


const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setSidebarOpen((open) => !open), [])

  
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  
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
