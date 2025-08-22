import { supabase } from './supabase'
import type { 
  Setting, 
  CreateSettingData, 
  UpdateSettingData, 
  SettingsResponse, 
  SettingResponse,
  ConfigType,
  ConfigValue
} from '@/types/settings'

/**
 * Obtiene todas las configuraciones del sistema
 */
export async function getSettings(): Promise<Setting[]> {
  try {
    console.log('🔍 Attempting to fetch settings from Supabase...')
    
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('key', { ascending: true })

    if (error) {
      console.error('❌ Supabase error fetching settings:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      
      // Si la tabla no existe, retornar array vacío en lugar de fallar
      if (error.code === '42P01') { // undefined_table
        console.warn('⚠️ Table "settings" does not exist yet. Please run the SQL scripts first.')
        return []
      }
      
      throw error
    }

    console.log('✅ Successfully fetched settings:', data?.length || 0, 'settings found')
    return data || []
  } catch (error) {
    console.error('💥 Unexpected error in getSettings:', error)
    
    // Si es un error de red o conexión, retornar array vacío
    if (error instanceof Error && (
      error.message.includes('fetch') || 
      error.message.includes('network') ||
      error.message.includes('connection')
    )) {
      console.warn('⚠️ Network/connection error, returning empty array')
      return []
    }
    
    throw error
  }
}

/**
 * Obtiene una configuración específica por su clave
 */
export async function getSettingByKey(key: string): Promise<Setting | null> {
  try {
    console.log(`🔍 Attempting to fetch setting with key: ${key}`)
    
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', key)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró la configuración
        console.log(`ℹ️ No setting found with key: ${key}`)
        return null
      }
      
      console.error('❌ Supabase error fetching setting by key:', {
        key,
        message: error.message,
        code: error.code,
        details: error.details
      })
      
      // Si la tabla no existe, retornar null
      if (error.code === '42P01') { // undefined_table
        console.warn('⚠️ Table "settings" does not exist yet. Please run the SQL scripts first.')
        return null
      }
      
      throw error
    }

    console.log(`✅ Successfully fetched setting: ${key}`)
    return data
  } catch (error) {
    console.error('💥 Unexpected error in getSettingByKey:', error)
    throw error
  }
}

/**
 * Obtiene configuraciones por tipo
 */
export async function getSettingsByType(configType: ConfigType): Promise<Setting[]> {
  try {
    console.log(`🔍 Attempting to fetch settings by type: ${configType}`)
    
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('config_type', configType)
      .order('key', { ascending: true })

    if (error) {
      console.error('❌ Supabase error fetching settings by type:', {
        configType,
        message: error.message,
        code: error.code,
        details: error.details
      })
      
      // Si la tabla no existe, retornar array vacío
      if (error.code === '42P01') { // undefined_table
        console.warn('⚠️ Table "settings" does not exist yet. Please run the SQL scripts first.')
        return []
      }
      
      throw error
    }

    console.log(`✅ Successfully fetched ${data?.length || 0} settings of type: ${configType}`)
    return data || []
  } catch (error) {
    console.error('💥 Unexpected error in getSettingsByType:', error)
    throw error
  }
}

/**
 * Crea una nueva configuración
 */
export async function createSetting(settingData: CreateSettingData): Promise<Setting> {
  try {
    console.log('🔍 Attempting to create setting:', {
      key: settingData.key,
      description: settingData.description,
      config_type: settingData.config_type,
      value: settingData.value,
      tenant_id: settingData.tenant_id
    })
    
    const { data, error } = await supabase
      .from('settings')
      .insert([settingData])
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase error creating setting:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      
      // Si la tabla no existe, mostrar mensaje específico
      if (error.code === '42P01') { // undefined_table
        console.warn('⚠️ Table "settings" does not exist yet. Please run the SQL scripts first.')
        throw new Error('Table "settings" does not exist. Please run the SQL setup scripts first.')
      }
      
      // Si hay problema de permisos
      if (error.code === '42501') { // insufficient_privilege
        console.warn('⚠️ Permission denied. RLS policies may not be configured correctly.')
        throw new Error('Permission denied. Please check RLS policies configuration.')
      }
      
      throw error
    }

    console.log('✅ Successfully created setting:', data)
    return data
  } catch (error) {
    console.error('💥 Unexpected error in createSetting:', error)
    throw error
  }
}

/**
 * Actualiza una configuración existente
 */
export async function updateSetting(id: number, updateData: UpdateSettingData): Promise<Setting> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating setting:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in updateSetting:', error)
    throw error
  }
}

/**
 * Elimina una configuración
 */
export async function deleteSetting(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('settings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting setting:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in deleteSetting:', error)
    throw error
  }
}

/**
 * Obtiene configuraciones por tenant
 */
export async function getSettingsByTenant(tenantId: number): Promise<Setting[]> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('key', { ascending: true })

    if (error) {
      console.error('Error fetching settings by tenant:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getSettingsByTenant:', error)
    throw error
  }
}

/**
 * Obtiene configuraciones globales (sin tenant)
 */
export async function getGlobalSettings(): Promise<Setting[]> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .is('tenant_id', null)
      .order('key', { ascending: true })

    if (error) {
      console.error('Error fetching global settings:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getGlobalSettings:', error)
    throw error
  }
}

/**
 * Valida que una configuración tenga el formato correcto
 */
export function validateSettingValue(configType: ConfigType, value: ConfigValue): boolean {
  try {
    if (configType === 'simple_list') {
      return Array.isArray(value) && value.every(item => typeof item === 'string')
    } else if (configType === 'colored_list') {
      return Array.isArray(value) && value.every(item => 
        typeof item === 'object' && 
        item !== null && 
        'name' in item && 
        'color' in item &&
        typeof item.name === 'string' &&
        typeof item.color === 'string'
      )
    }
    return false
  } catch (error) {
    console.error('Error validating setting value:', error)
    return false
  }
}

