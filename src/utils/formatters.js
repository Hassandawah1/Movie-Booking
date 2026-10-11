/**
 * Formatters for currency, dates, times, and movie statuses
 */

export const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return "—"
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatDate = (dateString, options = {}) => {
  if (!dateString) return "—"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    const defaultOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
      ...options
    }
    return new Intl.DateTimeFormat("en-US", defaultOptions).format(date)
  } catch {
    return dateString
  }
}

export const formatTime = (timeString) => {
  if (!timeString) return "—"
  // If time is already HH:MM (e.g. "19:00" or "07:30")
  const parts = timeString.split(":")
  if (parts.length >= 2) {
    let hour = parseInt(parts[0], 10)
    const minute = parts[1].padStart(2, "0")
    if (isNaN(hour)) return timeString
    const ampm = hour >= 12 ? "PM" : "AM"
    hour = hour % 12 || 12
    return `${hour}:${minute} ${ampm}`
  }
  return timeString
}

export const formatStatus = (status) => {
  switch (status) {
    case "now-showing":
      return "Now Showing"
    case "coming-soon":
      return "Coming Soon"
    case "ended":
      return "Ended"
    default:
      return status || "Unknown"
  }
}
