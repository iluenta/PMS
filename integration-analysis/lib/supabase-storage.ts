export interface UploadResult {
  url: string | null
  error: string | null
  path: string | null
}

export class SupabaseStorageService {
  private bucketName = "guide-images"

  async uploadImage(file: File, folder = "general"): Promise<UploadResult> {
    try {
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
      const filePath = `${folder}/${fileName}`

      // Simulate upload (replace with actual Supabase upload when integrated)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock successful upload
      const mockUrl = `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(file.name)}`

      return {
        url: mockUrl,
        error: null,
        path: filePath,
      }
    } catch (error) {
      return {
        url: null,
        error: error instanceof Error ? error.message : "Error al subir la imagen",
        path: null,
      }
    }
  }

  async deleteImage(path: string): Promise<{ error: string | null }> {
    try {
      // Simulate deletion (replace with actual Supabase deletion when integrated)
      await new Promise((resolve) => setTimeout(resolve, 500))

      return { error: null }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Error al eliminar la imagen",
      }
    }
  }

  getPublicUrl(path: string): string {
    // Mock public URL (replace with actual Supabase public URL when integrated)
    return `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(path)}`
  }
}

export const storageService = new SupabaseStorageService()
