"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Layout } from "@/components/Layout"
import Pricing from "@/components/Pricing"

export default function PricingPage() {
  return (
    <Layout>
      <Pricing />
    </Layout>
  )
}
