"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase, clearExpiredTokens } from "@/lib/supabase"
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
  onTenantChange?: (tenantId: number | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// demo mode removed

export function AuthProvider({ children, onTenantChange }: { children: React.ReactNode, onTenantChange?: (tenantId: number | null) => void }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("=== AUTH STATE CHANGE ===", { event, session })

      if (event === "TOKEN_REFRESHED") {
        if (!session) {
          console.log("Token refresh failed, signing out...")
          setTimeout(async () => {
            await clearExpiredTokens()
            onTenantChange?.(null)
          }, 0)
          setUser(null)
          setLoading(false)
          return
        }
      }

      if (event === "SIGNED_OUT") {
        console.log("User signed out")
        setUser(null)
        onTenantChange?.(null)
        setLoading(false)
        return
      }

      if (session?.user) {
        console.log("Valid session found, getting user profile...")
        
        try {
          const userProfile = await getUserProfile(session.user.id)
          console.log("AuthContext: User profile result:", userProfile ? "success" : "failed")
          
          if (userProfile) {
            setUser(userProfile)
            // Notify about tenant change if tenant_id is available
            if (userProfile.tenant_id) {
              onTenantChange?.(userProfile.tenant_id)
            } else {
              onTenantChange?.(null)
            }
          } else {
            setUser(null)
            onTenantChange?.(null)
          }
        } catch (error) {
          console.error("AuthContext: Error in auth state change:", error)
          setUser(null)
          onTenantChange?.(null)
        } finally {
          setLoading(false)
        }
      } else {
        console.log("No valid session")
        setUser(null)
        onTenantChange?.(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, []) // Removed onTenantChange dependency to prevent infinite loop

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const user = await signInWithPassword({ email, password })
      setUser(user)
      
      // Notify about tenant change if tenant_id is available
      if (user.tenant_id) {
        onTenantChange?.(user.tenant_id)
      }
      
    } catch (err) {
      const error = err as Error
      console.error("Sign in error:", error)
      setError(error.message || "Failed to sign in")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await signOutApi()
      setUser(null)
      onTenantChange?.(null)
    } catch (error) {
      console.error("Sign out error:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signInDemo = async () => {
    try {
      setLoading(true)
      setError(null)

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
    onTenantChange,
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
