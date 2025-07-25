"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase, isDemoMode } from "@/lib/supabase"
import { signInWithPassword, signOut as authSignOut, getCurrentUser, type AuthUser } from "@/lib/auth"

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInDemo: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user for demo mode
const mockUser: AuthUser = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "demo@pms.com",
  full_name: "Demo User",
  role: "admin",
  is_active: true,
  last_login: new Date().toISOString(),
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isDemoMode) {
          // In demo mode, check localStorage for demo session
          const demoSession = localStorage.getItem("demo-session")
          if (demoSession === "active") {
            setUser(mockUser)
          }
          setLoading(false)
          return
        }

        // Real Supabase authentication
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        setLoading(false)
      } catch (error) {
        console.error("Auth initialization error:", error)
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id)
      
      if (event === "SIGNED_IN" && session?.user) {
        try {
          const currentUser = await getCurrentUser()
          setUser(currentUser)
          setError(null)
        } catch (error) {
          console.error("Error getting current user:", error)
          setError("Error loading user data")
        }
      } else if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        if (event === "SIGNED_OUT") {
          setUser(null)
          setError(null)
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          try {
            const currentUser = await getCurrentUser()
            setUser(currentUser)
            setError(null)
          } catch (error) {
            console.error("Error refreshing user data:", error)
            // If token refresh fails, sign out user
            setUser(null)
            setError("Session expired. Please login again.")
          }
        }
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      if (isDemoMode) {
        // Demo mode authentication
        if (email === "demo@pms.com" && password === "demo123456") {
          localStorage.setItem("demo-session", "active")
          setUser(mockUser)
          return
        } else {
          throw new Error("Credenciales de demo inválidas")
        }
      }

      // Real authentication with Supabase
      const authUser = await signInWithPassword({ email, password })
      setUser(authUser)
    } catch (error) {
      console.error("Sign in error:", error)
      const errorMessage = error instanceof Error ? error.message : "Error de autenticación"
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)

      if (isDemoMode) {
        localStorage.removeItem("demo-session")
        setUser(null)
        return
      }

      await authSignOut()
      setUser(null)
    } catch (error) {
      console.error("Sign out error:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al cerrar sesión"
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signInDemo = async () => {
    try {
      setLoading(true)
      setError(null)

      if (isDemoMode) {
        localStorage.setItem("demo-session", "active")
        setUser(mockUser)
        return
      }

      // Try to sign in with demo credentials in real Supabase
      await signIn("demo@pms.com", "demo123456")
    } catch (error) {
      console.error("Demo sign in error:", error)
      const errorMessage = error instanceof Error ? error.message : "Error con el login de demo"
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    signInDemo,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
