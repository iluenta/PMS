"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ExternalLink, RefreshCw, Clock, Zap } from "lucide-react"
import type { PropertyChannelWithDetails } from "@/types/channels"

interface PropertyChannelCardReadOnlyProps {
  propertyChannel: PropertyChannelWithDetails
}

export default function PropertyChannelCardReadOnly({
  propertyChannel,
}: PropertyChannelCardReadOnlyProps) {
  const channel = propertyChannel.channel

  if (!channel) {
    return null
  }

  // Helper para truncar URLs
  const truncateUrl = (url: string, maxLength: number = 40) => {
    if (!url) return ""
    return url.length > maxLength ? `${url.substring(0, maxLength)}...` : url
  }

  // Helper para formatear comisiones
  const formatCommission = (value?: number) => {
    if (!value || value === 0) return "0%"
    return `${value}%`
  }

  return (
    <Card className={`relative transition-all duration-200 ${
      propertyChannel.is_enabled 
        ? "border-green-200 bg-green-50/30" 
        : "border-gray-200 bg-gray-50/30"
    }`}>
      <CardContent className="p-5">
        {/* Header: Logo + Nombre + Estado */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Logo del canal */}
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border shadow-sm flex items-center justify-center">
              {channel.logo ? (
                <img
                  src={channel.logo}
                  alt={`Logo de ${channel.name}`}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    target.nextElementSibling?.setAttribute('style', 'display: flex')
                  }}
                />
              ) : null}
              <div 
                className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-xs font-medium text-gray-600"
                style={{ display: channel.logo ? 'none' : 'flex' }}
              >
                {channel.name.substring(0, 2).toUpperCase()}
              </div>
            </div>

            {/* Nombre y estado */}
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{channel.name}</h3>
              <Badge 
                variant={propertyChannel.is_enabled ? "default" : "secondary"}
                className={`text-xs ${
                  propertyChannel.is_enabled 
                    ? "bg-green-100 text-green-800 border-green-200" 
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                {propertyChannel.is_enabled ? "🟢 Activo" : "🔴 Inactivo"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Información principal */}
        <div className="space-y-3 mb-4">
          {/* Sync y Rating */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <RefreshCw className={`h-4 w-4 ${propertyChannel.sync_enabled ? 'text-green-600' : 'text-gray-400'}`} />
              <span>Sync: {propertyChannel.sync_enabled ? "✅" : "❌"}</span>
            </div>
           
            <div className="flex items-center gap-1 text-gray-600">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>
                {propertyChannel.property_rating && propertyChannel.property_rating > 0 
                  ? `${propertyChannel.property_rating.toFixed(1)} (${propertyChannel.property_review_count || 0} reseñas)`
                  : "- (- reseñas)"
                }
              </span>
            </div>
          </div>

          {/* Comisiones destacadas */}
          <div className="bg-white rounded-lg p-3 border">
            <div className="text-xs font-medium text-gray-500 mb-2">COMISIONES</div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-sm font-semibold text-red-600">
                  {formatCommission(propertyChannel.commission_override_charge)} cobro
                </div>
              </div>
              <div className="w-px h-6 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-sm font-semibold text-red-600">
                  {formatCommission(propertyChannel.commission_override_sale)} venta
                </div>
              </div>
            </div>
          </div>

          {/* URL principal */}
          {propertyChannel.listing_url && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">URL:</span>
              <a
                href={propertyChannel.listing_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 max-w-48 truncate"
                title={propertyChannel.listing_url}
              >
                <span>{truncateUrl(propertyChannel.listing_url)}</span>
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
            </div>
          )}
        </div>

        {/* Features/Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {propertyChannel.auto_update_ratings && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Auto Ratings
            </Badge>
          )}
          {propertyChannel.instant_booking_enabled && (
            <Badge variant="outline" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Reserva Instantánea
            </Badge>
          )}
          {propertyChannel.availability_sync_enabled && (
            <Badge variant="outline" className="text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Sync Disponibilidad
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 