/**
 * Script de migración de imágenes a estructura organizada por tenant
 * Este script debe ejecutarse después de implementar el nuevo servicio unificado
 */

import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase (usar variables de entorno)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface MigrationResult {
  success: boolean
  message: string
  details?: any
}

interface ImageMigration {
  oldPath: string
  newPath: string
  tenantId: number
  category: string
  entityId: string
  entityName: string
}

class ImageMigrationService {
  private bucketName = 'properties'

  /**
   * Obtiene todas las imágenes que necesitan migración
   */
  async getImagesToMigrate(): Promise<ImageMigration[]> {
    const migrations: ImageMigration[] = []

    try {
      // Obtener imágenes de propiedades
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, tenant_id, name, cover_image, images')

      if (propertiesError) throw propertiesError

      for (const property of properties || []) {
        if (property.cover_image) {
          migrations.push({
            oldPath: this.extractPathFromUrl(property.cover_image),
            newPath: `tenant-${property.tenant_id}/properties/${property.id}/cover.jpg`,
            tenantId: property.tenant_id,
            category: 'properties',
            entityId: property.id,
            entityName: property.name
          })
        }

        if (property.images && Array.isArray(property.images)) {
          property.images.forEach((imageUrl: string, index: number) => {
            migrations.push({
              oldPath: this.extractPathFromUrl(imageUrl),
              newPath: `tenant-${property.tenant_id}/properties/${property.id}/gallery/image-${index + 1}.jpg`,
              tenantId: property.tenant_id,
              category: 'properties',
              entityId: property.id,
              entityName: property.name
            })
          })
        }
      }

      // Obtener imágenes de playas
      const { data: beaches, error: beachesError } = await supabase
        .from('beaches')
        .select(`
          id, name, image_url,
          guides!inner(tenant_id, property_id)
        `)

      if (beachesError) throw beachesError

      for (const beach of beaches || []) {
        if (beach.image_url) {
          migrations.push({
            oldPath: this.extractPathFromUrl(beach.image_url),
            newPath: `tenant-${beach.guides.tenant_id}/guides/beaches/${beach.id}/image.jpg`,
            tenantId: beach.guides.tenant_id,
            category: 'guides',
            entityId: beach.id,
            entityName: beach.name
          })
        }
      }

      // Obtener imágenes de restaurantes
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select(`
          id, name, image_url,
          guides!inner(tenant_id, property_id)
        `)

      if (restaurantsError) throw restaurantsError

      for (const restaurant of restaurants || []) {
        if (restaurant.image_url) {
          migrations.push({
            oldPath: this.extractPathFromUrl(restaurant.image_url),
            newPath: `tenant-${restaurant.guides.tenant_id}/guides/restaurants/${restaurant.id}/image.jpg`,
            tenantId: restaurant.guides.tenant_id,
            category: 'guides',
            entityId: restaurant.id,
            entityName: restaurant.name
          })
        }
      }

      // Obtener imágenes de actividades
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select(`
          id, name, image_url,
          guides!inner(tenant_id, property_id)
        `)

      if (activitiesError) throw activitiesError

      for (const activity of activities || []) {
        if (activity.image_url) {
          migrations.push({
            oldPath: this.extractPathFromUrl(activity.image_url),
            newPath: `tenant-${activity.guides.tenant_id}/guides/activities/${activity.id}/image.jpg`,
            tenantId: activity.guides.tenant_id,
            category: 'guides',
            entityId: activity.id,
            entityName: activity.name
          })
        }
      }

      return migrations
    } catch (error) {
      console.error('Error getting images to migrate:', error)
      throw error
    }
  }

  /**
   * Extrae la ruta del archivo desde la URL pública
   */
  private extractPathFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const bucketIndex = pathParts.findIndex(part => part === this.bucketName)
      
      if (bucketIndex === -1 || bucketIndex === pathParts.length - 1) {
        throw new Error(`No se pudo extraer la ruta del bucket ${this.bucketName} de la URL: ${url}`)
      }
      
