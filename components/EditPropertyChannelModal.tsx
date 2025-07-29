"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { updatePropertyChannel } from "@/lib/channels"
import type { PropertyChannelWithDetails, UpdatePropertyChannelData } from "@/types/channels"
import { Loader2, ExternalLink, RefreshCw, Clock, Zap, Star } from "lucide-react"

interface EditPropertyChannelModalProps {
  isOpen: boolean
  onClose: () => void
  propertyChannel: PropertyChannelWithDetails | null
  onSuccess: () => void
}

export default function EditPropertyChannelModal({
  isOpen,
  onClose,
  propertyChannel,
  onSuccess,
}: EditPropertyChannelModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UpdatePropertyChannelData>({
    is_enabled: true,
    sync_enabled: true,
    auto_update_ratings: false,
    external_property_id: "",
    external_listing_id: "",
    external_place_id: "",
    listing_url: "",
    review_url: "",
    price_adjustment_percentage: 0,
    commission_override_charge: 0,
    commission_override_sale: 0,
    availability_sync_enabled: true,
    instant_booking_enabled: false,
  })

  const { toast } = useToast()

  // Cargar datos del canal cuando se abre el modal
  useEffect(() => {
    if (isOpen && propertyChannel) {
      setFormData({
        is_enabled: propertyChannel.is_enabled,
        sync_enabled: propertyChannel.sync_enabled,
        auto_update_ratings: propertyChannel.auto_update_ratings,
        external_property_id: propertyChannel.external_property_id || "",
        external_listing_id: propertyChannel.external_listing_id || "",
        external_place_id: propertyChannel.external_place_id || "",
        listing_url: propertyChannel.listing_url || "",
        review_url: propertyChannel.review_url || "",
        price_adjustment_percentage: propertyChannel.price_adjustment_percentage || 0,
        commission_override_charge: propertyChannel.commission_override_charge || 0,
        commission_override_sale: propertyChannel.commission_override_sale || 0,
        availability_sync_enabled: propertyChannel.availability_sync_enabled,
        instant_booking_enabled: propertyChannel.instant_booking_enabled,
      })
    }
  }, [isOpen, propertyChannel])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!propertyChannel) return

    try {
      setLoading(true)
      
      await updatePropertyChannel(propertyChannel.id, formData)
      
      toast({
        title: "Canal actualizado",
        description: "La configuración del canal se ha actualizado correctamente",
      })
      
      onSuccess()
      handleClose()
      
    } catch (error) {
      console.error("Error updating property channel:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración del canal",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  if (!propertyChannel) return null

  const channel = propertyChannel.channel

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {channel?.logo && (
              <img 
                src={channel.logo} 
                alt={channel.name}
                className="w-6 h-6 object-contain"
              />
            )}
            Editar {channel?.name}
          </DialogTitle>
          <DialogDescription>
            Modifica la configuración del canal para esta propiedad
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info del canal */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-3 mb-2">
              {channel?.logo && (
                <img 
                  src={channel.logo} 
                  alt={channel.name}
                  className="w-8 h-8 object-contain"
                />
              )}
              <span className="font-medium">{channel?.name}</span>
            </div>
            <p className="text-sm text-gray-600">
              Configuración actual del canal para esta propiedad
            </p>
          </div>

          <Separator />

          {/* Estado y Configuración Básica */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="is_enabled">Canal Activo</Label>
              <Switch
                id="is_enabled"
                checked={formData.is_enabled}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, is_enabled: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="sync_enabled">Sincronización</Label>
              <Switch
                id="sync_enabled"
                checked={formData.sync_enabled}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, sync_enabled: checked }))
                }
              />
            </div>
          </div>

          {/* IDs Externos */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Identificadores Externos
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="external_property_id">ID de Propiedad</Label>
                <Input
                  id="external_property_id"
                  placeholder="ID en el canal externo"
                  value={formData.external_property_id}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, external_property_id: e.target.value }))
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="external_listing_id">ID de Listing</Label>
                <Input
                  id="external_listing_id"
                  placeholder="ID del anuncio"
                  value={formData.external_listing_id}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, external_listing_id: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="external_place_id">ID de Lugar</Label>
              <Input
                id="external_place_id"
                placeholder="ID de ubicación (opcional)"
                value={formData.external_place_id}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, external_place_id: e.target.value }))
                }
              />
            </div>
          </div>

          {/* URLs */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Enlaces
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor="listing_url">URL del Anuncio</Label>
              <Input
                id="listing_url"
                type="url"
                placeholder="https://..."
                value={formData.listing_url}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, listing_url: e.target.value }))
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="review_url">URL de Reseñas</Label>
              <Input
                id="review_url"
                type="url"
                placeholder="https://..."
                value={formData.review_url}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, review_url: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Comisiones */}
          <div className="space-y-4">
            <h4 className="font-medium text-red-600">💰 Comisiones</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commission_override_charge">Comisión Cobro (%)</Label>
                <Input
                  id="commission_override_charge"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0"
                  value={formData.commission_override_charge}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, commission_override_charge: parseFloat(e.target.value) || 0 }))
                  }
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="commission_override_sale">Comisión Venta (%)</Label>
                <Input
                  id="commission_override_sale"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="0"
                  value={formData.commission_override_sale}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, commission_override_sale: parseFloat(e.target.value) || 0 }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_adjustment_percentage">Ajuste de Precio (%)</Label>
              <Input
                id="price_adjustment_percentage"
                type="number"
                min="-100"
                max="100"
                step="0.1"
                placeholder="0"
                value={formData.price_adjustment_percentage}
                onChange={(e) => 
                  setFormData(prev => ({ ...prev, price_adjustment_percentage: parseFloat(e.target.value) || 0 }))
                }
              />
              <p className="text-xs text-gray-500">
                Porcentaje de ajuste sobre el precio base (negativo para descuento)
              </p>
            </div>
          </div>

          {/* Configuraciones Avanzadas */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Configuraciones Avanzadas
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <Label htmlFor="auto_update_ratings">Auto-actualizar Ratings</Label>
                </div>
                <Switch
                  id="auto_update_ratings"
                  checked={formData.auto_update_ratings}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, auto_update_ratings: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <Label htmlFor="availability_sync_enabled">Sync Disponibilidad</Label>
                </div>
                <Switch
                  id="availability_sync_enabled"
                  checked={formData.availability_sync_enabled}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, availability_sync_enabled: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <Label htmlFor="instant_booking_enabled">Reserva Instantánea</Label>
                </div>
                <Switch
                  id="instant_booking_enabled"
                  checked={formData.instant_booking_enabled}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, instant_booking_enabled: checked }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Stats actuales */}
          {(propertyChannel.property_rating > 0 || propertyChannel.property_review_count > 0) && (
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                Estadísticas Actuales
              </h4>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>
                    Rating: {propertyChannel.property_rating > 0 ? propertyChannel.property_rating.toFixed(1) : "-"} 
                    ({propertyChannel.property_review_count} reseñas)
                  </span>
                </div>
                {propertyChannel.last_rating_update && (
                  <p className="text-xs text-gray-600 mt-1">
                    Última actualización: {new Date(propertyChannel.last_rating_update).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 