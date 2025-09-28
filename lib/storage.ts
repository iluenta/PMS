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

export class TuriGestStorageService {
  private bucketName = "properties"

  async uploadImage(file: File, folder = ""): Promise<UploadResult> {
    try {
      console.log('Uploading image:', file.name, 'to bucket:', this.bucketName)
      
      // Validate file type
      if (!file.type.startsWith("image/")) {
        return { url: null, error: "El archivo debe ser una imagen", path: null }
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return { url: null, error: "La imagen debe ser menor a 5MB", path: null }
      }

      // Generate unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = folder ? `${folder}/${fileName}` : fileName

      console.log('Uploading to path:', filePath)

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, file)

      if (uploadError) {
        console.error('Supabase upload error:', uploadError)
        return { url: null, error: uploadError.message, path: null }
      }

      // Get public URL
      const { data } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath)

      console.log('Upload successful:', data.publicUrl)
      
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

  async getExistingImages(folder = ""): Promise<ExistingImage[]> {
    try {
      console.log('=== INICIANDO BÚSQUEDA DE IMÁGENES ===')
      console.log('Bucket:', this.bucketName)
      console.log('Folder:', folder || 'root')
      
      // Si folder está vacío, buscar en la raíz del bucket
      const searchPath = folder || ""
      
      console.log('Search path:', searchPath)
      
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
          message: error.message
        })
        return []
      }

      if (!data || data.length === 0) {
        console.log('No files found in bucket')
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
          const filePath = searchPath ? `${searchPath}/${file.name}` : file.name
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

  async checkBucketAccess(): Promise<{ exists: boolean; error?: string }> {
    try {
      console.log('=== VERIFICANDO ACCESO AL BUCKET ===')
      console.log('Bucket:', this.bucketName)
      
      // Intentar listar archivos en la raíz del bucket
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

  getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(path)
    return data.publicUrl
  }
}

export const storageService = new TuriGestStorageService()
