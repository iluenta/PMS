"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Layout } from "@/components/Layout"
import Reports from "@/components/Reports"

export default function ReportsPage() {
  return (
    <Layout>
      <Reports />
    </Layout>
  )
}
