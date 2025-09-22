"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { IconSelector } from "@/components/ui/icon-selector"
import type { HouseGuideItem } from "@/types/guide"

interface HouseGuideEditFormProps {
  items: HouseGuideItem[]
  guideId: string
}

export function HouseGuideEditForm({ items, guideId }: HouseGuideEditFormProps) {
  const [editingItem, setEditingItem] = useState<HouseGuideItem | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  const handleEdit = (item: HouseGuideItem) => {
    setEditingItem(item)
    setIsAddingNew(false)
  }

  const handleAddNew = () => {
    setEditingItem({
      id: "",
      guide_id: guideId,
      title: "",
      description: "",
      details: "",
      icon: "fas fa-info-circle",
      order_index: items.length + 1,
    })
    setIsAddingNew(true)
  }

  const handleSave = () => {
    console.log("Saving house guide item:", editingItem)
    alert("Elemento de guía guardado (simulado)")
    setEditingItem(null)
    setIsAddingNew(false)
  }

  const handleDelete = (itemId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este elemento?")) {
      console.log("Deleting house guide item:", itemId)
      alert("Elemento eliminado (simulado)")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-book text-blue-600"></i>
              Guía de la Casa ({items.length})
            </CardTitle>
            <Button onClick={handleAddNew}>
              <i className="fas fa-plus mr-2"></i>
              Agregar Elemento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${item.icon} text-blue-600`}></i>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      {item.details && (
                        <div className="bg-blue-50 p-2 rounded text-xs text-blue-800">
                          <strong>Consejo:</strong> {item.details}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {editingItem && (
        <Card>
          <CardHeader>
            <CardTitle>{isAddingNew ? "Agregar Nuevo Elemento" : "Editar Elemento"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item-title">Título</Label>
                  <Input
                    id="item-title"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder="Título del elemento"
                  />
                </div>
                <IconSelector
                  value={editingItem.icon}
                  onChange={(icon) => setEditingItem({ ...editingItem, icon })}
                  category="general"
                  label="Icono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-description">Descripción</Label>
                <Textarea
                  id="item-description"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Descripción del elemento"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-details">Detalles/Consejo (opcional)</Label>
                <Textarea
                  id="item-details"
                  value={editingItem.details}
                  onChange={(e) => setEditingItem({ ...editingItem, details: e.target.value })}
                  placeholder="Información adicional o consejo"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-order">Orden</Label>
                <Input
                  id="item-order"
                  type="number"
                  value={editingItem.order_index}
                  onChange={(e) => setEditingItem({ ...editingItem, order_index: Number.parseInt(e.target.value) })}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <i className="fas fa-save mr-2"></i>
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setEditingItem(null)}>
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
