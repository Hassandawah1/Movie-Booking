import { useAuth } from "../../../context/AuthContext"
import { formatRole } from "../../../utils/formatters"

const UserRoleForm = ({ user, submitting, onRoleChange }) => {
  const { isSuperAdmin } = useAuth()
  if (!user || !isSuperAdmin) return null

  const isAdmin = user.role === "admin"
  const protectedRole = user.role === "super-admin"
  const handleClick = () => {
    if (protectedRole || submitting) return
    const confirmed = window.confirm(isAdmin
      ? `Remove admin access from ${user.name}?`
      : `Promote ${user.name} to Admin?`)
    if (confirmed) onRoleChange(user.id || user._id, isAdmin ? "user" : "admin")
  }

  return (
    <section className="admin-panel" data-panel="user-role" aria-label="User role management">
      <div className="admin-panel-head">
        <div>
          <h2 className="admin-panel-title">Role</h2>
          <p className="admin-panel-sub">Currently <strong>{formatRole(user.role)}</strong></p>
        </div>
      </div>
      {protectedRole ? (
        <p className="admin-detail-note">The Super Admin role is protected and cannot be changed here.</p>
      ) : (
        <div className="admin-form-actions">
          <button type="button" className={`admin-btn ${isAdmin ? "admin-btn--danger" : "admin-btn--primary"}`} onClick={handleClick} disabled={submitting}>
            {submitting ? "Updating…" : isAdmin ? "Demote to User" : "Promote to Admin"}
          </button>
        </div>
      )}
    </section>
  )
}

export default UserRoleForm
