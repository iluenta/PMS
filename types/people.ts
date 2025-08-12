export type PersonType = 'guest' | 'provider' | 'distribution_channel' | 'other'

export interface Person {
  id: string
  person_type: PersonType
  first_name?: string
  last_name?: string
  company_name?: string
  fiscal_id?: string
  fiscal_id_type?: string
  country?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ListPeopleParams {
  person_type?: PersonType
}

export interface CreatePersonInput {
  person_type: PersonType
  first_name?: string
  last_name?: string
  company_name?: string
  fiscal_id?: string
  fiscal_id_type?: string
  country?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  notes?: string
}

export interface UpdatePersonInput extends Partial<CreatePersonInput> {}


