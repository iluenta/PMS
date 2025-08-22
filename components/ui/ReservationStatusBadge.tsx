import { Badge } from '@/components/ui/badge'
import { useReservationStatusByName } from '@/hooks/useReservationStatuses'
import { Loader2 } from 'lucide-react'

interface ReservationStatusBadgeProps {
  statusName: string
  showIcon?: boolean
  className?: string
}

export function ReservationStatusBadge({ 
  statusName, 
  showIcon = false, 
  className = '' 
}: ReservationStatusBadgeProps) {
  const { status, loading, error } = useReservationStatusByName(statusName)

  if (loading) {
    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${className}`}>
        <Loader2 className="h-3 w-3 animate-spin" />
        Cargando...
      </Badge>
    )
  }

  if (error || !status) {
    // Fallback si no se puede cargar el estado
    return (
      <Badge variant="outline" className={className}>
        {statusName}
      </Badge>
    )
  }

  return (
    <Badge 
      className={`flex items-center gap-1 ${className}`}
      style={{ 
        backgroundColor: status.color,
        color: getContrastColor(status.color)
      }}
    >
      {showIcon && (
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: getContrastColor(status.color) }}
        />
      )}
      {status.name}
    </Badge>
  )
}

// Función para determinar el color de contraste (texto blanco o negro)
function getContrastColor(hexColor: string): string {
  // Convertir hex a RGB
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calcular luminosidad
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Retornar negro para colores claros, blanco para colores oscuros
  return luminance > 0.5 ? '#000000' : '#ffffff'
}

// Componente para mostrar solo el color del estado
export function ReservationStatusColor({ 
  statusName, 
  className = 'w-4 h-4 rounded-full' 
}: { 
  statusName: string
  className?: string 
}) {
  const { status, loading } = useReservationStatusByName(statusName)

  if (loading || !status) {
    return <div className={`bg-gray-300 ${className}`} />
  }

  return (
    <div 
      className={className}
      style={{ backgroundColor: status.color }}
      title={status.name}
    />
  )
}
