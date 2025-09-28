/**
 * Script de migración rápida para mover imágenes existentes a estructura por tenant
 * Este script mueve las imágenes de la raíz del bucket a tenant-X/shared/
 */

import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface MigrationResult {
  success: boolean
  message: string
  oldPath?: string
  newPath?: string
}

class QuickImageMigration {
  private bucketName = 'properties'

  /**
   * Obtiene el tenant_id del usuario actual
   */
  private async getCurrentTenantId(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

      if (error || !data) {
        throw new Error('No se pudo obtener el tenant_id')
      }

      return data.tenant_id
    } catch (error) {
      console.error('Error getting tenant_id:', error)
      throw new Error('Error al obtener tenant_id')
    }
  }

  /**
   * Migra todas las imágenes de la raíz del bucket a tenant-X/shared/
   */
  async migrateAllImages(): Promise<MigrationResult[]> {
    const results: MigrationResult[] = []

    try {
      console.log('=== INICIANDO MIGRACIÓN RÁPIDA ===')

      // Obtener tenant_id actual
      const tenantId = await this.getCurrentTenantId()
      console.log('Tenant ID:', tenantId)

      // Listar archivos en la raíz del bucket
      const { data: files, error: listError } = await supabase.storage
        .from(this.bucketName)
        .list("")

      if (listError) {
        console.error('Error listing files:', listError)
        return [{
          success: false,
          message: `Error al listar archivos: ${listError.message}`
        }]
      }

      if (!files || files.length === 0) {
        console.log('No hay archivos para migrar')
        return [{
          success: true,
          message: 'No hay archivos para migrar'
        }]
      }

      console.log(`Encontrados ${files.length} archivos en la raíz del bucket`)

      // Filtrar solo archivos de imagen
      const imageFiles = files.filter(file => 
        file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
      )

      console.log(`Encontradas ${imageFiles.length} imágenes para migrar`)

      // Migrar cada imagen
      for (const file of imageFiles) {
        const oldPath = file.name
        const newPath = `tenant-${tenantId}/shared/${file.name}`

        console.log(`Migrando: ${oldPath} → ${newPath}`)

        try {
          // Descargar imagen desde la ruta antigua
          const { data: imageData, error: downloadError } = await supabase.storage
            .from(this.bucketName)
            .download(oldPath)

          if (downloadError) {
            results.push({
              success: false,
              message: `Error al descargar ${oldPath}: ${downloadError.message}`,
              oldPath
            })
            continue
          }

          // Subir imagen a la nueva ruta
          const { error: uploadError } = await supabase.storage
            .from(this.bucketName)
            .upload(newPath, imageData)

          if (uploadError) {
            results.push({
              success: false,
              message: `Error al subir ${newPath}: ${uploadError.message}`,
              oldPath,
              newPath
            })
            continue
          }

          // Eliminar imagen de la ruta antigua
          const { error: deleteError } = await supabase.storage
            .from(this.bucketName)
            .remove([oldPath])

          if (deleteError) {
            console.warn(`No se pudo eliminar ${oldPath}: ${deleteError.message}`)
            // No es crítico, la imagen ya está en la nueva ubicación
          }

          results.push({
            success: true,
            message: `Imagen migrada exitosamente`,
            oldPath,
            newPath
          })

          console.log(`✅ Migrado: ${oldPath} → ${newPath}`)

        } catch (error) {
          results.push({
            success: false,
            message: `Error durante migración de ${oldPath}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            oldPath,
            newPath
          })
        }
      }

      console.log('=== MIGRACIÓN COMPLETADA ===')
      return results

    } catch (error) {
      console.error('Error durante migración:', error)
      return [{
        success: false,
        message: `Error general: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }]
    }
  }

  /**
   * Muestra resumen de la migración
   */
  showSummary(results: MigrationResult[]) {
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
        if (result.oldPath) console.log(`   Archivo: ${result.oldPath}`)
      })
    }

    if (successful > 0) {
      console.log(`\n=== MIGRACIONES EXITOSAS ===`)
      results.filter(r => r.success).forEach(result => {
        console.log(`✅ ${result.oldPath} → ${result.newPath}`)
      })
    }
  }
}

// Función principal para ejecutar la migración
export async function runQuickMigration() {
  const migration = new QuickImageMigration()
  const results = await migration.migrateAllImages()
  migration.showSummary(results)
  return results
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runQuickMigration()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error ejecutando migración:', error)
      process.exit(1)
    })
}













