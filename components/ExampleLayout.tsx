"use client"

import { AppProvider } from '@/contexts/app-context'
import { SidebarProvider } from '@/contexts/sidebar-context'
import { PropertyProvider } from '@/contexts/PropertyContext'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { Dashboard } from '@/components/Dashboard'

export function ExampleLayout() {
  return (
    <AppProvider>
      <SidebarProvider>
        <PropertyProvider>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="flex">
              <Sidebar />
              <main className="flex-1 p-8">
                <Dashboard />
              </main>
            </div>
          </div>
        </PropertyProvider>
      </SidebarProvider>
    </AppProvider>
  )
}
