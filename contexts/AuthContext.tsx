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
        console.log("Initializing auth, isDemoMode:", isDemoMode)
        
        if (isDemoMode) {
          // In demo mode, check localStorage for demo session
          const demoSession = localStorage.getItem("demo-session")
          console.log("Demo session found:", demoSession)
          if (demoSession === "active") {
            setUser(mockUser)
          }
          setLoading(false)
          return
        }

        // Real Supabase authentication - check session first
        const { data: { session } } = await supabase.auth.getSession()
        console.log("Initial session check:", session?.user?.id)
        
        if (session?.user) {
          try {
            const currentUser = await getCurrentUser()
            setUser(currentUser)
          } catch (error) {
            console.error("Error getting current user on init:", error)
            setUser(null)
          }
        } else {
          setUser(null)
        }
        setLoading(false)
      } catch (error) {
        console.error("Auth initialization error:", error)
        setUser(null)
        setLoading(false)
      }
    }

    // Start initialization
    initializeAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("=== AUTH STATE CHANGE ===")
      console.log("Event:", event)
      console.log("Session user ID:", session?.user?.id)
      console.log("Current loading state:", loading)
      console.log("Current user state:", user?.email)
      
      if (event === "SIGNED_IN" && session?.user) {
        console.log("Processing SIGNED_IN event, user ID:", session.user.id)
        try {
          const currentUser = await getCurrentUser()
          console.log("Current user retrieved:", currentUser?.email)
          if (currentUser) {
            setUser(currentUser)
            setError(null)
            setLoading(false)
            console.log("Auth state updated: user set, loading false")
          } else {
            console.log("getCurrentUser returned null, setting user to null")
            setUser(null)
            setLoading(false)
          }
        } catch (error) {
          console.error("Error getting current user:", error)
          setError("Error loading user data")
          setUser(null)
          setLoading(false)
          console.log("Auth state updated: user null, loading false (error)")
        }
      } else if (event === "SIGNED_OUT") {
        console.log("Processing SIGNED_OUT event")
        setUser(null)
        setError(null)
        setLoading(false)
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        console.log("Processing TOKEN_REFRESHED event")
        try {
          const currentUser = await getCurrentUser()
          if (currentUser) {
            setUser(currentUser)
            setError(null)
            setLoading(false)
          } else {
            setUser(null)
            setLoading(false)
          }
        } catch (error) {
          console.error("Error refreshing user data:", error)
          setUser(null)
          setError("Session expired. Please login again.")
          setLoading(false)
        }
      }
      
      console.log("=== AUTH STATE CHANGE COMPLETED ===")
      console.log("Final loading state:", loading)
      console.log("Final user state:", user?.email)
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
