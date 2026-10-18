import { useState, useEffect, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { getMovieById } from "../services/movie.service"
import { getShowtimesForMovie } from "../services/showtime.service"
import ShowtimeCard from "../components/movies/ShowtimeCard"
import MovieDetailsSkeleton from "../components/movies/MovieDetailsSkeleton"
import { formatStatus, formatDate } from "../utils/formatters"
import AppIcon from "../components/ui/AppIcon"

const PLACEHOLDER_POSTER =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80"

const MovieDetailsPage = () => {
  const { id } = useParams()

  const [movie, setMovie] = useState(null)
  const [showtimes, setShowtimes] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingShowtimes, setLoadingShowtimes] = useState(true)
  const [showtimesError, setShowtimesError] = useState("")
  const [scheduleSummary, setScheduleSummary] = useState(null)
  const [showtimesAttempt, setShowtimesAttempt] = useState(0)
  const [error, setError] = useState("")
  const [posterError, setPosterError] = useState(false)

  
  useEffect(() => {
    let isMounted = true

    const loadMovie = async () => {
      setLoading(true)
      setLoadingShowtimes(true)
      setMovie(null)
      setPosterError(false)
      setError("")

      try {
        const data = await getMovieById(id)
        if (!isMounted) return

        if (data?.success && data.movie) {
          setMovie(data.movie)
        } else {
          setError(data?.message || "Movie not found.")
        }
      } catch (err) {
        if (isMounted) {
          if (err.response?.status === 404 || err.response?.status === 400) {
            setError("Movie not found.")
          } else {
            setError(
              err.response?.data?.message ||
                "Failed to load movie details. Please try again later."
            )
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadMovie()

    return () => {
      isMounted = false
    }
  }, [id])

  
  useEffect(() => {
    let isMounted = true

    const loadShowtimes = async () => {
      if (!movie || movie._id !== id) return
      setShowtimes([])
      setScheduleSummary(null)
      setShowtimesError("")
      if (movie.status === "ended") {
        setLoadingShowtimes(false)
        return
      }

      setLoadingShowtimes(true)
      try {
        const data = await getShowtimesForMovie(movie._id)
        if (!isMounted) return

        if (data?.success) {
          setShowtimes(data.showtimes || [])
          setScheduleSummary(data.scheduleSummary || null)
        } else {
          setShowtimesError(data?.message || "Unable to load showtimes. Please try again.")
        }
      } catch (err) {
        
        if (isMounted) setShowtimesError(err.response?.data?.message || "We couldn't load the screening schedule. Check your connection and try again.")
      } finally {
        if (isMounted) {
          setLoadingShowtimes(false)
        }
      }
    }

    if (movie) {
      loadShowtimes()
    }

    return () => {
      isMounted = false
    }
  }, [movie, id, showtimesAttempt])

  
  const groupedShowtimes = useMemo(() => {
    if (!showtimes || showtimes.length === 0) return {}

    const groups = {}
    showtimes.forEach((st) => {
      const dateKey = st.date || st.showDate?.split("T")[0] || "Upcoming"
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(st)
    })
    return groups
  }, [showtimes])

  
  const getDateLabel = (dateStr) => {
    if (!dateStr || dateStr === "Upcoming") return "Upcoming"
    try {
      const showDate = new Date(dateStr)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const showDateZero = new Date(showDate)
      showDateZero.setHours(0, 0, 0, 0)

      if (showDateZero.getTime() === today.getTime()) {
        return `Today — ${formatDate(dateStr)}`
      }
      if (showDateZero.getTime() === tomorrow.getTime()) {
        return `Tomorrow — ${formatDate(dateStr)}`
      }
      return formatDate(dateStr, { weekday: "long", month: "long", day: "numeric" })
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return <MovieDetailsSkeleton />
  }

  if (error || !movie) {
    return (
      <div className="page-wrapper">
        <div className="container py-5 text-center">
          <div className="not-found-card py-5">
            <div style={{ marginBottom: "1rem" }}><AppIcon name="film" size={56} /></div>
            <h2 className="mb-2">{error || "Movie Not Found"}</h2>
            <p className="text-muted mb-4">
              The movie you are looking for does not exist or may have been removed.
            </p>
            <Link to="/movies" className="btn-primary-grad">
              <AppIcon name="arrowLeft" size={16} /> Back to All Movies
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const {
    title,
    overview,
    posterUrl,
    backdropUrl,
    genres = [],
    runtime,
    releaseDate,
    rating,
    language,
    status
  } = movie

  const posterSrc = posterError || !posterUrl ? PLACEHOLDER_POSTER : posterUrl

  return (
    <div className="page-wrapper movie-details-page">
      
      <section
        className={`movie-hero${backdropUrl ? " movie-hero--has-backdrop" : ""}`}
        style={{
          backgroundImage: backdropUrl
            ? `url(${backdropUrl})`
            : "none",
          backgroundColor: "var(--color-bg)"
        }}
      >
        <div className="container">
          <div className="movie-hero-layout">
            
            <div className="movie-hero-poster">
              <img
                src={posterSrc}
                alt={title}
                className="hero-poster-img"
                onError={() => setPosterError(true)}
              />
            </div>

            
            <div className="movie-hero-details">
              <div className="hero-status-row mb-2">
                <span className={`status-badge badge-${status}`}>
                  {formatStatus(status)}
                </span>
                {rating != null && (
                  <span className="rating-pill">
                    <AppIcon name="star" size={14} fill="currentColor" /> {Number(rating).toFixed(1)} <small>/ 10</small>
                  </span>
                )}
              </div>

              <h1 className="hero-movie-title">{title}</h1>

              
              <div className="hero-movie-meta mb-3">
                {runtime ? (
                  <span className="meta-item"><AppIcon name="clock" size={15} /> {runtime} min</span>
                ) : null}
                {releaseDate ? (
                  <span className="meta-item">
                    <AppIcon name="calendar" size={15} /> {new Date(releaseDate).getFullYear()}
                  </span>
                ) : null}
                {language ? (
                  <span className="meta-item"><AppIcon name="globe" size={15} /> {language.toUpperCase()}</span>
                ) : null}
              </div>

              
              {genres?.length > 0 && (
                <div className="hero-genres mb-3">
                  {genres.map((g) => (
                    <span key={g} className="genre-pill">
                      {g}
                    </span>
                  ))}
                </div>
              )}

              
              {overview && (
                <div className="hero-overview">
                  <h3>Synopsis</h3>
                  <p>{overview}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      
      <section className="container py-5 showtimes-section">
        <div className="section-header mb-4">
          <h2 className="section-title">Available Showtimes</h2>
          <p className="section-subtitle">
            Select a session below to proceed with seat selection and ticket reservation.
          </p>
        </div>

        {status === "ended" ? (
          <div className="ended-notice-box">
            <span><AppIcon name="film" size={28} /></span>
            <div>
              <h4>No Longer Showing</h4>
              <p>
                This movie's theatrical run has completed. Explore our Now Showing titles to book upcoming shows.
              </p>
            </div>
            <Link to="/movies" className="btn-secondary-custom ms-auto">
              Browse Current Movies
            </Link>
          </div>
        ) : loadingShowtimes ? (
          <div className="loading-showtimes">
            <div className="spinner"></div>
            <p>Loading showtimes…</p>
          </div>
        ) : showtimesError ? (
          <div className="no-showtimes-box" role="alert">
            <AppIcon name="alert" size={32} />
            <h3>Showtimes could not be loaded</h3>
            <p>{showtimesError}</p>
            <button className="btn-secondary-custom" type="button" onClick={() => setShowtimesAttempt(value => value + 1)}>Try again</button>
          </div>
        ) : Object.keys(groupedShowtimes).length === 0 ? (
          <div className="no-showtimes-box">
            <div className="no-showtimes-icon"><AppIcon name="ticket" size={36} /></div>
            <h3>No upcoming showtimes</h3>
            <p>
              {scheduleSummary?.pastCount > 0
                ? `The last scheduled screening was ${formatDate(scheduleSummary.lastPastDate, { year: "numeric", timeZone: "Africa/Lagos" })}. New screening times haven't been added yet.`
                : status === "coming-soon"
                  ? "Screening times haven't been published for this upcoming movie yet."
                  : "No upcoming screenings have been added for this movie yet. Please check back later."}
            </p>
            <Link to="/movies" className="btn-secondary-custom">
              View Other Movies
            </Link>
            <button type="button" className="btn-secondary-custom ms-2 mt-2" onClick={() => setShowtimesAttempt(value => value + 1)}>Refresh showtimes</button>
          </div>
        ) : (
          <div className="showtimes-grouped-list">
            {Object.entries(groupedShowtimes).map(([dateKey, stList]) => (
              <div key={dateKey} className="showtime-date-group mb-4">
                <h3 className="date-group-heading">
                  <AppIcon name="calendar" size={16} /> {getDateLabel(dateKey)}
                </h3>
                <div className="showtimes-grid">
                  {stList.map((st) => (
                    <ShowtimeCard key={st.id || st._id} showtime={st} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default MovieDetailsPage
