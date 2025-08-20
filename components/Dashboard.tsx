"use client"

import { Building2, Users, CreditCard, TrendingUp, Calendar, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header del Dashboard */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Resumen general de tu negocio</p>
      </div>

      {/* Métricas Clave - Fila Superior */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propiedades</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">propiedades activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">reservas totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Huéspedes</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">huéspedes registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Brutos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€0.00</div>
            <p className="text-xs text-muted-foreground">ingresos totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficio Neto</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€0.00</div>
            <p className="text-xs text-muted-foreground">después de gastos</p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Financieras - Fila Media */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisiones</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-€0.00</div>
            <p className="text-xs text-muted-foreground">comisiones pagadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-€0.00</div>
            <p className="text-xs text-muted-foreground">gastos operacionales</p>
          </CardContent>
        </Card>
      </div>

      {/* Listados - Fila Inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reservas Recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Las últimas 5 reservas realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              No hay reservas recientes
            </div>
          </CardContent>
        </Card>

        {/* Resumen de Propiedades */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen de tus propiedades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Propiedad 1: ESTEFANITA */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">ESTEFANITA</h3>
                  <p className="text-sm text-gray-600">1 hab. • 2 huéspedes</p>
                  <p className="text-sm font-medium text-green-600">€50/noche</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                active
              </Badge>
            </div>

            {/* Propiedad 2: VERATESPERA */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">VERATESPERA</h3>
                  <p className="text-sm text-gray-600">VERA, es • 2 hab. • 4 huéspedes</p>
                  <p className="text-sm font-medium text-green-600">€125/noche</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                active
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
