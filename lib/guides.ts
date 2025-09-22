// Servicio para operaciones CRUD de guías del viajero
// Integrado con Supabase y multi-tenant

import { supabase } from '@/lib/supabase'
import type {
  Guide,
  GuideSection,
  ApartmentSection,
  Beach,
  Restaurant,
  Activity,
  HouseRule,
  HouseGuideItem,
  Tip,
  ContactInfo,
  PracticalInfo,
  CreateGuideData,
  UpdateGuideData,
  CreateGuideSectionData,
  UpdateGuideSectionData,
  CreateApartmentSectionData,
  UpdateApartmentSectionData,
  CreateBeachData,
  UpdateBeachData,
  CreateRestaurantData,
  UpdateRestaurantData,
  CreateActivityData,
  UpdateActivityData,
  CreateHouseRuleData,
  UpdateHouseRuleData,
  CreateHouseGuideItemData,
  UpdateHouseGuideItemData,
  CreateTipData,
  UpdateTipData,
  CreateContactInfoData,
  UpdateContactInfoData,
  CreatePracticalInfoData,
  UpdatePracticalInfoData
} from '@/types/guides'

// Función auxiliar para obtener el tenant_id del usuario autenticado
async function getCurrentUserTenantId(): Promise<number | null> {
  try {
    console.log('🔍 Obteniendo tenant_id del usuario...')
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      console.error('❌ Error obteniendo usuario:', userError)
      return null
    }
    
    if (!user) {
      console.error('❌ Usuario no autenticado')
      return null
    }
    
    console.log('✅ Usuario autenticado:', user.id)
    
    const { data: userData, error } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .single()
    
    if (error) {
      console.error('❌ Error obteniendo datos del usuario:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      return null
    }
    
    if (!userData) {
      console.error('❌ No se encontraron datos del usuario')
      return null
    }
    
    console.log('✅ Tenant ID obtenido:', userData.tenant_id)
    return userData.tenant_id
  } catch (error) {
    console.error('❌ Error en getCurrentUserTenantId:', error)
    return null
  }
}

function mapError(error: any, fallback: string) {
  const message = error?.message || error?.details || error?.hint || fallback
  return new Error(message)
}

// ===== GUÍAS =====
export async function getGuide(propertyId: string): Promise<Guide | null> {
  try {
    console.log('Fetching guide for property:', propertyId)
    
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .eq('property_id', propertyId)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      // Si no se encuentra la guía, no es un error crítico
      if (error.code === 'PGRST116') {
        console.log('No guide found for property:', propertyId)
        return null
      }
      throw error
    }
    
    console.log('Guide found:', data)
    return data
  } catch (error) {
    console.error('Error fetching guide:', error)
    return null
  }
}

export async function createGuide(guideData: CreateGuideData): Promise<Guide | null> {
  try {
    console.log('Creating guide with data:', guideData)
    
    // Obtener el tenant_id del usuario autenticado
    const tenantId = await getCurrentUserTenantId()
    if (!tenantId) {
      throw new Error('No se pudo determinar el tenant del usuario')
    }
    
    console.log('User tenant_id:', tenantId)
    
    const dataToInsert = {
      ...guideData,
      tenant_id: tenantId
    }
    
    console.log('Guide data to insert:', dataToInsert)
    
    // Verificar que tenemos todos los campos requeridos
    if (!dataToInsert.property_id) {
      throw new Error('property_id es requerido')
    }
    if (!dataToInsert.tenant_id) {
      throw new Error('tenant_id es requerido')
    }
    
    console.log('Inserting guide into database...')
    
    const { data, error } = await supabase
      .from('guides')
      .insert(dataToInsert)
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating guide:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        fullError: error
      })
      throw mapError(error, 'Error al crear la guía')
    }
    
    console.log('Guide created successfully:', data)
    return data
  } catch (error) {
    console.error('Error creating guide:', error)
    return null
  }
}

