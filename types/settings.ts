// Tipos para las configuraciones del sistema

export type ConfigType = 'simple_list' | 'colored_list'

export interface ColoredListItem {
  name: string
  color: string
}

export interface SimpleListItem {
  name: string
}

export type ConfigValue = string[] | ColoredListItem[]

export interface Setting {
  id: number
  tenant_id: number | null
  key: string
  description: string | null
  config_type: ConfigType
  value: ConfigValue
  created_at: string
  updated_at: string
}

export interface CreateSettingData {
  key: string
  description: string
  config_type: ConfigType
  value: ConfigValue
  tenant_id?: number | null
}

export interface UpdateSettingData {
  key?: string
  description?: string
  config_type?: ConfigType
  value?: ConfigValue
}

// Tipos específicos para diferentes configuraciones
export interface ReservationStatus extends ColoredListItem {}

export interface PropertyType extends SimpleListItem {}

export interface IncludedService extends SimpleListItem {}

export interface PaymentMethod extends ColoredListItem {}

// Tipos para las respuestas de la API
export interface SettingsResponse {
  success: boolean
  data?: Setting[]
  error?: string
}

export interface SettingResponse {
  success: boolean
  data?: Setting
  error?: string
}

// Tipos para los formularios
export interface SettingFormData {
  key: string
  description: string
  config_type: ConfigType
  value: ConfigValue
}

// Tipos para la gestión de elementos de configuración
export interface ConfigItemFormData {
  name: string
  color?: string
}

// Tipos para la validación
export interface SettingValidation {
  key: string[]
  description: string[]
  config_type: string[]
  value: string[]
}
