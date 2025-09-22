import { NextResponse } from "next/server"

// Mock API endpoint for properties
export async function GET() {
  // In a real app, this would fetch from Supabase
  const properties = [
    {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "VeraTespera",
      address: "Calle Ejemplo, 123, 04620 Vera, Almería",
      description: "Hermoso apartamento en Vera, perfecto para vacaciones en familia",
      created_at: "2024-01-15T00:00:00Z",
      has_guide: true,
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Casa del Mar",
      address: "Avenida Playa, 45, 04620 Vera, Almería",
      description: "Villa frente al mar con vistas espectaculares",
      created_at: "2024-02-20T00:00:00Z",
      has_guide: false,
    },
  ]

  return NextResponse.json({ properties })
}

export async function POST(request: Request) {
  const body = await request.json()

  // In a real app, this would save to Supabase
  console.log("Creating property:", body)

  const newProperty = {
    id: crypto.randomUUID(),
    ...body,
    created_at: new Date().toISOString(),
    has_guide: false,
  }

  return NextResponse.json({ property: newProperty }, { status: 201 })
}
