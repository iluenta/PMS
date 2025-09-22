import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { propertyId: string } }) {
  // In a real app, this would fetch from Supabase
  const mockProperty = {
    id: params.propertyId,
    name: "VeraTespera",
    address: "Calle Ejemplo, 123, 04620 Vera, Almería",
    description: "Hermoso apartamento en Vera, perfecto para vacaciones en familia",
    created_at: "2024-01-15T00:00:00Z",
    has_guide: true,
  }

  return NextResponse.json({ property: mockProperty })
}

export async function PUT(request: Request, { params }: { params: { propertyId: string } }) {
  const body = await request.json()

  // In a real app, this would update in Supabase
  console.log("Updating property:", params.propertyId, body)

  const updatedProperty = {
    id: params.propertyId,
    ...body,
    updated_at: new Date().toISOString(),
  }

  return NextResponse.json({ property: updatedProperty })
}

export async function DELETE(request: Request, { params }: { params: { propertyId: string } }) {
  // In a real app, this would delete from Supabase
  console.log("Deleting property:", params.propertyId)

  return NextResponse.json({ success: true })
}
