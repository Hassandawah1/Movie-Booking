import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useOutletContext } from "react-router-dom"
import AdminHeader from "../../components/admin/AdminHeader"
import AppIcon from "../../components/ui/AppIcon"
import AdminMovieCard from "../../components/admin/movies/AdminMovieCard"
import MovieSearchResult from "../../components/admin/movies/MovieSearchResult"
import { AdminBanner, AdminLoading, AdminSectionError, AdminEmpty } from "../../components/admin/AdminUi"
import { describeApiError } from "../../components/admin/adminUtils"
import {
  getAllMovies,
  searchExternalMovies,
  addMovieToCinema,
  updateMovie,
  deleteMovie
} from "../../services/admin.service"

const STATUS_FILTERS = [
  { id: "", label: "All" },
  { id: "now-showing", label: "Now Showing" },
  { id: "coming-soon", label: "Coming Soon" },
  { id: "ended", label: "Ended" }
]


const AdminMoviesPage = () => {
  const outletContext = useOutletContext()
  const requestVersion = useRef(0)

  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [titleQuery, setTitleQuery] = useState("")
  const [catalogueExternalIds, setCatalogueExternalIds] = useState(() => new Set())

  const [busyMovieId, setBusyMovieId] = useState(null)
  const [busyAction, setBusyAction] = useState("")
  const [banner, setBanner] = useState(null)

  
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState("")
  const [addingId, setAddingId] = useState(null)

  const loadMovies = useCallback(async (status = statusFilter) => {
    const version = ++requestVersion.current
    setLoading(true)
    setListError("")
    try {
      const data = await getAllMovies(status ? { status } : {})
      if (version !== requestVersion.current) return
      if (data?.success && Array.isArray(data.movies)) {
        setMovies(data.movies)
      } else {
        setListError(data?.message || "We couldn't load the catalogue.")
      }
    } catch (err) {
      if (version !== requestVersion.current) return
      setListError(describeApiError(err, "We couldn't load the catalogue."))
      setMovies([])
    } finally {
      if (version === requestVersion.current) setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadMovies(statusFilter)
  }, [statusFilter, loadMovies])

  
  
  useEffect(() => {
    const loadIds = async () => {
      try {
        const data = await getAllMovies()
        if (data?.success && Array.isArray(data.movies)) {
          setCatalogueExternalIds(
            new Set(data.movies.map((m) => String(m.externalMovieId || "")).filter(Boolean))
          )
        }
      } catch {
        
      }
    }
    loadIds()
  }, [movies.length])

  const visibleMovies = useMemo(() => {
    const q = titleQuery.trim().toLowerCase()
    if (!q) return movies
    return movies.filter((m) => (m.title || "").toLowerCase().includes(q))
  }, [movies, titleQuery])

  const handleSaveStatus = async (movieId, status) => {
    setBusyMovieId(movieId)
    setBusyAction("status")
    setBanner(null)
    try {
      const data = await updateMovie(movieId, { status })
      if (data?.success) {
        
        await loadMovies(statusFilter)
        setBanner({ tone: "success", message: `Movie status updated to "${status}".` })
      } else {
        setBanner({ tone: "error", message: data?.message || "The status could not be updated." })
      }
    } catch (err) {
      setBanner({ tone: "error", message: describeApiError(err, "The status could not be updated.") })
    } finally {
      setBusyMovieId(null)
      setBusyAction("")
    }
  }

  const handleDelete = async (movie) => {
    const confirmed = window.confirm(
      `Remove this movie from the cinema catalogue?\n\n"${movie.title}" will be removed. This cannot be undone.`
    )
    if (!confirmed) return

    setBusyMovieId(movie._id)
    setBusyAction("delete")
    setBanner(null)
    try {
      const data = await deleteMovie(movie._id)
      if (data?.success) {
        setMovies((prev) => prev.filter((m) => m._id !== movie._id))
        setBanner({ tone: "success", message: `"${movie.title}" was removed from the catalogue.` })
      } else {
        setBanner({ tone: "error", message: data?.message || "The movie could not be removed." })
      }
    } catch (err) {
      
      setBanner({ tone: "error", message: describeApiError(err, "The movie could not be removed.") })
    } finally {
      setBusyMovieId(null)
      setBusyAction("")
    }
  }

  const handleSearch = async (e) => {
    e?.preventDefault()
    const query = searchTerm.trim()
    if (!query) {
      setSearchError("Enter a movie title to search.")
      setSearchResults(null)
      return
    }

    setSearching(true)
    setSearchError("")
    setSearchResults(null)
    setBanner(null)
    try {
      const data = await searchExternalMovies(query)
      if (data?.success) {
        setSearchResults(Array.isArray(data.results) ? data.results : [])
      } else {
        setSearchError(data?.message || "The search could not be completed.")
      }
    } catch (err) {
      
      setSearchError(describeApiError(err, "The movie provider is unavailable right now."))
    } finally {
      setSearching(false)
    }
  }

  const handleAdd = async (result) => {
    setAddingId(result.externalMovieId)
    setBanner(null)
    try {
      const data = await addMovieToCinema({
        externalMovieId: result.externalMovieId,
        posterUrl: result.posterUrl,
        backdropUrl: result.backdropUrl,
        title: result.title,
        overview: result.overview,
        runtime: result.runtime
      })
      if (data?.success) {
        setCatalogueExternalIds((prev) => new Set([...prev, String(result.externalMovieId)]))
        setBanner({
          tone: "success",
          message: `"${data.movie?.title || result.title}" was added to the catalogue.`
        })
        await loadMovies(statusFilter)
      } else {
        setBanner({ tone: "error", message: data?.message || "The movie could not be added." })
      }
    } catch (err) {
      setBanner({ tone: "error", message: describeApiError(err, "The movie could not be added.") })
      if (err.response?.status === 409) {
        setCatalogueExternalIds((prev) => new Set([...prev, String(result.externalMovieId)]))
        await loadMovies(statusFilter)
      }
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="admin-page">
      <AdminHeader
        title="Movies"
        subtitle="Manage the cinema catalogue and import new titles"
        sidebarOpen={outletContext?.sidebarOpen}
        onToggleSidebar={outletContext?.toggleSidebar}
        actions={
          <button
            type="button"
            className="admin-btn"
            onClick={() => loadMovies(statusFilter)}
            disabled={loading}
          >
            {loading ? "Refreshing…" : <><AppIcon name="refresh" size={16} /> Refresh</>}
          </button>
        }
      />

      <div className="admin-content">
        {banner && (
          <AdminBanner tone={banner.tone} message={banner.message} onDismiss={() => setBanner(null)} />
        )}

        
        <section className="admin-panel" data-panel="external-search" aria-label="Search external movie provider">
          <div className="admin-panel-head">
            <div>
              <h2 className="admin-panel-title">Add a Movie</h2>
              <p className="admin-panel-sub">
                Search the external catalogue, then import the title into our cinema.
              </p>
            </div>
          </div>

          <form className="admin-search-form" onSubmit={handleSearch}>
            <div className="admin-field admin-field--grow">
              <label htmlFor="external-search-input">Movie title</label>
              <input
                id="external-search-input"
                type="text"
                className="admin-input"
                placeholder="e.g. Avatar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={searching}
              />
            </div>
            <button type="submit" className="admin-btn admin-btn--primary" disabled={searching}>
              {searching ? "Searching…" : "Search Provider"}
            </button>
          </form>

          {searching && <AdminLoading>Searching the movie provider…</AdminLoading>}
          {!searching && searchError && <AdminSectionError message={searchError} />}

          {!searching && !searchError && searchResults && searchResults.length === 0 && (
            <AdminEmpty>
              No results found for “{searchTerm.trim()}”. Try a different title.
            </AdminEmpty>
          )}

          {!searching && searchResults && searchResults.length > 0 && (
            <div className="admin-search-results" data-results-count={searchResults.length}>
              {searchResults.map((result) => (
                <MovieSearchResult
                  key={result.externalMovieId || result.title}
                  result={result}
                  onAdd={handleAdd}
                  adding={addingId === result.externalMovieId}
                  disabled={addingId !== null}
                  isAlreadyAdded={catalogueExternalIds.has(String(result.externalMovieId))}
                />
              ))}
            </div>
          )}
        </section>

        
        <section className="admin-panel admin-panel--wide" data-panel="movie-catalogue" aria-label="Cinema catalogue">
          <div className="admin-panel-head">
            <div>
              <h2 className="admin-panel-title">Cinema Catalogue</h2>
              <p className="admin-panel-sub">
                {loading ? "Loading movies…" : `${movies.length} ${movies.length === 1 ? "movie" : "movies"} shown.`}
              </p>
            </div>

            <div className="admin-segmented" role="group" aria-label="Filter movies by status">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.id || "all"}
                  type="button"
                  className={`admin-segmented-btn ${statusFilter === f.id ? "active" : ""}`}
                  onClick={() => setStatusFilter(f.id)}
                  aria-pressed={statusFilter === f.id}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-filter-bar" data-panel="catalogue-search">
            <div className="admin-field admin-field--grow">
              <label htmlFor="catalogue-title-search">Search catalogue</label>
              <input
                id="catalogue-title-search"
                type="search"
                className="admin-input"
                placeholder="Filter existing movies by title"
                value={titleQuery}
                onChange={(e) => setTitleQuery(e.target.value)}
              />
            </div>
          </div>

          {loading && <AdminLoading>Loading movies…</AdminLoading>}
          {!loading && listError && <AdminSectionError message={listError} onRetry={() => loadMovies(statusFilter)} />}
          {!loading && !listError && movies.length === 0 && (
            <AdminEmpty>
              No movies {statusFilter ? "with this status" : "in the catalogue yet"}. Use the search above to add one.
            </AdminEmpty>
          )}
          {!loading && !listError && movies.length > 0 && visibleMovies.length === 0 && (
            <AdminEmpty>No movies match “{titleQuery.trim()}”.</AdminEmpty>
          )}

          {!loading && !listError && visibleMovies.length > 0 && (
            <div className="admin-movie-grid">
              {visibleMovies.map((movie) => (
                <AdminMovieCard
                  key={movie._id}
                  movie={movie}
                  disabled={busyMovieId !== null}
                  saving={busyMovieId === movie._id && busyAction === "status"}
                  deleting={busyMovieId === movie._id && busyAction === "delete"}
                  onSaveStatus={handleSaveStatus}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminMoviesPage
