import { useState, useEffect, useCallback } from "react"
import { useParams, Link, useOutletContext, useNavigate } from "react-router-dom"
import AdminHeader from "../../components/admin/AdminHeader"
import AppIcon from "../../components/ui/AppIcon"
import AdminBookingDetails from "../../components/admin/bookings/AdminBookingDetails"
import { AdminBanner, AdminLoading, AdminSectionError } from "../../components/admin/AdminUi"
import { describeApiError } from "../../components/admin/adminUtils"
import { getBookingById, cancelBooking } from "../../services/admin.service"


const AdminBookingDetailsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const outletContext = useOutletContext()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [banner, setBanner] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const loadBooking = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const data = await getBookingById(id)
      if (data?.success && data.booking) {
        setBooking(data.booking)
      } else {
        setError(data?.message || "We couldn't load this booking.")
      }
    } catch (err) {
      setError(describeApiError(err, "We couldn't load this booking."))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadBooking()
  }, [loadBooking])

  const handleCancel = async (target) => {
    const confirmed = window.confirm(
      `Cancel booking ${target.bookingReference}? The seats will be released.`
    )
    if (!confirmed) return

    setCancelling(true)
    setBanner(null)
    try {
      const data = await cancelBooking(target._id)
      if (data?.success) {
        setBanner({ tone: "success", message: "Booking cancelled and seats released." })
        await loadBooking()
      } else {
        setBanner({ tone: "error", message: data?.message || "The booking could not be cancelled." })
      }
    } catch (err) {
      
      setBanner({ tone: "error", message: describeApiError(err, "The booking could not be cancelled.") })
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="admin-page">
      <AdminHeader
        title="Booking Details"
        subtitle="Full record for a single reservation"
        sidebarOpen={outletContext?.sidebarOpen}
        onToggleSidebar={outletContext?.toggleSidebar}
        actions={
          <>
            <button type="button" className="admin-btn" onClick={loadBooking} disabled={loading}>
              {loading ? "Refreshing…" : <><AppIcon name="refresh" size={16} /> Refresh</>}
            </button>
            <button type="button" className="admin-btn" onClick={() => navigate("/admin/bookings")}>
              <AppIcon name="arrowLeft" size={16} /> All Bookings
            </button>
          </>
        }
      />

      <div className="admin-content">
        {banner && <AdminBanner tone={banner.tone} message={banner.message} onDismiss={() => setBanner(null)} />}

        {loading && <AdminLoading>Loading booking…</AdminLoading>}

        {!loading && error && (
          <section className="admin-panel admin-panel--wide">
            <AdminSectionError message={error} onRetry={loadBooking} />
            <div className="mt-3">
              <Link to="/admin/bookings" className="admin-btn">
                <AppIcon name="arrowLeft" size={16} /> Back to all bookings
              </Link>
            </div>
          </section>
        )}

        {!loading && !error && booking && (
          <AdminBookingDetails booking={booking} cancelling={cancelling} onCancel={handleCancel} />
        )}
      </div>
    </div>
  )
}

export default AdminBookingDetailsPage
