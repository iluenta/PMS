"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase, isDemoMode } from "@/lib/supabase"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInDemo: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user for demo mode
const mockUser: User = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "demo@pms.com",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: {
    full_name: "Demo User",
  },
} as User

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (isDemoMode) {
      // Demo mode authentication
      if (email === "demo@pms.com" && password === "demo123456") {
        localStorage.setItem("demo-session", "active")
        setUser(mockUser)
        return
      } else {
        throw new Error("Invalid demo credentials")
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem("demo-session")
      setUser(null)
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signInDemo = async () => {
    if (isDemoMode) {
      localStorage.setItem("demo-session", "active")
      setUser(mockUser)
      return
    }

    // Try to sign in with demo credentials in real Supabase
    try {
      await signIn("demo@pms.com", "demo123456")
    } catch (error) {
      // If demo user doesn't exist, create it
      const { error: signUpError } = await supabase.auth.signUp({
        email: "demo@pms.com",
        password: "demo123456",
      })
      if (!signUpError) {
        await signIn("demo@pms.com", "demo123456")
      } else {
        throw signUpError
      }
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    signInDemo,
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
