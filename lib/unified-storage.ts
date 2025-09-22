import { supabase } from "@/lib/supabase"

export interface UploadResult {
  url: string | null
  error: string | null
  path: string | null
}

export interface ExistingImage {
  name: string
  url: string
  size: number
  lastModified: string
}

export interface StoragePath {
  tenantId: number
  category: 'properties' | 'guides' | 'shared' | 'system'
  subcategory?: string
  entityId?: string
}

export class UnifiedStorageService {
  private bucketName = "properties"

  /**
   * Genera la ruta de storage basada en el tenant y categoría
   */
  private generateStoragePath(pathConfig: StoragePath, fileName: string): string {
    const { tenantId, category, subcategory, entityId } = pathConfig
    
    let path = `tenant-${tenantId}/${category}`
    
    if (subcategory) {
      path += `/${subcategory}`
    }
    
    if (entityId) {
      path += `/${entityId}`
    }
    
    return `${path}/${fileName}`
  }

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
   * Sube una imagen con organización por tenant
   */
  async uploadImage(file: File, pathConfig: Partial<StoragePath> = {}): Promise<UploadResult> {
    try {
      console.log('=== INICIANDO SUBIDA DE IMAGEN ===')
      console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type)
      
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        return { url: null, error: "El archivo debe ser una imagen", path: null }
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return { url: null, error: "La imagen debe ser menor a 5MB", path: null }
      }

      // Obtener tenant_id si no se proporciona
      const tenantId = pathConfig.tenantId || await this.getCurrentTenantId()
      
      // Configuración de ruta por defecto
      const fullPathConfig: StoragePath = {
        tenantId,
        category: pathConfig.category || 'shared',
        subcategory: pathConfig.subcategory,
        entityId: pathConfig.entityId
      }

      // Generar nombre único
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      // Generar ruta completa
      const filePath = this.generateStoragePath(fullPathConfig, fileName)

