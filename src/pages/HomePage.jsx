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
  const [attempt, setAttempt] = useState(0)

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

        if (nowRes.status !== "fulfilled" || !nowRes.value?.success || comingRes.status !== "fulfilled" || !comingRes.value?.success) {
          setError("Some movies could not be loaded. Please try again.")
        }
      } catch {
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
  }, [attempt])

  const featured = nowShowing[0]

  return (
    <div className="page-wrapper">
      
      <section className="cinema-hero">
        <div className="container cinema-hero-layout">
          <div className="cinema-hero-copy">
            <p className="eyebrow"><AppIcon name="film" size={16} /> YOUR NEXT MOVIE NIGHT</p>
            <h1>Big screen.<br />Great stories.<br /><span>Your seat awaits.</span></h1>
            <p className="cinema-hero-description">Find your next watch, choose your seats, and make a night of it. The cinema starts here.</p>
            <div className="cinema-hero-actions">
              <Link to="/movies?status=now-showing" className="nav-primary">Find a movie <AppIcon name="arrowRight" size={18} /></Link>
              <Link to="/movies?status=coming-soon" className="hero-secondary">Coming soon <AppIcon name="calendar" size={18} /></Link>
            </div>
            <p className="hero-footnote"><AppIcon name="ticket" size={16} /> Pick a movie. Pick a seat. Enjoy the show.</p>
          </div>
          <div className="cinema-feature">
            <div className="cinema-feature-art" aria-hidden="true">
              {featured?.posterUrl ? <img src={featured.posterUrl} alt="" className="feature-poster" /> : <AppIcon name="clapperboard" size={96} strokeWidth={1} />}
            </div>
            <div className="cinema-feature-caption">
              <span className="eyebrow">{featured ? "IN THE SPOTLIGHT · NOW SHOWING" : "LESS PLANNING. MORE WATCHING."}</span>
              <h2>{featured ? featured.title : <>A little escape.<br />A bigger experience.</>}</h2>
              {featured ? <Link className="feature-link" to={`/movies/${featured._id}`}>Explore movie & showtimes <AppIcon name="arrowRight" size={16} /></Link> : <p>Your next favourite story is waiting on the big screen.</p>}
            </div>
          </div>
        </div>
      </section>

      <div className="container py-5">
        {error && (
          <div className="alert-error mb-4" role="alert">
            <AppIcon name="alert" size={16} /> {error}
            <button className="retry-button" onClick={() => setAttempt(value => value + 1)}>Try again</button>
          </div>
        )}

        
        <MovieSection
          title="Now Showing"
          subtitle="Catch these blockbusters in theatres today"
          movies={nowShowing.slice(0, HOME_LIMIT)}
          viewAllLink="/movies?status=now-showing"
          viewAllText="View All Now Showing"
          emptyMessage="No movies are currently showing. Check back soon for new releases!"
          loading={loading}
        />

        
        <MovieSection
          title="Coming Soon"
          subtitle="Upcoming titles hitting the big screen soon"
          movies={comingSoon.slice(0, HOME_LIMIT)}
          viewAllLink="/movies?status=coming-soon"
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
                <h3 className="perk-title">Choose your seats</h3>
                <p className="perk-desc">
                  See available seats and find your favourite spot before you arrive.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="perk-card">
                <div className="perk-icon"><AppIcon name="creditCard" size={28} /></div>
                <h3 className="perk-title">Pay your way</h3>
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
