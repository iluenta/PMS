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
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('expense_id', expenseId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data || []) as DocumentMeta[]
}

export async function uploadExpenseDocument(args: UploadExpenseDocumentArgs): Promise<DocumentMeta> {
  const { expenseId, file, originalName, mimeType, uploadedBy } = args

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

  if (uploadError) throw uploadError

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
    })
    .select()
    .single()

  if (error) {
    // Rollback storage upload if DB insert fails
    await supabase.storage.from(BUCKET).remove([storagePath])
    throw error
  }

  return data as DocumentMeta
}

export async function getSignedDocumentUrl({ path, expiresInSeconds = 60 * 10 }: GetSignedUrlArgs) {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, expiresInSeconds)
  if (error) throw error
  return data.signedUrl
}

export async function deleteExpenseDocument(documentId: string): Promise<void> {
  // Fetch to get storage path first
  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('id, storage_path')
    .eq('id', documentId)
    .single()
  if (fetchError) throw fetchError

  const storagePath = (doc as any)?.storage_path as string
  if (storagePath) {
    const { error: removeError } = await supabase.storage.from(BUCKET).remove([storagePath])
    if (removeError) throw removeError
  }

  const { error: deleteError } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)

  if (deleteError) throw deleteError
}


