import { useState, useEffect } from "react"
import { AdminField } from "../AdminUi"

const SCREEN_TYPES = [
  { value: "standard", label: "Standard" },
  { value: "vip", label: "VIP" }
]

const SCREEN_STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" }
]

const emptyForm = { name: "", screenType: "standard", totalRows: "10", seatsPerRow: "8", status: "active" }


const ScreenForm = ({ initial, submitting, onCancel, onSubmit }) => {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  const isEdit = Boolean(initial?._id || initial?.id)

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name ?? "",
        screenType: initial.screenType ?? "standard",
        totalRows: String(initial.totalRows ?? "10"),
        seatsPerRow: String(initial.seatsPerRow ?? "8"),
        status: initial.status ?? "active"
      })
    } else {
      setForm(emptyForm)
    }
    setErrors({})
  }, [initial])

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: "" }))
  }

  
  const validate = () => {
    const next = {}
    const rows = Number(form.totalRows)
    const perRow = Number(form.seatsPerRow)

    if (!form.name.trim()) next.name = "Screen name is required."
    if (!Number.isInteger(rows) || rows < 1) next.totalRows = "Rows must be a whole number of at least 1."
    else if (rows > 26) next.totalRows = "Maximum 26 rows are supported (A–Z)."
    if (!Number.isInteger(perRow) || perRow < 1) next.seatsPerRow = "Seats per row must be a whole number of at least 1."

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      name: form.name.trim(),
      screenType: form.screenType,
      totalRows: Number(form.totalRows),
      seatsPerRow: Number(form.seatsPerRow)
    }
    
    if (isEdit) payload.status = form.status

    onSubmit(payload)
  }

  const rows = Number(form.totalRows)
  const perRow = Number(form.seatsPerRow)
  const previewValid = Number.isInteger(rows) && rows > 0 && Number.isInteger(perRow) && perRow > 0
  const capacity = previewValid ? rows * perRow : null

  return (
    <form className="admin-form" onSubmit={handleSubmit} data-panel="screen-form" noValidate>
      <h3 className="admin-form-title">{isEdit ? `Edit "${initial.name}"` : "Add a Screen"}</h3>

      <div className="admin-form-grid">
        <AdminField label="Screen Name" htmlFor="screen-name" error={errors.name}>
          <input
            id="screen-name"
            type="text"
            className="admin-input"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="e.g. Screen 3 - Dolby"
            disabled={submitting}
          />
        </AdminField>

        <AdminField label="Screen Type" htmlFor="screen-type" hint="VIP screens can carry VIP pricing.">
          <select
            id="screen-type"
            className="admin-input"
            value={form.screenType}
            onChange={(e) => setField("screenType", e.target.value)}
            disabled={submitting}
          >
            {SCREEN_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </AdminField>

        <AdminField label="Rows" htmlFor="screen-rows" error={errors.totalRows} hint="1–26 rows (A–Z).">
          <input
            id="screen-rows"
            type="number"
            min="1"
            max="26"
            className="admin-input"
            value={form.totalRows}
            onChange={(e) => setField("totalRows", e.target.value)}
            disabled={submitting}
          />
        </AdminField>

        <AdminField label="Seats Per Row" htmlFor="screen-seats" error={errors.seatsPerRow}>
          <input
            id="screen-seats"
            type="number"
            min="1"
            className="admin-input"
            value={form.seatsPerRow}
            onChange={(e) => setField("seatsPerRow", e.target.value)}
            disabled={submitting}
          />
        </AdminField>

        {isEdit && (
          <AdminField label="Status" htmlFor="screen-status">
            <select
              id="screen-status"
              className="admin-input"
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
              disabled={submitting}
            >
              {SCREEN_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </AdminField>
        )}
      </div>

      <p className="admin-form-note" data-capacity-preview={capacity ?? ""}>
        Estimated capacity: <strong>{capacity ?? "—"}</strong> seats
        <span className="admin-form-note-sub"> (the server calculates and stores the final total)</span>
      </p>

      <div className="admin-form-actions">
        <button type="submit" className="admin-btn admin-btn--primary" disabled={submitting}>
          {submitting ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save Screen" : "Create Screen"}
        </button>
        <button type="button" className="admin-btn" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default ScreenForm