export async function updateGuide(guideId: string, guideData: UpdateGuideData): Promise<Guide | null> {
  try {
    const { data, error } = await supabase
      .from('guides')
      .update(guideData)
      .eq('id', guideId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating guide:', error)
    return null
  }
}

export async function deleteGuide(guideId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('guides')
      .delete()
      .eq('id', guideId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting guide:', error)
    return false
  }
}

// ===== SECCIONES DE GUÍA =====
export async function getGuideSections(guideId: string): Promise<GuideSection[]> {
  try {
    const { data, error } = await supabase
      .from('guide_sections')
      .select('*')
      .eq('guide_id', guideId)
      .order('order_index')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching guide sections:', error)
    return []
  }
}

export async function createGuideSection(sectionData: CreateGuideSectionData): Promise<GuideSection | null> {
  try {
    console.log('Creating guide section with data:', sectionData)
    
    // Obtener el tenant_id del usuario autenticado
    const tenantId = await getCurrentUserTenantId()
    if (!tenantId) {
      throw new Error('No se pudo determinar el tenant del usuario')
    }
    
    console.log('User tenant_id:', tenantId)
    
    const dataToInsert = {
      ...sectionData,
      tenant_id: tenantId
    }
    
    console.log('Section data to insert:', dataToInsert)
    
    // Verificar que tenemos todos los campos requeridos
    if (!dataToInsert.guide_id) {
      throw new Error('guide_id es requerido')
    }
    if (!dataToInsert.tenant_id) {
      throw new Error('tenant_id es requerido')
    }
    
    console.log('Inserting section into database...')
    
    const { data, error } = await supabase
      .from('guide_sections')
      .insert(dataToInsert)
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating guide section:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw mapError(error, 'Error al crear la sección de la guía')
    }
    
    console.log('Guide section created successfully:', data)
    return data
  } catch (error) {
    console.error('Error creating guide section:', error)
    return null
  }
}

