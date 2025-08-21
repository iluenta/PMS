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

// Función auxiliar para obtener el tenant_id del usuario autenticado
async function getCurrentUserTenantId(): Promise<number | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    const { data: userData, error } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single()
    
    if (error || !userData) return null
    return userData.tenant_id
  } catch (error) {
    console.error('Error getting user tenant_id:', error)
    return null
  }
}

export async function listPeople(params?: ListPeopleParams): Promise<Person[]> {
  ensureAuth()
  
  // Obtener el tenant_id del usuario autenticado
  const tenantId = await getCurrentUserTenantId()
  if (!tenantId) {
    throw new Error('No se pudo determinar el tenant del usuario')
  }
  
  let query = supabase
    .from('people')
    .select('*')
    .eq('tenant_id', tenantId) // FILTRO CRÍTICO DE SEGURIDAD
    .order('updated_at', { ascending: false })
    
  if (params?.person_type) {
    query = query.eq('person_type', params.person_type)
  }
  
  const { data, error } = await query
  if (error) throw mapError(error, 'Error al listar personas')
  return (data || []) as Person[]
}

export async function getPerson(id: string): Promise<Person | null> {
  ensureAuth()
  
  // Obtener el tenant_id del usuario autenticado
  const tenantId = await getCurrentUserTenantId()
  if (!tenantId) {
    throw new Error('No se pudo determinar el tenant del usuario')
  }
  
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenantId) // FILTRO CRÍTICO DE SEGURIDAD
    .single()
    
  if (error) throw mapError(error, 'Error al obtener la persona')
  return (data as Person) || null
}

export async function createPerson(input: CreatePersonInput): Promise<Person> {
  ensureAuth()
  
  // Guard rule: first_name or company_name must exist
  if (!input.company_name && !input.first_name) {
    throw new Error('Nombre o empresa es obligatorio')
  }
  
  // Obtener el tenant_id del usuario autenticado si no se proporciona
  if (!input.tenant_id) {
    const tenantId = await getCurrentUserTenantId()
    if (!tenantId) {
      throw new Error('No se pudo determinar el tenant del usuario')
    }
    input.tenant_id = tenantId
  }
  
  const { data, error } = await supabase
    .from('people')
    .insert([input])
    .select('*')
    .single()
    
  if (error) throw mapError(error, 'Error al crear la persona')
  return data as Person
}

export async function updatePerson(id: string, dataToUpdate: UpdatePersonInput): Promise<Person> {
  ensureAuth()
  
  // Obtener el tenant_id del usuario autenticado
  const tenantId = await getCurrentUserTenantId()
  if (!tenantId) {
    throw new Error('No se pudo determinar el tenant del usuario')
  }
  
  const { data, error } = await supabase
    .from('people')
    .update({ ...dataToUpdate, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('tenant_id', tenantId) // FILTRO CRÍTICO DE SEGURIDAD
    .select('*')
    .single()
    
  if (error) throw mapError(error, 'Error al actualizar la persona')
  return data as Person
}

export async function deletePerson(id: string): Promise<void> {
  ensureAuth()
  
  // Obtener el tenant_id del usuario autenticado
  const tenantId = await getCurrentUserTenantId()
  if (!tenantId) {
    throw new Error('No se pudo determinar el tenant del usuario')
  }
  
  const { error } = await supabase
    .from('people')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId) // FILTRO CRÍTICO DE SEGURIDAD
    
  if (error) throw mapError(error, 'Error al eliminar la persona')
}

export async function searchPeople({ query, type = 'guest', limit = 10 }: { query: string; type?: PersonType; limit?: number }) {
  ensureAuth()
  
  const q = query.trim()
  if (!q) return []
  
  // Obtener el tenant_id del usuario autenticado
  const tenantId = await getCurrentUserTenantId()
  if (!tenantId) {
    throw new Error('No se pudo determinar el tenant del usuario')
  }
  
  const ilike = `%${q}%`
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('person_type', type)
    .eq('tenant_id', tenantId) // FILTRO CRÍTICO DE SEGURIDAD
    .or(`first_name.ilike.${ilike},last_name.ilike.${ilike},company_name.ilike.${ilike},email.ilike.${ilike},phone.ilike.${ilike}`)
    .limit(limit)
    
  if (error) throw mapError(error, 'Error al buscar personas')
  return data as Person[]
}


