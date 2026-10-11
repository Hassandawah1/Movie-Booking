import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import AppIcon from "../ui/AppIcon"

const TOKEN_KEY = "movieBookingToken"

/** Is there a usable stored token (never expose or log its value)? */
const hasStoredToken = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  return Boolean(token && token !== "null" && token !== "undefined")
}

/**
 * ProtectedRoute
 *
 * Props:
 *   children      - component to render if allowed
 *   requireAdmin  - if true, only admins may access this route
 *   allowUnverifiedSession - render anyway when the session could not be checked
 *                            (used by payment routes so a customer returning
 *                            from Paystack can still attempt verification)
 *
 * Behaviour:
 *   - While auth is loading: show a spinner (prevents flash of login)
 *   - Session check failed (server unreachable): offer a retry instead of
 *     silently signing the user out — they may be mid-payment
 *   - Not authenticated: redirect to /login preserving target location in state.from
 *   - Authenticated but not admin when requireAdmin=true: redirect to /
 *   - Otherwise: render children
 */
const ProtectedRoute = ({ children, requireAdmin = false, allowUnverifiedSession = false }) => {
  const { isAuthenticated, isAdmin, loading, authError, refreshUser } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111213"
        }}
      >
        <div className="text-center">
          <div
            className="spinner-border"
            role="status"
            style={{ color: "#ffd43b", width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3" style={{ color: "#ffe27a", fontSize: "0.9rem" }}>
            Verifying session...
          </p>
        </div>
      </div>
    )
  }

  // The session could not be checked because the server was unreachable.
  // Do NOT treat this as "logged out" — that would drop a customer who is in
  // the middle of the payment flow (e.g. returning from Paystack).
  if (!isAuthenticated && authError && !allowUnverifiedSession) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111213",
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
    // Payment routes may render while the session is unverifiable, but only if
    // a token is actually present. Everything else falls through to /login.
    if (allowUnverifiedSession && hasStoredToken()) {
      return children
    }

    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
