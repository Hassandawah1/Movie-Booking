import AppIcon from "../ui/AppIcon"

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        background: "var(--color-surface)",
        borderTop: "1px solid rgba(var(--color-neutral-rgb), 0.16)",
        padding: "1.5rem 0",
        marginTop: "auto"
      }}
    >
      <div className="container text-center">
        <p style={{ color: "var(--color-muted)", fontSize: "0.85rem", margin: 0 }}>
          <span style={{ color: "var(--color-primary-light)", fontWeight: 600 }}>
            <AppIcon name="film" size={15} style={{ verticalAlign: "text-bottom", marginRight: "0.35rem" }} />
            CineBook
          </span>
          {" "}— Your Premium Movie Booking Experience
        </p>
        <p style={{ color: "var(--color-muted)", fontSize: "0.75rem", marginTop: "0.25rem", marginBottom: 0 }}>
          © {year} CineBook. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
