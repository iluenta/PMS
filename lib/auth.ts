import { supabase, isDemoMode } from "./supabase"
import type { User } from "./supabase"

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: "admin" | "manager" | "operator" | "viewer"
  is_active: boolean
  last_login?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthError {
  message: string
  code?: string
}

/**
 * Authenticate user with email and password
 * Validates against Supabase auth and users table
 */
export async function signInWithPassword(credentials: LoginCredentials): Promise<AuthUser> {
  try {
    // First, authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error("Authentication failed")
    }

    // Then, get user data from the users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (userError) {
      throw new Error("User not found in database")
    }

    if (!userData) {
      throw new Error("User not found")
    }

    if (!userData.is_active) {
      throw new Error("User account is deactivated")
    }

    // Update last_login timestamp
    await supabase
      .from("users")
      .update({ last_login: new Date().toISOString() })
      .eq("id", userData.id)

    return {
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
      is_active: userData.is_active,
      last_login: userData.last_login,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    throw error
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  } catch (error) {
    console.error("Sign out error:", error)
    throw error
  }
}

/**
 * Get current authenticated user from users table
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    console.log("getCurrentUser: Starting...")
    
    // Add timeout for getSession specifically
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.log("getCurrentUser: Session timeout reached")
        resolve(null)
      }, 5000) // 5 second timeout for session
    })

    console.log("getCurrentUser: Getting session with timeout...")
    const sessionResult = await Promise.race([sessionPromise, timeoutPromise])
    
    if (!sessionResult) {
      console.log("getCurrentUser: Session timeout - returning null")
      return null
    }

    const { data: { session }, error: sessionError } = sessionResult
    console.log("getCurrentUser: Session result:", { session: !!session, error: sessionError?.message })
    
    if (sessionError || !session) {
      console.log("getCurrentUser: No valid session found:", sessionError?.message)
      return null
    }

    console.log("getCurrentUser: Session found, user ID:", session.user?.id)

    // Add timeout for getUser specifically
    const userPromise = supabase.auth.getUser()
    const userTimeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.log("getCurrentUser: Auth user timeout reached")
        resolve(null)
      }, 5000) // 5 second timeout for auth user
    })

    console.log("getCurrentUser: Getting auth user with timeout...")
    const userResult = await Promise.race([userPromise, userTimeoutPromise])
    
    if (!userResult) {
      console.log("getCurrentUser: Auth user timeout - returning null")
      return null
    }

    const { data: { user: authUser }, error: authError } = userResult
    console.log("getCurrentUser: Auth user result:", { user: !!authUser, error: authError?.message })
    
    if (authError || !authUser) {
      console.log("getCurrentUser: No authenticated user found:", authError?.message)
      return null
    }

    console.log("getCurrentUser: Auth user found:", authUser.email)

    // In demo mode, return mock user if session exists
    if (isDemoMode) {
      console.log("getCurrentUser: Demo mode, returning mock user")
      return {
        id: authUser.id,
        email: authUser.email || "demo@pms.com",
        full_name: "Demo User",
        role: "admin",
        is_active: true,
        last_login: new Date().toISOString(),
      }
    }

    // Add timeout for database query
    const dbPromise = supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single()
    
    const dbTimeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.log("getCurrentUser: Database query timeout reached")
        resolve(null)
      }, 10000) // 10 second timeout for database
    })

    console.log("getCurrentUser: Querying users table for ID:", authUser.id)
    console.log("getCurrentUser: About to execute database query with timeout...")
    const dbResult = await Promise.race([dbPromise, dbTimeoutPromise])
    
    if (!dbResult) {
      console.log("getCurrentUser: Database timeout - returning null")
      return null
    }

    const { data: userData, error } = dbResult
    console.log("getCurrentUser: Database query completed:", { data: !!userData, error: error?.message })

    if (error || !userData) {
      console.log("getCurrentUser: User not found in database:", error?.message)
      return null
    }

    console.log("getCurrentUser: User found in database:", userData.email)

    if (!userData.is_active) {
      console.log("getCurrentUser: User account is deactivated")
      return null
    }

    const result = {
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
      is_active: userData.is_active,
      last_login: userData.last_login,
    }
    
    console.log("getCurrentUser: Returning user:", result.email)
    return result
  } catch (error) {
    console.error("getCurrentUser: Error:", error)
    return null
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser | null, requiredRole: AuthUser["role"]): boolean {
  if (!user || !user.is_active) {
    return false
  }

  const roleHierarchy = {
    admin: 4,
    manager: 3,
    operator: 2,
    viewer: 1,
  }

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}

/**
 * Get user session with automatic refresh
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      throw error
    }

    return session
  } catch (error) {
    console.error("Get session error:", error)
    return null
  }
}

/**
 * Check if user should be redirected to login
 */
export async function shouldRedirectToLogin(): Promise<boolean> {
  try {
    const session = await getSession()
    if (!session) {
      return true
    }

    const user = await getCurrentUser()
    if (!user) {
      return true
    }

    return false
  } catch (error) {
    console.error("Error checking login status:", error)
    return true
  }
} 