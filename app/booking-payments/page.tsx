"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Layout } from "@/components/Layout"
import BookingPayments from "@/components/BookingPayments"

export default function BookingPaymentsPage() {
  return (
    <Layout>
      <BookingPayments />
    </Layout>
  )
}
