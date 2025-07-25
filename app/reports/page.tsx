"use client"

import { useAuth } from "@/contexts/AuthContext"
import LoginForm from "@/components/LoginForm"
import Layout from "@/components/Layout"

export default function ReportsPage() {
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
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Módulo de Reportes</h2>
        <p className="text-gray-600">Funcionalidad en desarrollo</p>
      </div>
    </Layout>
  )
}
