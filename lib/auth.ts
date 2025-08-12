import { supabase } from "./supabase"
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
 * Fetches the user profile from the public.users table with retry logic.
 * @param userId The ID of the user to fetch.
 * @param retryCount Current retry attempt (internal use)
 */
export async function getUserProfile(userId: string, retryCount = 0): Promise<AuthUser | null> {
  const maxRetries = 1 // Reduce retries but increase timeouts
  const timeoutDuration = 15000 // Reduce to 15 seconds

  try {
    console.log(`getUserProfile: Starting attempt ${retryCount + 1} for userId:`, userId)
    
    

    console.log(`getUserProfile: Querying users table (timeout: ${timeoutDuration}ms)...`)
    
    // Add timeout to prevent infinite hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`getUserProfile timeout (${timeoutDuration}ms)`)), timeoutDuration)
    })

    const queryPromise = supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    const { data: userData, error } = await Promise.race([queryPromise, timeoutPromise])

    console.log("getUserProfile: Query completed", { userData: userData ? "found" : "null", error: error?.message })

    if (error || !userData) {
      // If this is a network/timeout error and we haven't exhausted retries, try again
      if (retryCount < maxRetries && (error?.message?.includes('timeout') || error?.message?.includes('network') || !error)) {
        console.log(`getUserProfile: Retrying due to error (attempt ${retryCount + 1}/${maxRetries + 1})`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))) // Progressive delay
        return getUserProfile(userId, retryCount + 1)
      }
      
      console.error("Error fetching user profile:", error?.message)
      return null
    }

    if (!userData.is_active) {
      console.warn(`User account ${userId} is deactivated.`)
      return null
    }

    console.log("getUserProfile: Returning user profile for", userData.email)
    return {
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
      is_active: userData.is_active,
      last_login: userData.last_login,
    }
  } catch (error) {
    // If this is a network/timeout error and we haven't exhausted retries, try again
    if (retryCount < maxRetries && (error instanceof Error && (error.message?.includes('timeout') || error.message?.includes('network')))) {
      console.log(`getUserProfile: Retrying due to error (attempt ${retryCount + 1}/${maxRetries + 1}):`, error.message)
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))) // Progressive delay
      return getUserProfile(userId, retryCount + 1)
    }
    
    console.error("Error in getUserProfile:", error)
    return null
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
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("getCurrentUser: Supabase error getting session:", sessionError.message)
      return null
    }

    if (!session) {
      console.log("getCurrentUser: No active session found.")
      return null
    }

    console.log("getCurrentUser: Session found, fetching user profile for", session.user.id)
    return getUserProfile(session.user.id)
  } catch (error) {
    console.error("getCurrentUser: Unexpected error:", error)
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