      return pathParts.slice(bucketIndex + 1).join('/')
    } catch (error) {
      console.error('Error extracting path from URL:', url, error)
      throw new Error(`Error al extraer la ruta de la URL: ${url}`)
    }
  }

  /**
   * Migra una imagen individual
   */
  async migrateImage(migration: ImageMigration): Promise<MigrationResult> {
    try {
      console.log(`Migrando imagen: ${migration.entityName} (${migration.category})`)
      console.log(`  De: ${migration.oldPath}`)
      console.log(`  A: ${migration.newPath}`)

      // Descargar la imagen desde la ruta antigua
      const { data: imageData, error: downloadError } = await supabase.storage
        .from(this.bucketName)
        .download(migration.oldPath)

      if (downloadError) {
        return {
          success: false,
          message: `Error al descargar imagen: ${downloadError.message}`,
          details: { migration, error: downloadError }
        }
      }

      // Subir la imagen a la nueva ruta
      const { error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(migration.newPath, imageData)

      if (uploadError) {
        return {
          success: false,
          message: `Error al subir imagen: ${uploadError.message}`,
          details: { migration, error: uploadError }
        }
      }

      // Obtener la nueva URL pública
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(migration.newPath)

      return {
        success: true,
        message: `Imagen migrada exitosamente`,
        details: {
          migration,
          newUrl: urlData.publicUrl
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `Error durante la migración: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        details: { migration, error }
      }
    }
  }

  /**
   * Actualiza las referencias en la base de datos
   */
  async updateDatabaseReferences(migration: ImageMigration, newUrl: string): Promise<MigrationResult> {
    try {
      let updateResult

      switch (migration.category) {
        case 'properties':
          // Actualizar cover_image o images array
          const { data: property } = await supabase
            .from('properties')
            .select('cover_image, images')
            .eq('id', migration.entityId)
            .single()

          if (property?.cover_image && property.cover_image.includes(migration.oldPath)) {
            updateResult = await supabase
              .from('properties')
              .update({ cover_image: newUrl })
              .eq('id', migration.entityId)
          } else if (property?.images) {
            const updatedImages = property.images.map((url: string) => 
              url.includes(migration.oldPath) ? newUrl : url
            )
            updateResult = await supabase
              .from('properties')
              .update({ images: updatedImages })
              .eq('id', migration.entityId)
          }
          break

        case 'guides':
          // Determinar el tipo de guía por la ruta
          if (migration.newPath.includes('/beaches/')) {
            updateResult = await supabase
              .from('beaches')
              .update({ image_url: newUrl })
              .eq('id', migration.entityId)
          } else if (migration.newPath.includes('/restaurants/')) {
            updateResult = await supabase
              .from('restaurants')
              .update({ image_url: newUrl })
              .eq('id', migration.entityId)
          } else if (migration.newPath.includes('/activities/')) {
            updateResult = await supabase
              .from('activities')
              .update({ image_url: newUrl })
              .eq('id', migration.entityId)
          }
          break
      }

      if (updateResult?.error) {
        return {
          success: false,
          message: `Error al actualizar base de datos: ${updateResult.error.message}`,
          details: { migration, error: updateResult.error }
        }
      }

      return {
        success: true,
        message: `Referencias de base de datos actualizadas`,
        details: { migration, newUrl }
      }
    } catch (error) {
      return {
        success: false,
        message: `Error al actualizar referencias: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        details: { migration, error }
      }
    }
  }

  /**
   * Elimina la imagen de la ruta antigua
   */
  async removeOldImage(oldPath: string): Promise<MigrationResult> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([oldPath])

      if (error) {
        return {
          success: false,
          message: `Error al eliminar imagen antigua: ${error.message}`,
          details: { oldPath, error }
        }
      }

      return {
        success: true,
        message: `Imagen antigua eliminada`,
        details: { oldPath }
      }
    } catch (error) {
      return {
        success: false,
        message: `Error al eliminar imagen antigua: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        details: { oldPath, error }
      }
    }
  }

  /**
   * Ejecuta la migración completa
   */
  async executeMigration(dryRun = true): Promise<MigrationResult[]> {
    const results: MigrationResult[] = []

    try {
      console.log('=== INICIANDO MIGRACIÓN DE IMÁGENES ===')
      console.log(`Modo: ${dryRun ? 'SIMULACIÓN (dry run)' : 'MIGRACIÓN REAL'}`)

      const migrations = await this.getImagesToMigrate()
      console.log(`Encontradas ${migrations.length} imágenes para migrar`)

      for (const migration of migrations) {
        console.log(`\nProcesando: ${migration.entityName} (${migration.category})`)

        if (dryRun) {
          results.push({
            success: true,
            message: `SIMULACIÓN: Se migraría de ${migration.oldPath} a ${migration.newPath}`,
            details: { migration }
          })
        } else {
          // Migrar imagen
          const migrateResult = await this.migrateImage(migration)
          results.push(migrateResult)

          if (migrateResult.success && migrateResult.details?.newUrl) {
            // Actualizar referencias en BD
            const updateResult = await this.updateDatabaseReferences(migration, migrateResult.details.newUrl)
            results.push(updateResult)

            if (updateResult.success) {
              // Eliminar imagen antigua
              const removeResult = await this.removeOldImage(migration.oldPath)
              results.push(removeResult)
            }
          }
        }
      }

      console.log('\n=== MIGRACIÓN COMPLETADA ===')
      return results
    } catch (error) {
      console.error('Error durante la migración:', error)
      results.push({
        success: false,
        message: `Error general: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        details: { error }
      })
      return results
    }
  }
}

// Función principal para ejecutar la migración
export async function runImageMigration(dryRun = true) {
  const migrationService = new ImageMigrationService()
  const results = await migrationService.executeMigration(dryRun)

  // Mostrar resumen
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length

  console.log(`\n=== RESUMEN DE MIGRACIÓN ===`)
  console.log(`✅ Exitosas: ${successful}`)
  console.log(`❌ Fallidas: ${failed}`)
  console.log(`📊 Total: ${results.length}`)

  if (failed > 0) {
    console.log(`\n=== ERRORES ===`)
    results.filter(r => !r.success).forEach(result => {
      console.log(`❌ ${result.message}`)
      if (result.details) {
        console.log(`   Detalles:`, result.details)
      }
    })
  }

  return results
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run')
  runImageMigration(dryRun)
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error ejecutando migración:', error)
      process.exit(1)
    })
}













