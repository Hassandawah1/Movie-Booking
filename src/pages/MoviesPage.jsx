import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import MovieGrid from "../components/movies/MovieGrid"
import { getMovies } from "../services/movie.service"
import AppIcon from "../components/ui/AppIcon"

const STATUS_FILTERS = [
  { label: "All Movies", value: "all" },
  { label: "Now Showing", value: "now-showing" },
  { label: "Coming Soon", value: "coming-soon" }
]

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusParam = searchParams.get("status")
  const activeStatus = STATUS_FILTERS.some(filter => filter.value === statusParam) ? statusParam : "all"
  const searchTerm = searchParams.get("q") || ""
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [attempt, setAttempt] = useState(0)

  const updateParams = (key, value, replace = false) => {
    setSearchParams(previous => {
      const next = new URLSearchParams(previous)
      if (value && value !== "all") next.set(key, value)
      else next.delete(key)
      return next
    }, { replace })
  }

  
  useEffect(() => {
    let isMounted = true

    const fetchMovies = async () => {
      setLoading(true)
      setError("")

      try {
        
        const params = activeStatus !== "all" ? { status: activeStatus } : {}
        const data = await getMovies(params)

        if (!isMounted) return

        if (data?.success) {
          
          const fetchedMovies = data.movies || []
          if (activeStatus === "all") {
            
            const activeList = fetchedMovies.filter((m) => m.status !== "ended")
            setMovies(activeList.length > 0 ? activeList : fetchedMovies)
          } else {
            setMovies(fetchedMovies)
          }
        } else {
          setError(data?.message || "Failed to load movies.")
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Could not connect to cinema server. Please try again."
          )
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchMovies()

    return () => {
      isMounted = false
    }
  }, [activeStatus, attempt])

  
  const handleFilterChange = (status) => {
    updateParams("status", status)
  }

  
  const filteredMovies = useMemo(() => {
    if (!searchTerm.trim()) return movies

    const term = searchTerm.trim().toLowerCase()
    return movies.filter((movie) => {
      const titleMatch = movie.title?.toLowerCase().includes(term)
      const genreMatch = movie.genres?.some((g) =>
        g.toLowerCase().includes(term)
      )
      return titleMatch || genreMatch
    })
  }, [movies, searchTerm])

  return (
    <div className="page-wrapper">
      <div className="container py-4">
        
        <div className="page-header mb-4">
          <h1 className="page-title">Find your next watch</h1>
          <p className="page-subtitle">
            From tonight’s plans to your next must-see. Explore what’s on the big screen.
          </p>
        </div>

        
        <div className="catalogue-toolbar mb-4">
          
          <div className="filter-tabs" role="group" aria-label="Filter movies by availability">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`filter-tab ${
                  activeStatus === filter.value ? "active" : ""
                }`}
                aria-pressed={activeStatus === filter.value}
                onClick={() => handleFilterChange(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          
          <div className="search-box-wrapper">
            <input
              type="search"
              className="search-input"
              placeholder="Search by title or genre…"
              value={searchTerm}
              onChange={(e) => updateParams("q", e.target.value, true)}
              aria-label="Search movies"
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => updateParams("q", "", true)}
                aria-label="Clear search"
              >
                <AppIcon name="close" size={16} />
              </button>
            )}
          </div>
        </div>

        
        {error && (
          <div className="alert-error mb-4" role="alert">
            <AppIcon name="alert" size={16} /> {error}
            <button className="retry-button" onClick={() => setAttempt(value => value + 1)}>Try again</button>
          </div>
        )}

        
        {!loading && !error && (
          <div className="results-count-bar mb-3" role="status">
            <span>
              Showing <strong>{filteredMovies.length}</strong> {filteredMovies.length === 1 ? "movie" : "movies"}
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
          </div>
        )}

        
        {!error && <MovieGrid
          movies={filteredMovies}
          emptyMessage={
            searchTerm
              ? `No movies found matching "${searchTerm}". Try another title or genre.`
              : "No movies found in this category."
          }
          loading={loading}
        />}
      </div>
    </div>
  )
}

export default MoviesPage
