import { useState, useEffect, useCallback } from "react"
import { useParams, Link, useOutletContext, useNavigate } from "react-router-dom"
import AdminHeader from "../../components/admin/AdminHeader"
import AppIcon from "../../components/ui/AppIcon"
import UserRoleForm from "../../components/admin/users/UserRoleForm"
import { AdminBanner, AdminLoading, AdminSectionError } from "../../components/admin/AdminUi"
import { describeApiError } from "../../components/admin/adminUtils"
import { useAuth } from "../../context/AuthContext"
import { formatCurrency, formatDate } from "../../utils/formatters"
import { getUserById, updateUserRole } from "../../services/admin.service"


const AdminUserDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const outletContext = useOutletContext()
  const { user: currentAdmin } = useAuth()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [banner, setBanner] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const loadUser = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await getUserById(id)
      if (data?.success && data.user) {
        setUser(data.user)
      } else {
        setError(data?.message || "We couldn't load this user.")
      }
    } catch (err) {
      setError(describeApiError(err, "We couldn't load this user."))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const handleRoleChange = async (userId, role) => {
    setSubmitting(true)
    setBanner(null)
    try {
      const data = await updateUserRole(userId, role)
      if (data?.success) {
        setBanner({
          tone: "success",
          message: role === "admin" ? "User promoted to administrator." : "Admin access removed."
        })
        await loadUser()
      } else {
        setBanner({ tone: "error", message: data?.message || "The role could not be updated." })
      }
    } catch (err) {
      
      setBanner({ tone: "error", message: describeApiError(err, "The role could not be updated.") })
    } finally {
      setSubmitting(false)
    }
  }

  
  const currentAdminId = currentAdmin?.id || currentAdmin?._id
  const targetId = user?.id || user?._id
  const isSelf = Boolean(currentAdminId && targetId && String(currentAdminId) === String(targetId))

  return (
    <div className="admin-page">
      <AdminHeader
        title="User Details"
        subtitle="Account, activity and access level"
        sidebarOpen={outletContext?.sidebarOpen}
        onToggleSidebar={outletContext?.toggleSidebar}
        actions={
          <>
            <button type="button" className="admin-btn" onClick={loadUser} disabled={loading}>
              {loading ? "Refreshing…" : <><AppIcon name="refresh" size={16} /> Refresh</>}
            </button>
            <button type="button" className="admin-btn" onClick={() => navigate("/admin/users")}>
              <AppIcon name="arrowLeft" size={16} /> All Users
            </button>
          </>
        }
      />

      <div className="admin-content">
        {banner && <AdminBanner tone={banner.tone} message={banner.message} onDismiss={() => setBanner(null)} />}

        {loading && (
          <section className="admin-panel admin-panel--wide" data-panel="user-details">
            <AdminLoading>Loading user…</AdminLoading>
          </section>
        )}

        {!loading && error && (
          <section className="admin-panel admin-panel--wide" data-panel="user-details">
            <AdminSectionError message={error} onRetry={loadUser} />
            <div className="mt-3">
              <Link to="/admin/users" className="admin-btn">
                <AppIcon name="arrowLeft" size={16} /> Back to all users
              </Link>
            </div>
          </section>
        )}

        {!loading && !error && user && (
          <>
            <section className="admin-panel admin-panel--wide" data-panel="user-details" aria-label="User details">
              <div className="admin-panel-head">
                <div>
                  <h2 className="admin-panel-title">{user.name}</h2>
                  <p className="admin-panel-sub">{user.email}</p>
                </div>
                <span className={`admin-badge ${user.role === "admin" ? "admin-badge--ok" : "admin-badge--muted"}`}>
                  {user.role === "admin" ? "Administrator" : "Customer"}
                </span>
              </div>

              <div className="admin-detail-grid">
                <div className="reservation-details-box">
                  <h3 className="admin-detail-heading">Account</h3>
                  <div className="detail-item-row">
                    <span className="detail-label">Role:</span>
                    <span className="detail-value">{user.role === "admin" ? "Administrator" : "Customer"}</span>
                  </div>
                  <div className="detail-item-row">
                    <span className="detail-label">Joined:</span>
                    <span className="detail-value">{formatDate(user.createdAt)}</span>
                  </div>
                </div>

                <div className="reservation-details-box">
                  <h3 className="admin-detail-heading">Activity</h3>
                  <div className="detail-item-row">
                    <span className="detail-label">Total Bookings:</span>
                    <span className="detail-value">{user.bookingCount ?? 0}</span>
                  </div>
                  <div className="detail-item-row">
                    <span className="detail-label">Confirmed Bookings:</span>
                    <span className="detail-value">{user.confirmedBookingCount ?? 0}</span>
                  </div>
                  <div className="detail-item-row">
                    <span className="detail-label">Total Spent:</span>
                    <span className="detail-value">
                      <strong className="admin-detail-amount">{formatCurrency(user.totalSpent ?? 0)}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <UserRoleForm
              user={user}
              isSelf={isSelf}
              submitting={submitting}
              onRoleChange={handleRoleChange}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default AdminUserDetailsPage
