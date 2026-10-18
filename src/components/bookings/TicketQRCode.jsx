import { QRCodeSVG } from "qrcode.react"

const TicketQRCode = ({ token, reference }) => {
  if (!token) return <p className="ticket-qr-unavailable" role="status">QR code unavailable. Refresh your ticket to try again.</p>

  const verificationUrl = new URL("/tickets/verify", window.location.origin)
  // The fragment is not sent in server access logs or HTTP referrers.
  verificationUrl.hash = new URLSearchParams({ token }).toString()

  return (
    <div className="ticket-qr-block">
      <QRCodeSVG value={verificationUrl.href} size={200} level="M" marginSize={4} title={`Scan to verify ticket ${reference}`} />
      <div className="ticket-qr-caption">
        <strong>Scan to view & verify</strong>
        <p>Open your phone camera and scan this code to see the ticket holder, movie, seats, and screening details.</p>
        <a href={verificationUrl.href}>Open ticket verification</a>
        <small>Keep this code private. Anyone with it can view these ticket details.</small>
      </div>
    </div>
  )
}

export default TicketQRCode
