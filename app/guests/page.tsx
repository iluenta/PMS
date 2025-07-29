"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Layout } from "@/components/Layout"
import Guests from "@/components/Guests"

export default function GuestsPage() {
  return (
    <Layout>
      <Guests />
    </Layout>
  )
}
