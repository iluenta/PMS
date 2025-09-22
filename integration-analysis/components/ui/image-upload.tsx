"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { storageService, type UploadResult } from "@/lib/supabase-storage"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onError?: (error: string) => void
  label?: string
  folder?: string
  className?: string
  preview?: boolean
}

export function ImageUpload({
  value,
  onChange,
  onError,
  label = "Imagen",
  folder = "general",
  className,
  preview = true,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setIsUploading(true)

    try {
      const result: UploadResult = await storageService.uploadImage(file, folder)

      if (result.error) {
        onError?.(result.error)
      } else if (result.url) {
        onChange(result.url)
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

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>

      {/* Preview */}
      {preview && value && (
        <div className="relative inline-block">
          <img src={value || "/placeholder.svg"} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
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

      {/* Manual URL Input */}
      <div className="text-xs text-gray-500">O ingresa una URL manualmente:</div>
      <input
        type="url"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      />
    </div>
  )
}
