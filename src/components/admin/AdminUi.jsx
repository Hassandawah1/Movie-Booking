import AppIcon from "../ui/AppIcon"




export const AdminBanner = ({ tone = "info", title, message, onDismiss }) => {
  if (!title && !message) return null

  return (
    <div className={`admin-banner admin-banner--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <span className="admin-banner-icon" aria-hidden="true">
        {tone === "error" ? <AppIcon name="alert" /> : tone === "success" ? <AppIcon name="check" /> : <AppIcon name="info" />}
      </span>
      <div className="admin-banner-body">
        {title && <p className="admin-banner-title">{title}</p>}
        {message && <p className="admin-banner-text">{message}</p>}
      </div>
      {onDismiss && (
        <button type="button" className="admin-banner-close" onClick={onDismiss} aria-label="Dismiss message">
          <AppIcon name="close" />
        </button>
      )}
    </div>
  )
}


export const AdminPagination = ({ page, pages, total, limit, onPageChange, disabled }) => {
  if (!pages || pages <= 1) {
    return total != null ? (
      <p className="admin-pagination-summary">
        {total} {total === 1 ? "record" : "records"}
      </p>
    ) : null
  }

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <nav className="admin-pagination" aria-label="Pagination">
      <button
        type="button"
        className="admin-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
      >
        <AppIcon name="arrowLeft" size={16} /> Previous
      </button>

      <span className="admin-pagination-status">
        Page <strong>{page}</strong> of <strong>{pages}</strong>
        <span className="admin-pagination-range">
          ({from}–{to} of {total})
        </span>
      </span>

      <button
        type="button"
        className="admin-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= pages}
      >
        Next <AppIcon name="arrowRight" size={16} />
      </button>
    </nav>
  )
}


export const AdminField = ({ label, htmlFor, error, hint, children, className = "" }) => (
  <div className={`admin-field ${className}`}>
    <label htmlFor={htmlFor}>{label}</label>
    {children}
    {hint && !error && <p className="admin-field-hint">{hint}</p>}
    {error && (
      <p className="admin-field-error" role="alert">
        <AppIcon name="alert" size={15} /> {error}
      </p>
    )}
  </div>
)


export const AdminLoading = ({ children = "Loading…" }) => <p className="admin-loading">{children}</p>

export const AdminSectionError = ({ message, onRetry }) => (
  <>
    <p className="admin-section-error" role="alert">
      <AppIcon name="alert" size={15} /> {message}
    </p>
    {onRetry && (
      <button type="button" className="admin-link-btn" onClick={onRetry}>
        <AppIcon name="refresh" size={15} /> Retry
      </button>
    )}
  </>
)

export const AdminEmpty = ({ children = "Nothing to show." }) => <p className="admin-empty">{children}</p>
