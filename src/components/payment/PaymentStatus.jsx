import AppIcon from "../ui/AppIcon"


export const formatPaymentStatus = (status, failureReason) => {
  switch (status) {
    case "paid":
      return "Paid"
    case "unpaid":
      return "Payment Pending"
    case "failed":
      
      
      if (failureReason === "abandoned") return "Payment Not Completed"
      if (failureReason === "amount-mismatch") return "Amount Mismatch"
      return "Payment Failed"
    case "refunded":
      return "Refunded"
    default:
      return status ? "Payment Pending" : "—"
  }
}

export const formatBookingStatus = (status) => {
  switch (status) {
    case "pending-payment":
      return "Awaiting Payment"
    case "confirmed":
      return "Confirmed"
    case "cancelled":
      return "Cancelled"
    case "expired":
      return "Expired"
    default:
      return status || "—"
  }
}


export const paymentStatusClass = (status) => {
  switch (status) {
    case "paid":
      return "state-badge state-badge--positive"
    case "failed":
      return "state-badge state-badge--negative"
    case "refunded":
      return "state-badge"
    default:
      return "state-badge state-badge--pending"
  }
}


export const bookingStatusClass = (status) => {
  switch (status) {
    case "confirmed":
      return "state-badge state-badge--positive"
    case "cancelled":
    case "expired":
      return "state-badge"
    default:
      return "state-badge state-badge--pending"
  }
}

const BADGE_STYLE = { padding: "0.45rem 0.75rem", fontSize: "0.8rem" }

export const PaymentStatusBadge = ({ status, failureReason }) => {
  if (!status) return null
  return (
    <span className={`badge ${paymentStatusClass(status)}`} style={BADGE_STYLE}>
      <AppIcon name={status === "paid" ? "check" : status === "failed" ? "alert" : "clock"} size={14} />
      {formatPaymentStatus(status, failureReason)}
    </span>
  )
}

export const BookingStatusBadge = ({ status }) => {
  if (!status) return null
  return (
    <span className={`badge ${bookingStatusClass(status)}`} style={BADGE_STYLE}>
      <AppIcon name={status === "confirmed" ? "check" : status === "cancelled" || status === "expired" ? "ban" : "clock"} size={14} />
      {formatBookingStatus(status)}
    </span>
  )
}

const PaymentStatus = ({ paymentStatus, bookingStatus, failureReason }) => {
  return (
    <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
      <PaymentStatusBadge status={paymentStatus} failureReason={failureReason} />
      <BookingStatusBadge status={bookingStatus} />
    </div>
  )
}

export default PaymentStatus
