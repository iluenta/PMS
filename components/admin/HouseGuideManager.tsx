"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { IconSelector } from "@/components/ui/IconSelector"
import { HouseGuideItem } from "@/types/guides"
import { getHouseGuideItems, createHouseGuideItem, updateHouseGuideItem, deleteHouseGuideItem } from "@/lib/guides"

interface HouseGuideManagerProps {
  guideId: string
}

export function HouseGuideManager({ guideId }: HouseGuideManagerProps) {
  const [items, setItems] = useState<HouseGuideItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<HouseGuideItem | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  // Cargar elementos de guía al montar el componente
  useEffect(() => {
    loadItems()
  }, [guideId])

  const loadItems = async () => {
    try {
      setLoading(true)
      const itemsData = await getHouseGuideItems(guideId)
      setItems(itemsData || [])
    } catch (error) {
      console.error('Error loading house guide items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: HouseGuideItem) => {
    setEditingItem(item)
    setIsAddingNew(false)
  }

  const handleAddNew = () => {
    setEditingItem({
      id: "",
      tenant_id: 0,
      guide_id: guideId,
      title: "",
      description: "",
      details: "",
      icon: "",
      order_index: items.length,
      created_at: "",
      updated_at: ""
    })
    setIsAddingNew(true)
  }

  const handleSave = async () => {
    if (!editingItem) return

    try {
      if (isAddingNew) {
        const newItem = await createHouseGuideItem({
          guide_id: guideId,
          title: editingItem.title,
          description: editingItem.description,
          details: editingItem.details,
          icon: editingItem.icon,
          order_index: editingItem.order_index
        })
        
        if (newItem) {
          setItems([...items, newItem])
        }
      } else {
        const updatedItem = await updateHouseGuideItem(editingItem.id, {
          title: editingItem.title,
          description: editingItem.description,
          details: editingItem.details,
          icon: editingItem.icon,
          order_index: editingItem.order_index
        })
        
        if (updatedItem) {
          setItems(items.map(item => 
            item.id === editingItem.id ? updatedItem : item
          ))
        }
      }
      
      setEditingItem(null)
      setIsAddingNew(false)
    } catch (error) {
      console.error('Error saving house guide item:', error)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este elemento de la guía?')) return

    try {
      const success = await deleteHouseGuideItem(itemId)
      if (success) {
        setItems(items.filter(item => item.id !== itemId))
      }
    } catch (error) {
      console.error('Error deleting house guide item:', error)
    }
  }

  const handleCancel = () => {
    setEditingItem(null)
    setIsAddingNew(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Cargando elementos de la guía...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de agregar */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Elementos de la Guía de la Casa ({items.length})
        </h3>
        <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
          <i className="fas fa-plus mr-2"></i>
          Agregar Elemento
        </Button>
      </div>

      {/* Lista de elementos existentes */}
      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id} className="border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.icon && (
                    <i className={`${item.icon} text-blue-600 text-lg`}></i>
                  )}
                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>
              </div>
            </CardHeader>
            {item.details && (
              <CardContent className="pt-0">
                <p className="text-sm text-gray-700">{item.details}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Formulario de edición */}
      {editingItem && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>
              {isAddingNew ? 'Agregar Nueva Guía' : 'Editar Guía'}
            </CardTitle>
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
                <Label htmlFor="item-details">Detalles</Label>
                <Textarea
                  id="item-details"
                  value={editingItem.details}
                  onChange={(e) => setEditingItem({ ...editingItem, details: e.target.value })}
                  placeholder="Información detallada sobre este elemento"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-order">Orden</Label>
                <Input
                  id="item-order"
                  type="number"
                  value={editingItem.order_index || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, order_index: e.target.value ? Number.parseInt(e.target.value) : 0 })}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <i className="fas fa-save mr-2"></i>
                  Guardar
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && !editingItem && (
        <div className="text-center py-8 text-gray-500">
          <i className="fas fa-book-open text-4xl mb-4"></i>
          <p>No hay elementos en la guía de la casa aún.</p>
          <p className="text-sm">Haz clic en "Agregar Elemento" para comenzar.</p>
        </div>
      )}
    </div>
  )
}
