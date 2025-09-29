import { NextResponse } from "next/server"
import { z } from "zod"
import { getOverviewMetrics } from "@/lib/reports"

const requestSchema = z.object({
  tenantId: z.number().int().positive(),
  propertyId: z.string().uuid().optional(),
  dateFrom: z.string(),
  dateTo: z.string(),
  channel: z.string().optional()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const params = requestSchema.parse(body)
    const data = await getOverviewMetrics(params)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error generating overview report:", error)
    return NextResponse.json({ message: "Error generating report" }, { status: 500 })
  }
}