export async function updateGuideSection(sectionId: string, sectionData: UpdateGuideSectionData): Promise<GuideSection | null> {
  try {
    const { data, error } = await supabase
      .from('guide_sections')
      .update(sectionData)
      .eq('id', sectionId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating guide section:', error)
    return null
  }
}

export async function deleteGuideSection(sectionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('guide_sections')
      .delete()
      .eq('id', sectionId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting guide section:', error)
    return false
  }
}

// ===== SECCIONES DEL APARTAMENTO =====
export async function getApartmentSections(guideId: string): Promise<ApartmentSection[]> {
  try {
    const { data, error } = await supabase
      .from('apartment_sections')
      .select('*')
      .eq('guide_id', guideId)
      .order('order_index')

    if (error) {
      console.error('Supabase error fetching apartment sections:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      // Si la tabla no existe, devolver array vacío sin error
      if (error.code === '42P01') { // Table doesn't exist
        console.warn('Table apartment_sections does not exist yet. Returning empty array.')
        return []
      }
      throw error
    }
    
    console.log('Apartment sections fetched successfully:', data)
    
    // Debug: Log específico para verificar el campo icon
    if (data && data.length > 0) {
      console.log('🔍 Debug apartment sections icons:')
      data.forEach((section, index) => {
        console.log(`  ${index + 1}. ${section.title}:`)
        console.log(`     - ID: ${section.id}`)
        console.log(`     - Section Type: ${section.section_type}`)
        console.log(`     - Icon from DB: "${section.icon}"`)
        console.log(`     - Has Icon: ${!!section.icon}`)
        console.log(`     - Icon Type: ${typeof section.icon}`)
        console.log(`     - Icon Length: ${section.icon ? section.icon.length : 0}`)
        console.log('     ---')
      })
    }
    
    return data || []
  } catch (error) {
    console.error('Error fetching apartment sections:', error)
    return []
  }
}

export async function createApartmentSection(sectionData: CreateApartmentSectionData): Promise<ApartmentSection | null> {
  try {
    console.log('Creating apartment section with data:', sectionData)
    
    // Obtener el tenant_id del usuario autenticado
    const tenantId = await getCurrentUserTenantId()
    if (!tenantId) {
      throw new Error('No se pudo determinar el tenant del usuario')
    }
    
    console.log('User tenant_id:', tenantId)
    
    const dataToInsert = {
      ...sectionData,
      tenant_id: tenantId
    }
    
    console.log('Apartment section data to insert:', dataToInsert)
    
    // Verificar que tenemos todos los campos requeridos
    if (!dataToInsert.guide_id) {
      throw new Error('guide_id es requerido')
    }
    if (!dataToInsert.tenant_id) {
      throw new Error('tenant_id es requerido')
    }
    
    console.log('Inserting apartment section into database...')
    
    const { data, error } = await supabase
      .from('apartment_sections')
      .insert(dataToInsert)
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating apartment section:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw mapError(error, 'Error al crear la sección del apartamento')
    }
    
    console.log('Apartment section created successfully:', data)
    return data
  } catch (error) {
    console.error('Error creating apartment section:', error)
    return null
  }
}

export async function updateApartmentSection(sectionId: string, sectionData: UpdateApartmentSectionData): Promise<ApartmentSection | null> {
  try {
    const { data, error } = await supabase
      .from('apartment_sections')
      .update(sectionData)
      .eq('id', sectionId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating apartment section:', error)
    return null
  }
}

export async function deleteApartmentSection(sectionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('apartment_sections')
      .delete()
      .eq('id', sectionId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting apartment section:', error)
    return false
  }
}

// ===== PLAYAS =====
export async function getBeaches(guideId: string): Promise<Beach[]> {
  try {
    const { data, error } = await supabase
      .from('beaches')
      .select('*')
      .eq('guide_id', guideId)
      .order('order_index')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching beaches:', error)
    return []
  }
}

export async function createBeach(beachData: CreateBeachData): Promise<Beach | null> {
  try {
    console.log('Creating beach with data:', beachData)
    
    // Obtener el tenant_id del usuario autenticado
    const tenantId = await getCurrentUserTenantId()
    if (!tenantId) {
      throw new Error('No se pudo determinar el tenant del usuario')
    }
    
    console.log('User tenant_id:', tenantId)
    
    const dataToInsert = {
      ...beachData,
      tenant_id: tenantId
    }
    
    console.log('Beach data to insert:', dataToInsert)
    
    // Verificar que tenemos todos los campos requeridos
    if (!dataToInsert.guide_id) {
      throw new Error('guide_id es requerido')
    }
    if (!dataToInsert.tenant_id) {
      throw new Error('tenant_id es requerido')
    }
    
    console.log('Inserting beach into database...')
    
    const { data, error } = await supabase
      .from('beaches')
      .insert(dataToInsert)
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating beach:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw mapError(error, 'Error al crear la playa')
    }
    
    console.log('Beach created successfully:', data)
    return data
  } catch (error) {
    console.error('Error creating beach:', error)
    return null
  }
}

export async function updateBeach(beachId: string, beachData: UpdateBeachData): Promise<Beach | null> {
  try {
    console.log('Updating beach:', beachId, beachData)
    
    const { data, error } = await supabase
      .from('beaches')
      .update(beachData)
      .eq('id', beachId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error updating beach:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw mapError(error, 'Error al actualizar la playa')
    }
    
    console.log('Beach updated successfully:', data)
    return data
  } catch (error) {
    console.error('Error updating beach:', error)
    return null
  }
}

export async function deleteBeach(beachId: string): Promise<boolean> {
  try {
    console.log('Deleting beach:', beachId)
    
    const { error } = await supabase
      .from('beaches')
      .delete()
      .eq('id', beachId)

    if (error) {
      console.error('Supabase error deleting beach:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw mapError(error, 'Error al eliminar la playa')
    }
    
    console.log('Beach deleted successfully')
    return true
  } catch (error) {
    console.error('Error deleting beach:', error)
    return false
  }
}

// ===== RESTAURANTES =====
export async function getRestaurants(guideId: string): Promise<Restaurant[]> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('guide_id', guideId)
      .order('order_index')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return []
  }
}

