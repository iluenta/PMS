import { NextResponse } from 'next/server'
import { getPerson, updatePerson, deletePerson } from '@/lib/peopleService'
import type { UpdatePersonInput } from '@/types/people'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    const person = await getPerson(id)
    if (!person) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(person)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to get person' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const body = (await request.json()) as UpdatePersonInput
    const { id } = await params
    const updated = await updatePerson(id, body)
    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update person' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params
    await deletePerson(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete person' }, { status: 500 })
  }
}


