"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { shouldRedirectToLogin } from "@/lib/auth"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        const shouldRedirect = await shouldRedirectToLogin()
        if (shouldRedirect) {
          console.log("Redirecting to login - user not authenticated")
          router.push("/")
        }
      }
    }

    checkAuth()
  }, [user, loading, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show fallback or redirect if not authenticated
  if (!user) {
    if (fallback) {
      return <>{fallback}</>
    }
    return null
  }

  // User is authenticated, show children
  return <>{children}</>
} 