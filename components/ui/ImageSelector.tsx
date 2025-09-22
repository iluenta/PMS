"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { unifiedStorageService, type ExistingImage } from "@/lib/unified-storage"

interface ImageSelectorProps {
  value?: string
  onChange: (url: string) => void
  onError?: (error: string) => void
  label?: string
  className?: string
}

export function ImageSelector({
  value,
  onChange,
  onError,
  label = "",
  className,
}: ImageSelectorProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([])
  const [showImageSelector, setShowImageSelector] = useState(false)
  const [loadingImages, setLoadingImages] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cargar imágenes existentes cuando se abre el selector
  useEffect(() => {
    if (showImageSelector && existingImages.length === 0) {
      loadExistingImages()
    }
  }, [showImageSelector])

  const loadExistingImages = async () => {
    setLoadingImages(true)
    try {
      // Primero verificar acceso al bucket
      console.log('Verificando acceso al bucket...')
      const bucketCheck = await unifiedStorageService.checkBucketAccess()
      
      if (!bucketCheck.exists) {
        console.error('Bucket access failed:', bucketCheck.error)
        onError?.(`Error de acceso al bucket: ${bucketCheck.error}`)
        return
      }
      
      console.log('Bucket access OK, cargando imágenes compartidas...')
      const images = await unifiedStorageService.getSharedImages()
      setExistingImages(images)
      console.log('Loaded existing images:', images.length)
    } catch (error) {
      console.error('Error loading existing images:', error)
      onError?.("Error al cargar imágenes existentes")
    } finally {
      setLoadingImages(false)
    }
  }

  const handleFileSelect = async (file: File) => {
    setIsUploading(true)

    try {
      const result = await unifiedStorageService.uploadSharedImage(file)

      if (result.error) {
        onError?.(result.error)
      } else if (result.url) {
        onChange(result.url)
        // Actualizar la lista de imágenes existentes
        await loadExistingImages()
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Error al subir la imagen")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleRemove = () => {
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSelectExisting = (imageUrl: string) => {
    onChange(imageUrl)
    setShowImageSelector(false)
  }

  const handleManualUrl = (url: string) => {
    onChange(url)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}

      {/* Preview */}
      {value && (
        <div className="relative inline-block">
          <img 
            src={value || "/placeholder.svg"} 
            alt="Preview" 
            className="w-32 h-32 object-cover rounded-lg border" 
          />
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleRemove}
          >
            <i className="fas fa-times text-xs"></i>
          </Button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300",
          isUploading && "opacity-50 pointer-events-none",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

        <div className="space-y-2">
          <i className="fas fa-cloud-upload-alt text-2xl text-gray-400"></i>
          <div>
            <p className="text-sm text-gray-600">
              Arrastra una imagen aquí o{" "}
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                selecciona un archivo
              </button>
            </p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF hasta 5MB</p>
          </div>
        </div>

        {isUploading && (
          <div className="mt-2">
            <div className="inline-flex items-center gap-2 text-sm text-blue-600">
              <i className="fas fa-spinner fa-spin"></i>
              Subiendo imagen...
            </div>
          </div>
        )}
      </div>

      {/* Selector de imágenes existentes */}
      <Dialog open={showImageSelector} onOpenChange={setShowImageSelector}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <i className="fas fa-images mr-2"></i>
            Elegir de imágenes existentes
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Seleccionar Imagen Existente</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[60vh]">
            {loadingImages ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mb-4"></i>
                <p className="text-gray-600">Cargando imágenes...</p>
              </div>
            ) : existingImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {existingImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative cursor-pointer group"
                    onClick={() => handleSelectExisting(image.url)}
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-24 object-cover rounded-lg border hover:border-blue-500 transition-colors"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                      <i className="fas fa-check-circle text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate" title={image.name}>
                      {image.name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-images text-4xl mb-4"></i>
                <p>No hay imágenes disponibles</p>
                <p className="text-sm">Sube una imagen primero</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual URL Input */}
      <div className="space-y-2">
        <Label className="text-xs text-gray-500">O ingresa una URL manualmente:</Label>
        <Input
          type="url"
          value={value || ""}
          onChange={(e) => handleManualUrl(e.target.value)}
          placeholder="https://..."
          className="text-sm"
        />
      </div>
    </div>
  )
}
