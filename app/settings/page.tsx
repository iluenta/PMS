"use client"

import { useAuth } from "@/contexts/AuthContext"
import LoginForm from "@/components/LoginForm"
import { Layout } from "@/components/Layout"
import Settings from "@/components/Settings"

export default function SettingsPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <Layout>
      <Settings />
    </Layout>
  )
}
