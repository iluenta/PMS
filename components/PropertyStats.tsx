"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Euro 
} from "lucide-react"

interface PropertyStatsProps {
  occupancy: number // Porcentaje de ocupación
  reservedDays: number // Días reservados
  pendingDays: number // Días pendientes
  availableDays: number // Días disponibles
  averagePrice: number // Precio medio por noche
  period: string // Período de análisis (ej: "últimos 90 días")
}

export default function PropertyStats({
  occupancy,
  reservedDays,
  pendingDays,
  availableDays,
  averagePrice,
  period
}: PropertyStatsProps) {
  const stats = [
    {
      title: "Ocupación",
      value: `${occupancy}%`,
      subtitle: period,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Días Reservados",
      value: reservedDays.toString(),
      subtitle: `de ${reservedDays + pendingDays + availableDays} días`,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Días Pendientes",
      value: pendingDays.toString(),
      subtitle: `de ${reservedDays + pendingDays + availableDays} días`,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Días Disponibles",
      value: availableDays.toString(),
      subtitle: `de ${reservedDays + pendingDays + availableDays} días`,
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Precio Medio",
      value: `€${averagePrice}`,
      subtitle: "por noche",
      icon: Euro,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 