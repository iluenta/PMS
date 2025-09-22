"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { generateMultipleProperties } from "@/scripts/generate-sample-data"
import Link from "next/link"

export default function GenerateDataPage() {
  const [propertyCount, setPropertyCount] = useState(3)
  const [generatedData, setGeneratedData] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [sqlOutput, setSqlOutput] = useState("")

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const data = generateMultipleProperties(propertyCount)
      setGeneratedData(data)

      // Generate SQL output
      let sql = "-- Generated Sample Data\n\n"
      data.forEach((item) => {
        sql += `-- Property: ${item.property.name}\n`
        sql += `INSERT INTO properties (id, name, address, description) VALUES ('${item.property.id}', '${item.property.name.replace(/'/g, "''")}', '${item.property.address.replace(/'/g, "''")}', '${item.property.description.replace(/'/g, "''")}');\n`
        sql += `INSERT INTO guides (id, property_id, title, welcome_message, host_names, host_signature) VALUES ('${item.guide.id}', '${item.guide.property_id}', '${item.guide.title.replace(/'/g, "''")}', '${item.guide.welcome_message.replace(/'/g, "''")}', '${item.guide.host_names}', '${item.guide.host_signature}');\n\n`
      })

      setSqlOutput(sql)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadSQL = () => {
    const blob = new Blob([sqlOutput], { type: "text/sql" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sample-data.sql"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin">
                  <i className="fas fa-arrow-left mr-2"></i>
                  Volver al Admin
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Generador de Datos de Ejemplo</h1>
            </div>
            <Badge variant="secondary">Herramienta de Desarrollo</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-database text-blue-600"></i>
                Configuración de Generación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="property-count">Número de Propiedades a Generar</Label>
                  <Input
                    id="property-count"
                    type="number"
                    min="1"
                    max="20"
                    value={propertyCount}
                    onChange={(e) => setPropertyCount(Number.parseInt(e.target.value))}
                    className="max-w-xs"
                  />
                  <p className="text-sm text-gray-600">
                    Cada propiedad incluirá guía completa con playas, restaurantes, actividades y más.
                  </p>
                </div>

                <Button onClick={handleGenerate} disabled={isGenerating} className="w-full sm:w-auto">
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic mr-2"></i>
                      Generar Datos de Ejemplo
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {generatedData.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <i className="fas fa-check-circle text-green-600"></i>
                      Datos Generados ({generatedData.length} propiedades)
                    </CardTitle>
                    <Button onClick={downloadSQL} variant="outline">
                      <i className="fas fa-download mr-2"></i>
                      Descargar SQL
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {generatedData.map((data, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">{data.property.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{data.property.address}</p>
                        <div className="space-y-1 text-xs text-gray-500">
                          <div>Playas: {data.beaches.length}</div>
                          <div>Restaurantes: {data.restaurants.length}</div>
                          <div>Actividades: {data.activities.length}</div>
                          <div>Normas: {data.house_rules.length}</div>
                          <div>Guía casa: {data.house_guide_items.length}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-code text-blue-600"></i>
                    SQL Generado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={sqlOutput}
                    readOnly
                    rows={15}
                    className="font-mono text-sm"
                    placeholder="El SQL generado aparecerá aquí..."
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Copia este SQL y ejecútalo en tu base de datos Supabase para insertar los datos de ejemplo.
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-info-circle text-blue-600"></i>
                Información
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <p>Esta herramienta genera datos de ejemplo realistas para probar el sistema de guías interactivas.</p>
                <p>Los datos incluyen:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Propiedades con nombres y direcciones variadas</li>
                  <li>Guías completas con mensajes de bienvenida personalizados</li>
                  <li>Playas con diferentes características y ubicaciones</li>
                  <li>Restaurantes con variedad de tipos de cocina y precios</li>
                  <li>Actividades para diferentes tipos de turistas</li>
                  <li>Normas de casa y guías de funcionamiento</li>
                  <li>Información de contacto realista</li>
                </ul>
                <p className="text-amber-600">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  Nota: Esta es una herramienta de desarrollo. En producción, los datos se gestionarían a través de la
                  interfaz de administración.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
