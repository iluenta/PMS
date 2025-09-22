"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-bug text-3xl text-red-600"></i>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Algo salió mal!</h1>
          <p className="text-gray-600 mb-6">Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.</p>

          <div className="space-y-3">
            <Button onClick={reset} className="w-full">
              <i className="fas fa-redo mr-2"></i>
              Intentar de nuevo
            </Button>

            <Button asChild variant="outline" className="w-full bg-transparent">
              <a href="/">
                <i className="fas fa-home mr-2"></i>
                Ir al Inicio
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
