"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Layout } from "@/components/Layout"
import Payments from "@/components/Payments"

export default function BookingPaymentsPage() {
  return (
    <Layout>
      <Payments />
    </Layout>
  )
}
