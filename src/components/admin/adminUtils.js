/**
 * Non-component admin helpers.
 *
 * Kept separate from AdminUi.jsx so that file only exports components, which
 * keeps React Fast Refresh working for the admin UI primitives.
 */

/**
 * Turn any thrown request error into a readable sentence.
 * Raw Axios objects and stack traces are never surfaced to the admin.
 */
export const describeApiError = (err, fallback = "Something went wrong. Please try again.") => {
  if (!err) return fallback

  const status = err.response?.status
  const backendMessage = err.response?.data?.message

  // Prefer the backend's human message. Map a few 409s to the admin-facing wording.
  if (status === 409) {
    const text = (backendMessage || "").toLowerCase()
    if (text.includes("already been added")) return "This movie has already been added."
    if (text.includes("active upcoming showtimes")) {
      return "Screen cannot be deleted because it has active upcoming showtimes."
    }
    if (text.includes("already has a showtime") || text.includes("schedul")) {
      return "This screen is already scheduled during that time."
    }
    if (backendMessage) return backendMessage
    return "That conflicts with an existing record."
  }

  if (backendMessage) return backendMessage
  if (status === 401) return "Your session has expired. Please sign in again."
  if (status === 403) return "You don't have permission to do that."
  if (status === 404) return "That record could not be found."
  if (!err.response) return "We couldn't reach the server. Check your connection and try again."
  if (status >= 500) return "The server ran into a problem. Please try again."
  return fallback
}

/** Today as YYYY-MM-DD from local calendar parts (not UTC). */
export const todayInputValue = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
