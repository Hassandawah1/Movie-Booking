import { Link } from "react-router-dom"
import AppIcon from "../components/ui/AppIcon"

const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem"
      }}
    >
      <div style={{ marginBottom: "1rem" }}><AppIcon name="film" size={72} /></div>
      <h1
        style={{
          fontSize: "4rem",
          fontWeight: 900,
          color: "#ffd43b",
          marginBottom: "0.5rem"
        }}
      >
        404
      </h1>
      <h2 style={{ color: "#f5f5f5", fontSize: "1.3rem", marginBottom: "0.75rem" }}>
        Page Not Found
      </h2>
      <p style={{ color: "var(--color-muted)", maxWidth: "400px", marginBottom: "2rem" }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        style={{
          background: "#ffd43b",
          color: "#111213",
          padding: "0.65rem 2rem",
          borderRadius: "30px",
          fontWeight: 700,
          textDecoration: "none"
        }}
      >
        Back to Home
      </Link>
    </div>
  )
}

export default NotFoundPage
