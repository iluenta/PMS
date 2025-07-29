"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Layout } from "@/components/Layout"
import Availability from "@/components/Availability"

export default function AvailabilityPage() {
  return (
    <Layout>
      <Availability />
    </Layout>
  )
}
