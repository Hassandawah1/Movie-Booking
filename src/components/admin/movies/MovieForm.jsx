const STATUS_OPTIONS = [
  { value: "coming-soon", label: "Coming Soon" },
  { value: "now-showing", label: "Now Showing" },
  { value: "ended", label: "Ended" }
]

/**
 * MovieForm — explicit status update for a catalogue movie.
 *
 * Draft changes stay local until Save Status succeeds on the backend.
 */
const MovieForm = ({ movie, draftStatus, saving, disabled, onDraftChange, onSave }) => {
  const isDirty = draftStatus !== movie.status

  return (
    <div className="admin-movie-status-row">
      <label className="admin-movie-status-label" htmlFor={`status-${movie._id}`}>
        Status
      </label>
      <select
        id={`status-${movie._id}`}
        className="admin-input"
        value={draftStatus}
        disabled={disabled}
        onChange={(e) => onDraftChange(e.target.value)}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="admin-btn admin-btn--primary"
        disabled={!isDirty || disabled}
        onClick={() => onSave(movie._id, draftStatus)}
      >
        {saving ? "Saving…" : "Save Status"}
      </button>
    </div>
  )
}

export default MovieForm
