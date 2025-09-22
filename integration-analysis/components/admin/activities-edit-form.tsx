"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "@/components/ui/image-upload"
import type { Activity } from "@/types/guide"

interface ActivitiesEditFormProps {
  activities: Activity[]
  guideId: string
}

export function ActivitiesEditForm({ activities, guideId }: ActivitiesEditFormProps) {
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [imageError, setImageError] = useState<string>("")

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity)
    setIsAddingNew(false)
    setImageError("")
  }

  const handleAddNew = () => {
    setEditingActivity({
      id: "",
      guide_id: guideId,
      name: "",
      description: "",
      distance: "",
      price_info: "",
      badge: "",
      image_url: "",
      order_index: activities.length + 1,
    })
    setIsAddingNew(true)
    setImageError("")
  }

  const handleSave = () => {
    console.log("Saving activity:", editingActivity)
    alert("Actividad guardada (simulado)")
    setEditingActivity(null)
    setIsAddingNew(false)
    setImageError("")
  }

  const handleDelete = (activityId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta actividad?")) {
      console.log("Deleting activity:", activityId)
      alert("Actividad eliminada (simulado)")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-hiking text-blue-600"></i>
              Actividades ({activities.length})
            </CardTitle>
            <Button onClick={handleAddNew}>
              <i className="fas fa-plus mr-2"></i>
              Agregar Actividad
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {activity.image_url && (
                      <img
                        src={activity.image_url || "/placeholder.svg"}
                        alt={activity.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{activity.name}</h4>
                        <Badge variant="secondary">{activity.badge}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          <i className="fas fa-car mr-1"></i>
                          {activity.distance}
                        </span>
                        <span>
                          <i className="fas fa-ticket-alt mr-1"></i>
                          {activity.price_info}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(activity)}>
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(activity.id)}>
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {editingActivity && (
        <Card>
          <CardHeader>
            <CardTitle>{isAddingNew ? "Agregar Nueva Actividad" : "Editar Actividad"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {imageError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">{imageError}</div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activity-name">Nombre</Label>
                  <Input
                    id="activity-name"
                    value={editingActivity.name}
                    onChange={(e) => setEditingActivity({ ...editingActivity, name: e.target.value })}
                    placeholder="Nombre de la actividad"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity-badge">Etiqueta</Label>
                  <Input
                    id="activity-badge"
                    value={editingActivity.badge}
                    onChange={(e) => setEditingActivity({ ...editingActivity, badge: e.target.value })}
                    placeholder="Ej: Familiar, Deporte, Naturaleza"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity-description">Descripción</Label>
                <Textarea
                  id="activity-description"
                  value={editingActivity.description}
                  onChange={(e) => setEditingActivity({ ...editingActivity, description: e.target.value })}
                  placeholder="Descripción de la actividad"
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="activity-distance">Distancia</Label>
                  <Input
                    id="activity-distance"
                    value={editingActivity.distance}
                    onChange={(e) => setEditingActivity({ ...editingActivity, distance: e.target.value })}
                    placeholder="Ej: 10 min en coche"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity-price">Precio</Label>
                  <Input
                    id="activity-price"
                    value={editingActivity.price_info}
                    onChange={(e) => setEditingActivity({ ...editingActivity, price_info: e.target.value })}
                    placeholder="Ej: Desde 14€"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity-order">Orden</Label>
                  <Input
                    id="activity-order"
                    type="number"
                    value={editingActivity.order_index}
                    onChange={(e) =>
                      setEditingActivity({ ...editingActivity, order_index: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>

              <ImageUpload
                value={editingActivity.image_url}
                onChange={(url) => setEditingActivity({ ...editingActivity, image_url: url })}
                onError={setImageError}
                label="Imagen de la Actividad"
                folder="activities"
              />

              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <i className="fas fa-save mr-2"></i>
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setEditingActivity(null)}>
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
