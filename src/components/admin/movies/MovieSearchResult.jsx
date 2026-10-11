import { formatDate } from "../../../utils/formatters"
import AppIcon from "../../ui/AppIcon"

/**
 * MovieSearchResult — one normalised result from the external provider search.
 *
 * Only the fields the backend already normalises are shown; the raw provider
 * payload is never rendered.
 */
const MovieSearchResult = ({ result, onAdd, adding, disabled, isAlreadyAdded }) => {
  return (
    <article className="admin-search-result" data-external-id={result.externalMovieId}>
      <div className="admin-search-media">
        {result.posterUrl ? (
          <img
            src={result.posterUrl}
            alt={`${result.title} poster`}
            className="admin-search-poster"
            loading="lazy"
          />
        ) : (
          <div className="admin-search-poster admin-search-poster--empty" aria-hidden="true">
            <AppIcon name="film" size={32} />
          </div>
        )}
      </div>

      <div className="admin-search-body">
        <h3 className="admin-search-title">{result.title || "Untitled"}</h3>

        <p className="admin-search-meta">
          {result.releaseDate ? formatDate(result.releaseDate) : "Release date unknown"}
          {result.rating != null ? <> · <AppIcon name="star" size={13} fill="currentColor" /> {result.rating}</> : ""}
          {result.runtime ? ` · ${result.runtime} min` : ""}
        </p>

        {result.genres?.length > 0 && (
          <p className="admin-search-genres">{result.genres.slice(0, 4).join(" · ")}</p>
        )}

        {result.overview && <p className="admin-search-overview">{result.overview}</p>}

        <div className="admin-search-actions">
          {isAlreadyAdded ? (
            <span className="admin-badge admin-badge--muted">Already in catalogue</span>
          ) : (
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={() => onAdd(result)}
              disabled={adding || disabled || !result.externalMovieId}
            >
              {adding ? "Adding…" : "Add to Cinema"}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default MovieSearchResult
