"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  role: string
  name?: string
}

interface Tenant {
  id: string
  name: string
  domain?: string
}

interface AppContextType {
  user: User | null
  tenant: Tenant | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setTenant: (tenant: Tenant | null) => void
  setLoading: (loading: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simular carga inicial
    const timer = setTimeout(() => {
      setIsLoading(false)
      // Datos de ejemplo - en producción vendrían de la API
      setUser({
        id: '1',
        email: 'admin@demo.es',
        role: 'Administrador',
        name: 'Admin Demo'
      })
      setTenant({
        id: '1',
        name: 'VERATESPERA',
        domain: 'veratespera.com'
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const value = {
    user,
    tenant,
    isLoading,
    setUser,
    setTenant,
    setLoading: setIsLoading
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
