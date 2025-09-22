"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "@/components/ui/image-upload"
import { RatingInput } from "@/components/ui/rating-input"
import type { Beach } from "@/types/guide"

interface BeachesEditFormProps {
  beaches: Beach[]
  guideId: string
}

export function BeachesEditForm({ beaches, guideId }: BeachesEditFormProps) {
  const [editingBeach, setEditingBeach] = useState<Beach | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [imageError, setImageError] = useState<string>("")

  const handleEdit = (beach: Beach) => {
    setEditingBeach(beach)
    setIsAddingNew(false)
    setImageError("")
  }

  const handleAddNew = () => {
    setEditingBeach({
      id: "",
      guide_id: guideId,
      name: "",
      description: "",
      distance: "",
      rating: 0,
      badge: "",
      image_url: "",
      order_index: beaches.length + 1,
    })
    setIsAddingNew(true)
    setImageError("")
  }

  const handleSave = () => {
    console.log("Saving beach:", editingBeach)
    alert("Playa guardada (simulado)")
    setEditingBeach(null)
    setIsAddingNew(false)
    setImageError("")
  }

  const handleDelete = (beachId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta playa?")) {
      console.log("Deleting beach:", beachId)
      alert("Playa eliminada (simulado)")
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
            <Button onClick={handleAddNew}>
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
                        <Badge variant="secondary">{beach.badge}</Badge>
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
                    <Button size="sm" variant="outline" onClick={() => handleEdit(beach)}>
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(beach.id)}>
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
              {imageError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">{imageError}</div>
              )}

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
                  <Input
                    id="beach-badge"
                    value={editingBeach.badge}
                    onChange={(e) => setEditingBeach({ ...editingBeach, badge: e.target.value })}
                    placeholder="Ej: Recomendada, Familiar, Tranquila"
                  />
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
                <RatingInput
                  value={editingBeach.rating}
                  onChange={(rating) => setEditingBeach({ ...editingBeach, rating })}
                  label="Puntuación"
                />
                <div className="space-y-2">
                  <Label htmlFor="beach-order">Orden</Label>
                  <Input
                    id="beach-order"
                    type="number"
                    value={editingBeach.order_index}
                    onChange={(e) => setEditingBeach({ ...editingBeach, order_index: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <ImageUpload
                value={editingBeach.image_url}
                onChange={(url) => setEditingBeach({ ...editingBeach, image_url: url })}
                onError={setImageError}
                label="Imagen de la Playa"
                folder="beaches"
              />

              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <i className="fas fa-save mr-2"></i>
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setEditingBeach(null)}>
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
