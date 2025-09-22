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
import { createRestaurant, updateRestaurant, deleteRestaurant } from "@/lib/guides"
import type { Restaurant } from "@/types/guides"

interface RestaurantsEditFormProps {
  restaurants: Restaurant[]
  guideId: string
  onRestaurantsChange: (restaurants: Restaurant[]) => void
}

export function RestaurantsEditForm({ restaurants, guideId, onRestaurantsChange }: RestaurantsEditFormProps) {
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant)
    setIsAddingNew(false)
  }

  const handleAddNew = () => {
    setEditingRestaurant({
      id: "",
      guide_id: guideId,
      tenant_id: 0,
      name: "",
      description: "",
      rating: 0,
      review_count: 0,
      price_range: "",
      badge: "",
      image_url: "",
      order_index: restaurants.length + 1,
      created_at: "",
      updated_at: ""
    })
    setIsAddingNew(true)
  }

  const handleSave = async () => {
    if (!editingRestaurant) return

    setLoading(true)
    try {
      console.log('Saving restaurant:', editingRestaurant)
      
      if (isAddingNew) {
        const restaurantData = {
          guide_id: editingRestaurant.guide_id,
          name: editingRestaurant.name,
          description: editingRestaurant.description,
          rating: editingRestaurant.rating,
          review_count: editingRestaurant.review_count,
          price_range: editingRestaurant.price_range,
          badge: editingRestaurant.badge,
          image_url: editingRestaurant.image_url,
          order_index: editingRestaurant.order_index,
        }
        
        const createdRestaurant = await createRestaurant(restaurantData)
        
        if (createdRestaurant) {
          console.log('Restaurant created successfully:', createdRestaurant)
          onRestaurantsChange([...restaurants, createdRestaurant])
          setEditingRestaurant(null)
          setIsAddingNew(false)
        }
      } else {
        const updatedRestaurant = await updateRestaurant(editingRestaurant.id, {
          name: editingRestaurant.name,
          description: editingRestaurant.description,
          rating: editingRestaurant.rating,
          review_count: editingRestaurant.review_count,
          price_range: editingRestaurant.price_range,
          badge: editingRestaurant.badge,
          image_url: editingRestaurant.image_url,
          order_index: editingRestaurant.order_index,
        })
        
        if (updatedRestaurant) {
          console.log('Restaurant updated successfully:', updatedRestaurant)
          onRestaurantsChange(restaurants.map(r => r.id === editingRestaurant.id ? updatedRestaurant : r))
          setEditingRestaurant(null)
          setIsAddingNew(false)
        }
      }
    } catch (error) {
      console.error('Error saving restaurant:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (restaurantId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este restaurante?")) return

    setLoading(true)
    try {
      const success = await deleteRestaurant(restaurantId)
      
      if (success) {
        console.log('Restaurant deleted successfully')
        onRestaurantsChange(restaurants.filter(r => r.id !== restaurantId))
      }
    } catch (error) {
      console.error('Error deleting restaurant:', error)
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
              <i className="fas fa-utensils text-blue-600"></i>
              Restaurantes ({restaurants.length})
            </CardTitle>
            <Button onClick={handleAddNew} disabled={loading}>
              <i className="fas fa-plus mr-2"></i>
              Agregar Restaurante
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {restaurant.image_url && (
                      <img
                        src={restaurant.image_url || "/placeholder.svg"}
                        alt={restaurant.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{restaurant.name}</h4>
                        {restaurant.badge && <Badge variant="secondary">{restaurant.badge}</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{restaurant.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          <i className="fas fa-euro-sign mr-1"></i>
                          {restaurant.price_range}
                        </span>
                        <span>
                          <i className="fas fa-star mr-1 text-yellow-500"></i>
                          {restaurant.rating}/5
                        </span>
                        {restaurant.review_count && (
                          <span>
                            <i className="fas fa-comments mr-1"></i>
                            {restaurant.review_count} reseñas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleEdit(restaurant)}
                      disabled={loading}
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(restaurant.id)}
                      disabled={loading}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {restaurants.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-utensils text-4xl mb-4"></i>
                <p>No hay restaurantes añadidos aún</p>
                <p className="text-sm">Haz clic en "Agregar Restaurante" para comenzar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {editingRestaurant && (
        <Card>
          <CardHeader>
            <CardTitle>{isAddingNew ? "Agregar Nuevo Restaurante" : "Editar Restaurante"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurant-name">Nombre</Label>
                  <Input
                    id="restaurant-name"
                    value={editingRestaurant.name}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, name: e.target.value })}
                    placeholder="Nombre del restaurante"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restaurant-badge">Etiqueta</Label>
                  <Select
                    value={editingRestaurant.badge}
                    onValueChange={(value) => setEditingRestaurant({ ...editingRestaurant, badge: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar etiqueta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Recomendado">Recomendado</SelectItem>
                      <SelectItem value="Familiar">Familiar</SelectItem>
                      <SelectItem value="Romántico">Romántico</SelectItem>
                      <SelectItem value="Gourmet">Gourmet</SelectItem>
                      <SelectItem value="Casual">Casual</SelectItem>
                      <SelectItem value="Tradicional">Tradicional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="restaurant-description">Descripción</Label>
                <Textarea
                  id="restaurant-description"
                  value={editingRestaurant.description}
                  onChange={(e) => setEditingRestaurant({ ...editingRestaurant, description: e.target.value })}
                  placeholder="Descripción del restaurante"
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurant-price-range">Rango de Precio</Label>
                  <Select
                    value={editingRestaurant.price_range}
                    onValueChange={(value) => setEditingRestaurant({ ...editingRestaurant, price_range: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar precio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="€">€</SelectItem>
                      <SelectItem value="€€">€€</SelectItem>
                      <SelectItem value="€€€">€€€</SelectItem>
                      <SelectItem value="€€€€">€€€€</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restaurant-rating">Calificación</Label>
                  <Select
                    value={editingRestaurant.rating?.toString()}
                    onValueChange={(value) => setEditingRestaurant({ ...editingRestaurant, rating: parseFloat(value) })}
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
                  <Label htmlFor="restaurant-review-count">Número de Reseñas</Label>
                  <Input
                    id="restaurant-review-count"
                    type="number"
                    value={editingRestaurant.review_count || ''}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, review_count: e.target.value ? Number.parseInt(e.target.value) : 0 })}
                    placeholder="Ej: 150"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restaurant-order">Orden</Label>
                  <Input
                    id="restaurant-order"
                    type="number"
                    value={editingRestaurant.order_index || ''}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, order_index: e.target.value ? Number.parseInt(e.target.value) : 0 })}
                  />
                </div>
              </div>

              <ImageSelector
                value={editingRestaurant.image_url}
                onChange={(url) => setEditingRestaurant({ ...editingRestaurant, image_url: url })}
                onError={(error) => console.error('Image error:', error)}
                label=""
                className="col-span-2"
              />

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={loading}>
                  <i className="fas fa-save mr-2"></i>
                  {loading ? "Guardando..." : "Guardar"}
                </Button>
                <Button variant="outline" onClick={() => setEditingRestaurant(null)} disabled={loading}>
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









