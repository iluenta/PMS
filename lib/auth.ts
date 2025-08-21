import { createClient } from '@supabase/supabase-js'
import { supabase as supabaseClient, getSupabase } from './supabase'
import type { User } from "./supabase"

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: "admin" | "manager" | "operator" | "viewer"
  is_active: boolean
  last_login?: string
  tenant_id: number
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
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
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
    const { data: userData, error: userError } = await supabaseClient
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
    await supabaseClient
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
      tenant_id: userData.tenant_id,
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
// Cache para evitar consultas repetidas
const userProfileCache = new Map<string, { user: AuthUser; timestamp: number }>()
const CACHE_DURATION = 15 * 60 * 1000 // 15 minutos (aumentado de 10 a 15)

// Fallback data para casos de emergencia
const fallbackUserProfile: AuthUser = {
  id: '',
  email: '',
  full_name: 'Usuario',
  role: 'viewer', // Cambiar de 'user' a 'viewer' que es un tipo válido
  is_active: true,
  last_login: undefined, // Cambiar de null a undefined para coincidir con el tipo opcional
  tenant_id: 0, // Cambiar de undefined a 0 para coincidir con el tipo number
}

export async function getUserProfile(userId: string, retryCount = 0): Promise<AuthUser | null> {
  const maxRetries = 2 // Reducir de 3 a 2
  const timeoutDuration = 10000 // Reducir de 30s a 10s

  try {
    // Verificar cache primero - ser más agresivo con el caché
    const cached = userProfileCache.get(userId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.user
    }
    
    // Si hay caché expirado, usarlo como fallback mientras se hace la consulta
    const expiredCache = cached ? cached.user : null
    
    // Usar la nueva función getSupabase() que maneja la salud de la conexión
    const supabase = await getSupabase()
    
    const startTime = Date.now()
    
    // Crear un timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`getUserProfile timeout (${timeoutDuration}ms)`)), timeoutDuration)
    })
    
    // Consulta optimizada - solo campos necesarios
    const queryPromise = supabase
      .from('users')
      .select('id, email, full_name, role, is_active, last_login, tenant_id')
      .eq('id', userId)
      .single()
    
    // Ejecutar consulta con timeout
    const { data: userData, error } = await Promise.race([queryPromise, timeoutPromise])
    
    if (error) {
      throw error
    }
    
    if (!userData) {
      return null
    }
    
    // Mapear datos a AuthUser
    const user: AuthUser = {
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name,
      role: userData.role,
      is_active: userData.is_active,
      last_login: userData.last_login,
      tenant_id: userData.tenant_id,
    }
    
    // Cachear el resultado exitoso
    userProfileCache.set(userId, { user, timestamp: Date.now() })
    
    return user
    
  } catch (error) {
    // Si es un error de timeout y tenemos caché expirado, usarlo como fallback
    if (error instanceof Error && error.message.includes('timeout')) {
      const cached = userProfileCache.get(userId)
      if (cached) {
        return cached.user
      }
    }
    
    // Retry logic más inteligente
    if (retryCount < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 5000) // Exponential backoff: 1s, 2s, 4s, max 5s
      
      await new Promise(resolve => setTimeout(resolve, delay))
      return getUserProfile(userId, retryCount + 1)
    }
    
    // Si todos los reintentos fallaron, usar fallback
    
    // Usar caché expirado si está disponible
    const cached = userProfileCache.get(userId)
    if (cached) {
      return cached.user
    }
    
    // Fallback genérico como último recurso
    return fallbackUserProfile
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabaseClient.auth.signOut()
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
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()

    if (sessionError) {
      return null
    }

    if (!session) {
      return null
    }

    return getUserProfile(session.user.id)
  } catch (error) {
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
    const { data: { session }, error } = await supabaseClient.auth.getSession()
    
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