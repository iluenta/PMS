import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Settings, Database } from "lucide-react"

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Guías Interactivas para Alquileres Vacacionales
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Una aplicación completa para crear y gestionar guías personalizadas para propiedades de alquiler vacacional
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Ver Guía de Ejemplo
              </CardTitle>
              <CardDescription>Explora la guía interactiva de VeraTespera en Vera, Almería</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/vera-tespera/guide">
                <Button className="w-full">Abrir Guía</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-green-600" />
                Panel de Administración
              </CardTitle>
              <CardDescription>Gestiona propiedades y edita contenido de las guías</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button variant="outline" className="w-full bg-transparent">
                  Ir a Admin
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-600" />
                Generar Datos
              </CardTitle>
              <CardDescription>Crea datos de ejemplo para probar el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/generate-data">
                <Button variant="secondary" className="w-full">
                  Generar Datos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Características Principales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span>Guías interactivas con navegación por pestañas</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span>Sistema de edición completo para administradores</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span>Rutas dinámicas por propiedad</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span>Diseño responsive y moderno</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">✓</Badge>
                <span>Integración con Supabase preparada</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secciones de la Guía</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="outline">Información del Apartamento</Badge>
              <Badge variant="outline">Normas de la Casa</Badge>
              <Badge variant="outline">Guía de Uso</Badge>
              <Badge variant="outline">Consejos Útiles</Badge>
              <Badge variant="outline">Playas Recomendadas</Badge>
              <Badge variant="outline">Restaurantes</Badge>
              <Badge variant="outline">Actividades</Badge>
              <Badge variant="outline">Información Práctica</Badge>
              <Badge variant="outline">Contacto</Badge>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Estructura del Proyecto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Base de Datos (Supabase)</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• properties - Propiedades</li>
                  <li>• guides - Guías por propiedad</li>
                  <li>• guide_sections - Secciones de contenido</li>
                  <li>• beaches, restaurants, activities</li>
                  <li>• house_rules, contact_info</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Rutas Principales</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• /[propertyId]/guide - Ver guía</li>
                  <li>• /admin - Panel administración</li>
                  <li>• /admin/properties/[id]/edit - Editar</li>
                  <li>• /api/properties - API REST</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
