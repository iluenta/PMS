"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function Pricing() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tarifas</CardTitle>
        <CardDescription>
          Gestiona las reglas de precios y tarifas de tus propiedades.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">Módulo en Desarrollo</h3>
          <p className="text-gray-500 mt-2">
            Esta sección está actualmente en construcción.
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 