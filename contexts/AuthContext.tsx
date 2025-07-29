"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase, isDemoMode, clearExpiredTokens } from "@/lib/supabase"
import {
  AuthUser,
  signInWithPassword,
  signOut as signOutApi,
  getCurrentUser,
  getUserProfile,
  LoginCredentials,
} from "@/lib/auth"

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
    // Set initial loading to true
    setLoading(true)

    // onAuthStateChange handles everything: initial session, sign in, sign out, token refresh
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("=== AUTH STATE CHANGE ===", { event, session })

      // Handle specific events
      if (event === "TOKEN_REFRESHED") {
        console.log("Token refresh event:", { session })
        
        // If token refresh failed (session is null), sign out completely
        if (!session) {
          console.log("Token refresh failed, signing out...")
          // Use setTimeout to avoid deadlock - move async call outside callback
          setTimeout(async () => {
            await clearExpiredTokens()
          }, 0)
          setUser(null)
          setLoading(false)
          return
        }
      }

      if (event === "SIGNED_OUT") {
        console.log("User signed out")
        setUser(null)
        setLoading(false)
        return
      }

      // For INITIAL_SESSION, SIGNED_IN, and successful TOKEN_REFRESHED
      if (session?.user) {
        console.log("Valid session found, getting user profile...")
        
        // Use setTimeout to avoid deadlock - move async call outside callback
        setTimeout(async () => {
          try {
            const userProfile = await getUserProfile(session.user.id)
            
            console.log("AuthContext: User profile result:", userProfile ? "success" : "failed")
            setUser(userProfile)
          } catch (profileError) {
            console.error("AuthContext: Error getting user profile:", profileError)
            setUser(null)
          } finally {
            setLoading(false)
          }
        }, 0)
      } else {
        console.log("No valid session")
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
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

      await signOutApi()
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
