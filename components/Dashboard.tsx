"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase, isDemoMode, mockData, type Booking, type Property } from "@/lib/supabase"
import {
  Building2,
  Calendar,
  Users,
  TrendingUp,
  Bed,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Receipt,
  BookOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalBookings: 0,
    totalGuests: 0,
    totalRevenue: 0,
    totalCommissions: 0,
    totalExpenses: 0,
    netRevenue: 0,
    occupancyRate: 0,
  })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      if (isDemoMode) {
        // Use mock data
        const mockBookingsWithRelations = mockData.bookings.map((booking) => ({
          ...booking,
          property: mockData.properties.find((p) => p.id === booking.property_id),
          guest: mockData.guests.find((g) => g.id === booking.guest_id),
        }))

        setProperties(mockData.properties)
        setRecentBookings(mockBookingsWithRelations.slice(0, 5))

        // Calculate stats from mock data
        const totalRevenue = mockData.bookings.reduce((sum, booking) => sum + booking.total_amount, 0)
        const totalCommissions = mockData.bookings.reduce((sum, booking) => sum + (booking.commission_amount || 0), 0)
        const totalExpenses = mockData.propertyExpenses.reduce((sum, expense) => sum + expense.amount, 0)
        const netRevenue = totalRevenue - totalCommissions - totalExpenses
        const confirmedBookings = mockData.bookings.filter((b) => b.status === "confirmed").length
        const occupancyRate = Math.round((confirmedBookings / (mockData.properties.length * 30)) * 100)

        setStats({
          totalProperties: mockData.properties.length,
          totalBookings: mockData.bookings.length,
          totalGuests: mockData.guests.length,
          totalRevenue,
          totalCommissions,
          totalExpenses,
          netRevenue,
          occupancyRate,
        })
      } else {
        // Real Supabase data fetching
        const { data: propertiesData } = await supabase.from("properties").select("*").eq("status", "active")
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select(`
            *,
            property:properties(*),
            guest:guests(*)
          `)
          .order("created_at", { ascending: false })
          .limit(5)

        const { data: allBookings } = await supabase.from("bookings").select("*")
        const { count: guestsCount } = await supabase.from("guests").select("*", { count: "exact", head: true })

        // Get expenses data
        const { data: expensesData } = await supabase.from("property_expenses").select("amount")

        if (propertiesData) setProperties(propertiesData)
        if (bookingsData) setRecentBookings(bookingsData)

        const totalRevenue = allBookings?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0
        const totalCommissions = allBookings?.reduce((sum, booking) => sum + (booking.commission_amount || 0), 0) || 0
        const totalExpenses = expensesData?.reduce((sum, expense) => sum + expense.amount, 0) || 0
        const netRevenue = totalRevenue - totalCommissions - totalExpenses
        const confirmedBookings = allBookings?.filter((b) => b.status === "confirmed").length || 0
        const occupancyRate =
          propertiesData && allBookings ? Math.round((confirmedBookings / (propertiesData.length * 30)) * 100) : 0

        setStats({
          totalProperties: propertiesData?.length || 0,
          totalBookings: allBookings?.length || 0,
          totalGuests: guestsCount || 0,
          totalRevenue,
          totalCommissions,
          totalExpenses,
          netRevenue,
          occupancyRate,
        })
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Resumen general de tu negocio</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Propiedades</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">Propiedades activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">Total de reservas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Huéspedes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGuests}</div>
            <p className="text-xs text-muted-foreground">Huéspedes registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Brutos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Ingresos totales</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comisiones</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-€{stats.totalCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Comisiones pagadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos</CardTitle>
            <Receipt className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">-€{stats.totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Gastos operacionales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficio Neto</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netRevenue >= 0 ? "text-green-600" : "text-red-600"}`}>
              €{stats.netRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Beneficio después de gastos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Reservas Recientes</CardTitle>
            <CardDescription>Las últimas 5 reservas realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {booking.guest?.first_name} {booking.guest?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{booking.property?.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(booking.check_in).toLocaleDateString()} -{" "}
                        {new Date(booking.check_out).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(booking.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(booking.status)}
                        <span className="capitalize">{booking.status}</span>
                      </div>
                    </Badge>
                    <div className="text-right">
                      <span className="text-sm font-medium">€{booking.total_amount}</span>
                      {booking.commission_amount && booking.commission_amount > 0 && (
                        <p className="text-xs text-red-500">-€{booking.commission_amount} com.</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Properties Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Propiedades</CardTitle>
            <CardDescription>Resumen de tus propiedades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {properties.map((property) => (
                <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Building2 className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{property.name}</p>
                      <p className="text-sm text-gray-500">
                        {property.city}, {property.country}
                      </p>
                      <p className="text-xs text-gray-400">
                        {property.bedrooms} hab • {property.capacity} huéspedes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">€{property.base_price}/noche</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {property.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/demo-guide`, "_blank")}
                        className="text-xs"
                      >
                        <BookOpen className="h-3 w-3 mr-1" />
                        Ver Guía Demo
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Demo Guide Floating Button */}
      {isDemoMode && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => window.open("/demo-guide", "_blank")}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg rounded-full p-4 animate-bounce"
            size="lg"
          >
            <BookOpen className="h-6 w-6 mr-2" />
            Ver Guía Demo
          </Button>
        </div>
      )}
    </div>
  )
}
