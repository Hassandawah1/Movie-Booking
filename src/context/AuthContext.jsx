import { createContext, useContext, useState, useEffect, useCallback } from "react"
import api from "../api/axios"
import {
  changePassword as changePasswordRequest,
  deleteAccount as deleteAccountRequest
} from "../services/user.service"

const AuthContext = createContext(null)

const TOKEN_KEY = "movieBookingToken"

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  // Set only when the session could not be checked because the server was
  // unreachable. Distinct from "no valid session", which must not be confused
  // with a temporary outage (e.g. returning from a Paystack payment).
  const [authError, setAuthError] = useState(false)

  const isAuthenticated = !!user
  const isAdmin = user?.role === "admin"

  // ── Persist token and attach to axios ──────────────────────────────────────
  const saveToken = (newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
  }

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setAuthError(false)
  }, [])

  // ── Fetch current user from backend /users/me ───────────────────────────────
  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (!storedToken || storedToken === "null" || storedToken === "undefined") {
      clearAuth()
      setLoading(false)
      return null
    }

    try {
      const response = await api.get("/users/me")
      if (response.data?.success && response.data?.user) {
        setUser(response.data.user)
        setToken(storedToken)
        setAuthError(false)
        return response.data.user
      } else {
        clearAuth()
        return null
      }
    } catch (err) {
      // 401 means the token really is invalid/expired → sign the user out.
      if (err.response?.status === 401) {
        setAuthError(false)
        clearAuth()
        return null
      }

      // Any other HTTP error is a server-side problem — the token may still be
      // valid, so keep it and flag that we could not verify the session.
      if (err.response) {
        setAuthError(true)
        return null
      }

      // No response at all = network/connection failure. Do NOT sign the user
      // out: they may be mid-payment and must still be able to verify it.
      setAuthError(true)
      return null
    } finally {
      setLoading(false)
    }
  }, [clearAuth])

  // ── Initialize: check token on app load ────────────────────────────────────
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  // ── Register ───────────────────────────────────────────────────────────────
  const register = async ({ name, email, password }) => {
    const response = await api.post("/users/register", { name, email, password })
    const data = response.data

    if (data?.token) {
      saveToken(data.token)
      setUser(data.user)
    }

    return data
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async ({ email, password }) => {
    const response = await api.post("/users/login", { email, password })
    const data = response.data

    if (data?.token) {
      saveToken(data.token)
      setUser(data.user)
    }

    return data
  }

  const updatePassword = async ({ currentPassword, newPassword }) => {
    const data = await changePasswordRequest({ currentPassword, newPassword })
    if (data?.token) saveToken(data.token)
    if (data?.user) setUser(data.user)
    return data
  }

  const deleteAccount = async ({ currentPassword, confirmation }) => {
    const data = await deleteAccountRequest({ currentPassword, confirmation })
    clearAuth()
    return data
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    clearAuth()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        loading,
        authError,
        login,
        logout,
        register,
        refreshUser,
        updatePassword,
        deleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default AuthContext
