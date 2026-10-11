import { useState, useEffect } from "react"
import { formatDate } from "../../../utils/formatters"
import MovieForm from "./MovieForm"
import AppIcon from "../../ui/AppIcon"


const AdminMovieCard = ({ movie, saving, deleting, disabled, onSaveStatus, onDelete }) => {
  const [draftStatus, setDraftStatus] = useState(movie.status)

  
  useEffect(() => {
    setDraftStatus(movie.status)
  }, [movie.status, movie._id])

  const busy = saving || deleting || disabled

  return (
    <article className="admin-movie-card" data-movie={movie._id}>
      <div className="admin-movie-media">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            className="admin-movie-poster"
            loading="lazy"
          />
        ) : (
          <div className="admin-movie-poster admin-movie-poster--empty" aria-hidden="true">
            <AppIcon name="film" size={32} />
          </div>
        )}
      </div>

      <div className="admin-movie-body">
        <h3 className="admin-movie-title">{movie.title}</h3>

        <p className="admin-movie-meta">
          {movie.genres?.length > 0 ? movie.genres.slice(0, 3).join(" · ") : "No genres listed"}
        </p>

        <dl className="admin-movie-facts">
          <div>
            <dt>Released</dt>
            <dd>{movie.releaseDate ? formatDate(movie.releaseDate) : "—"}</dd>
          </div>
          <div>
            <dt>Runtime</dt>
            <dd>{movie.runtime ? `${movie.runtime} min` : "—"}</dd>
          </div>
          <div>
            <dt>Rating</dt>
            <dd>{movie.rating != null ? movie.rating : "—"}</dd>
          </div>
        </dl>

        <MovieForm
          movie={movie}
          draftStatus={draftStatus}
          saving={saving}
          disabled={busy}
          onDraftChange={setDraftStatus}
          onSave={onSaveStatus}
        />

        <div className="admin-movie-actions">
          <button
            type="button"
            className="admin-btn admin-btn--danger"
            onClick={() => onDelete(movie)}
            disabled={busy}
          >
            {deleting ? "Removing…" : "Remove Movie"}
          </button>
        </div>
      </div>
    </article>
  )
}

export default AdminMovieCard
