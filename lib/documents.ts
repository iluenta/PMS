import { supabase } from './supabase'
import type { DocumentMeta } from '@/types/documents'

const BUCKET = 'expense-documents'
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = new Set(['application/pdf', 'image/png', 'image/jpeg'])

export interface UploadExpenseDocumentArgs {
  expenseId: string
  file: File | Blob
  originalName: string
  mimeType: string
  uploadedBy?: string
  tenantId: number // Agregar tenant_id como campo requerido
}

export interface GetSignedUrlArgs {
  path: string
  expiresInSeconds?: number
}

export async function ensureValidFile(file: File | Blob, mimeType: string): Promise<void> {
  if (!ALLOWED_TYPES.has(mimeType)) {
    throw new Error('Tipo de archivo no permitido')
  }
  const size = 'size' in file ? (file as File).size : (file as any)?.byteLength ?? 0
  if (size > MAX_SIZE_BYTES) {
    throw new Error('El archivo excede el límite de 10MB')
  }
}

export async function listExpenseDocuments(expenseId: string): Promise<DocumentMeta[]> {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('expense_id', expenseId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database query error:', error)
      throw new Error(`Error al cargar documentos: ${error.message || 'Problema de base de datos'}`)
    }
    
    return (data || []) as DocumentMeta[]
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    
    console.error('Unexpected error in listExpenseDocuments:', error)
    throw new Error('Error inesperado al cargar documentos')
  }
}

export async function uploadExpenseDocument(args: UploadExpenseDocumentArgs): Promise<DocumentMeta> {
  const { expenseId, file, originalName, mimeType, uploadedBy, tenantId } = args

  try {
    await ensureValidFile(file, mimeType)

    const timestamp = Date.now()
    const safeName = originalName.replace(/[^a-zA-Z0-9_.-]/g, '_')
    const storagePath = `expenses/${expenseId}/${timestamp}_${safeName}`

    // 1) Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw new Error(`Error al subir archivo: ${uploadError.message || 'Problema de almacenamiento'}`)
    }

    // 2) Insert metadata row
    const { data, error } = await supabase
      .from('documents')
      .insert({
        expense_id: expenseId,
        original_name: originalName,
        storage_path: storagePath,
        mime_type: mimeType,
        size: 'size' in file ? (file as File).size : (file as any)?.byteLength ?? null,
        uploaded_by: uploadedBy ?? null,
        tenant_id: tenantId, // Agregar tenant_id al insert
      })
      .select()
      .single()

    if (error) {
      console.error('Database insert error:', error)
      // Rollback storage upload if DB insert fails
      await supabase.storage.from(BUCKET).remove([storagePath])
      throw new Error(`Error al guardar documento: ${error.message || 'Problema de base de datos'}`)
    }

    return data as DocumentMeta
  } catch (error) {
    // Si ya es un Error con mensaje, relanzarlo
    if (error instanceof Error) {
      throw error
    }
    
    // Si es un error de Supabase u otro tipo, convertirlo a Error
    console.error('Unexpected error in uploadExpenseDocument:', error)
    
    if (error && typeof error === 'object') {
      let errorMessage = 'Error inesperado al subir documento'
      
      if ('message' in error && typeof error.message === 'string') {
        errorMessage = error.message
      } else if ('error' in error && typeof error.error === 'string') {
        errorMessage = error.error
      } else if ('details' in error && typeof error.details === 'string') {
        errorMessage = error.details
      } else if ('hint' in error && typeof error.hint === 'string') {
        errorMessage = error.hint
      }
      
      throw new Error(errorMessage)
    }
    
    // Fallback para cualquier otro tipo de error
    throw new Error('Error inesperado al subir documento')
  }
}

export async function getSignedDocumentUrl({ path, expiresInSeconds = 60 * 10 }: GetSignedUrlArgs) {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(path, expiresInSeconds)
    
    if (error) {
      console.error('Storage signed URL error:', error)
      throw new Error(`Error al generar enlace: ${error.message || 'Problema de almacenamiento'}`)
    }
    
    return data.signedUrl
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    
    console.error('Unexpected error in getSignedDocumentUrl:', error)
    throw new Error('Error inesperado al generar enlace de descarga')
  }
}

export async function deleteExpenseDocument(documentId: string): Promise<void> {
  try {
    // Fetch to get storage path first
    const { data: doc, error: fetchError } = await supabase
      .from('documents')
      .select('id, storage_path')
      .eq('id', documentId)
      .single()
    
    if (fetchError) {
      console.error('Document fetch error:', fetchError)
      throw new Error(`Error al buscar documento: ${fetchError.message || 'Documento no encontrado'}`)
    }

    const storagePath = (doc as any)?.storage_path as string
    if (storagePath) {
      const { error: removeError } = await supabase.storage.from(BUCKET).remove([storagePath])
      if (removeError) {
        console.error('Storage remove error:', removeError)
        throw new Error(`Error al eliminar archivo: ${removeError.message || 'Problema de almacenamiento'}`)
      }
    }

    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (deleteError) {
      console.error('Database delete error:', deleteError)
      throw new Error(`Error al eliminar documento: ${deleteError.message || 'Problema de base de datos'}`)
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    
    console.error('Unexpected error in deleteExpenseDocument:', error)
    throw new Error('Error inesperado al eliminar documento')
  }
}


