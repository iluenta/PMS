"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus, Share2, Building2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase, isDemoMode, mockData, type Property } from "@/lib/supabase"

// Helper function to get property type display name
const getPropertyTypeDisplayName = (type: string) => {
  const typeMap: { [key: string]: string } = {
    apartment: 'Apartamento',
    house: 'Casa',
    loft: 'Loft',
    studio: 'Estudio',
    villa: 'Villa',
    chalet: 'Chalet'
  }
  return typeMap[type] || type || 'Apartamento'
}
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
  const [properties, setProperties] = useState<Property[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(propertyId || "")
  const [propertyChannels, setPropertyChannels] = useState<PropertyChannelWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [channelsLoading, setChannelsLoading] = useState(false)
  
  // Estados para modales
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<PropertyChannelWithDetails | null>(null)
  
  const { toast } = useToast()

  // Determinar si es modo embebido (dentro de una propiedad específica)
  const isEmbeddedMode = Boolean(propertyId)

  // Cargar propiedades al iniciar (solo si no está en modo embebido)
  useEffect(() => {
    if (!isEmbeddedMode) {
      loadProperties()
    } else {
      setLoading(false) // En modo embebido no necesitamos cargar propiedades
    }
  }, [isEmbeddedMode])

  // Cargar canales cuando cambia la propiedad seleccionada
  useEffect(() => {
    if (selectedPropertyId) {
      loadPropertyChannels(selectedPropertyId)
    }
  }, [selectedPropertyId])

  // En modo embebido, cargar canales inmediatamente
  useEffect(() => {
    if (isEmbeddedMode && propertyId) {
      loadPropertyChannels(propertyId)
      loadSingleProperty(propertyId) // También cargar los datos de la propiedad
    }
  }, [isEmbeddedMode, propertyId])

  const loadProperties = async () => {
    try {
      setLoading(true)
      
      if (isDemoMode) {
        setProperties(mockData.properties)
        // Auto-seleccionar la primera propiedad si existe
        if (mockData.properties.length > 0 && !selectedPropertyId) {
          setSelectedPropertyId(mockData.properties[0].id)
        }
        return
      }

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      
      const propertiesData = data || []
      setProperties(propertiesData)
      
      // Auto-seleccionar la primera propiedad si existe
      if (propertiesData.length > 0 && !selectedPropertyId) {
        setSelectedPropertyId(propertiesData[0].id)
      }
    } catch (error) {
      console.error("Error loading properties:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las propiedades",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadSingleProperty = async (propertyId: string) => {
    try {
      if (isDemoMode) {
        const property = mockData.properties.find(p => p.id === propertyId)
        if (property) {
          setProperties([property])
        }
        return
      }

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single()

      if (error) throw error
      
      if (data) {
        setProperties([data])
      }
    } catch (error) {
      console.error("Error loading single property:", error)
      // No mostrar toast aquí para evitar ruido, el componente padre ya maneja errores
    }
  }

  const loadPropertyChannels = async (propertyId: string) => {
    try {
      setChannelsLoading(true)
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
      if (selectedPropertyId) {
        loadPropertyChannels(selectedPropertyId)
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
      if (selectedPropertyId) {
        loadPropertyChannels(selectedPropertyId)
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
    
    const currentPropertyId = isEmbeddedMode ? propertyId : selectedPropertyId
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
    
    const currentPropertyId = isEmbeddedMode ? propertyId : selectedPropertyId
    if (currentPropertyId) {
      loadPropertyChannels(currentPropertyId)
    }
  }

  // En modo embebido, necesitamos obtener la propiedad por su ID
  const selectedProperty = isEmbeddedMode 
    ? properties.find(p => p.id === propertyId) || null 
    : properties.find(p => p.id === selectedPropertyId)

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
          {isEmbeddedMode ? "Canales de Distribución" : "Canales de Distribución"}
        </CardTitle>
                 <CardDescription>
           {isEmbeddedMode 
             ? "Vista de los canales de distribución configurados para esta propiedad"
             : "Gestiona la configuración de canales por propiedad"
           }
         </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selector de Propiedad (solo en modo no embebido) */}
        {!isEmbeddedMode && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Propiedad:</label>
            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una propiedad" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name} ({property.address})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Información de la propiedad seleccionada (solo en modo no embebido) */}
        {!isEmbeddedMode && selectedProperty && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg">{selectedProperty.name}</h3>
            <p className="text-gray-600 text-sm">{selectedProperty.address}</p>
                         <p className="text-gray-500 text-xs mt-1">
               Tipo: {getPropertyTypeDisplayName(selectedProperty.type)} • 
               Capacidad: {selectedProperty.capacity} huéspedes • 
               Habitaciones: {selectedProperty.bedrooms}
             </p>
          </div>
        )}

                 {/* Sección de canales */}
         {(selectedPropertyId || propertyId) ? (
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
       {!isEmbeddedMode && (selectedPropertyId || propertyId) && (
         <AddPropertyChannelModal
           isOpen={showAddModal}
           onClose={() => setShowAddModal(false)}
           propertyId={isEmbeddedMode ? propertyId! : selectedPropertyId}
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