"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { IconSelector } from "@/components/ui/IconSelector"
import { Tip } from "@/types/guides"
import { getTips, createTip, updateTip, deleteTip } from "@/lib/guides"

interface TipsManagerProps {
  guideId: string
}

export function TipsManager({ guideId }: TipsManagerProps) {
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTip, setEditingTip] = useState<Tip | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  // Cargar consejos al montar el componente
  useEffect(() => {
    loadTips()
  }, [guideId])

  const loadTips = async () => {
    try {
      setLoading(true)
      const tipsData = await getTips(guideId)
      setTips(tipsData || [])
    } catch (error) {
      console.error('Error loading tips:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tip: Tip) => {
    setEditingTip(tip)
    setIsAddingNew(false)
  }

  const handleAddNew = () => {
    setEditingTip({
      id: "",
      tenant_id: 0,
      guide_id: guideId,
      title: "",
      description: "",
      details: "",
      icon: "",
      order_index: tips.length,
      created_at: "",
      updated_at: ""
    })
    setIsAddingNew(true)
  }

  const handleSave = async () => {
    if (!editingTip) return

    try {
      if (isAddingNew) {
        const newTip = await createTip({
          guide_id: guideId,
          title: editingTip.title,
          description: editingTip.description,
          details: editingTip.details,
          icon: editingTip.icon,
          order_index: editingTip.order_index
        })
        
        if (newTip) {
          setTips([...tips, newTip])
        }
      } else {
        const updatedTip = await updateTip(editingTip.id, {
          title: editingTip.title,
          description: editingTip.description,
          details: editingTip.details,
          icon: editingTip.icon,
          order_index: editingTip.order_index
        })
        
        if (updatedTip) {
          setTips(tips.map(tip => 
            tip.id === editingTip.id ? updatedTip : tip
          ))
        }
      }
      
      setEditingTip(null)
      setIsAddingNew(false)
    } catch (error) {
      console.error('Error saving tip:', error)
    }
  }

  const handleDelete = async (tipId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este consejo?')) return

    try {
      const success = await deleteTip(tipId)
      if (success) {
        setTips(tips.filter(tip => tip.id !== tipId))
      }
    } catch (error) {
      console.error('Error deleting tip:', error)
    }
  }

  const handleCancel = () => {
    setEditingTip(null)
    setIsAddingNew(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Cargando consejos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de agregar */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Consejos ({tips.length})
        </h3>
        <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
          <i className="fas fa-plus mr-2"></i>
          Agregar Consejo
        </Button>
      </div>

      {/* Lista de consejos existentes */}
      <div className="grid gap-4">
        {tips.map((tip) => (
          <Card key={tip.id} className="border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {tip.icon && (
                    <i className={`${tip.icon} text-blue-600 text-lg`}></i>
                  )}
                  <div>
                    <CardTitle className="text-lg">{tip.title}</CardTitle>
                    {tip.description && (
                      <p className="text-sm text-gray-600 mt-1">{tip.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(tip)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <i className="fas fa-edit"></i>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(tip.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <i className="fas fa-trash"></i>
                  </Button>
                </div>
              </div>
            </CardHeader>
            {tip.details && (
              <CardContent className="pt-0">
                <p className="text-sm text-gray-700">{tip.details}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Formulario de edición */}
      {editingTip && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>
              {isAddingNew ? 'Agregar Nuevo Consejo' : 'Editar Consejo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tip-title">Título</Label>
                  <Input
                    id="tip-title"
                    value={editingTip.title}
                    onChange={(e) => setEditingTip({ ...editingTip, title: e.target.value })}
                    placeholder="Título del consejo"
                  />
                </div>
                <IconSelector
                  value={editingTip.icon}
                  onChange={(icon) => setEditingTip({ ...editingTip, icon })}
                  category="general"
                  label="Icono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tip-description">Descripción</Label>
                <Textarea
                  id="tip-description"
                  value={editingTip.description}
                  onChange={(e) => setEditingTip({ ...editingTip, description: e.target.value })}
                  placeholder="Descripción del consejo"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tip-details">Detalles</Label>
                <Textarea
                  id="tip-details"
                  value={editingTip.details}
                  onChange={(e) => setEditingTip({ ...editingTip, details: e.target.value })}
                  placeholder="Información detallada sobre este consejo"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tip-order">Orden</Label>
                <Input
                  id="tip-order"
                  type="number"
                  value={editingTip.order_index || ''}
                  onChange={(e) => setEditingTip({ ...editingTip, order_index: e.target.value ? Number.parseInt(e.target.value) : 0 })}
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

      {tips.length === 0 && !editingTip && (
        <div className="text-center py-8 text-gray-500">
          <i className="fas fa-lightbulb text-4xl mb-4"></i>
          <p>No hay consejos aún.</p>
          <p className="text-sm">Haz clic en "Agregar Consejo" para comenzar.</p>
        </div>
      )}
    </div>
  )
}
