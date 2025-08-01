"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Layout } from "@/components/Layout"
import Calendar from "@/components/Calendar"

export default function CalendarPage() {
  return (
    <Layout>
      <Calendar />
    </Layout>
  )
}
