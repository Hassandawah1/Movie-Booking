import { BrowserRouter, useLocation } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Navbar from "./components/layout/Navbar"
import Footer from "./components/layout/Footer"
import AppRoutes from "./routes/AppRoutes"


const Shell = () => {
  const { pathname } = useLocation()
  const isAdminArea = pathname === "/admin" || pathname.startsWith("/admin/")

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {!isAdminArea && <Navbar />}
      <main id="main-content" tabIndex={-1} style={{ flex: 1 }}>
        <AppRoutes />
      </main>
      {!isAdminArea && <Footer />}
    </div>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
