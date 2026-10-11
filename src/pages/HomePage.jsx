import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import MovieSection from "../components/movies/MovieSection"
import AppIcon from "../components/ui/AppIcon"
import { getMoviesByStatus } from "../services/movie.service"

const HOME_LIMIT = 6

const HomePage = () => {
  const [nowShowing, setNowShowing] = useState([])
  const [comingSoon, setComingSoon] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let isMounted = true

    const loadHomeMovies = async () => {
      setLoading(true)
      setError("")

      try {
        const [nowRes, comingRes] = await Promise.allSettled([
          getMoviesByStatus("now-showing"),
          getMoviesByStatus("coming-soon")
        ])

        if (!isMounted) return

        if (nowRes.status === "fulfilled" && nowRes.value?.success) {
          setNowShowing(nowRes.value.movies || [])
        }

        if (comingRes.status === "fulfilled" && comingRes.value?.success) {
          setComingSoon(comingRes.value.movies || [])
        }

        if (nowRes.status === "rejected" && comingRes.status === "rejected") {
          setError("Unable to load movies right now. Please check your connection.")
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load movie catalogue.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadHomeMovies()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="page-wrapper">
      
      <section className="hero-section">
        <div className="container hero-container text-center">
          <h1 className="hero-title">
            Immerse Yourself in the<br />
            <span className="hero-title-accent">Magic of Cinema</span>
          </h1>
          <p className="hero-subtitle">
            Experience the latest blockbusters in stunning IMAX and VIP sound.
            Pick your favorite seats, book in seconds, and enjoy the show.
          </p>
          <div className="hero-actions">
            <Link to="/movies" className="btn-primary-grad hero-cta">
              Browse All Movies
            </Link>
          </div>
        </div>
      </section>

      
      <div className="container py-5">
        {error && (
          <div className="alert-error mb-4">
            <AppIcon name="alert" size={16} /> {error}
          </div>
        )}

        
        <MovieSection
          title="Now Showing"
          subtitle="Catch these blockbusters in theatres today"
          movies={nowShowing.slice(0, HOME_LIMIT)}
          viewAllLink={nowShowing.length > HOME_LIMIT ? "/movies?status=now-showing" : "/movies"}
          viewAllText="View All Now Showing"
          emptyMessage="No movies are currently showing. Check back soon for new releases!"
          loading={loading}
        />

        
        <MovieSection
          title="Coming Soon"
          subtitle="Upcoming titles hitting the big screen soon"
          movies={comingSoon.slice(0, HOME_LIMIT)}
          viewAllLink={comingSoon.length > HOME_LIMIT ? "/movies?status=coming-soon" : "/movies"}
          viewAllText="View All Coming Soon"
          emptyMessage="No upcoming movies scheduled at the moment."
          loading={loading}
        />

        
        <section className="perks-section mt-5 pt-4">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="perk-card">
                <div className="perk-icon"><AppIcon name="popcorn" size={28} /></div>
                <h3 className="perk-title">Instant Digital Booking</h3>
                <p className="perk-desc">
                  Select your screen and favorite seats online with zero hassle and instant confirmation.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="perk-card">
                <div className="perk-icon"><AppIcon name="volume" size={28} /></div>
                <h3 className="perk-title">Dolby Atmos & IMAX</h3>
                <p className="perk-desc">
                  State-of-the-art laser projection and multi-dimensional surround audio in every auditorium.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="perk-card">
                <div className="perk-icon"><AppIcon name="creditCard" size={28} /></div>
                <h3 className="perk-title">Secure Seamless Payment</h3>
                <p className="perk-desc">
                  Fast, encrypted transactions via Paystack supporting cards, bank transfer, and USSD.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default HomePage