/**
 * Obtiene el valor de una configuración como array de strings (para listas simples)
 */
export function getSimpleListValue(setting: Setting): string[] {
  if (setting.config_type === 'simple_list' && Array.isArray(setting.value)) {
    return setting.value as string[]
  }
  return []
}

/**
 * Obtiene el valor de una configuración como array de objetos con nombre y color
 */
export function getColoredListValue(setting: Setting): Array<{ name: string; color: string }> {
  if (setting.config_type === 'colored_list' && Array.isArray(setting.value)) {
    return setting.value as Array<{ name: string; color: string }>
  }
  return []
}

/**
 * Obtiene los estados de reserva desde la configuración
 */
export async function getReservationStatuses(): Promise<Array<{ name: string; color: string }>> {
  try {
    const setting = await getSettingByKey('reservation_statuses')
    if (!setting) {
      console.warn('⚠️ Configuración "reservation_statuses" no encontrada. Usando valores por defecto.')
      // Valores por defecto si no existe la configuración
      return [
        { name: 'Pendiente', color: '#fbbf24' },
        { name: 'Confirmada', color: '#34d399' },
        { name: 'Cancelada', color: '#f87171' },
        { name: 'Completada', color: '#60a5fa' }
      ]
    }
    
    if (setting.config_type !== 'colored_list') {
      throw new Error('La configuración reservation_statuses debe ser de tipo colored_list')
    }
    
    return getColoredListValue(setting)
  } catch (error) {
    console.error('💥 Error obteniendo estados de reserva:', error)
    // Retornar valores por defecto en caso de error
    return [
      { name: 'Pendiente', color: '#fbbf24' },
      { name: 'Confirmada', color: '#34d399' },
      { name: 'Cancelada', color: '#f87171' },
      { name: 'Completada', color: '#60a5fa' }
    ]
  }
}

/**
 * Obtiene los tipos de propiedad desde la configuración
 */
export async function getPropertyTypes(): Promise<string[]> {
  try {
    const setting = await getSettingByKey('property_types')
    if (!setting) {
      console.warn('⚠️ Configuración "property_types" no encontrada. Usando valores por defecto.')
      return ['Apartamento', 'Casa', 'Villa', 'Cabaña', 'Loft', 'Estudio']
    }
    
    if (setting.config_type !== 'simple_list') {
      throw new Error('La configuración property_types debe ser de tipo simple_list')
    }
    
    return getSimpleListValue(setting)
  } catch (error) {
    console.error('💥 Error obteniendo tipos de propiedad:', error)
    return ['Apartamento', 'Casa', 'Villa', 'Cabaña', 'Loft', 'Estudio']
  }
}

/**
 * Obtiene los servicios incluidos desde la configuración
 */
export async function getIncludedServices(): Promise<string[]> {
  try {
    const setting = await getSettingByKey('included_services')
    if (!setting) {
      console.warn('⚠️ Configuración "included_services" no encontrada. Usando valores por defecto.')
      return ['WiFi', 'Limpieza', 'Toallas', 'Sábanas', 'Cocina equipada', 'Estacionamiento']
    }
    
    if (setting.config_type !== 'simple_list') {
      throw new Error('La configuración included_services debe ser de tipo simple_list')
    }
    
    return getSimpleListValue(setting)
  } catch (error) {
    console.error('💥 Error obteniendo servicios incluidos:', error)
    return ['WiFi', 'Limpieza', 'Toallas', 'Sábanas', 'Cocina equipada', 'Estacionamiento']
  }
}

/**
 * Obtiene los métodos de pago desde la configuración
 */
export async function getPaymentMethods(): Promise<Array<{ name: string; color: string }>> {
  try {
    const setting = await getSettingByKey('payment_methods')
    if (!setting) {
      console.warn('⚠️ Configuración "payment_methods" no encontrada. Usando valores por defecto.')
      return [
        { name: 'Tarjeta de Crédito', color: '#10b981' },
        { name: 'Transferencia', color: '#3b82f6' },
        { name: 'Efectivo', color: '#f59e0b' },
        { name: 'PayPal', color: '#8b5cf6' }
      ]
    }
    
    if (setting.config_type !== 'colored_list') {
      throw new Error('La configuración payment_methods debe ser de tipo colored_list')
    }
    
    return getColoredListValue(setting)
  } catch (error) {
    console.error('💥 Error obteniendo métodos de pago:', error)
    return [
      { name: 'Tarjeta de Crédito', color: '#10b981' },
      { name: 'Transferencia', color: '#3b82f6' },
      { name: 'Efectivo', color: '#f59e0b' },
      { name: 'PayPal', color: '#8b5cf6' }
    ]
  }
}

/**
 * Obtiene un estado de reserva específico por nombre
 */
export async function getReservationStatusByName(statusName: string): Promise<{ name: string; color: string } | null> {
  try {
    const statuses = await getReservationStatuses()
    return statuses.find(status => status.name === statusName) || null
  } catch (error) {
    console.error('💥 Error obteniendo estado de reserva por nombre:', error)
    return null
  }
}

/**
 * Verifica si un estado de reserva existe
 */
export async function isValidReservationStatus(statusName: string): Promise<boolean> {
  try {
    const statuses = await getReservationStatuses()
    return statuses.some(status => status.name === statusName)
  } catch (error) {
    console.error('💥 Error verificando estado de reserva válido:', error)
    return false
  }
}