export async function createRestaurant(restaurantData: CreateRestaurantData): Promise<Restaurant | null> {
  try {
    console.log('=== CREATING RESTAURANT ===')
    console.log('Input restaurantData:', JSON.stringify(restaurantData, null, 2))
    
    const tenantId = await getCurrentUserTenantId()
    if (!tenantId) {
      console.error('❌ No se pudo obtener tenant_id del usuario')
      throw new Error('No se pudo determinar el tenant del usuario')
    }
    
    console.log('✅ User tenant_id:', tenantId)
    
    const dataToInsert = {
      ...restaurantData,
      tenant_id: tenantId
    }
    
    console.log('📝 Data to insert:', JSON.stringify(dataToInsert, null, 2))
    
    if (!dataToInsert.guide_id) {
      console.error('❌ guide_id es requerido')
      throw new Error('guide_id es requerido')
    }
    
    if (!dataToInsert.name || dataToInsert.name.trim() === '') {
      console.error('❌ name es requerido')
      throw new Error('name es requerido')
    }
    
    console.log('🚀 Ejecutando insert en Supabase...')
    
    const { data, error } = await supabase
      .from('restaurants')
      .insert(dataToInsert)
      .select()
      .single()

    if (error) {
      console.error('❌ SUPABASE ERROR:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        data: dataToInsert
      })
      throw error
    }
    
    console.log('✅ Restaurant created successfully:', JSON.stringify(data, null, 2))
    console.log('=== END CREATING RESTAURANT ===')
    return data
  } catch (error) {
    console.error('❌ CATCH ERROR creating restaurant:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    console.log('=== END CREATING RESTAURANT (ERROR) ===')
    return null
  }
}

export async function updateRestaurant(restaurantId: string, restaurantData: UpdateRestaurantData): Promise<Restaurant | null> {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .update(restaurantData)
      .eq('id', restaurantId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating restaurant:', error)
    return null
  }
}

export async function deleteRestaurant(restaurantId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', restaurantId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting restaurant:', error)
    return false
  }
}

// ===== ACTIVIDADES =====
export async function getActivities(guideId: string): Promise<Activity[]> {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('guide_id', guideId)
      .order('order_index')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching activities:', error)
    return []
  }
}

export async function createActivity(activityData: CreateActivityData): Promise<Activity | null> {
  try {
    console.log('=== CREATING ACTIVITY ===')
    console.log('Input activityData:', JSON.stringify(activityData, null, 2))
    
    const tenantId = await getCurrentUserTenantId()
    if (!tenantId) {
      console.error('❌ No se pudo obtener tenant_id del usuario')
      throw new Error('No se pudo determinar el tenant del usuario')
    }
    
    console.log('✅ User tenant_id:', tenantId)
    
    const dataToInsert = {
      ...activityData,
      tenant_id: tenantId
    }
    
    console.log('📝 Data to insert:', JSON.stringify(dataToInsert, null, 2))
    
    if (!dataToInsert.guide_id) {
      console.error('❌ guide_id es requerido')
      throw new Error('guide_id es requerido')
    }
    
    if (!dataToInsert.name || dataToInsert.name.trim() === '') {
      console.error('❌ name es requerido')
      throw new Error('name es requerido')
    }
    
    console.log('🚀 Ejecutando insert en Supabase...')
    
    const { data, error } = await supabase
      .from('activities')
      .insert(dataToInsert)
      .select()
      .single()

    if (error) {
      console.error('❌ SUPABASE ERROR:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        data: dataToInsert
      })
      throw error
    }
    
    console.log('✅ Activity created successfully:', JSON.stringify(data, null, 2))
    console.log('=== END CREATING ACTIVITY ===')
    return data
  } catch (error) {
    console.error('❌ CATCH ERROR creating activity:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    console.log('=== END CREATING ACTIVITY (ERROR) ===')
    return null
  }
}

