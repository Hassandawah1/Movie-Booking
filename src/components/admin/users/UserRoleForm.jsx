
const UserRoleForm = ({ user, isSelf, submitting, onRoleChange }) => {
  if (!user) return null

  const isAdmin = user.role === "admin"

  const handleClick = () => {
    if (isSelf && isAdmin) {
      
      return
    }

    const nextRole = isAdmin ? "user" : "admin"
    const confirmed = window.confirm(
      isAdmin
        ? `Remove admin access from ${user.name}? They will become a normal customer.`
        : `Promote ${user.name} to admin? They will gain full management access.`
    )
    if (!confirmed) return

    onRoleChange(user.id || user._id, nextRole)
  }

  return (
    <section className="admin-panel" data-panel="user-role" aria-label="User role management">
      <div className="admin-panel-head">
        <div>
          <h2 className="admin-panel-title">Role</h2>
          <p className="admin-panel-sub">
            Currently <strong>{isAdmin ? "Administrator" : "Customer"}</strong>
          </p>
        </div>
      </div>

      {isSelf && isAdmin ? (
        <p className="admin-detail-note" data-panel="self-demotion-notice">
          You cannot remove your own admin access. Ask another administrator to change your role.
        </p>
      ) : (
        <div className="admin-form-actions">
          <button
            type="button"
            className={`admin-btn ${isAdmin ? "admin-btn--danger" : "admin-btn--primary"}`}
            onClick={handleClick}
            disabled={submitting}
          >
            {submitting
              ? "Updating…"
              : isAdmin
              ? "Remove Admin Access"
              : "Promote to Admin"}
          </button>
        </div>
      )}
    </section>
  )
}

export default UserRoleForm
