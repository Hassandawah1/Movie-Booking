import AppIcon from "../ui/AppIcon"
import MovieCard from "./MovieCard"

const MovieGrid = ({
  movies = [],
  emptyMessage = "No movies found.",
  loading = false
}) => {
  if (loading) {
    return (
      <div className="movie-grid-loading">
        <div className="spinner"></div>
        <p>Loading movies…</p>
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