      console.log('Uploading to path:', filePath)
      console.log('Path config:', fullPathConfig)

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file)

      if (uploadError) {
        console.error('Supabase upload error:', uploadError)
        return { url: null, error: uploadError.message, path: null }
      }

      // Obtener URL pública
      const { data } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath)

      console.log('Upload successful:', data.publicUrl)
      console.log('=== FIN SUBIDA DE IMAGEN ===')
      
      return {
        url: data.publicUrl,
        error: null,
        path: filePath,
      }
    } catch (error) {
      console.error('Upload error:', error)
      return {
        url: null,
        error: error instanceof Error ? error.message : "Error al subir la imagen",
        path: null,
      }
    }
  }

  /**
   * Obtiene imágenes existentes para un tenant y categoría específica
   */
  async getExistingImages(pathConfig: Partial<StoragePath> = {}): Promise<ExistingImage[]> {
    try {
      console.log('=== INICIANDO BÚSQUEDA DE IMÁGENES ===')
      
      // Obtener tenant_id si no se proporciona
      const tenantId = pathConfig.tenantId || await this.getCurrentTenantId()
      
      // Configuración de ruta por defecto
      const fullPathConfig: StoragePath = {
        tenantId,
        category: pathConfig.category || 'shared',
        subcategory: pathConfig.subcategory,
        entityId: pathConfig.entityId
      }

      // Generar ruta de búsqueda
      let searchPath = `tenant-${fullPathConfig.tenantId}/${fullPathConfig.category}`
      
      if (fullPathConfig.subcategory) {
        searchPath += `/${fullPathConfig.subcategory}`
      }
      
      if (fullPathConfig.entityId) {
        searchPath += `/${fullPathConfig.entityId}`
      }

      console.log('Bucket:', this.bucketName)
      console.log('Search path:', searchPath)
      console.log('Path config:', fullPathConfig)
      
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(searchPath, {
          limit: 100,
          offset: 0,
        })

      console.log('Supabase response:')
      console.log('- Error:', error)
      console.log('- Data:', data)
      console.log('- Data length:', data?.length || 0)

      if (error) {
        console.error('Error fetching images:', error)
        console.error('Error details:', {
          message: error.message,
          statusCode: error.statusCode,
          error: error.error
        })
        return []
      }

      if (!data || data.length === 0) {
        console.log('No files found in path')
        return []
      }

      console.log('Raw files found:', data.map(f => ({ name: f.name, metadata: f.metadata })))

      const images: ExistingImage[] = (data || [])
        .filter(file => {
          // Filtrar solo archivos de imagen
          const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
          console.log(`File ${file.name} is image:`, !!isImage)
          return isImage
        })
        .map(file => {
          const filePath = `${searchPath}/${file.name}`
          const { data: urlData } = supabase.storage
            .from(this.bucketName)
            .getPublicUrl(filePath)

          console.log(`Generated URL for ${file.name}:`, urlData.publicUrl)

          return {
            name: file.name,
            url: urlData.publicUrl,
            size: file.metadata?.size || 0,
            lastModified: file.updated_at || file.created_at || new Date().toISOString()
          }
        })

      console.log('Processed images:', images.length)
      console.log('Images:', images)
      console.log('=== FIN BÚSQUEDA DE IMÁGENES ===')
      
      return images
    } catch (error) {
      console.error('Error fetching existing images:', error)
      return []
    }
  }

  /**
   * Verifica acceso al bucket
   */
  async checkBucketAccess(): Promise<{ exists: boolean; error?: string }> {
    try {
      console.log('=== VERIFICANDO ACCESO AL BUCKET ===')
      console.log('Bucket:', this.bucketName)
      
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list("", { limit: 1 })

      console.log('Bucket check response:')
      console.log('- Error:', error)
      console.log('- Data:', data)

      if (error) {
        console.error('Bucket access error:', error)
        return { 
          exists: false, 
          error: `Error accessing bucket: ${error.message}` 
        }
      }

      console.log('✅ Bucket access successful')
      console.log('=== FIN VERIFICACIÓN BUCKET ===')
      
      return { exists: true }
    } catch (error) {
      console.error('Bucket check error:', error)
      return { 
        exists: false, 
        error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }
    }
  }

  /**
   * Elimina una imagen
   */
  async deleteImage(path: string): Promise<{ error: string | null }> {
    try {
      console.log('Deleting image:', path)
      
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path])

      if (error) {
        console.error('Delete error:', error)
        return { error: error.message }
      }

      console.log('Image deleted successfully')
      return { error: null }
    } catch (error) {
      console.error('Delete error:', error)
      return {
        error: error instanceof Error ? error.message : "Error al eliminar la imagen",
      }
    }
  }

  /**
   * Obtiene URL pública de una imagen
   */
  getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path)
    return data.publicUrl
  }

  /**
   * Métodos de conveniencia para diferentes tipos de imágenes
   */

  // Para imágenes de propiedades
  async uploadPropertyImage(file: File, propertyId: string): Promise<UploadResult> {
    return this.uploadImage(file, {
      category: 'properties',
      entityId: propertyId
    })
  }

  // Para imágenes de guías (playas, restaurantes, etc.)
  async uploadGuideImage(file: File, guideType: string, entityId?: string): Promise<UploadResult> {
    return this.uploadImage(file, {
      category: 'guides',
      subcategory: guideType,
      entityId
    })
  }

  // Para imágenes compartidas del tenant
  async uploadSharedImage(file: File, subcategory?: string): Promise<UploadResult> {
    return this.uploadImage(file, {
      category: 'shared',
      subcategory
    })
  }

  // Obtener imágenes de propiedades
  async getPropertyImages(propertyId: string): Promise<ExistingImage[]> {
    return this.getExistingImages({
      category: 'properties',
      entityId: propertyId
    })
  }

  // Obtener imágenes de guías
  async getGuideImages(guideType: string, entityId?: string): Promise<ExistingImage[]> {
    return this.getExistingImages({
      category: 'guides',
      subcategory: guideType,
      entityId
    })
  }

  // Obtener imágenes compartidas
  async getSharedImages(subcategory?: string): Promise<ExistingImage[]> {
    try {
      console.log('=== BÚSQUEDA DE IMÁGENES COMPARTIDAS ===')
      
      // Obtener tenant_id del usuario actual
      const tenantId = await this.getCurrentTenantId()
      const searchPath = `tenant-${tenantId}/shared`
      
      console.log('Buscando en estructura organizada:', searchPath)
      
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(searchPath, {
          limit: 100,
          offset: 0,
        })

      console.log('Supabase response:')
      console.log('- Error:', error)
      console.log('- Data:', data)
      console.log('- Data length:', data?.length || 0)

      if (error) {
        console.error('Error fetching images:', error)
        return []
      }

      if (!data || data.length === 0) {
        console.log('No files found in tenant shared folder')
        return []
      }

      console.log('Raw files found:', data.map(f => ({ name: f.name, metadata: f.metadata })))

      const images: ExistingImage[] = (data || [])
        .filter(file => {
          // Filtrar solo archivos de imagen
          const isImage = file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)
          console.log(`File ${file.name} is image:`, !!isImage)
          return isImage
        })
        .map(file => {
          const filePath = `${searchPath}/${file.name}`
          const { data: urlData } = supabase.storage
            .from(this.bucketName)
            .getPublicUrl(filePath)

          console.log(`Generated URL for ${file.name}:`, urlData.publicUrl)

          return {
            name: file.name,
            url: urlData.publicUrl,
            size: file.metadata?.size || 0,
            lastModified: file.updated_at || file.created_at || new Date().toISOString()
          }
        })

      console.log('Processed images:', images.length)
      console.log('Images:', images)
      console.log('=== FIN BÚSQUEDA DE IMÁGENES COMPARTIDAS ===')
      
      return images
    } catch (error) {
      console.error('Error fetching shared images:', error)
      return []
    }
  }
}

export const unifiedStorageService = new UnifiedStorageService()
