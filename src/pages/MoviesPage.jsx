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

  // Sync state if URL query param changes
  useEffect(() => {
    const statusParam = searchParams.get("status")
    if (statusParam && ["now-showing", "coming-soon"].includes(statusParam)) {
      setActiveStatus(statusParam)
    }
  }, [searchParams])

  // Fetch movies from our backend
  useEffect(() => {
    let isMounted = true

    const fetchMovies = async () => {
      setLoading(true)
      setError("")

      try {
        // Fetch all active movies; if specific status filter selected (not "all"), pass as param
        const params = activeStatus !== "all" ? { status: activeStatus } : {}
        const data = await getMovies(params)

        if (!isMounted) return

        if (data?.success) {
          // Normal customer view: hide "ended" movies unless all are fetched, or show them at the end
          const fetchedMovies = data.movies || []
          if (activeStatus === "all") {
            // Filter out ended movies from general customer browsing, or prioritize active ones
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

  // Handle filter pill clicks
  const handleFilterChange = (status) => {
    setActiveStatus(status)
    if (status === "all") {
      setSearchParams({})
    } else {
      setSearchParams({ status })
    }
  }

  // Client-side search filtering by title and genre
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
        {/* Page Header */}
        <div className="page-header mb-4">
          <h1 className="page-title">Cinema Movies</h1>
          <p className="page-subtitle">
            Browse our full repertoire of currently playing blockbusters and upcoming premieres.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="catalogue-toolbar mb-4">
          {/* Status Tabs */}
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

          {/* Search Input */}
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

        {/* Error message */}
        {error && (
          <div className="alert-error mb-4">
            <AppIcon name="alert" size={16} /> {error}
          </div>
        )}

        {/* Results Info */}
        {!loading && !error && (
          <div className="results-count-bar mb-3">
            <span>
              Showing <strong>{filteredMovies.length}</strong> {filteredMovies.length === 1 ? "movie" : "movies"}
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
          </div>
        )}

        {/* Movies Grid */}
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
