"use client"

import { useProperty as usePropertyContext } from "@/contexts/PropertyContext"

// Re-export del hook del contexto para mantener consistencia
export const useProperty = usePropertyContext

// Hook adicional para casos específicos (opcional, para futuras extensiones)
export function usePropertyId() {
  const { selectedProperty } = usePropertyContext()
  return selectedProperty?.id || null
}

export function usePropertyName() {
  const { selectedProperty } = usePropertyContext()
  return selectedProperty?.name || ""
}

export function useIsPropertySelected() {
  const { isPropertySelected } = usePropertyContext()
  return isPropertySelected
}
