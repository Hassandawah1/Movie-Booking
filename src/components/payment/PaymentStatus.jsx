

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
      return "bg-success"
    case "failed":
      return "bg-danger"
    case "refunded":
      return "bg-secondary"
    default:
      return "bg-warning text-dark"
  }
}


export const bookingStatusClass = (status) => {
  switch (status) {
    case "confirmed":
      return "bg-success"
    case "cancelled":
    case "expired":
      return "bg-secondary"
    default:
      return "bg-info text-dark"
  }
}

const BADGE_STYLE = { padding: "0.45rem 0.75rem", fontSize: "0.8rem" }

export const PaymentStatusBadge = ({ status, failureReason }) => {
  if (!status) return null
  return (
    <span className={`badge ${paymentStatusClass(status)}`} style={BADGE_STYLE}>
      {formatPaymentStatus(status, failureReason)}
    </span>
  )
}

export const BookingStatusBadge = ({ status }) => {
  if (!status) return null
  return (
    <span className={`badge ${bookingStatusClass(status)}`} style={BADGE_STYLE}>
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
