import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import AppIcon from "../ui/AppIcon"

const TOKEN_KEY = "movieBookingToken"


const hasStoredToken = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  return Boolean(token && token !== "null" && token !== "undefined")
}


const ProtectedRoute = ({ children, requireAdmin = false, requireSuperAdmin = false, allowUnverifiedSession = false }) => {
  const { isAuthenticated, isAdmin, isSuperAdmin, loading, authError, refreshUser } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg)"
        }}
      >
        <div className="text-center">
          <div
            className="spinner-border"
            role="status"
            style={{ color: "var(--color-primary)", width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3" style={{ color: "var(--color-primary-light)", fontSize: "0.9rem" }}>
            Verifying session...
          </p>
        </div>
      </div>
    )
  }

  
  
  
  if (!isAuthenticated && authError && !allowUnverifiedSession) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-bg)",
          padding: "1rem"
        }}
      >
        <div className="text-center" style={{ maxWidth: "460px" }}>
          <div style={{ marginBottom: "0.75rem" }}><AppIcon name="radio" size={38} /></div>
          <h4 className="text-light fw-bold mb-2">We couldn&apos;t verify your session</h4>
          <p className="text-muted small mb-4">
            We can&apos;t reach the server right now. Your sign-in has been kept — please retry.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => refreshUser()}
          >
            <AppIcon name="refresh" size={16} /> Retry
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    
    
    if (allowUnverifiedSession && hasStoredToken()) {
      return children
    }

    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to={isAdmin ? "/admin" : "/"} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