export async function updateActivity(activityId: string, activityData: UpdateActivityData): Promise<Activity | null> {
  try {
    const { data, error } = await supabase
      .from('activities')
      .update(activityData)
      .eq('id', activityId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating activity:', error)
    return null
  }
}

export async function deleteActivity(activityId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', activityId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting activity:', error)
    return false
  }
}

// ===== NORMAS DE LA CASA =====
export async function getHouseRules(guideId: string): Promise<HouseRule[]> {
  try {
    const { data, error } = await supabase
      .from('house_rules')
      .select('*')
      .eq('guide_id', guideId)
      .order('order_index')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching house rules:', error)
    return []
  }
}

export async function createHouseRule(ruleData: CreateHouseRuleData): Promise<HouseRule | null> {
  try {
    console.log('Creating house rule with data:', ruleData)
    
    // Obtener el tenant_id del usuario autenticado
    const tenantId = await getCurrentUserTenantId()
    if (!tenantId) {
      throw new Error('No se pudo determinar el tenant del usuario')
    }
    
    console.log('User tenant_id:', tenantId)
    
    const dataToInsert = {
      ...ruleData,
      tenant_id: tenantId
    }
    
    console.log('House rule data to insert:', dataToInsert)
    
    // Verificar que tenemos todos los campos requeridos
    if (!dataToInsert.guide_id) {
      throw new Error('guide_id es requerido')
    }
    if (!dataToInsert.tenant_id) {
      throw new Error('tenant_id es requerido')
    }
    
    console.log('Inserting house rule into database...')
    
    const { data, error } = await supabase
      .from('house_rules')
      .insert(dataToInsert)
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating house rule:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw mapError(error, 'Error al crear la norma de la casa')
    }
    
    console.log('House rule created successfully:', data)
    return data
  } catch (error) {
    console.error('Error creating house rule:', error)
    return null
  }
}

export async function updateHouseRule(ruleId: string, ruleData: UpdateHouseRuleData): Promise<HouseRule | null> {
  try {
    const { data, error } = await supabase
      .from('house_rules')
      .update(ruleData)
      .eq('id', ruleId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating house rule:', error)
    return null
  }
}

export async function deleteHouseRule(ruleId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('house_rules')
      .delete()
      .eq('id', ruleId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting house rule:', error)
    return false
  }
}

// ===== ELEMENTOS DE LA GUÍA DE LA CASA =====
export async function getHouseGuideItems(guideId: string): Promise<HouseGuideItem[]> {
  try {
    const { data, error } = await supabase
      .from('house_guide_items')
      .select('*')
      .eq('guide_id', guideId)
      .order('order_index')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching house guide items:', error)
    return []
  }
}

export async function createHouseGuideItem(itemData: CreateHouseGuideItemData): Promise<HouseGuideItem | null> {
  try {
    console.log('Creating house guide item with data:', itemData)
    
    // Obtener el tenant_id del usuario autenticado
    const tenantId = await getCurrentUserTenantId()
    if (!tenantId) {
      throw new Error('No se pudo determinar el tenant del usuario')
    }
    
    console.log('User tenant_id:', tenantId)
    
    const dataToInsert = {
      ...itemData,
      tenant_id: tenantId
    }
    
    console.log('Data to insert:', dataToInsert)
    
    const { data, error } = await supabase
      .from('house_guide_items')
      .insert(dataToInsert)
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating house guide item:', error)
      throw error
    }
    
    console.log('House guide item created successfully:', data)
    return data
  } catch (error) {
    console.error('Error creating house guide item:', error)
    return null
  }
}

