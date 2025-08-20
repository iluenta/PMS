import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { listExpenseDocuments, uploadExpenseDocument, getSignedDocumentUrl, deleteExpenseDocument } from "@/lib/documents"
import type { DocumentMeta } from "@/types/documents"

export function usePropertyExpensesDocuments() {
  const { toast } = useToast()
  
  // Estados de documentos
  const [documents, setDocuments] = useState<DocumentMeta[]>([])
  const [uploading, setUploading] = useState(false)

  // Cargar documentos de un gasto
  const loadDocuments = async (expenseId: string) => {
    try {
      const docs = await listExpenseDocuments(expenseId)
      setDocuments(docs)
    } catch (error) {
      console.error('Error loading documents:', error)
      toast({
        title: "Error",
        description: "Error al cargar documentos",
        variant: "destructive",
      })
    }
  }

  // Subir documento
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, expenseId: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      await uploadExpenseDocument(expenseId, file)
      await loadDocuments(expenseId) // Recargar lista
      
      toast({
        title: "Éxito",
        description: "Documento subido correctamente",
      })
    } catch (error) {
      console.error('Error uploading document:', error)
      toast({
        title: "Error",
        description: "Error al subir documento",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  // Descargar documento
  const handleDownload = async (path: string) => {
    try {
      const url = await getSignedDocumentUrl(path)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error downloading document:', error)
      toast({
        title: "Error",
        description: "Error al descargar documento",
        variant: "destructive",
      })
    }
  }

  // Eliminar documento
  const handleDeleteDocument = async (docId: string) => {
    try {
      await deleteExpenseDocument(docId)
      // Filtrar el documento eliminado de la lista
      setDocuments(prev => prev.filter(doc => doc.id !== docId))
      
      toast({
        title: "Éxito",
        description: "Documento eliminado correctamente",
      })
    } catch (error) {
      console.error('Error deleting document:', error)
      toast({
        title: "Error",
        description: "Error al eliminar documento",
        variant: "destructive",
      })
    }
  }

  return {
    // Estados
    documents,
    uploading,
    
    // Funciones
    loadDocuments,
    handleUpload,
    handleDownload,
    handleDeleteDocument,
  }
}








