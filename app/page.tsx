"use client"

import { useAuth } from "@/contexts/AuthContext"
import LoginForm from "@/components/LoginForm"
import Layout from "@/components/Layout"
import Dashboard from "@/components/Dashboard"
import AuthLoading from "@/components/AuthLoading"

export default function Home() {
  const { user, loading } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return <AuthLoading />
  }

  // Only show login form when we're sure user is not authenticated
  if (!user) {
    return <LoginForm />
  }

  // User is authenticated, show dashboard
  return (
    <Layout>
      <Dashboard />
    </Layout>
  )
}
