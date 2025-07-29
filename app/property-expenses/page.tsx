"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Layout } from "@/components/Layout"
import PropertyExpenses from "@/components/PropertyExpenses"

export default function PropertyExpensesPage() {
  return (
    <Layout>
      <PropertyExpenses />
    </Layout>
  )
}
