"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  id: string
  username: string
  full_name: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  sendOtp: (email: string, username: string) => Promise<void>
  register: (email: string, username: string, password: string, full_name: string, otp: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("auth_token")
    const savedUser = localStorage.getItem("auth_user")

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) throw new Error("Login failed")

      const { token, user } = await response.json()
      setToken(token)
      setUser(user)
      localStorage.setItem("auth_token", token)
      localStorage.setItem("auth_user", JSON.stringify(user))
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const sendOtp = async (email: string, username: string) => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username }),
    })

    // FIX: Read the error message from the backend before throwing
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send OTP");
    }
  } catch (error) {
    console.error("Send OTP error:", error)
    throw error
  }
}

  const register = async (email: string, username: string, password: string, full_name: string, otp: string) => {
  try {
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password, full_name, otp }),
    })

    // FIX: Read the backend error message
    if (!response.ok) {
      const errorData = await response.json();
      // If validation failed, it usually comes as { details: ["Password too short"] } or { error: "..." }
      const errorMessage = errorData.details ? errorData.details[0] : errorData.error;
      throw new Error(errorMessage || "Registration failed");
    }

    const { token, user } = await response.json()
    setToken(token)
    setUser(user)
    localStorage.setItem("auth_token", token)
    localStorage.setItem("auth_user", JSON.stringify(user))
  } catch (error) {
    console.error("Register error:", error)
    throw error
  }
}

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, sendOtp, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
