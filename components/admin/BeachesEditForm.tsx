"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ImageSelector } from "@/components/ui/ImageSelector"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBeach, updateBeach, deleteBeach } from "@/lib/guides"
import type { Beach } from "@/types/guides"

interface BeachesEditFormProps {
  beaches: Beach[]
  guideId: string
  onBeachesChange: (beaches: Beach[]) => void
}

export function BeachesEditForm({ beaches, guideId, onBeachesChange }: BeachesEditFormProps) {
  const [editingBeach, setEditingBeach] = useState<Beach | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleEdit = (beach: Beach) => {
    setEditingBeach(beach)
    setIsAddingNew(false)
  }

  const handleAddNew = () => {
    setEditingBeach({
      id: "",
      guide_id: guideId,
      tenant_id: 0,
      name: "",
      description: "",
      distance: "",
      rating: 0,
      badge: "",
      image_url: "",
      order_index: beaches.length + 1,
      created_at: "",
      updated_at: ""
    })
    setIsAddingNew(true)
  }

  const handleSave = async () => {
    if (!editingBeach) return

    setLoading(true)
    try {
      console.log('Saving beach:', editingBeach)
      
      if (isAddingNew) {
        const beachData = {
          guide_id: editingBeach.guide_id,
          name: editingBeach.name,
          description: editingBeach.description,
          distance: editingBeach.distance,
          rating: editingBeach.rating,
          badge: editingBeach.badge,
          image_url: editingBeach.image_url,
          order_index: editingBeach.order_index,
        }
        
        const createdBeach = await createBeach(beachData)
        
        if (createdBeach) {
          console.log('Beach created successfully:', createdBeach)
          onBeachesChange([...beaches, createdBeach])
          setEditingBeach(null)
          setIsAddingNew(false)
        }
      } else {
        const updatedBeach = await updateBeach(editingBeach.id, {
          name: editingBeach.name,
          description: editingBeach.description,
          distance: editingBeach.distance,
          rating: editingBeach.rating,
          badge: editingBeach.badge,
          image_url: editingBeach.image_url,
          order_index: editingBeach.order_index,
        })
        
        if (updatedBeach) {
          console.log('Beach updated successfully:', updatedBeach)
          onBeachesChange(beaches.map(b => b.id === editingBeach.id ? updatedBeach : b))
          setEditingBeach(null)
          setIsAddingNew(false)
        }
      }
    } catch (error) {
      console.error('Error saving beach:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (beachId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta playa?")) return

    setLoading(true)
    try {
      const success = await deleteBeach(beachId)
      
      if (success) {
        console.log('Beach deleted successfully')
        onBeachesChange(beaches.filter(b => b.id !== beachId))
      }
    } catch (error) {
      console.error('Error deleting beach:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-umbrella-beach text-blue-600"></i>
              Playas ({beaches.length})
            </CardTitle>
            <Button onClick={handleAddNew} disabled={loading}>
              <i className="fas fa-plus mr-2"></i>
              Agregar Playa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {beaches.map((beach) => (
              <div key={beach.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {beach.image_url && (
                      <img
                        src={beach.image_url || "/placeholder.svg"}
                        alt={beach.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{beach.name}</h4>
                        {beach.badge && <Badge variant="secondary">{beach.badge}</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{beach.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          <i className="fas fa-walking mr-1"></i>
                          {beach.distance}
                        </span>
                        <span>
                          <i className="fas fa-star mr-1 text-yellow-500"></i>
                          {beach.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEdit(beach)}
                      disabled={loading}
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(beach.id)}
                      disabled={loading}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {beaches.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-umbrella-beach text-4xl mb-4"></i>
                <p>No hay playas añadidas aún</p>
                <p className="text-sm">Haz clic en "Agregar Playa" para comenzar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {editingBeach && (
        <Card>
          <CardHeader>
            <CardTitle>{isAddingNew ? "Agregar Nueva Playa" : "Editar Playa"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="beach-name">Nombre</Label>
                  <Input
                    id="beach-name"
                    value={editingBeach.name}
                    onChange={(e) => setEditingBeach({ ...editingBeach, name: e.target.value })}
                    placeholder="Nombre de la playa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beach-badge">Etiqueta</Label>
                  <Select
                    value={editingBeach.badge}
                    onValueChange={(value) => setEditingBeach({ ...editingBeach, badge: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar etiqueta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Recomendada">Recomendada</SelectItem>
                      <SelectItem value="Familiar">Familiar</SelectItem>
                      <SelectItem value="Tranquila">Tranquila</SelectItem>
                      <SelectItem value="Naturista">Naturista</SelectItem>
                      <SelectItem value="Deportiva">Deportiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="beach-description">Descripción</Label>
                <Textarea
                  id="beach-description"
                  value={editingBeach.description}
                  onChange={(e) => setEditingBeach({ ...editingBeach, description: e.target.value })}
                  placeholder="Descripción de la playa"
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="beach-distance">Distancia</Label>
                  <Input
                    id="beach-distance"
                    value={editingBeach.distance}
                    onChange={(e) => setEditingBeach({ ...editingBeach, distance: e.target.value })}
                    placeholder="Ej: 15 min caminando"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beach-rating">Calificación</Label>
                  <Select
                    value={editingBeach.rating.toString()}
                    onValueChange={(value) => setEditingBeach({ ...editingBeach, rating: parseFloat(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar calificación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1/5</SelectItem>
                      <SelectItem value="2">2/5</SelectItem>
                      <SelectItem value="3">3/5</SelectItem>
                      <SelectItem value="4">4/5</SelectItem>
                      <SelectItem value="5">5/5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beach-order">Orden</Label>
                  <Input
                    id="beach-order"
                    type="number"
                    value={editingBeach.order_index || ''}
                    onChange={(e) => setEditingBeach({ ...editingBeach, order_index: e.target.value ? Number.parseInt(e.target.value) : 0 })}
                  />
                </div>
              </div>

              <ImageSelector
                value={editingBeach.image_url}
                onChange={(url) => setEditingBeach({ ...editingBeach, image_url: url })}
                onError={(error) => console.error('Image error:', error)}
                label="Imagen de la Playa"
                className="col-span-2"
              />

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={loading}>
                  <i className="fas fa-save mr-2"></i>
                  {loading ? "Guardando..." : "Guardar"}
                </Button>
                <Button variant="outline" onClick={() => setEditingBeach(null)} disabled={loading}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
