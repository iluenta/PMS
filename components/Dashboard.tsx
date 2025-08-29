"use client"

import { Building2, Users, CreditCard, TrendingUp, Calendar, CheckCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useProperty } from '@/contexts/PropertyContext'

export function Dashboard() {
  const { selectedProperty } = useProperty()
  const { stats, loading, yearFilter, setYearFilter, availableYears } = useDashboardStats()

  return (
    <div className="space-y-8">
      {/* Header del Dashboard */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Resumen general de tu negocio</p>
        
        {/* Selector de Años con Badges */}
        <div className="mt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filtrar por año:</span>
            <Badge 
              variant={yearFilter === "all" ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                yearFilter === "all" 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "hover:bg-blue-50 hover:text-blue-700"
              }`}
              onClick={() => setYearFilter("all")}
            >
              Todos los años
            </Badge>
            {availableYears.map((year) => (
              <Badge 
                key={year}
                variant={yearFilter === year.toString() ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  yearFilter === year.toString() 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "hover:bg-blue-50 hover:text-blue-700"
                }`}
                onClick={() => setYearFilter(year.toString())}
              >
                {year}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Métricas Clave - Fila Superior */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.reservations}
            </div>
            <p className="text-xs text-muted-foreground">reservas totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Huéspedes</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.guests}
            </div>
            <p className="text-xs text-muted-foreground">huéspedes únicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Brutos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `€${stats.grossIncome.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground">ingresos totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficio Neto</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `€${stats.netProfit.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground">después de gastos de reservas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propiedad</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {selectedProperty?.name || 'Sin seleccionar'}
            </div>
            <p className="text-xs text-muted-foreground">propiedad actual</p>
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
            <div className="text-2xl font-bold text-red-600">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `-€${stats.commissions.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground">comisiones + IVA 21%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos</CardTitle>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `-€${stats.expenses.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </div>
            <p className="text-xs text-muted-foreground">gastos operacionales (todos)</p>
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {selectedProperty ? 'No hay reservas recientes' : 'Selecciona una propiedad para ver las reservas'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen de Propiedades */}
        <Card>
          <CardHeader>
            <CardTitle>Propiedad seleccionada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProperty ? (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Building2 className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">{selectedProperty.name}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedProperty.bedrooms} hab. • {selectedProperty.max_guests} huéspedes
                    </p>
                    <p className="text-sm font-medium text-green-600">
                      €{selectedProperty.base_price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/noche
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {selectedProperty.status}
                </Badge>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Selecciona una propiedad para ver el resumen
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
