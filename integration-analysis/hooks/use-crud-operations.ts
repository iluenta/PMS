"use client"

import { useState, useCallback } from "react"
import { apiClient, type ApiResponse } from "@/lib/api-client"

interface CrudState {
  loading: boolean
  error: string | null
  success: boolean
}

export function useCrudOperations() {
  const [state, setState] = useState<CrudState>({
    loading: false,
    error: null,
    success: false,
  })

  const resetState = useCallback(() => {
    setState({ loading: false, error: null, success: false })
  }, [])

  const executeOperation = useCallback(
    async (
      operation: () => Promise<ApiResponse<any>>,
      onSuccess?: (data: any) => void,
      onError?: (error: string) => void,
    ) => {
      setState({ loading: true, error: null, success: false })

      try {
        const response = await operation()

        if (response.error) {
          setState({ loading: false, error: response.error, success: false })
          onError?.(response.error)
          return { success: false, error: response.error }
        }

        setState({ loading: false, error: null, success: true })
        if (response.data) {
          onSuccess?.(response.data)
        }
        return { success: true, data: response.data }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido"
        setState({ loading: false, error: errorMessage, success: false })
        onError?.(errorMessage)
        return { success: false, error: errorMessage }
      }
    },
    [],
  )

  // Beach operations
  const createBeach = useCallback(
    (beach: any, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.createBeach(beach),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  const updateBeach = useCallback(
    (id: string, beach: any, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.updateBeach(id, beach),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  const deleteBeach = useCallback(
    (id: string, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.deleteBeach(id),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  // Restaurant operations
  const createRestaurant = useCallback(
    (restaurant: any, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.createRestaurant(restaurant),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  const updateRestaurant = useCallback(
    (id: string, restaurant: any, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.updateRestaurant(id, restaurant),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  const deleteRestaurant = useCallback(
    (id: string, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.deleteRestaurant(id),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  // Activity operations
  const createActivity = useCallback(
    (activity: any, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.createActivity(activity),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  const updateActivity = useCallback(
    (id: string, activity: any, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.updateActivity(id, activity),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  const deleteActivity = useCallback(
    (id: string, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.deleteActivity(id),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  // House rule operations
  const createHouseRule = useCallback(
    (rule: any, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.createHouseRule(rule),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  const updateHouseRule = useCallback(
    (id: string, rule: any, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.updateHouseRule(id, rule),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  const deleteHouseRule = useCallback(
    (id: string, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.deleteHouseRule(id),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  // House guide item operations
  const createHouseGuideItem = useCallback(
    (item: any, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.createHouseGuideItem(item),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  const updateHouseGuideItem = useCallback(
    (id: string, item: any, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.updateHouseGuideItem(id, item),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  const deleteHouseGuideItem = useCallback(
    (id: string, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.deleteHouseGuideItem(id),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  // Section operations
  const createSection = useCallback(
    (section: any, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.createSection(section),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  const updateSection = useCallback(
    (id: string, section: any, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.updateSection(id, section),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  const deleteSection = useCallback(
    (id: string, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.deleteSection(id),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  // Property and guide operations
  const updateProperty = useCallback(
    (id: string, property: any, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.updateProperty(id, property),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  const updateGuide = useCallback(
    (id: string, guide: any, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.updateGuide(id, guide),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  const updateContactInfo = useCallback(
    (id: string, contactInfo: any, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.updateContactInfo(id, contactInfo),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  const updatePracticalInfo = useCallback(
    (id: string, practicalInfo: any, onSuccess?: () => void) => {
      return executeOperation(
        () => apiClient.updatePracticalInfo(id, practicalInfo),
        () => onSuccess?.(),
      )
    },
    [executeOperation],
  )

  return {
    state,
    resetState,
    // Beach operations
    createBeach,
    updateBeach,
    deleteBeach,
    // Restaurant operations
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    // Activity operations
    createActivity,
    updateActivity,
    deleteActivity,
    // House rule operations
    createHouseRule,
    updateHouseRule,
    deleteHouseRule,
    // House guide item operations
    createHouseGuideItem,
    updateHouseGuideItem,
    deleteHouseGuideItem,
    // Section operations
    createSection,
    updateSection,
    deleteSection,
    // Property and guide operations
    updateProperty,
    updateGuide,
    updateContactInfo,
    updatePracticalInfo,
  }
}
