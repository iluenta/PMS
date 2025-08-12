"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { supabase, type Property } from "@/lib/supabase"

// Tipos para el contexto
interface PropertyContextType {
  // Estado actual
  selectedProperty: Property | null
  properties: Property[]
  loading: boolean
  
  // Acciones
  setSelectedProperty: (property: Property | null) => void
  setSelectedPropertyById: (propertyId: string) => void
  refreshProperties: () => Promise<void>
  
  // Utilidades
  getPropertyById: (propertyId: string) => Property | null
  isPropertySelected: boolean
}

// Contexto
const PropertyContext = createContext<PropertyContextType | undefined>(undefined)

// Hook personalizado para usar el contexto
export function useProperty() {
  const context = useContext(PropertyContext)
  if (context === undefined) {
    throw new Error("useProperty must be used within a PropertyProvider")
  }
  return context
}

// Props para el provider
interface PropertyProviderProps {
  children: ReactNode
}

// Provider component
export function PropertyProvider({ children }: PropertyProviderProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar propiedades al inicializar
  const fetchProperties = async () => {
    try {
      setLoading(true)
      
      

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("status", "active")
        .order("name")

      if (error) {
        console.error("Error fetching properties:", error)
        return
      }

      const activeProperties = data || []
      setProperties(activeProperties)

      // Si no hay propiedad seleccionada, seleccionar la primera
      if (!selectedProperty && activeProperties.length > 0) {
        setSelectedProperty(activeProperties[0])
      }
    } catch (error) {
      console.error("Error in fetchProperties:", error)
    } finally {
      setLoading(false)
    }
  }

  // Función para refrescar propiedades
  const refreshProperties = async () => {
    await fetchProperties()
  }

  // Función para seleccionar propiedad por ID
  const setSelectedPropertyById = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId)
    if (property) {
      setSelectedProperty(property)
      // Guardar en localStorage para persistencia
      localStorage.setItem("selectedPropertyId", propertyId)
    }
  }

  // Función para obtener propiedad por ID
  const getPropertyById = (propertyId: string): Property | null => {
    return properties.find(p => p.id === propertyId) || null
  }

  // Cargar propiedades al montar el componente
  useEffect(() => {
    fetchProperties()
  }, [])

  // Restaurar propiedad seleccionada desde localStorage
  useEffect(() => {
    if (properties.length > 0) {
      const savedPropertyId = localStorage.getItem("selectedPropertyId")
      
      if (savedPropertyId) {
        const savedProperty = properties.find(p => p.id === savedPropertyId)
        if (savedProperty) {
          setSelectedProperty(savedProperty)
          return
        }
      }
      
      // Si no hay propiedad guardada o no se encuentra, seleccionar la primera
      if (!selectedProperty) {
        setSelectedProperty(properties[0])
        if (properties[0]) {
          localStorage.setItem("selectedPropertyId", properties[0].id)
        }
      }
    }
  }, [properties])

  // Guardar propiedad seleccionada en localStorage cuando cambie
  useEffect(() => {
    if (selectedProperty) {
      localStorage.setItem("selectedPropertyId", selectedProperty.id)
    }
  }, [selectedProperty])

  const value: PropertyContextType = {
    selectedProperty,
    properties,
    loading,
    setSelectedProperty,
    setSelectedPropertyById,
    refreshProperties,
    getPropertyById,
    isPropertySelected: !!selectedProperty,
  }

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  )
}
