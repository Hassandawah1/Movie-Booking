import { useState, useEffect } from "react"
import { AdminField } from "../AdminUi"
import { todayInputValue } from "../adminUtils"


const ShowtimeForm = ({ initial, movies = [], screens = [], submitting, onCancel, onSubmit }) => {
  const isEdit = Boolean(initial?._id || initial?.id)

  const [form, setForm] = useState({
    movieId: "",
    screenId: "",
    showDate: todayInputValue(),
    startTime: "18:00",
    standardPrice: "",
    vipPrice: "",
    status: "scheduled"
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initial) {
      const movieId = initial.movie?._id || initial.movie || ""
      const screenId = initial.screen?._id || initial.screen || ""
      const date = initial.showDate ? new Date(initial.showDate) : null

      setForm({
        movieId: String(movieId),
        screenId: String(screenId),
        showDate: date
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
          : todayInputValue(),
        startTime: initial.startTime || "18:00",
        standardPrice: initial.standardPrice != null ? String(initial.standardPrice) : "",
        vipPrice: initial.vipPrice != null ? String(initial.vipPrice) : "",
        status: initial.status || "scheduled"
      })
    } else {
      setForm({
        movieId: "",
        screenId: "",
        showDate: todayInputValue(),
        startTime: "18:00",
        standardPrice: "",
        vipPrice: "",
        status: "scheduled"
      })
    }
    setErrors({})
  }, [initial])

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: "" }))
  }

  const validate = () => {
    const next = {}
    if (!form.movieId) next.movieId = "Choose a movie."
    if (!form.screenId) next.screenId = "Choose a screen."
    if (!form.showDate) next.showDate = "Choose a show date."
    else if (form.showDate < todayInputValue() && (!isEdit || form.showDate !== initial.showDate?.slice(0, 10))) {
      next.showDate = "Show date cannot be in the past."
    }
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(form.startTime)) next.startTime = "Use a 24-hour time such as 18:30."

    const std = Number(form.standardPrice)
    if (form.standardPrice === "" || Number.isNaN(std) || std < 0) {
      next.standardPrice = "Enter a standard price of 0 or more."
    }
    if (form.vipPrice !== "") {
      const vip = Number(form.vipPrice)
      if (Number.isNaN(vip) || vip < 0) next.vipPrice = "Enter a VIP price of 0 or more."
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (submitting || !validate()) return

    const payload = {
      movieId: form.movieId,
      screenId: form.screenId,
      showDate: form.showDate,
      startTime: form.startTime,
      standardPrice: Number(form.standardPrice),
      
      vipPrice: form.vipPrice === "" ? null : Number(form.vipPrice)
    }
    if (isEdit) {
      payload.status = form.status
      
      
      const original = {
        movieId: String(initial.movie?._id || initial.movie || ""),
        screenId: String(initial.screen?._id || initial.screen || ""),
        showDate: initial.showDate?.slice(0, 10),
        startTime: initial.startTime,
        standardPrice: initial.standardPrice,
        vipPrice: initial.vipPrice ?? null,
        status: initial.status
      }
      for (const key of Object.keys(payload)) {
        if (payload[key] === original[key]) delete payload[key]
      }
      if (Object.keys(payload).length === 0) {
        setErrors({ submit: "No changes to save." })
        return
      }
      if (payload.status === "cancelled" && !window.confirm("Cancel this showtime? It will no longer be bookable by customers.")) return
    }

    onSubmit(payload)
  }

  
  
  const selectableMovies = movies.filter(
    (m) => m.status !== "ended" || String(m._id) === String(form.movieId)
  )

  
  
  const selectableScreens = screens.filter(
    (s) => s.status === "active" || String(s._id) === String(form.screenId)
  )

  const currentScreenInactive = screens.some(
    (s) => String(s._id) === String(form.screenId) && s.status !== "active"
  )

  return (
    <form className="admin-form" onSubmit={handleSubmit} data-panel="showtime-form" noValidate>
      <h3 className="admin-form-title">{isEdit ? "Edit Showtime" : "Schedule a Showtime"}</h3>
      {errors.submit && <p role="alert">{errors.submit}</p>}

      <div className="admin-form-grid">
        <AdminField label="Movie" htmlFor="showtime-movie" error={errors.movieId}>
          <select
            id="showtime-movie"
            className="admin-input"
            value={form.movieId}
            onChange={(e) => setField("movieId", e.target.value)}
            disabled={submitting}
          >
            <option value="">Select a movie…</option>
            {selectableMovies.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title} ({m.status})
              </option>
            ))}
          </select>
        </AdminField>

        <AdminField
          label="Screen"
          htmlFor="showtime-screen"
          error={errors.screenId}
          hint={currentScreenInactive ? "This screen is now inactive; choose an active one." : undefined}
        >
          <select
            id="showtime-screen"
            className="admin-input"
            value={form.screenId}
            onChange={(e) => setField("screenId", e.target.value)}
            disabled={submitting}
          >
            <option value="">Select a screen…</option>
            {selectableScreens.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} · {s.screenType} · {s.totalSeats} seats
                {s.status !== "active" ? " (inactive)" : ""}
              </option>
            ))}
          </select>
        </AdminField>

        <AdminField label="Show Date" htmlFor="showtime-date" error={errors.showDate}>
          <input
            id="showtime-date"
            type="date"
            className="admin-input"
            value={form.showDate}
            min={todayInputValue()}
            onChange={(e) => setField("showDate", e.target.value)}
            disabled={submitting}
          />
        </AdminField>

        <AdminField label="Start Time" htmlFor="showtime-time" error={errors.startTime} hint="24-hour clock.">
          <input
            id="showtime-time"
            type="time"
            className="admin-input"
            value={form.startTime}
            onChange={(e) => setField("startTime", e.target.value)}
            disabled={submitting}
          />
        </AdminField>

        <AdminField label="Standard Price (₦)" htmlFor="showtime-standard" error={errors.standardPrice}>
          <input
            id="showtime-standard"
            type="number"
            min="0"
            step="50"
            className="admin-input"
            value={form.standardPrice}
            onChange={(e) => setField("standardPrice", e.target.value)}
            disabled={submitting}
          />
        </AdminField>

        <AdminField label="VIP Price (₦)" htmlFor="showtime-vip" error={errors.vipPrice} hint="Leave blank if not offered.">
          <input
            id="showtime-vip"
            type="number"
            min="0"
            step="50"
            className="admin-input"
            value={form.vipPrice}
            onChange={(e) => setField("vipPrice", e.target.value)}
            disabled={submitting}
          />
        </AdminField>

        {isEdit && (
          <AdminField label="Status" htmlFor="showtime-status">
            <select
              id="showtime-status"
              className="admin-input"
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
              disabled={submitting}
            >
              <option value="scheduled">Scheduled</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </AdminField>
        )}
      </div>

      <div className="admin-form-actions">
        <button type="submit" className="admin-btn admin-btn--primary" disabled={submitting}>
          {submitting ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save Showtime" : "Create Showtime"}
        </button>
        <button type="button" className="admin-btn" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
      </div>
    </form>
  )
}

export default ShowtimeForm
