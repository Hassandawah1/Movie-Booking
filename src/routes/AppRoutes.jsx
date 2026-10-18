import { Routes, Route } from "react-router-dom"
import ProtectedRoute from "../components/auth/ProtectedRoute"


import HomePage from "../pages/HomePage"
import MoviesPage from "../pages/MoviesPage"
import MovieDetailsPage from "../pages/MovieDetailsPage"
import LoginPage from "../pages/auth/LoginPage"
import RegisterPage from "../pages/auth/RegisterPage"
import NotFoundPage from "../pages/NotFoundPage"


import ProfilePage from "../pages/user/ProfilePage"


import SeatSelectionPage from "../pages/booking/SeatSelectionPage"
import ReservationPage from "../pages/booking/ReservationPage"
import PaymentPage from "../pages/payment/PaymentPage"
import PaymentCallbackPage from "../pages/payment/PaymentCallbackPage"
import PaymentSuccessPage from "../pages/payment/PaymentSuccessPage"
import PaymentFailedPage from "../pages/payment/PaymentFailedPage"


import MyBookingsPage from "../pages/bookings/MyBookingsPage"
import BookingDetailsPage from "../pages/bookings/BookingDetailsPage"
import TicketPage from "../pages/bookings/TicketPage"
import VerifyTicketPage from "../pages/bookings/VerifyTicketPage"


import AdminLayout from "../components/admin/AdminLayout"
import AdminDashboardPage from "../pages/admin/AdminDashboardPage"
import AdminMoviesPage from "../pages/admin/AdminMoviesPage"
import AdminScreensPage from "../pages/admin/AdminScreensPage"
import AdminShowtimesPage from "../pages/admin/AdminShowtimesPage"
import AdminBookingsPage from "../pages/admin/AdminBookingsPage"
import AdminBookingDetailsPage from "../pages/admin/AdminBookingDetailsPage"
import AdminUsersPage from "../pages/admin/AdminUsersPage"
import AdminUserDetailsPage from "../pages/admin/AdminUserDetailsPage"

const AppRoutes = () => {
  return (
    <Routes>
      
      <Route path="/" element={<HomePage />} />
      <Route path="/movies" element={<MoviesPage />} />
      <Route path="/movies/:id" element={<MovieDetailsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/tickets/verify" element={<VerifyTicketPage />} />

      
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/:showtimeId/seats"
        element={
          <ProtectedRoute>
            <SeatSelectionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/:bookingId/reservation"
        element={
          <ProtectedRoute>
            <ReservationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/:bookingId/payment"
        element={
          <ProtectedRoute allowUnverifiedSession>
            <PaymentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/callback"
        element={
          <ProtectedRoute allowUnverifiedSession>
            <PaymentCallbackPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/:bookingId/success"
        element={
          <ProtectedRoute allowUnverifiedSession>
            <PaymentSuccessPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/failed"
        element={
          <ProtectedRoute allowUnverifiedSession>
            <PaymentFailedPage />
          </ProtectedRoute>
        }
      />

      
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <MyBookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/:bookingId"
        element={
          <ProtectedRoute>
            <BookingDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/:bookingId/ticket"
        element={
          <ProtectedRoute>
            <TicketPage />
          </ProtectedRoute>
        }
      />

      
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="movies" element={<AdminMoviesPage />} />
        <Route path="screens" element={<AdminScreensPage />} />
        <Route path="showtimes" element={<AdminShowtimesPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="bookings/:id" element={<AdminBookingDetailsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="users/:id" element={<AdminUserDetailsPage />} />
      </Route>

      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
