import { Link } from "react-router-dom"
import AppIcon from "../ui/AppIcon"
import MovieGrid from "./MovieGrid"

const MovieSection = ({
  title,
  subtitle,
  movies = [],
  viewAllLink,
  viewAllText = "View All Movies",
  emptyMessage = "No movies available in this category.",
  loading = false
}) => {
  return (
    <section className="movie-section mb-5">
      <div className="section-header d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
        {viewAllLink && movies.length > 0 && (
          <Link to={viewAllLink} className="view-all-link">
            {viewAllText} <AppIcon name="arrowRight" size={16} />
          </Link>
        )}
      </div>

      <MovieGrid
        movies={movies}
        emptyMessage={emptyMessage}
        loading={loading}
      />
    </section>
  )
}

export default MovieSection
