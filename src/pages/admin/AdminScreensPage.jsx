import { useState, useEffect, useCallback } from "react"
import { useOutletContext } from "react-router-dom"
import AdminHeader from "../../components/admin/AdminHeader"
import AppIcon from "../../components/ui/AppIcon"
import ScreenForm from "../../components/admin/screens/ScreenForm"
import { AdminBanner, AdminLoading, AdminSectionError, AdminEmpty } from "../../components/admin/AdminUi"
import { describeApiError } from "../../components/admin/adminUtils"
import { getScreens, createScreen, updateScreen, deleteScreen } from "../../services/admin.service"

/**
 * AdminScreensPage — /admin/screens
 *
 * Full CRUD for cinema screens. Capacity is always the backend's calculation;
 * the form shows a preview only.
 */
const AdminScreensPage = () => {
  const outletContext = useOutletContext()

  const [screens, setScreens] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState("")
  const [banner, setBanner] = useState(null)

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [busyId, setBusyId] = useState(null)

  const loadScreens = useCallback(async () => {
    setLoading(true)
    setListError("")
    try {
      const data = await getScreens()
      if (data?.success && Array.isArray(data.screens)) {
        setScreens(data.screens)
      } else {
        setListError(data?.message || "We couldn't load the screens.")
      }
    } catch (err) {
      setListError(describeApiError(err, "We couldn't load the screens."))
      setScreens([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadScreens()
  }, [loadScreens])

  const openCreate = () => {
    setEditing(null)
    setShowForm(true)
    setBanner(null)
  }

  const openEdit = (screen) => {
    // Use the full record so the form is populated from backend values.
    setEditing(screen)
    setShowForm(true)
    setBanner(null)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditing(null)
  }

  const handleSubmit = async (payload) => {
    setSubmitting(true)
    setBanner(null)
    try {
      const data = editing ? await updateScreen(editing._id, payload) : await createScreen(payload)

      if (data?.success) {
        setBanner({
          tone: "success",
          message: editing ? "Screen updated successfully." : "Screen created successfully."
        })
        closeForm()
        await loadScreens()
      } else {
        setBanner({ tone: "error", message: data?.message || "The screen could not be saved." })
      }
    } catch (err) {
      // 409 duplicate name, 400 validation — the backend message is descriptive.
      setBanner({ tone: "error", message: describeApiError(err, "The screen could not be saved.") })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (screen) => {
    const confirmed = window.confirm(
      `Delete the screen "${screen.name}"? This cannot be undone.`
    )
    if (!confirmed) return

    setBusyId(screen._id)
    setBanner(null)
    try {
      const data = await deleteScreen(screen._id)
      if (data?.success) {
        setScreens((prev) => prev.filter((s) => s._id !== screen._id))
        setBanner({ tone: "success", message: `Screen "${screen.name}" was deleted.` })
      } else {
        setBanner({ tone: "error", message: data?.message || "The screen could not be deleted." })
      }
    } catch (err) {
      // 409 when upcoming showtimes still use this screen — always surfaced.
      setBanner({ tone: "error", message: describeApiError(err, "The screen could not be deleted.") })
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="admin-page">
      <AdminHeader
        title="Screens"
        subtitle="Auditoriums, seat layout and capacity"
        sidebarOpen={outletContext?.sidebarOpen}
        onToggleSidebar={outletContext?.toggleSidebar}
        actions={
          <>
            <button type="button" className="admin-btn" onClick={loadScreens} disabled={loading}>
              {loading ? "Refreshing…" : <><AppIcon name="refresh" size={16} /> Refresh</>}
            </button>
            <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate} disabled={submitting}>
              + Add Screen
            </button>
          </>
        }
      />

      <div className="admin-content">
        {banner && <AdminBanner tone={banner.tone} message={banner.message} onDismiss={() => setBanner(null)} />}

        {showForm && (
          <section className="admin-panel" aria-label="Screen form">
            <ScreenForm
              initial={editing}
              submitting={submitting}
              onCancel={closeForm}
              onSubmit={handleSubmit}
            />
          </section>
        )}

        <section className="admin-panel admin-panel--wide" data-panel="screen-list" aria-label="Screen list">
          <div className="admin-panel-head">
            <div>
              <h2 className="admin-panel-title">Cinema Screens</h2>
              <p className="admin-panel-sub">
                {loading ? "Loading screens…" : `${screens.length} ${screens.length === 1 ? "screen" : "screens"}.`}
              </p>
            </div>
          </div>

          {loading && <AdminLoading>Loading screens…</AdminLoading>}
          {!loading && listError && <AdminSectionError message={listError} onRetry={loadScreens} />}
          {!loading && !listError && screens.length === 0 && (
            <AdminEmpty>No screens yet. Use “Add Screen” to create the first auditorium.</AdminEmpty>
          )}

          {!loading && !listError && screens.length > 0 && (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <caption className="visually-hidden">Cinema screens</caption>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Type</th>
                    <th scope="col" className="admin-num">Rows</th>
                    <th scope="col" className="admin-num">Seats / Row</th>
                    <th scope="col" className="admin-num">Total Seats</th>
                    <th scope="col">Status</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {screens.map((screen) => (
                    <tr key={screen._id}>
                      <td className="admin-cell-strong">{screen.name}</td>
                      <td>
                        <span className="admin-badge">{(screen.screenType || "standard").toUpperCase()}</span>
                      </td>
                      <td className="admin-num">{screen.totalRows}</td>
                      <td className="admin-num">{screen.seatsPerRow}</td>
                      <td className="admin-num">{screen.totalSeats}</td>
                      <td>
                        <span className={`admin-badge ${screen.status === "active" ? "admin-badge--ok" : "admin-badge--muted"}`}>
                          {screen.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button type="button" className="admin-link-btn" onClick={() => openEdit(screen)} disabled={submitting || busyId !== null}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-link-btn admin-link-btn--danger"
                            onClick={() => handleDelete(screen)}
                            disabled={submitting || busyId !== null}
                          >
                            {busyId === screen._id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminScreensPage
