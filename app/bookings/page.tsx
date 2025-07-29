"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Layout } from "@/components/Layout"
import Bookings from "@/components/Bookings"

export default function BookingsPage() {
  return (
    <Layout>
      <Bookings />
    </Layout>
  )
}
