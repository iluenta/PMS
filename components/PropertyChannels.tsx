"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, Share2, Building2, Building } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useProperty } from "@/hooks/useProperty"
import { getPropertyChannels, togglePropertyChannelStatus, deletePropertyChannel } from "@/lib/channels"
import type { PropertyChannelWithDetails } from "@/types/channels"
import PropertyChannelCard from "./PropertyChannelCard"
import PropertyChannelCardReadOnly from "./PropertyChannelCardReadOnly"
import AddPropertyChannelModal from "./AddPropertyChannelModal"
import EditPropertyChannelModal from "./EditPropertyChannelModal"

interface PropertyChannelsProps {
  propertyId?: string // Opcional: si se pasa, se usa directamente sin selector
}

export default function PropertyChannels({ propertyId }: PropertyChannelsProps = {}) {
  const [propertyChannels, setPropertyChannels] = useState<PropertyChannelWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [channelsLoading, setChannelsLoading] = useState(false)
  
  // Estados para modales
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<PropertyChannelWithDetails | null>(null)
  
  const { toast } = useToast()
  const { selectedProperty } = useProperty()

  // Determinar si es modo embebido (dentro de una propiedad específica)
  const isEmbeddedMode = Boolean(propertyId)

  // Cargar canales cuando cambia la propiedad seleccionada
  useEffect(() => {
    const currentPropertyId = isEmbeddedMode ? propertyId : selectedProperty?.id
    if (currentPropertyId) {
      loadPropertyChannels(currentPropertyId)
    } else {
      setLoading(false)
    }
  }, [selectedProperty, propertyId, isEmbeddedMode])

  const loadPropertyChannels = async (propertyId: string) => {
    try {
      setChannelsLoading(true)
      setLoading(true)
      const data = await getPropertyChannels(propertyId)
      setPropertyChannels(data)
    } catch (error) {
      console.error("Error loading property channels:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los canales de la propiedad",
        variant: "destructive",
      })
    } finally {
      setChannelsLoading(false)
      setLoading(false)
    }
  }

  // Funciones de manejo (solo para modo no embebido)
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (isEmbeddedMode) return // No permitir acciones en modo embebido
    
    try {
      await togglePropertyChannelStatus(id, !currentStatus)
      toast({
        title: "Estado actualizado",
        description: `El canal se ha ${!currentStatus ? 'activado' : 'desactivado'} correctamente`,
      })
      // Recargar canales
      const currentPropertyId = isEmbeddedMode ? propertyId : selectedProperty?.id
      if (currentPropertyId) {
        loadPropertyChannels(currentPropertyId)
      }
    } catch (error) {
      console.error("Error toggling channel status:", error)
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del canal",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (propertyChannel: PropertyChannelWithDetails) => {
    if (isEmbeddedMode) return // No permitir acciones en modo embebido
    
    setSelectedChannel(propertyChannel)
    setShowEditModal(true)
  }

  const handleDelete = async (id: string) => {
    if (isEmbeddedMode) return // No permitir acciones en modo embebido
    
    const confirmed = window.confirm("¿Estás seguro de que quieres eliminar este canal?")
    if (!confirmed) return

    try {
      await deletePropertyChannel(id)
      toast({
        title: "Canal eliminado",
        description: "El canal se ha eliminado correctamente",
      })
      // Recargar canales
      const currentPropertyId = isEmbeddedMode ? propertyId : selectedProperty?.id
      if (currentPropertyId) {
        loadPropertyChannels(currentPropertyId)
      }
    } catch (error) {
      console.error("Error deleting property channel:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el canal",
        variant: "destructive",
      })
    }
  }

  const handleAddChannel = () => {
    if (isEmbeddedMode) return // No permitir acciones en modo embebido
    
    const currentPropertyId = isEmbeddedMode ? propertyId : selectedProperty?.id
    if (!currentPropertyId) {
      toast({
        title: "Error",
        description: "Debes seleccionar una propiedad primero",
        variant: "destructive",
      })
      return
    }
    setShowAddModal(true)
  }

  const handleModalSuccess = () => {
    if (isEmbeddedMode) return // No permitir acciones en modo embebido
    
    const currentPropertyId = isEmbeddedMode ? propertyId : selectedProperty?.id
    if (currentPropertyId) {
      loadPropertyChannels(currentPropertyId)
    }
  }

  // Obtener la propiedad actual
  const currentProperty = isEmbeddedMode 
    ? null // En modo embebido no necesitamos mostrar la propiedad
    : selectedProperty

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Canales de Distribución
          </CardTitle>
          <CardDescription>
            Gestiona la configuración de canales por propiedad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Canales de Distribución
        </CardTitle>
        <CardDescription>
          {isEmbeddedMode 
            ? "Vista de los canales de distribución configurados para esta propiedad"
            : "Gestiona la configuración de canales por propiedad"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sección de canales */}
        {(currentProperty || propertyId) ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Canales configurados ({propertyChannels.length})
              </h3>
              {/* Botón Añadir Canal solo en modo no embebido */}
              {!isEmbeddedMode && (
                <Button size="sm" onClick={handleAddChannel}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir Canal
                </Button>
              )}
            </div>
           
            {channelsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
              </div>
            ) : propertyChannels.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {propertyChannels.map((propertyChannel) => (
                  isEmbeddedMode ? (
                    <PropertyChannelCardReadOnly
                      key={propertyChannel.id}
                      propertyChannel={propertyChannel}
                    />
                  ) : (
                    <PropertyChannelCard
                      key={propertyChannel.id}
                      propertyChannel={propertyChannel}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                    />
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Share2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No hay canales configurados</p>
                <p className="text-sm">Añade un canal para comenzar</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Selecciona una propiedad</p>
            <p className="text-sm">Elige una propiedad para ver sus canales de distribución</p>
          </div>
        )}
      </CardContent>

      {/* Modales (solo en modo no embebido) */}
      {!isEmbeddedMode && (currentProperty?.id || propertyId) && (
        <AddPropertyChannelModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          propertyId={isEmbeddedMode ? propertyId! : currentProperty!.id}
          onSuccess={handleModalSuccess}
        />
      )}

      {!isEmbeddedMode && (
        <EditPropertyChannelModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedChannel(null)
          }}
          propertyChannel={selectedChannel}
          onSuccess={handleModalSuccess}
        />
      )}
    </Card>
  )
} 