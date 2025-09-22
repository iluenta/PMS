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
import { createActivity, updateActivity, deleteActivity } from "@/lib/guides"
import type { Activity } from "@/types/guides"

interface ActivitiesEditFormProps {
  activities: Activity[]
  guideId: string
  onActivitiesChange: (activities: Activity[]) => void
}

export function ActivitiesEditForm({ activities, guideId, onActivitiesChange }: ActivitiesEditFormProps) {
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity)
    setIsAddingNew(false)
  }

  const handleAddNew = () => {
    setEditingActivity({
      id: "",
      guide_id: guideId,
      tenant_id: 0,
      name: "",
      description: "",
      distance: "",
      price_info: "",
      badge: "",
      image_url: "",
      order_index: activities.length + 1,
      created_at: "",
      updated_at: ""
    })
    setIsAddingNew(true)
  }

  const handleSave = async () => {
    if (!editingActivity) return

    setLoading(true)
    try {
      console.log('Saving activity:', editingActivity)
      
      if (isAddingNew) {
        const activityData = {
          guide_id: editingActivity.guide_id,
          name: editingActivity.name,
          description: editingActivity.description,
          distance: editingActivity.distance,
          price_info: editingActivity.price_info,
          badge: editingActivity.badge,
          image_url: editingActivity.image_url,
          order_index: editingActivity.order_index,
        }
        
        const createdActivity = await createActivity(activityData)
        
        if (createdActivity) {
          console.log('Activity created successfully:', createdActivity)
          onActivitiesChange([...activities, createdActivity])
          setEditingActivity(null)
          setIsAddingNew(false)
        }
      } else {
        const updatedActivity = await updateActivity(editingActivity.id, {
          name: editingActivity.name,
          description: editingActivity.description,
          distance: editingActivity.distance,
          price_info: editingActivity.price_info,
          badge: editingActivity.badge,
          image_url: editingActivity.image_url,
          order_index: editingActivity.order_index,
        })
        
        if (updatedActivity) {
          console.log('Activity updated successfully:', updatedActivity)
          onActivitiesChange(activities.map(a => a.id === editingActivity.id ? updatedActivity : a))
          setEditingActivity(null)
          setIsAddingNew(false)
        }
      }
    } catch (error) {
      console.error('Error saving activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (activityId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta actividad?")) return

    setLoading(true)
    try {
      const success = await deleteActivity(activityId)
      
      if (success) {
        console.log('Activity deleted successfully')
        onActivitiesChange(activities.filter(a => a.id !== activityId))
      }
    } catch (error) {
      console.error('Error deleting activity:', error)
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
              <i className="fas fa-hiking text-blue-600"></i>
              Actividades ({activities.length})
            </CardTitle>
            <Button onClick={handleAddNew} disabled={loading}>
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
                        {activity.badge && <Badge variant="secondary">{activity.badge}</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          <i className="fas fa-walking mr-1"></i>
                          {activity.distance}
                        </span>
                        <span>
                          <i className="fas fa-euro-sign mr-1"></i>
                          {activity.price_info}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEdit(activity)}
                      disabled={loading}
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(activity.id)}
                      disabled={loading}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {activities.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-hiking text-4xl mb-4"></i>
                <p>No hay actividades añadidas aún</p>
                <p className="text-sm">Haz clic en "Agregar Actividad" para comenzar</p>
              </div>
            )}
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
                  <Select
                    value={editingActivity.badge}
                    onValueChange={(value) => setEditingActivity({ ...editingActivity, badge: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar etiqueta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Recomendada">Recomendada</SelectItem>
                      <SelectItem value="Familiar">Familiar</SelectItem>
                      <SelectItem value="Aventura">Aventura</SelectItem>
                      <SelectItem value="Cultural">Cultural</SelectItem>
                      <SelectItem value="Deportiva">Deportiva</SelectItem>
                      <SelectItem value="Gratuita">Gratuita</SelectItem>
                      <SelectItem value="Nocturna">Nocturna</SelectItem>
                    </SelectContent>
                  </Select>
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
                    placeholder="Ej: 10 min caminando"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity-price">Información de Precio</Label>
                  <Input
                    id="activity-price"
                    value={editingActivity.price_info}
                    onChange={(e) => setEditingActivity({ ...editingActivity, price_info: e.target.value })}
                    placeholder="Ej: Gratis, 15€/persona"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity-order">Orden</Label>
                  <Input
                    id="activity-order"
                    type="number"
                    value={editingActivity.order_index || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, order_index: e.target.value ? Number.parseInt(e.target.value) : 0 })}
                  />
                </div>
              </div>

              <ImageSelector
                value={editingActivity.image_url}
                onChange={(url) => setEditingActivity({ ...editingActivity, image_url: url })}
                onError={(error) => console.error('Image error:', error)}
                label=""
                className="col-span-2"
              />

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={loading}>
                  <i className="fas fa-save mr-2"></i>
                  {loading ? "Guardando..." : "Guardar"}
                </Button>
                <Button variant="outline" onClick={() => setEditingActivity(null)} disabled={loading}>
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









