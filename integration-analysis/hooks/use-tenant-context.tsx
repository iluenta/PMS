"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Tenant, TenantContext } from "@/types/guide"

const TenantContextProvider = createContext<TenantContext | undefined>(undefined)

interface TenantProviderProps {
  children: ReactNode
  initialTenant?: Tenant
}

export function TenantProvider({ children, initialTenant }: TenantProviderProps) {
  const [tenant, setTenant] = useState<Tenant | null>(initialTenant || null)
  const [isLoading, setIsLoading] = useState(!initialTenant)

  useEffect(() => {
    if (!initialTenant) {
      // In a real app, you would determine tenant from:
      // 1. Subdomain (tenant.yourdomain.com)
      // 2. URL path (/tenant-slug/...)
      // 3. Authentication context
      // 4. Local storage for admin users

      const storedTenant = localStorage.getItem("current-tenant")
      if (storedTenant) {
        try {
          setTenant(JSON.parse(storedTenant))
        } catch (error) {
          console.error("Error parsing stored tenant:", error)
        }
      }
      setIsLoading(false)
    }
  }, [initialTenant])

  const handleSetTenant = (newTenant: Tenant | null) => {
    setTenant(newTenant)
    if (newTenant) {
      localStorage.setItem("current-tenant", JSON.stringify(newTenant))
    } else {
      localStorage.removeItem("current-tenant")
    }
  }

  return (
    <TenantContextProvider.Provider
      value={{
        tenant,
        setTenant: handleSetTenant,
        isLoading,
      }}
    >
      {children}
    </TenantContextProvider.Provider>
  )
}

export function useTenantContext() {
  const context = useContext(TenantContextProvider)
  if (context === undefined) {
    throw new Error("useTenantContext must be used within a TenantProvider")
  }
  return context
}

export function useCurrentTenantId(): string | null {
  const { tenant } = useTenantContext()
  return tenant?.id || null
}
