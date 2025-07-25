"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase, isDemoMode, mockData, type Property } from "@/lib/supabase"
import { Building2, Plus, Edit, MapPin, Users, Bed, Bath, Camera, X, Star, BookOpen, CalendarCheck } from "lucide-react"

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      if (isDemoMode) {
        setProperties(mockData.properties)
        return
      }

      const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setProperties(data || [])
    } catch (error) {
      console.error("Error fetching properties:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (property: Property) => {
    setEditingProperty(property)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingProperty(null)
    setIsDialogOpen(true)
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
          <h1 className="text-3xl font-bold text-gray-900">Propiedades</h1>
          <p className="mt-2 text-gray-600">Gestiona tus apartamentos turísticos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Propiedad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <PropertyDialog property={editingProperty} onClose={() => setIsDialogOpen(false)} onSave={fetchProperties} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            <div className="aspect-video bg-gray-200 relative">
              {property.cover_image ? (
                <img
                  src={property.cover_image || "/placeholder.svg"}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <Camera className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <Badge
                className={`absolute top-2 right-2 ${property.status === "active" ? "bg-green-500" : "bg-gray-500"}`}
              >
                {property.status}
              </Badge>
              {property.cover_image && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-black/50 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Portada
                  </Badge>
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{property.name}</CardTitle>
              <CardDescription className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                {property.city}, {property.country}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{property.description}</p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {property.bedrooms}
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {property.bathrooms}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {property.max_guests}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-lg font-bold text-gray-900">€{property.base_price}</p>
                  <p className="text-sm text-gray-500">por noche</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Camera className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{property.images?.length || 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(property)} className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(`/guide/${property.id}`, "_blank")}>
                  <BookOpen className="h-4 w-4 mr-1" />
                  Guía
                </Button>
              </div>

              {property.amenities && property.amenities.length > 0 && (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-1">
                    {property.amenities.slice(0, 3).map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {property.amenities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{property.amenities.length - 3} más
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {properties.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay propiedades</h3>
            <p className="text-gray-500 mb-4">Comienza agregando tu primera propiedad</p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Propiedad
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function PropertyDialog({
  property,
  onClose,
  onSave,
}: {
  property: Property | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    country: "",
    property_type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    base_price: 50,
    cleaning_fee: 25,
    cover_image: "",
    images: [] as string[],
    amenities: [] as string[],
    status: "active",
  })

  const [availabilityData, setAvailabilityData] = useState({
    min_nights: 1,
    max_nights: 30,
    advance_booking_days: 0,
    max_advance_booking_days: 365,
    check_in_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    check_out_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
  })

  const [newImageUrl, setNewImageUrl] = useState("")
  const [newAmenity, setNewAmenity] = useState("")

  const weekDays = [
    { value: "monday", label: "Lunes" },
    { value: "tuesday", label: "Martes" },
    { value: "wednesday", label: "Miércoles" },
    { value: "thursday", label: "Jueves" },
    { value: "friday", label: "Viernes" },
    { value: "saturday", label: "Sábado" },
    { value: "sunday", label: "Domingo" },
  ]

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name,
        description: property.description || "",
        address: property.address || "",
        city: property.city || "",
        country: property.country || "",
        property_type: property.property_type || "apartment",
        bedrooms: property.bedrooms || 1,
        bathrooms: property.bathrooms || 1,
        max_guests: property.max_guests || 2,
        base_price: property.base_price || 50,
        cleaning_fee: property.cleaning_fee || 25,
        cover_image: property.cover_image || "",
        images: property.images || [],
        amenities: property.amenities || [],
        status: property.status || "active",
      })

      // Load availability settings for existing property
      if (isDemoMode) {
        const settings = mockData.availabilitySettings.find((s) => s.property_id === property.id)
        if (settings) {
          setAvailabilityData({
            min_nights: settings.min_nights,
            max_nights: settings.max_nights,
            advance_booking_days: settings.advance_booking_days,
            max_advance_booking_days: settings.max_advance_booking_days,
            check_in_days: settings.check_in_days,
            check_out_days: settings.check_out_days,
          })
        }
      }
    } else {
      setFormData({
        name: "",
        description: "",
        address: "",
        city: "",
        country: "",
        property_type: "apartment",
        bedrooms: 1,
        bathrooms: 1,
        max_guests: 2,
        base_price: 50,
        cleaning_fee: 25,
        cover_image: "",
        images: [],
        amenities: [],
        status: "active",
      })
      setAvailabilityData({
        min_nights: 1,
        max_nights: 30,
        advance_booking_days: 0,
        max_advance_booking_days: 365,
        check_in_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
        check_out_days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      })
    }
  }, [property])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isDemoMode) {
        alert(property ? "Propiedad actualizada (Demo)" : "Propiedad creada (Demo)")
        onSave()
        onClose()
        return
      }

      if (property) {
        const { error } = await supabase.from("properties").update(formData).eq("id", property.id)
        if (error) throw error

        // Update availability settings
        const { error: availError } = await supabase.from("availability_settings").upsert({
          property_id: property.id,
          ...availabilityData,
          updated_at: new Date().toISOString(),
        })
        if (availError) throw availError
      } else {
        const { data: newProperty, error } = await supabase
          .from("properties")
          .insert([
            {
              ...formData,
              owner_id: "550e8400-e29b-41d4-a716-446655440000", // Demo user ID
            },
          ])
          .select()
          .single()

        if (error) throw error

        // Create availability settings for new property
        if (newProperty) {
          const { error: availError } = await supabase.from("availability_settings").insert({
            property_id: newProperty.id,
            ...availabilityData,
          })
          if (availError) throw availError
        }
      }

      onSave()
      onClose()
    } catch (error) {
      console.error("Error saving property:", error)
    }
  }

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, newImageUrl.trim()],
      })
      setNewImageUrl("")
    }
  }

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      images: newImages,
      cover_image: formData.cover_image === formData.images[index] ? "" : formData.cover_image,
    })
  }

  const setCoverImage = (imageUrl: string) => {
    setFormData({
      ...formData,
      cover_image: imageUrl,
    })
  }

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()],
      })
      setNewAmenity("")
    }
  }

  const removeAmenity = (index: number) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index),
    })
  }

  const handleDayChange = (day: string, type: "check_in" | "check_out", checked: boolean) => {
    const field = type === "check_in" ? "check_in_days" : "check_out_days"
    const currentDays = availabilityData[field]

    if (checked) {
      setAvailabilityData({
        ...availabilityData,
        [field]: [...currentDays, day],
      })
    } else {
      setAvailabilityData({
        ...availabilityData,
        [field]: currentDays.filter((d) => d !== day),
      })
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{property ? "Editar Propiedad" : "Nueva Propiedad"}</DialogTitle>
        <DialogDescription>
          {property ? "Modifica los datos de la propiedad" : "Agrega una nueva propiedad a tu portafolio"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="images">Imágenes</TabsTrigger>
            <TabsTrigger value="amenities">Comodidades</TabsTrigger>
            <TabsTrigger value="availability">Disponibilidad</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <h3 className="text-lg font-medium">Información Básica</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="property_type">Tipo</Label>
                <Select
                  value={formData.property_type}
                  onValueChange={(value) => setFormData({ ...formData, property_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartamento</SelectItem>
                    <SelectItem value="house">Casa</SelectItem>
                    <SelectItem value="loft">Loft</SelectItem>
                    <SelectItem value="studio">Estudio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Habitaciones</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="1"
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Baños</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min="1"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_guests">Huéspedes máx.</Label>
                <Input
                  id="max_guests"
                  type="number"
                  min="1"
                  value={formData.max_guests}
                  onChange={(e) => setFormData({ ...formData, max_guests: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="base_price">Precio base (€/noche)</Label>
                <Input
                  id="base_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: Number.parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cleaning_fee">Tarifa de limpieza (€)</Label>
                <Input
                  id="cleaning_fee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cleaning_fee}
                  onChange={(e) => setFormData({ ...formData, cleaning_fee: Number.parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <h3 className="text-lg font-medium">Fotografías</h3>

            <div className="flex space-x-2">
              <Input
                placeholder="URL de la imagen"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
              />
              <Button type="button" onClick={addImage}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setCoverImage(image)}
                        className={formData.cover_image === image ? "bg-yellow-500" : ""}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="sm" variant="destructive" onClick={() => removeImage(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {formData.cover_image === image && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500">Portada</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="amenities" className="space-y-4">
            <h3 className="text-lg font-medium">Comodidades</h3>

            <div className="flex space-x-2">
              <Input
                placeholder="Nueva comodidad"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
              />
              <Button type="button" onClick={addAmenity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{amenity}</span>
                    <button type="button" onClick={() => removeAmenity(index)} className="ml-1 hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="availability" className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <CalendarCheck className="h-5 w-5" />
              <h3 className="text-lg font-medium">Configuración de Disponibilidad</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_nights">Noches mínimas</Label>
                <Input
                  id="min_nights"
                  type="number"
                  min="1"
                  value={availabilityData.min_nights}
                  onChange={(e) =>
                    setAvailabilityData({
                      ...availabilityData,
                      min_nights: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_nights">Noches máximas</Label>
                <Input
                  id="max_nights"
                  type="number"
                  min="1"
                  value={availabilityData.max_nights}
                  onChange={(e) =>
                    setAvailabilityData({
                      ...availabilityData,
                      max_nights: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="advance_booking_days">Días de antelación mínima</Label>
                <Input
                  id="advance_booking_days"
                  type="number"
                  min="0"
                  value={availabilityData.advance_booking_days}
                  onChange={(e) =>
                    setAvailabilityData({
                      ...availabilityData,
                      advance_booking_days: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_advance_booking_days">Días de antelación máxima</Label>
                <Input
                  id="max_advance_booking_days"
                  type="number"
                  min="1"
                  value={availabilityData.max_advance_booking_days}
                  onChange={(e) =>
                    setAvailabilityData({
                      ...availabilityData,
                      max_advance_booking_days: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Días permitidos para Check-in</Label>
                <div className="space-y-2">
                  {weekDays.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`checkin-${day.value}`}
                        checked={availabilityData.check_in_days.includes(day.value)}
                        onCheckedChange={(checked) => handleDayChange(day.value, "check_in", checked as boolean)}
                      />
                      <Label htmlFor={`checkin-${day.value}`} className="text-sm">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Días permitidos para Check-out</Label>
                <div className="space-y-2">
                  {weekDays.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`checkout-${day.value}`}
                        checked={availabilityData.check_out_days.includes(day.value)}
                        onCheckedChange={(checked) => handleDayChange(day.value, "check_out", checked as boolean)}
                      />
                      <Label htmlFor={`checkout-${day.value}`} className="text-sm">
                        {day.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{property ? "Actualizar" : "Crear"} Propiedad</Button>
        </div>
      </form>
    </>
  )
}
