"use client"

import { useAuth } from "@/contexts/AuthContext"
import LoginForm from "@/components/LoginForm"
import { Layout } from "@/components/Layout"
import { Dashboard } from "@/components/Dashboard"

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <Layout>
      <Dashboard />
    </Layout>
  )
}
