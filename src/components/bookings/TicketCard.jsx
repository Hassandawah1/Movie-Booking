import { formatCurrency, formatDate, formatTime } from "../../utils/formatters"
import AppIcon from "../ui/AppIcon"
import TicketQRCode from "./TicketQRCode"


const TicketCard = ({ booking, customerName }) => {
  if (!booking) return null

  const { bookingReference, movie, screen, showtime, seats = [], totalAmount } = booking

  const ticketCount = seats.length

  return (
    <section className="ticket" aria-label={`Ticket for ${movie?.title || "your movie"}`}>
      
      <header className="ticket-header">
        <div className="ticket-brand">
          <span className="ticket-brand-mark" aria-hidden="true">
            <AppIcon name="film" size={22} />
          </span>
          <div>
            <p className="ticket-brand-name">CineBook</p>
            <p className="ticket-brand-sub">Cinema Ticket</p>
          </div>
        </div>

        <div className="ticket-header-status">
          <span className="ticket-paid-pill">PAID</span>
          <span className="ticket-confirmed-pill">CONFIRMED</span>
        </div>
      </header>

      
      <div className="ticket-body">
        <div className="ticket-artwork">
          {movie?.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={`${movie?.title || "Movie"} poster`}
              className="ticket-poster"
            />
          ) : (
            <div className="ticket-poster ticket-poster--placeholder" aria-hidden="true">
              <AppIcon name="film" size={32} />
            </div>
          )}
        </div>

        <div className="ticket-details">
          <h1 className="ticket-movie-title">{movie?.title || "Movie"}</h1>

          <p className="ticket-reference-label">Booking Reference</p>
          <p className="ticket-reference">{bookingReference}</p>

          <dl className="ticket-grid">
            <div className="ticket-grid-item">
              <dt>Date</dt>
              <dd>{formatDate(showtime?.showDate, { year: "numeric", timeZone: "Africa/Lagos" })}</dd>
            </div>
            <div className="ticket-grid-item">
              <dt>Time</dt>
              <dd>{formatTime(showtime?.startTime)}</dd>
            </div>
            <div className="ticket-grid-item">
              <dt>Screen</dt>
              <dd>
                {screen?.name || "—"}
                {screen?.screenType ? (
                  <span className="ticket-screen-type">{screen.screenType.toUpperCase()}</span>
                ) : null}
              </dd>
            </div>
            <div className="ticket-grid-item">
              <dt>{ticketCount === 1 ? "Ticket" : "Tickets"}</dt>
              <dd>
                {ticketCount} {ticketCount === 1 ? "seat" : "seats"}
              </dd>
            </div>
          </dl>

          <div className="ticket-seats-block">
            <p className="ticket-seats-label">Seats</p>
            <div className="ticket-seats">
              {seats.length > 0 ? (
                seats.map((s) => (
                  <span key={s.seatNumber} className="ticket-seat">
                    {s.seatNumber}
                    {s.ticketType === "vip" && <span className="ticket-seat-vip">VIP</span>}
                  </span>
                ))
              ) : (
                <span className="text-muted">—</span>
              )}
            </div>
          </div>

          {customerName && (
            <p className="ticket-holder">
              Ticket holder: <strong>{customerName}</strong>
            </p>
          )}
        </div>
      </div>

      
      <TicketQRCode token={booking.ticketToken} reference={bookingReference} />

      <div className="ticket-perforation" aria-hidden="true">
        <span className="ticket-notch ticket-notch--left" />
        <span className="ticket-dashes" />
        <span className="ticket-notch ticket-notch--right" />
      </div>

      
      <footer className="ticket-stub">
        <div className="ticket-stub-item">
          <span className="ticket-stub-label">Amount Paid</span>
          <span className="ticket-stub-value ticket-stub-value--amount">
            {formatCurrency(totalAmount)}
          </span>
        </div>

        <div className="ticket-stub-item">
          <span className="ticket-stub-label">Booking Status</span>
          <span className="ticket-stub-value">Confirmed</span>
        </div>

        <div className="ticket-stub-item">
          <span className="ticket-stub-label">Payment Status</span>
          <span className="ticket-stub-value">Paid</span>
        </div>

        <div className="ticket-stub-item">
          <span className="ticket-stub-label">Reference</span>
          <span className="ticket-stub-value ticket-stub-value--ref">{bookingReference}</span>
        </div>
      </footer>

      <p className="ticket-footnote">
        Please arrive at least 15 minutes before the showtime and present this ticket
        (printed or on your phone) at the entrance.
      </p>
    </section>
  )
}

export default TicketCard
