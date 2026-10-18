import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import AppIcon from "../../components/ui/AppIcon"

const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError("")
  }

  const validate = () => {
    if (!form.name.trim()) return "Full name is required"
    if (Array.from(form.name.trim()).length < 3) return "Name must be at least 3 characters"
    if (!/^[\p{L}\p{M}]+(?:[ '\u2019.-][\p{L}\p{M}]+)*$/u.test(form.name.trim())) {
      return "Name can only contain letters, spaces, hyphens, apostrophes, and periods"
    }
    if (!form.email.trim()) return "Email address is required"
    if (!/^[A-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,63}$/i.test(form.email.trim())) {
      return "Please enter a valid email address"
    }
    if (!form.password) return "Password is required"
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}$/.test(form.password)) {
      return "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
    }
    if (form.password !== form.confirmPassword) return "Passwords do not match"
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
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      })
      navigate("/")
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response ? "Registration failed. Please try again." : "Server unavailable. Check your connection.")
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
          <h1 style={{ fontSize: "1.6rem", marginBottom: "0.25rem" }}>Create Account</h1>
          <p style={{ color: "var(--color-muted)", fontSize: "0.875rem", margin: 0 }}>
            Join CineBook to start booking tickets
          </p>
        </div>

        
        {error && <div className="alert-error mb-3"><AppIcon name="alert" size={16} /> {error}</div>}

        
        <form onSubmit={handleSubmit} noValidate>
          
          <div className="mb-3">
            <label htmlFor="reg-name" className="form-label">Full Name</label>
            <input
              id="reg-name"
              name="name"
              type="text"
              className="form-control"
              placeholder="e.g. Hassan Abdulfatai"
              value={form.name}
              onChange={handleChange}
              minLength={3}
              autoComplete="name"
              disabled={loading}
            />
          </div>

          
          <div className="mb-3">
            <label htmlFor="reg-email" className="form-label">Email Address</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className="form-control"
              placeholder="hassan@gmail.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          
          <div className="mb-3">
            <label htmlFor="reg-password" className="form-label">Password</label>
            <div className="password-wrapper">
              <input
                id="reg-password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="8+ characters, upper/lowercase, number, special character"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,}"
                autoComplete="new-password"
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

          
          <div className="mb-4">
            <label htmlFor="reg-confirm" className="form-label">Confirm Password</label>
            <div className="password-wrapper">
              <input
                id="reg-confirm"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                className="form-control"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
                style={{ paddingRight: "2.5rem" }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                <AppIcon name={showConfirm ? "eyeOff" : "eye"} size={18} />
              </button>
            </div>
          </div>

          
          <button type="submit" className="btn-primary-grad" disabled={loading}>
            {loading ? "Creating Account…" : "Create Account"}
          </button>
        </form>

        
        <p className="text-center mt-3 mb-0" style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--color-primary-light)", fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
