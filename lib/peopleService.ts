import { supabase } from '@/lib/supabase'
import type { Person, PersonType, ListPeopleParams, CreatePersonInput, UpdatePersonInput } from '@/types/people'

function mapError(error: any, fallback: string) {
  const message = error?.message || error?.details || error?.hint || fallback
  return new Error(message)
}

function ensureAuth() {
  // Supabase auth handled by RLS; here we can optionally check session if needed in client env
  return true
}

export async function listPeople(params?: ListPeopleParams): Promise<Person[]> {
  ensureAuth()
  let query = supabase.from('people').select('*').order('updated_at', { ascending: false })
  if (params?.person_type) query = query.eq('person_type', params.person_type)
  const { data, error } = await query
  if (error) throw mapError(error, 'Error al listar personas')
  return (data || []) as Person[]
}

export async function getPerson(id: string): Promise<Person | null> {
  ensureAuth()
  const { data, error } = await supabase.from('people').select('*').eq('id', id).single()
  if (error) throw mapError(error, 'Error al obtener la persona')
  return (data as Person) || null
}

export async function createPerson(input: CreatePersonInput): Promise<Person> {
  ensureAuth()
  // Guard rule: first_name or company_name must exist
  if (!input.company_name && !input.first_name) {
    throw new Error('Nombre o empresa es obligatorio')
  }
  const { data, error } = await supabase.from('people').insert([input]).select('*').single()
  if (error) throw mapError(error, 'Error al crear la persona')
  return data as Person
}

export async function updatePerson(id: string, dataToUpdate: UpdatePersonInput): Promise<Person> {
  ensureAuth()
  const { data, error } = await supabase
    .from('people')
    .update({ ...dataToUpdate, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw mapError(error, 'Error al actualizar la persona')
  return data as Person
}

export async function deletePerson(id: string): Promise<void> {
  ensureAuth()
  const { error } = await supabase.from('people').delete().eq('id', id)
  if (error) throw mapError(error, 'Error al eliminar la persona')
}

export async function searchPeople({ query, type = 'guest', limit = 10 }: { query: string; type?: PersonType; limit?: number }) {
  ensureAuth()
  const q = query.trim()
  if (!q) return []
  const ilike = `%${q}%`
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('person_type', type)
    .or(`first_name.ilike.${ilike},last_name.ilike.${ilike},company_name.ilike.${ilike},email.ilike.${ilike},phone.ilike.${ilike}`)
    .limit(limit)
  if (error) throw mapError(error, 'Error al buscar personas')
  return data as Person[]
}


