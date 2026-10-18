import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import AppIcon from "../../components/ui/AppIcon"

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  
  const fromState = location.state?.from
  const from = typeof fromState === "string" ? fromState : fromState?.pathname || null

  const [form, setForm] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError("")
  }

  const validate = () => {
    if (!form.email.trim()) return "Email address is required"
    if (!form.password) return "Password is required"
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError("")

    try {
      const data = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password
      })

      
      if (from) {
        navigate(from, { replace: true })
      } else if (["admin", "super-admin"].includes(data?.user?.role)) {
        navigate("/admin", { replace: true })
      } else {
        navigate("/", { replace: true })
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response ? "Login failed. Please try again." : "Server unavailable. Check your connection.")
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        
        <div className="text-center mb-4">
          <div style={{ marginBottom: "0.5rem" }}><AppIcon name="film" size={40} /></div>
          <h1 style={{ fontSize: "1.6rem", marginBottom: "0.25rem" }}>Welcome Back</h1>
          <p style={{ color: "var(--color-muted)", fontSize: "0.875rem", margin: 0 }}>
            Sign in to your CineBook account
          </p>
        </div>

        
        {error && <div className="alert-error mb-3"><AppIcon name="alert" size={16} /> {error}</div>}

        
        <form onSubmit={handleSubmit} noValidate>
          
          <div className="mb-3">
            <label htmlFor="login-email" className="form-label">Email Address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              className="form-control"
              placeholder="hassan@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              autoFocus
              disabled={loading}
            />
          </div>

          
          <div className="mb-4">
            <label htmlFor="login-password" className="form-label">Password</label>
            <div className="password-wrapper">
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={loading}
                style={{ paddingRight: "2.5rem" }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                <AppIcon name={showPassword ? "eyeOff" : "eye"} size={18} />
              </button>
            </div>
          </div>

          
          <button type="submit" className="btn-primary-grad" disabled={loading}>
            {loading ? "Signing In…" : "Sign In"}
          </button>
        </form>

        
        <p className="text-center mt-3 mb-0" style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
          New to CineBook?{" "}
          <Link to="/register" style={{ color: "var(--color-primary-light)", fontWeight: 600 }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
