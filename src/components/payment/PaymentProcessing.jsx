const PaymentProcessing = ({ message = "Verifying your payment with Paystack…" }) => {
  return (
    <div className="text-center py-5">
      <div
        className="spinner-border text-primary mb-3"
        role="status"
        style={{ width: "3.5rem", height: "3.5rem" }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <h3 className="fw-bold mb-2">{message}</h3>
      <p className="text-muted">
        Please do not close or refresh this window while we confirm your transaction.
      </p>
    </div>
  )
}

export default PaymentProcessing
