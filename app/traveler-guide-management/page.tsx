"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Layout } from "@/components/Layout"
import TravelerGuideManagement from "@/components/TravelerGuideManagement"

export default function TravelerGuideManagementPage() {
  return (
    <Layout>
      <TravelerGuideManagement />
    </Layout>
  )
}
