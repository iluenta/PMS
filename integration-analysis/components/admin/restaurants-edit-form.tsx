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
import type { Restaurant } from "@/types/guide"

interface RestaurantsEditFormProps {
  restaurants: Restaurant[]
  guideId: string
}

export function RestaurantsEditForm({ restaurants, guideId }: RestaurantsEditFormProps) {
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [imageError, setImageError] = useState<string>("")

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant)
    setIsAddingNew(false)
    setImageError("")
  }

  const handleAddNew = () => {
    setEditingRestaurant({
      id: "",
      guide_id: guideId,
      name: "",
      description: "",
      rating: 0,
      review_count: 0,
      price_range: "",
      badge: "",
      image_url: "",
      order_index: restaurants.length + 1,
    })
    setIsAddingNew(true)
    setImageError("")
  }

  const handleSave = () => {
    console.log("Saving restaurant:", editingRestaurant)
    alert("Restaurante guardado (simulado)")
    setEditingRestaurant(null)
    setIsAddingNew(false)
    setImageError("")
  }

  const handleDelete = (restaurantId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este restaurante?")) {
      console.log("Deleting restaurant:", restaurantId)
      alert("Restaurante eliminado (simulado)")
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
            <Button onClick={handleAddNew}>
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
                        <Badge variant="secondary">{restaurant.badge}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{restaurant.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          <i className="fas fa-star mr-1 text-yellow-500"></i>
                          {restaurant.rating}/5 ({restaurant.review_count})
                        </span>
                        <span>
                          <i className="fas fa-euro-sign mr-1"></i>
                          {restaurant.price_range}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(restaurant)}>
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(restaurant.id)}>
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
              {imageError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">{imageError}</div>
              )}

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
                  <Input
                    id="restaurant-badge"
                    value={editingRestaurant.badge}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, badge: e.target.value })}
                    placeholder="Ej: Gourmet, Clásico, Marisco"
                  />
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
                <RatingInput
                  value={editingRestaurant.rating}
                  onChange={(rating) => setEditingRestaurant({ ...editingRestaurant, rating })}
                  label="Puntuación"
                />
                <div className="space-y-2">
                  <Label htmlFor="restaurant-reviews">Reseñas</Label>
                  <Input
                    id="restaurant-reviews"
                    type="number"
                    value={editingRestaurant.review_count}
                    onChange={(e) =>
                      setEditingRestaurant({ ...editingRestaurant, review_count: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restaurant-price">Precio</Label>
                  <Input
                    id="restaurant-price"
                    value={editingRestaurant.price_range}
                    onChange={(e) => setEditingRestaurant({ ...editingRestaurant, price_range: e.target.value })}
                    placeholder="Ej: €€ - €€€"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restaurant-order">Orden</Label>
                  <Input
                    id="restaurant-order"
                    type="number"
                    value={editingRestaurant.order_index}
                    onChange={(e) =>
                      setEditingRestaurant({ ...editingRestaurant, order_index: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>

              <ImageUpload
                value={editingRestaurant.image_url}
                onChange={(url) => setEditingRestaurant({ ...editingRestaurant, image_url: url })}
                onError={setImageError}
                label="Imagen del Restaurante"
                folder="restaurants"
              />

              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <i className="fas fa-save mr-2"></i>
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setEditingRestaurant(null)}>
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
