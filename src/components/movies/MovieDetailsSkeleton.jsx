const MovieDetailsSkeleton = () => {
  return (
    <div className="movie-details-skeleton">
      <div className="skeleton-hero">
        <div className="container">
          <div className="skeleton-layout">
            <div className="skeleton-poster skeleton-placeholder"></div>
            <div className="skeleton-content">
              <div className="skeleton-badge skeleton-placeholder"></div>
              <div className="skeleton-title skeleton-placeholder"></div>
              <div className="skeleton-meta skeleton-placeholder"></div>
              <div className="skeleton-text skeleton-placeholder"></div>
              <div className="skeleton-text skeleton-placeholder" style={{ width: "80%" }}></div>
              <div className="skeleton-text skeleton-placeholder" style={{ width: "60%" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieDetailsSkeleton
