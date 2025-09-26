"use client"

import { Building2, Users, CreditCard, TrendingUp, Calendar, CheckCircle, Loader2, XCircle, Info } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useProperty } from '@/contexts/PropertyContext'
import { formatCurrency } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function Dashboard() {
  const { selectedProperty } = useProperty()
  const { stats, loading, yearFilter, setYearFilter, availableYears, recentReservations } = useDashboardStats()

  return (
    <TooltipProvider>
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

      {/* Métricas Clave - Fila Superior (no económicas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Reservas confirmadas</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  Reservas con estado distinto de "cancelled" para la propiedad seleccionada y año filtrado.
                </TooltipContent>
              </Tooltip>
            </div>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.reservations}
            </div>
            <p className="text-xs text-muted-foreground">reservas confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Huéspedes</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  Huéspedes únicos (por email) en reservas confirmadas del periodo seleccionado.
                </TooltipContent>
              </Tooltip>
            </div>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.guests}
            </div>
            <p className="text-xs text-muted-foreground">huéspedes únicos</p>
          </CardContent>
        </Card>

        {/* Reservas canceladas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  Total de reservas con estado "cancelled" en el periodo seleccionado.
                </TooltipContent>
              </Tooltip>
            </div>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.cancelledReservations}
            </div>
            <p className="text-xs text-muted-foreground">reservas canceladas</p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Financieras - Una sola fila (Ingresos, Comisiones, Gastos, Beneficio Neto) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Ingresos Brutos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Ingresos Brutos</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  Ingresos Brutos = suma de total_amount de reservas confirmadas (excluye canceladas) en el periodo.
                  Actualmente: {formatCurrency(stats.grossIncome)}
                </TooltipContent>
              </Tooltip>
            </div>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatCurrency(stats.grossIncome)}
            </div>
            <p className="text-xs text-muted-foreground">ingresos totales</p>
          </CardContent>
        </Card>

        {/* Comisiones */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Comisiones</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  Comisiones = (canal + cobro) de reservas confirmadas, con IVA 21% aplicado.
                  Actualmente: {formatCurrency(stats.commissions)}
                </TooltipContent>
              </Tooltip>
            </div>
            <CreditCard className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatCurrency(-Math.abs(stats.commissions))}
            </div>
            <p className="text-xs text-muted-foreground">comisiones (con IVA)</p>
          </CardContent>
        </Card>

        {/* Gastos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Gastos</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  Gastos = operacionales + asociados a reservas (estados pending y completed).
                  Actualmente: {formatCurrency(stats.expenses)}
                </TooltipContent>
              </Tooltip>
            </div>
            <CreditCard className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatCurrency(-Math.abs(stats.expenses))}
            </div>
            <p className="text-xs text-muted-foreground">gastos operacionales (todos)</p>
          </CardContent>
        </Card>

        {/* Beneficio Neto */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Beneficio Neto</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  Beneficio Neto = Ingresos Brutos − Gastos (todos) − Comisiones (con IVA).
                  {"\n"}Ingresos: {formatCurrency(stats.grossIncome)}
                  {" • Gastos: "}{formatCurrency(stats.expenses)}
                  {" • Comisiones: "}{formatCurrency(stats.commissions)}
                  {"\n"}Resultado: {formatCurrency(stats.netProfit)}
                </TooltipContent>
              </Tooltip>
            </div>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatCurrency(stats.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">ingresos menos gastos y comisiones (con IVA)</p>
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
              <div>
                {recentReservations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {selectedProperty ? 'No hay reservas recientes' : 'Selecciona una propiedad para ver las reservas'}
                  </div>
                ) : (
                  <ul className="divide-y">
                    {recentReservations.map((r) => (
                      <li key={r.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{r.guest?.name || r.guest_name || 'Invitado'}</div>
                          <div className="text-xs text-gray-500">{new Date(r.check_in).toLocaleDateString('es-ES')} → {new Date(r.check_out).toLocaleDateString('es-ES')}</div>
                        </div>
                        <div className="text-sm font-semibold">{formatCurrency(r.total_amount || 0)}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen de Propiedades (eliminado, ya está en el header/contexto) */}
      </div>
    </div>
    </TooltipProvider>
  )
}
