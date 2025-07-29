import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export function useAuthRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect once the auth state is determined
    if (!loading) {
      // If there is no user, redirect to the login page
      if (!user) {
        router.push("/")
      }
    }
  }, [user, loading, router])
} 