export async function updateHouseGuideItem(itemId: string, itemData: UpdateHouseGuideItemData): Promise<HouseGuideItem | null> {
  try {
    const { data, error } = await supabase
      .from('house_guide_items')
      .update(itemData)
      .eq('id', itemId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating house guide item:', error)
    return null
  }
}

export async function deleteHouseGuideItem(itemId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('house_guide_items')
      .delete()
      .eq('id', itemId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting house guide item:', error)
    return false
  }
}

// ===== CONSEJOS =====
export async function getTips(guideId: string): Promise<Tip[]> {
  try {
    const { data, error } = await supabase
      .from('tips')
      .select('*')
      .eq('guide_id', guideId)
      .order('order_index')

    if (error) {
      console.error('Supabase error fetching tips:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      // Si la tabla no existe, devolver array vacío sin error
      if (error.code === '42P01') { // Table doesn't exist
        console.warn('Table tips does not exist yet. Returning empty array.')
        return []
      }
      throw error
    }
    return data || []
  } catch (error) {
    console.error('Error fetching tips:', error)
    return []
  }
}

export async function createTip(tipData: CreateTipData): Promise<Tip | null> {
  try {
    console.log('=== CREATING TIP ===')
    console.log('Input tipData:', JSON.stringify(tipData, null, 2))
    
    // Obtener el tenant_id del usuario autenticado
    const tenantId = await getCurrentUserTenantId()
    if (!tenantId) {
      console.error('❌ No se pudo obtener tenant_id del usuario')
      throw new Error('No se pudo determinar el tenant del usuario')
    }
    
    console.log('✅ User tenant_id:', tenantId)
    
    const dataToInsert = {
      ...tipData,
      tenant_id: tenantId
    }
    
    console.log('📝 Data to insert:', JSON.stringify(dataToInsert, null, 2))
    
    // Validar datos requeridos
    if (!dataToInsert.guide_id) {
      console.error('❌ guide_id es requerido')
      throw new Error('guide_id es requerido')
    }
    
    if (!dataToInsert.title || dataToInsert.title.trim() === '') {
      console.error('❌ title es requerido')
      throw new Error('title es requerido')
    }
    
    console.log('🚀 Ejecutando insert en Supabase...')
    
    const { data, error } = await supabase
      .from('tips')
      .insert(dataToInsert)
      .select()
      .single()

    if (error) {
      console.error('❌ SUPABASE ERROR:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        data: dataToInsert
      })
      
      // Si la tabla no existe, mostrar mensaje específico
      if (error.code === '42P01') { // Table doesn't exist
        console.error('ERROR: La tabla "tips" no existe en la base de datos.')
        console.error('SOLUCIÓN: Ejecuta el script SQL scripts/96-create-tips-table-simple.sql en Supabase')
        throw new Error('La tabla "tips" no existe. Ejecuta el script SQL para crearla.')
      }
      
      throw error
    }
    
    console.log('✅ Tip created successfully:', JSON.stringify(data, null, 2))
    console.log('=== END CREATING TIP ===')
    return data
  } catch (error) {
    console.error('❌ CATCH ERROR creating tip:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    console.log('=== END CREATING TIP (ERROR) ===')
    return null
  }
}

export async function updateTip(tipId: string, tipData: UpdateTipData): Promise<Tip | null> {
  try {
    const { data, error } = await supabase
      .from('tips')
      .update(tipData)
      .eq('id', tipId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error updating tip:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        tipId,
        tipData
      })
      
      if (error.code === '42P01') { // Table doesn't exist
        console.error('ERROR: La tabla "tips" no existe en la base de datos.')
        throw new Error('La tabla "tips" no existe. Ejecuta el script SQL para crearla.')
      }
      
      throw error
    }
    return data
  } catch (error) {
    console.error('Error updating tip:', error)
    return null
  }
}

export async function deleteTip(tipId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tips')
      .delete()
      .eq('id', tipId)

    if (error) {
      console.error('Supabase error deleting tip:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        tipId
      })
      
      if (error.code === '42P01') { // Table doesn't exist
        console.error('ERROR: La tabla "tips" no existe en la base de datos.')
        throw new Error('La tabla "tips" no existe. Ejecuta el script SQL para crearla.')
      }
      
      throw error
    }
    return true
  } catch (error) {
    console.error('Error deleting tip:', error)
    return false
  }
}

