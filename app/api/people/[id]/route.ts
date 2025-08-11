import { NextResponse } from 'next/server'
import { getPerson, updatePerson, deletePerson } from '@/lib/peopleService'
import type { UpdatePersonInput } from '@/types/people'

interface Params {
  params: { id: string }
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const person = await getPerson(params.id)
    if (!person) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(person)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to get person' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const body = (await request.json()) as UpdatePersonInput
    const updated = await updatePerson(params.id, body)
    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update person' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await deletePerson(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete person' }, { status: 500 })
  }
}


