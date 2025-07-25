"use client"

import { use } from "react"
import TravelerGuide from "@/components/TravelerGuide"

interface GuidePageProps {
  params: Promise<{ propertyId: string }>
}

export default function GuidePage({ params }: GuidePageProps) {
  const { propertyId } = use(params)

  return <TravelerGuide propertyId={propertyId} />
}
