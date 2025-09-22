import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-triangle text-3xl text-red-600"></i>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Página no encontrada</h1>
          <p className="text-gray-600 mb-6">Lo sentimos, la página que buscas no existe o ha sido movida.</p>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">
                <i className="fas fa-home mr-2"></i>
                Ir al Inicio
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/admin">
                <i className="fas fa-cog mr-2"></i>
                Panel de Administración
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
