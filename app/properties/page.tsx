"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Layout } from "@/components/Layout"
import Properties from "@/components/Properties"

export default function PropertiesPage() {
  return (
    <Layout>
      <Properties />
    </Layout>
  )
}
