import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { listExpenseDocuments, uploadExpenseDocument, getSignedDocumentUrl, deleteExpenseDocument } from "@/lib/documents"
import type { DocumentMeta } from "@/types/documents"

export function usePropertyExpensesDocuments() {
  const { toast } = useToast()
  const { user } = useAuth()
  
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
      
      let errorMessage = "Error al cargar documentos"
      let errorTitle = "Error"
      
      // Extraer información del error de diferentes formas
      let errorText = ""
      
      if (error instanceof Error) {
        errorText = error.message.toLowerCase()
      } else if (typeof error === 'string') {
        errorText = error.toLowerCase()
      } else if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorText = error.message.toLowerCase()
        } else if ('error' in error && typeof error.error === 'string') {
          errorText = error.error.toLowerCase()
        } else if ('details' in error && typeof error.details === 'string') {
          errorText = error.details.toLowerCase()
        }
      }
      
      if (errorText.includes('network') || errorText.includes('timeout') || errorText.includes('fetch')) {
        errorTitle = "Error de conexión"
        errorMessage = "Problema de conexión al cargar documentos. Verifica tu conexión e intenta nuevamente."
      } else if (errorText.includes('permission') || errorText.includes('unauthorized') || errorText.includes('forbidden')) {
        errorTitle = "Sin permisos"
        errorMessage = "No tienes permisos para acceder a estos documentos."
      } else if (errorText.includes('not found') || errorText.includes('no existe')) {
        errorTitle = "Recurso no encontrado"
        errorMessage = "El gasto solicitado no existe o no tienes acceso a él."
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  // Subir documento
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, expenseId: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Verificar que el usuario tenga tenant_id
    if (!user?.tenant_id) {
      toast({
        title: "Error de configuración",
        description: "No se pudo identificar tu organización. Por favor, contacta al administrador.",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)
      
      // Preparar los argumentos según la interfaz UploadExpenseDocumentArgs
      const uploadArgs = {
        expenseId,
        file,
        originalName: file.name,
        mimeType: file.type,
        uploadedBy: user.id, // Usar el ID del usuario autenticado
        tenantId: user.tenant_id // Agregar tenant_id
      }
      
      await uploadExpenseDocument(uploadArgs)
      await loadDocuments(expenseId) // Recargar lista
      
      toast({
        title: "Éxito",
        description: "Documento subido correctamente",
      })
    } catch (error) {
      console.error('Error uploading document:', error)
      
      // Manejar errores específicos de manera amigable
      let errorMessage = "Error al subir documento"
      let errorTitle = "Error"
      let variant: "destructive" | "default" = "destructive"
      
      // Extraer información del error de diferentes formas
      let errorText = ""
      
      if (error instanceof Error) {
        errorText = error.message.toLowerCase()
      } else if (typeof error === 'string') {
        errorText = error.toLowerCase()
      } else if (error && typeof error === 'object') {
        // Manejar errores de Supabase u otros objetos de error
        if ('message' in error && typeof error.message === 'string') {
          errorText = error.message.toLowerCase()
        } else if ('error' in error && typeof error.error === 'string') {
          errorText = error.error.toLowerCase()
        } else if ('details' in error && typeof error.details === 'string') {
          errorText = error.details.toLowerCase()
        } else if ('hint' in error && typeof error.hint === 'string') {
          errorText = error.hint.toLowerCase()
        }
        
        // Log adicional para debugging
        console.log('Error object structure:', JSON.stringify(error, null, 2))
      }
      
      // Procesar el error basado en el texto extraído
      if (errorText.includes('tipo de archivo no permitido')) {
        errorTitle = "Tipo de archivo no válido"
        errorMessage = "El tipo de archivo seleccionado no está permitido. Por favor, selecciona un archivo PDF, imagen o documento compatible."
        variant = "default" // Usar variant default para advertencias
      } else if (errorText.includes('excede el límite')) {
        errorTitle = "Archivo demasiado grande"
        errorMessage = "El archivo seleccionado excede el límite de 10MB. Por favor, selecciona un archivo más pequeño."
        variant = "default"
      } else if (errorText.includes('tenant_id') || errorText.includes('not-null constraint')) {
        errorTitle = "Error de configuración"
        errorMessage = "Error en la configuración de la organización. Por favor, contacta al administrador."
      } else if (errorText.includes('network') || errorText.includes('timeout') || errorText.includes('fetch')) {
        errorTitle = "Error de conexión"
        errorMessage = "Problema de conexión al subir el archivo. Por favor, verifica tu conexión e intenta nuevamente."
      } else if (errorText.includes('storage') || errorText.includes('bucket') || errorText.includes('supabase')) {
        errorTitle = "Error de almacenamiento"
        errorMessage = "Problema con el almacenamiento de archivos. Por favor, contacta al administrador."
      } else if (errorText.includes('database') || errorText.includes('insert') || errorText.includes('sql')) {
        errorTitle = "Error de base de datos"
        errorMessage = "Problema al guardar la información del documento. Por favor, intenta nuevamente."
      } else if (errorText.includes('permission') || errorText.includes('unauthorized') || errorText.includes('forbidden')) {
        errorTitle = "Sin permisos"
        errorMessage = "No tienes permisos para subir documentos. Contacta al administrador."
      } else if (errorText.includes('not found') || errorText.includes('no existe')) {
        errorTitle = "Recurso no encontrado"
        errorMessage = "El gasto o recurso solicitado no existe. Por favor, verifica la información."
      } else if (errorText.includes('invalid') || errorText.includes('validation')) {
        errorTitle = "Datos inválidos"
        errorMessage = "Los datos del documento no son válidos. Por favor, verifica la información e intenta nuevamente."
      } else if (errorText.includes('duplicate') || errorText.includes('already exists')) {
        errorTitle = "Documento duplicado"
        errorMessage = "Ya existe un documento con el mismo nombre. Por favor, cambia el nombre del archivo."
      } else if (errorText.includes('quota') || errorText.includes('limit')) {
        errorTitle = "Límite alcanzado"
        errorMessage = "Se ha alcanzado el límite de almacenamiento. Por favor, elimina documentos antiguos o contacta al administrador."
      } else {
        // Error genérico con información adicional para debugging
        errorTitle = "Error inesperado"
        errorMessage = "Ocurrió un error inesperado al subir el documento. Por favor, intenta nuevamente o contacta al administrador."
        
        // Log del error completo para debugging
        console.error('Error completo:', error)
        console.error('Tipo de error:', typeof error)
        console.error('Estructura del error:', error)
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: variant,
      })
    } finally {
      setUploading(false)
    }
  }

  // Descargar documento
  const handleDownload = async (path: string) => {
    try {
      const url = await getSignedDocumentUrl({ path })
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error downloading document:', error)
      
      let errorMessage = "Error al descargar documento"
      let errorTitle = "Error"
      
      // Extraer información del error de diferentes formas
      let errorText = ""
      
      if (error instanceof Error) {
        errorText = error.message.toLowerCase()
      } else if (typeof error === 'string') {
        errorText = error.toLowerCase()
      } else if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorText = error.message.toLowerCase()
        } else if ('error' in error && typeof error.error === 'string') {
          errorText = error.error.toLowerCase()
        } else if ('details' in error && typeof error.details === 'string') {
          errorText = error.details.toLowerCase()
        }
      }
      
      if (errorText.includes('not found') || errorText.includes('no existe')) {
        errorTitle = "Documento no encontrado"
        errorMessage = "El documento solicitado no existe o ha sido eliminado."
      } else if (errorText.includes('expired') || errorText.includes('expirado')) {
        errorTitle = "Enlace expirado"
        errorMessage = "El enlace de descarga ha expirado. Por favor, intenta acceder nuevamente."
      } else if (errorText.includes('network') || errorText.includes('timeout') || errorText.includes('fetch')) {
        errorTitle = "Error de conexión"
        errorMessage = "Problema de conexión al descargar. Verifica tu conexión e intenta nuevamente."
      } else if (errorText.includes('permission') || errorText.includes('unauthorized')) {
        errorTitle = "Sin permisos"
        errorMessage = "No tienes permisos para descargar este documento."
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
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
      
      let errorMessage = "Error al eliminar documento"
      let errorTitle = "Error"
      
      // Extraer información del error de diferentes formas
      let errorText = ""
      
      if (error instanceof Error) {
        errorText = error.message.toLowerCase()
      } else if (typeof error === 'string') {
        errorText = error.toLowerCase()
      } else if (error && typeof error === 'object') {
        if ('message' in error && typeof error.message === 'string') {
          errorText = error.message.toLowerCase()
        } else if ('error' in error && typeof error.error === 'string') {
          errorText = error.error.toLowerCase()
        } else if ('details' in error && typeof error.details === 'string') {
          errorText = error.details.toLowerCase()
        }
      }
      
      if (errorText.includes('permission') || errorText.includes('unauthorized') || errorText.includes('forbidden')) {
        errorTitle = "Sin permisos"
        errorMessage = "No tienes permisos para eliminar este documento."
      } else if (errorText.includes('not found') || errorText.includes('no existe')) {
        errorTitle = "Documento no encontrado"
        errorMessage = "El documento ya no existe o ha sido eliminado."
      } else if (errorText.includes('network') || errorText.includes('timeout') || errorText.includes('fetch')) {
        errorTitle = "Error de conexión"
        errorMessage = "Problema de conexión al eliminar. Verifica tu conexión e intenta nuevamente."
      } else if (errorText.includes('storage') || errorText.includes('bucket')) {
        errorTitle = "Error de almacenamiento"
        errorMessage = "Problema al eliminar el archivo del almacenamiento. Contacta al administrador."
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
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