// ===== INFORMACIÓN DE CONTACTO =====
export async function getContactInfo(guideId: string): Promise<ContactInfo | null> {
  try {
    console.log('Fetching contact info for guide:', guideId)
    
    const { data, error } = await supabase
      .from('contact_info')
      .select('*')
      .eq('guide_id', guideId)
      .single()

    if (error) {
      // Si no se encuentra la información de contacto, no es un error crítico
      if (error.code === 'PGRST116') {
        console.log('No contact info found for guide:', guideId)
        return null
      }
      console.error('Supabase error fetching contact info:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      throw mapError(error, 'Error al obtener información de contacto')
    }
    
    console.log('Contact info found:', data)
    return data
  } catch (error) {
    console.error('Error fetching contact info:', error)
    return null
  }
}

export async function createContactInfo(contactData: CreateContactInfoData): Promise<ContactInfo | null> {
  try {
    const { data, error } = await supabase
      .from('contact_info')
      .insert(contactData)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating contact info:', error)
    return null
  }
}

export async function updateContactInfo(contactId: string, contactData: UpdateContactInfoData): Promise<ContactInfo | null> {
  try {
    const { data, error } = await supabase
      .from('contact_info')
      .update(contactData)
      .eq('id', contactId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating contact info:', error)
    return null
  }
}

// ===== INFORMACIÓN PRÁCTICA =====
export async function getPracticalInfo(guideId: string): Promise<PracticalInfo[]> {
  try {
    const { data, error } = await supabase
      .from('practical_info')
      .select('*')
      .eq('guide_id', guideId)
      .order('order_index')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching practical info:', error)
    return []
  }
}

export async function createPracticalInfo(practicalData: CreatePracticalInfoData): Promise<PracticalInfo | null> {
  try {
    const { data, error } = await supabase
      .from('practical_info')
      .insert(practicalData)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating practical info:', error)
    return null
  }
}

export async function updatePracticalInfo(practicalId: string, practicalData: UpdatePracticalInfoData): Promise<PracticalInfo | null> {
  try {
    const { data, error } = await supabase
      .from('practical_info')
      .update(practicalData)
      .eq('id', practicalId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating practical info:', error)
    return null
  }
}

export async function deletePracticalInfo(practicalId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('practical_info')
      .delete()
      .eq('id', practicalId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting practical info:', error)
    return false
  }
}

// ===== FUNCIÓN HELPER PARA OBTENER TODOS LOS DATOS DE UNA GUÍA =====
export async function getCompleteGuideData(propertyId: string) {
  try {
    console.log('Fetching complete guide data for property:', propertyId)
    
    // Obtener la propiedad
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, name, address, description')
      .eq('id', propertyId)
      .single()

    if (propertyError) {
      console.error('Error fetching property:', propertyError)
      throw propertyError
    }

    console.log('Property found:', property)

    // Obtener la guía
    const guide = await getGuide(propertyId)
    if (!guide) {
      console.log('No guide found for property, returning null')
      return null
    }

    console.log('Guide found, fetching related data...')

    // Obtener todos los datos relacionados
    const [
      sections,
      apartmentSections,
      beaches,
      restaurants,
      activities,
      houseRules,
      houseGuideItems,
      tips,
      contactInfo,
      practicalInfo
    ] = await Promise.all([
      getGuideSections(guide.id),
      getApartmentSections(guide.id),
      getBeaches(guide.id),
      getRestaurants(guide.id),
      getActivities(guide.id),
      getHouseRules(guide.id),
      getHouseGuideItems(guide.id),
      getTips(guide.id),
      getContactInfo(guide.id),
      getPracticalInfo(guide.id)
    ])

    const result = {
      property,
      guide,
      sections,
      apartment_sections: apartmentSections,
      beaches,
      restaurants,
      activities,
      house_rules: houseRules,
      house_guide_items: houseGuideItems,
      tips,
      contact_info: contactInfo,
      practical_info: practicalInfo
    }

    console.log('Complete guide data fetched successfully:', result)
    return result
  } catch (error) {
    console.error('Error fetching complete guide data:', error)
    return null
  }
}
