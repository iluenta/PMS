"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { getChannels, createPropertyChannel } from "@/lib/channels"
import type { DistributionChannel, CreatePropertyChannelData } from "@/types/channels"
import { Loader2, ExternalLink, RefreshCw, Clock, Zap, Star } from "lucide-react"

interface AddPropertyChannelModalProps {
  isOpen: boolean
  onClose: () => void
  propertyId: string
  onSuccess: () => void
}

export default function AddPropertyChannelModal({
  isOpen,
  onClose,
  propertyId,
  onSuccess,
}: AddPropertyChannelModalProps) {
  const [availableChannels, setAvailableChannels] = useState<DistributionChannel[]>([])
  const [loading, setLoading] = useState(false)
  const [channelsLoading, setChannelsLoading] = useState(false)
  const [selectedChannelId, setSelectedChannelId] = useState<string>("")
  
  const [formData, setFormData] = useState<CreatePropertyChannelData>({
    property_id: propertyId,
    channel_id: "",
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

  // Cargar canales disponibles cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadAvailableChannels()
      setFormData(prev => ({ ...prev, property_id: propertyId }))
    }
  }, [isOpen, propertyId])

  const loadAvailableChannels = async () => {
    try {
      setChannelsLoading(true)
      const channels = await getChannels()
      setAvailableChannels(channels)
    } catch (error) {
      console.error("Error loading channels:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los canales disponibles",
        variant: "destructive",
      })
    } finally {
      setChannelsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedChannelId) {
      toast({
        title: "Error",
        description: "Debes seleccionar un canal",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      
      const channelData = {
        ...formData,
        channel_id: selectedChannelId,
      }

      await createPropertyChannel(channelData)
      
      toast({
        title: "Canal añadido",
        description: "El canal se ha configurado correctamente para la propiedad",
      })
      
      onSuccess()
      handleClose()
      
    } catch (error) {
      console.error("Error creating property channel:", error)
      toast({
        title: "Error",
        description: "No se pudo configurar el canal para la propiedad",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedChannelId("")
    setFormData({
      property_id: propertyId,
      channel_id: "",
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
    onClose()
  }

  const selectedChannel = availableChannels.find(c => c.id === selectedChannelId)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Añadir Canal de Distribución</DialogTitle>
          <DialogDescription>
            Configura un nuevo canal de distribución para esta propiedad
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selector de Canal */}
          <div className="space-y-2">
            <Label htmlFor="channel">Canal de Distribución *</Label>
            {channelsLoading ? (
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando canales...</span>
              </div>
            ) : (
              <Select value={selectedChannelId} onValueChange={setSelectedChannelId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un canal" />
                </SelectTrigger>
                <SelectContent>
                  {availableChannels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      <div className="flex items-center gap-2">
                        {channel.logo && (
                          <img 
                            src={channel.logo} 
                            alt={channel.name}
                            className="w-4 h-4 object-contain"
                          />
                        )}
                        <span>{channel.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Preview del canal seleccionado */}
          {selectedChannel && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-3 mb-2">
                {selectedChannel.logo && (
                  <img 
                    src={selectedChannel.logo} 
                    alt={selectedChannel.name}
                    className="w-8 h-8 object-contain"
                  />
                )}
                <span className="font-medium">{selectedChannel.name}</span>
              </div>
              <p className="text-sm text-gray-600">
                Canal seleccionado - Configura los detalles específicos a continuación
              </p>
            </div>
          )}

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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !selectedChannelId}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Añadir Canal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 