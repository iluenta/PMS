import { NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/supabase'
import { listPeople, createPerson } from '@/lib/peopleService'
import type { PersonType, CreatePersonInput } from '@/types/people'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const typeParam = searchParams.get('type') as PersonType | null

  try {
    const data = await listPeople(typeParam ? { person_type: typeParam } : undefined)
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to list people' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePersonInput
    // Validaciones mínimas
    if (!body || !body.person_type) {
      return NextResponse.json({ error: 'person_type es obligatorio' }, { status: 400 })
    }
    if (!['guest', 'provider', 'distribution_channel', 'other'].includes(body.person_type)) {
      return NextResponse.json({ error: 'person_type inválido' }, { status: 400 })
    }
    if (!body.first_name && !body.company_name) {
      return NextResponse.json({ error: 'Nombre o empresa es obligatorio' }, { status: 400 })
    }

    const created = await createPerson(body)
    return NextResponse.json(created, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create person' }, { status: 500 })
  }
}


