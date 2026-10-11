import { useState } from "react"
import { Link } from "react-router-dom"
import { formatStatus } from "../../utils/formatters"
import AppIcon from "../ui/AppIcon"

const PLACEHOLDER_POSTER = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80"

const MovieCard = ({ movie }) => {
  const [imgError, setImgError] = useState(false)

  if (!movie) return null

  const {
    _id,
    title,
    posterUrl,
    genres = [],
    runtime,
    rating,
    status
  } = movie

  const posterSrc = imgError || !posterUrl ? PLACEHOLDER_POSTER : posterUrl

  const statusBadgeClass =
    status === "now-showing"
      ? "badge-now-showing"
      : status === "coming-soon"
      ? "badge-coming-soon"
      : "badge-ended"

  return (
    <div className="movie-card">
      <div className="movie-poster-wrapper">
        <img
          src={posterSrc}
          alt={title ? `${title} poster` : "Movie poster"}
          className="movie-poster-img"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <div className="movie-poster-overlay">
          <span className={`status-badge ${statusBadgeClass}`}>
            {formatStatus(status)}
          </span>
          {rating != null && (
            <span className="rating-badge">
              <AppIcon name="star" size={14} fill="currentColor" /> {Number(rating).toFixed(1)}
            </span>
          )}
        </div>
      </div>

      <div className="movie-info">
        <h3 className="movie-title" title={title}>
          {title || "Untitled Movie"}
        </h3>

        <div className="movie-meta">
          {genres?.length > 0 && (
            <span className="movie-genre">{genres.slice(0, 2).join(", ")}</span>
          )}
          {runtime ? (
            <span className="movie-runtime">• {runtime} min</span>
          ) : null}
        </div>

        <div className="movie-actions">
          <Link
            to={`/movies/${_id}`}
            className={`btn-movie-action ${
              status === "now-showing" ? "btn-book-now" : "btn-view-details"
            }`}
          >
            {status === "now-showing" ? "Book Tickets" : "View Details"}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default MovieCard
