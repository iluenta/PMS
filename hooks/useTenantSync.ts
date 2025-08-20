"use client"

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'

export function useTenantSync() {
  const { user } = useAuth()
  const { fetchTenant, clearTenant } = useTenant()

  useEffect(() => {
    if (user?.tenant_id) {
      fetchTenant(user.tenant_id)
    } else {
      clearTenant()
    }
  }, [user?.tenant_id, fetchTenant, clearTenant])
}
