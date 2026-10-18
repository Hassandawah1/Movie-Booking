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
  
  
  
  const [authError, setAuthError] = useState(false)

  const isAuthenticated = !!user
  const isSuperAdmin = user?.role === "super-admin"
  const isAdmin = user?.role === "admin" || isSuperAdmin

  
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
      
      if (err.response?.status === 401) {
        setAuthError(false)
        clearAuth()
        return null
      }

      
      
      if (err.response) {
        setAuthError(true)
        return null
      }

      
      
      setAuthError(true)
      return null
    } finally {
      setLoading(false)
    }
  }, [clearAuth])

  
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  
  const register = async ({ name, email, password }) => {
    const response = await api.post("/users/register", { name, email, password })
    const data = response.data

    if (data?.token) {
      saveToken(data.token)
      setUser(data.user)
    }

    return data
  }

  
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
        isSuperAdmin,
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
