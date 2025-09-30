import { NextResponse } from "next/server"
import { z } from "zod"
import { getOverviewMetrics } from "@/lib/reports"

const requestSchema = z.object({
  tenantId: z.number().int().positive(),
  propertyId: z.string().optional(),
  dateFrom: z.string(),
  dateTo: z.string(),
  channel: z.string().optional(),
  reservationType: z.string().optional()
})

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    if (!rawBody) {
      return NextResponse.json({ message: "Request body is required" }, { status: 400 })
    }

    let parsedBody: unknown
    try {
      parsedBody = JSON.parse(rawBody)
    } catch (parseError) {
      return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 })
    }

    const params = requestSchema.parse(parsedBody)
    const data = await getOverviewMetrics(params)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error generating overview report:", error)

    if (process.env.NODE_ENV !== "production") {
      if (error instanceof Error) {
        return NextResponse.json({
          message: "Error generating report",
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        }, { status: 500 })
      }

      return NextResponse.json({
        message: "Error generating report",
        error
      }, { status: 500 })
    }

    return NextResponse.json({ message: "Error generating report" }, { status: 500 })
  }
}
