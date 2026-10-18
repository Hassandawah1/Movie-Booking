import AppIcon from "../ui/AppIcon"
import MovieCard from "./MovieCard"

const MovieGrid = ({
  movies = [],
  emptyMessage = "No movies found.",
  loading = false
}) => {
  if (loading) {
    return (
      <div className="movie-grid" aria-busy="true" role="status" aria-label="Loading movies">
        {Array.from({ length: 6 }, (_, index) => <div className="movie-skeleton" key={index} aria-hidden="true"><div className="skeleton-poster" /><div className="skeleton-line" /><div className="skeleton-line short" /></div>)}
        <span className="visually-hidden">Loading movies…</span>
      </div>
    )
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="empty-state-box">
        <div className="empty-icon"><AppIcon name="film" size={36} /></div>
        <p className="empty-text">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard key={movie._id || movie.id} movie={movie} />
      ))}
    </div>
  )
}

export default MovieGrid
