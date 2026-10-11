import { useState, useCallback, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import AdminHeader from "../../components/admin/AdminHeader"
import StatCard from "../../components/admin/StatCard"
import RevenueTrend from "../../components/admin/RevenueTrend"
import RevenueDateRange from "../../components/admin/RevenueDateRange"
import BookingStatusSummary from "../../components/admin/BookingStatusSummary"
import PaymentStatusSummary from "../../components/admin/PaymentStatusSummary"
import RecentBookingsTable from "../../components/admin/RecentBookingsTable"
import UpcomingShowtimesTable from "../../components/admin/UpcomingShowtimesTable"
import TopMoviesTable from "../../components/admin/TopMoviesTable"
import useAdminData from "../../hooks/useAdminData"
import AppIcon from "../../components/ui/AppIcon"
import { formatCurrency } from "../../utils/formatters"
import {
  getDashboardSummary,
  getRevenueTrend,
  getTopMovies,
  getBookingAnalytics,
  getPaymentAnalytics,
  getRecentBookings,
  getUpcomingShowtimes,
  getRevenueAnalytics
} from "../../services/admin.service"

/**
 * AdminDashboardPage — /admin
 *
 * Read-only operations overview. Each section owns its request and its error
 * state, so one failing endpoint never blanks the whole dashboard.
 */
const AdminDashboardPage = () => {
  const outletContext = useOutletContext()

  // Controls that feed the parameterised endpoints
  const [trendPeriod, setTrendPeriod] = useState("7d")
  const [topSort, setTopSort] = useState("revenue")
  const [revenueRange, setRevenueRange] = useState(() => {
    // Local calendar dates (not toISOString) so the default range matches the
    // admin's actual today/month in any timezone.
    const localDate = (date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

    const start = new Date()
    start.setDate(1)
    return { startDate: localDate(start), endDate: localDate(new Date()) }
  })

  // Bumping this re-runs every section's request declaratively.
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  // One hook per endpoint → independent loading/error handling
  const summary = useAdminData(getDashboardSummary, [], refreshKey)
  const trend = useAdminData(getRevenueTrend, [trendPeriod], refreshKey)
  const topMovies = useAdminData(getTopMovies, [topSort, 10], refreshKey)
  const bookingStats = useAdminData(getBookingAnalytics, [], refreshKey)
  const paymentStats = useAdminData(getPaymentAnalytics, [], refreshKey)
  const recent = useAdminData(getRecentBookings, [10], refreshKey)
  const upcoming = useAdminData(getUpcomingShowtimes, [10], refreshKey)
  const rangeRevenue = useAdminData(getRevenueAnalytics, [revenueRange], refreshKey)

  const refreshAll = useCallback(() => {
    setRefreshing(true)
    setRefreshKey((key) => key + 1)
  }, [])

  // Clear the refreshing flag once every section has settled.
  useEffect(() => {
    if (!refreshing) return
    const stillLoading =
      summary.loading ||
      trend.loading ||
      topMovies.loading ||
      bookingStats.loading ||
      paymentStats.loading ||
      recent.loading ||
      upcoming.loading ||
      rangeRevenue.loading

    if (!stillLoading) setRefreshing(false)
  }, [
    refreshing,
    summary.loading,
    trend.loading,
    topMovies.loading,
    bookingStats.loading,
    paymentStats.loading,
    recent.loading,
    upcoming.loading,
    rangeRevenue.loading
  ])

  const handleRangeApply = useCallback((range) => setRevenueRange(range), [])

  const s = summary.data?.summary

  return (
    <div className="admin-page">
      <AdminHeader
        title="Dashboard"
        subtitle="Cinema operations and performance overview"
        sidebarOpen={outletContext?.sidebarOpen}
        onToggleSidebar={outletContext?.toggleSidebar}
        actions={
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={refreshAll}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing…" : <><AppIcon name="refresh" size={16} /> Refresh</>}
          </button>
        }
      />

      <div className="admin-content">
        {/* ── Summary ──────────────────────────────────────────────────────── */}
        {summary.loading && (
          <section className="admin-panel admin-panel--wide" data-panel="summary" aria-label="Dashboard summary">
            <p className="admin-loading">Loading dashboard…</p>
            <div className="admin-skeleton-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div className="admin-skeleton-card" key={i} />
              ))}
            </div>
          </section>
        )}

        {!summary.loading && summary.error && (
          <section className="admin-panel admin-panel--wide" data-panel="summary" aria-label="Dashboard summary">
            <p className="admin-section-error"><AppIcon name="alert" size={16} /> {summary.error}</p>
            <button type="button" className="admin-link-btn" onClick={summary.refetch}>
              <AppIcon name="refresh" size={16} /> Retry
            </button>
          </section>
        )}

        {!summary.loading && !summary.error && s && (
          <section className="admin-stat-grid" data-panel="summary" aria-label="Key metrics">
            <StatCard label="Total Users" value={s.users?.total ?? 0} icon="users" />
            <StatCard
              label="Movies Showing"
              value={s.movies?.nowShowing ?? 0}
              hint={`${s.movies?.total ?? 0} in catalogue`}
              icon="film"
              tone="accent"
            />
            <StatCard label="Upcoming Showtimes" value={s.showtimes?.upcoming ?? 0} icon="clock" />
            <StatCard label="Total Bookings" value={s.bookings?.total ?? 0} icon="ticket" />
            <StatCard
              label="Confirmed Bookings"
              value={s.bookings?.confirmed ?? 0}
              icon="circleCheck"
              tone="success"
            />
            <StatCard
              label="Pending Payments"
              value={s.bookings?.pendingPayment ?? 0}
              icon="timer"
              tone="warning"
            />
            <StatCard
              label="Total Revenue"
              value={formatCurrency(s.revenue?.total ?? 0)}
              icon="naira"
              tone="success"
            />
            <StatCard
              label="Today's Revenue"
              value={formatCurrency(s.revenue?.today ?? 0)}
              icon="trending"
              tone="accent"
            />
          </section>
        )}

        {/* ── Revenue ──────────────────────────────────────────────────────── */}
        <div className="admin-grid-2">
          <RevenueTrend
            data={trend.data?.data}
            loading={trend.loading}
            error={trend.error}
            period={trendPeriod}
            onPeriodChange={setTrendPeriod}
            onRetry={trend.refetch}
          />

          <RevenueDateRange
            range={revenueRange}
            data={rangeRevenue.data?.analytics}
            loading={rangeRevenue.loading}
            error={rangeRevenue.error}
            onApply={handleRangeApply}
            onRetry={rangeRevenue.refetch}
          />
        </div>

        {/* ── Status breakdowns ────────────────────────────────────────────── */}
        <div className="admin-grid-2">
          <BookingStatusSummary
            data={bookingStats.data?.data}
            loading={bookingStats.loading}
            error={bookingStats.error}
            onRetry={bookingStats.refetch}
          />
          <PaymentStatusSummary
            data={paymentStats.data?.data}
            loading={paymentStats.loading}
            error={paymentStats.error}
            onRetry={paymentStats.refetch}
          />
        </div>

        {/* ── Top movies ───────────────────────────────────────────────────── */}
        <TopMoviesTable
          movies={topMovies.data?.movies}
          loading={topMovies.loading}
          error={topMovies.error}
          sortBy={topSort}
          onSortChange={setTopSort}
          onRetry={topMovies.refetch}
        />

        {/* ── Tables ───────────────────────────────────────────────────────── */}
        <RecentBookingsTable
          bookings={recent.data?.bookings}
          loading={recent.loading}
          error={recent.error}
          onRetry={recent.refetch}
        />

        <UpcomingShowtimesTable
          showtimes={upcoming.data?.showtimes}
          loading={upcoming.loading}
          error={upcoming.error}
          onRetry={upcoming.refetch}
        />
      </div>
    </div>
  )
}

export default AdminDashboardPage
