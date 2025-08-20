"use client"

import { createContext, useContext, ReactNode, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Tenant {
  id: number
  name: string
  created_at: string
  updated_at: string
}

interface TenantContextType {
  tenant: Tenant | null
  loading: boolean
  error: string | null
  fetchTenant: (tenantId: number) => Promise<void>
  clearTenant: () => void
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTenant = useCallback(async (tenantId: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single()

      if (fetchError) throw fetchError
      
      if (data) {
        setTenant(data)
      }
    } catch (err) {
      console.error('Error fetching tenant:', err)
      setError('Failed to load tenant information')
      setTenant(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearTenant = useCallback(() => {
    setTenant(null)
    setError(null)
  }, [])

  return (
    <TenantContext.Provider 
      value={{
        tenant,
        loading,
        error,
        fetchTenant,
        clearTenant
      }}
    >
      {children}
    </TenantContext.Provider>
  )
}

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}
