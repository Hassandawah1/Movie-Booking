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
  const initialStatus = searchParams.get("status") || "all"

  const [activeStatus, setActiveStatus] = useState(initialStatus)
  const [searchTerm, setSearchTerm] = useState("")
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  
  useEffect(() => {
    const statusParam = searchParams.get("status")
    if (statusParam && ["now-showing", "coming-soon"].includes(statusParam)) {
      setActiveStatus(statusParam)
    }
  }, [searchParams])

  
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
  }, [activeStatus])

  
  const handleFilterChange = (status) => {
    setActiveStatus(status)
    if (status === "all") {
      setSearchParams({})
    } else {
      setSearchParams({ status })
    }
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
          <h1 className="page-title">Cinema Movies</h1>
          <p className="page-subtitle">
            Browse our full repertoire of currently playing blockbusters and upcoming premieres.
          </p>
        </div>

        
        <div className="catalogue-toolbar mb-4">
          
          <div className="filter-tabs" role="tablist">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`filter-tab ${
                  activeStatus === filter.value ? "active" : ""
                }`}
                onClick={() => handleFilterChange(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          
          <div className="search-box-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search by title or genre…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search movies"
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <AppIcon name="close" size={16} />
              </button>
            )}
          </div>
        </div>

        
        {error && (
          <div className="alert-error mb-4">
            <AppIcon name="alert" size={16} /> {error}
          </div>
        )}

        
        {!loading && !error && (
          <div className="results-count-bar mb-3">
            <span>
              Showing <strong>{filteredMovies.length}</strong> {filteredMovies.length === 1 ? "movie" : "movies"}
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
          </div>
        )}

        
        <MovieGrid
          movies={filteredMovies}
          emptyMessage={
            searchTerm
              ? `No movies found matching "${searchTerm}". Try another title or genre.`
              : "No movies found in this category."
          }
          loading={loading}
        />
      </div>
    </div>
  )
}

export default MoviesPage
