import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import AppIcon from "../../components/ui/AppIcon"

const ProfilePage = () => {
  const { user, updatePassword, deleteAccount } = useAuth()
  const navigate = useNavigate()
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [deleteForm, setDeleteForm] = useState({
    currentPassword: "",
    confirmation: ""
  })
  const [passwordMessage, setPasswordMessage] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [deleteError, setDeleteError] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)

  if (!user) return null

  const handlePasswordChange = async (event) => {
    event.preventDefault()
    setPasswordMessage("")
    setPasswordError("")

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("The new passwords do not match.")
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })
      setPasswordMessage(response.message || "Password changed successfully.")
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      setPasswordError(error.response?.data?.message || "Unable to change your password right now.")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleAccountDelete = async (event) => {
    event.preventDefault()
    setDeleteError("")
    setIsDeletingAccount(true)
    try {
      await deleteAccount({
        currentPassword: deleteForm.currentPassword,
        confirmation: deleteForm.confirmation
      })
      navigate("/login", { replace: true })
    } catch (error) {
      setDeleteError(error.response?.data?.message || "Unable to delete your account right now.")
      setIsDeletingAccount(false)
    }
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="profile-card">
          
          <div className="text-center mb-4">
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
                fontWeight: 800,
                color: "var(--color-bg)",
                margin: "0 auto 1rem"
              }}
            >
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{user.name}</h1>
          </div>

          
          <div
            style={{
              background: "var(--color-card)",
              border: "1px solid rgba(var(--color-neutral-rgb), 0.16)",
              borderRadius: "10px",
              overflow: "hidden"
            }}
          >
            {[
              { label: "Full Name", value: user.name, icon: "user" },
              { label: "Email Address", value: user.email, icon: "mail" }
            ].map((item, i, arr) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.5rem",
                  borderBottom: i < arr.length - 1 ? "1px solid rgba(var(--color-neutral-rgb), 0.12)" : "none"
                }}
              >
                <span style={{ width: "28px", textAlign: "center" }}>
                  <AppIcon name={item.icon} size={20} />
                </span>
                <div>
                  <p style={{ color: "var(--color-muted)", fontSize: "0.75rem", margin: 0, fontWeight: 500 }}>
                    {item.label}
                  </p>
                  <p style={{ color: "var(--color-text)", fontSize: "0.95rem", margin: 0, fontWeight: 600 }}>
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <section className="profile-security-section" aria-labelledby="change-password-title">
            <h2 id="change-password-title" className="h5 mb-3">
              <AppIcon name="key" size={19} /> Change Password
            </h2>
            <form onSubmit={handlePasswordChange}>
              <label className="form-label" htmlFor="current-password">Current password</label>
              <input
                id="current-password"
                className="form-control mb-3"
                type="password"
                autoComplete="current-password"
                required
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
              />
              <label className="form-label" htmlFor="new-password">New password</label>
              <input
                id="new-password"
                className="form-control mb-3"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
              />
              <label className="form-label" htmlFor="confirm-password">Confirm new password</label>
              <input
                id="confirm-password"
                className="form-control mb-3"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
              />
              {passwordError && <p className="profile-form-error" role="alert">{passwordError}</p>}
              {passwordMessage && <p className="profile-form-success" role="status">{passwordMessage}</p>}
              <button className="btn btn-primary" type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? "Updating…" : "Update Password"}
              </button>
            </form>
          </section>

          <section className="profile-danger-section" aria-labelledby="delete-account-title">
            <h2 id="delete-account-title" className="h5 mb-2">Delete Account</h2>
            <p className="profile-danger-note">
              This removes your personal account details and signs you out. Existing booking and payment
              records are retained without your personal details. Active reservations must be cancelled
              or expire first.
            </p>
            <form onSubmit={handleAccountDelete}>
              <label className="form-label" htmlFor="delete-current-password">Current password</label>
              <input
                id="delete-current-password"
                className="form-control mb-3"
                type="password"
                autoComplete="current-password"
                required
                value={deleteForm.currentPassword}
                onChange={(event) => setDeleteForm({ ...deleteForm, currentPassword: event.target.value })}
              />
              <label className="form-label" htmlFor="delete-confirmation">Type DELETE to confirm</label>
              <input
                id="delete-confirmation"
                className="form-control mb-3"
                type="text"
                autoComplete="off"
                required
                value={deleteForm.confirmation}
                onChange={(event) => setDeleteForm({ ...deleteForm, confirmation: event.target.value })}
              />
              {deleteError && <p className="profile-form-error" role="alert">{deleteError}</p>}
              <button
                className="btn profile-delete-button"
                type="submit"
                disabled={isDeletingAccount || deleteForm.confirmation !== "DELETE"}
              >
                <AppIcon name="trash" size={16} />
                {isDeletingAccount ? "Deleting Account…" : "Delete My Account"}
              </button>
            </form>
          </section>

        </div>
      </div>
    </div>
  )
}

export default ProfilePage
