"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { updateSetting } from "@/lib/settings"
import type { Setting, ConfigType, ColoredListItem } from "@/types/settings"
import { Plus, Edit, Trash2, Save, X, Palette, Eye, Info } from "lucide-react"

interface ConfigItemsManagerProps {
  setting: Setting
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

export default function ConfigItemsManager({ setting, isOpen, onClose, onSave }: ConfigItemsManagerProps) {
  const [items, setItems] = useState<ConfigValue>(setting.value)
  const [newItem, setNewItem] = useState({ name: '', color: '#000000' })
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [lastUpdate] = useState(new Date().toLocaleDateString('es-ES'))
  const { toast } = useToast()

  useEffect(() => {
    setItems(setting.value)
  }, [setting])

  const addItem = () => {
    if (!newItem.name.trim()) return

    if (setting.config_type === 'simple_list') {
      const newItems = [...(items as string[]), newItem.name]
      setItems(newItems)
    } else {
      const newItems = [...(items as ColoredListItem[]), { name: newItem.name, color: newItem.color }]
      setItems(newItems)
    }

    setNewItem({ name: '', color: '#000000' })
  }

  const updateItem = (index: number) => {
    if (!newItem.name.trim()) return

    if (setting.config_type === 'simple_list') {
      const newItems = [...(items as string[])]
      newItems[index] = newItem.name
      setItems(newItems)
    } else {
      const newItems = [...(items as ColoredListItem[])]
      newItems[index] = { name: newItem.name, color: newItem.color }
      setItems(newItems)
    }

    setEditingIndex(null)
    setNewItem({ name: '', color: '#000000' })
  }

  const deleteItem = (index: number) => {
    if (setting.config_type === 'simple_list') {
      const newItems = (items as string[]).filter((_, i) => i !== index)
      setItems(newItems)
    } else {
      const newItems = (items as ColoredListItem[]).filter((_, i) => i !== index)
      setItems(newItems)
    }
  }

  const startEdit = (index: number) => {
    if (setting.config_type === 'simple_list') {
      setNewItem({ name: (items as string[])[index], color: '#000000' })
    } else {
      const item = (items as ColoredListItem[])[index]
      setNewItem({ name: item.name, color: item.color })
    }
    setEditingIndex(index)
  }

  const handleSave = async () => {
    try {
      await updateSetting(setting.id, { value: items })
      toast({
        title: "Elementos actualizados",
        description: "Los elementos de configuración se han actualizado correctamente"
      })
      onSave()
    } catch (error) {
      console.error('Error updating setting:', error)
      toast({
        title: "Error",
        description: "No se pudieron actualizar los elementos",
        variant: "destructive"
      })
    }
  }

  const getConfigTypeLabel = () => {
    return setting.config_type === 'simple_list' ? 'Lista Simple' : 'Lista con Colores'
  }

  const getConfigTypeIcon = () => {
    return setting.config_type === 'simple_list' ? <List className="h-4 w-4" /> : <Palette className="h-4 w-4" />
  }

  const renderJSONView = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Vista JSON</h3>
          <div className="text-sm text-muted-foreground">
            Última actualización: {lastUpdate}
          </div>
        </div>
        
        <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
          <pre>{JSON.stringify(items, null, 2)}</pre>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Información:</p>
              <p>Esta vista muestra el contenido JSON completo de la configuración. Los cambios realizados en los campos editables se reflejarán aquí después de guardar.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{setting.description}</DialogTitle>
              <DialogDescription>
                Administra los elementos de esta configuración del sistema
              </DialogDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Section: Editable Fields */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium">Campos Editables</h3>
                <Badge variant="secondary" className="flex items-center space-x-2">
                  {getConfigTypeIcon()}
                  <span>{getConfigTypeLabel()}</span>
                </Badge>
              </div>
              
              {/* Add/Edit Item Form */}
              <div className="space-y-4 p-4 border rounded-md bg-muted/30">
                <h4 className="font-medium">Agregar/Editar Elemento</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item-name">Nombre</Label>
                    <Input
                      id="item-name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      placeholder="Nombre del elemento"
                    />
                  </div>
                  
                  {setting.config_type === 'colored_list' && (
                    <div className="space-y-2">
                      <Label htmlFor="item-color">Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="item-color"
                          type="color"
                          value={newItem.color}
                          onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                          className="w-16 h-10"
                        />
                        <Input
                          value={newItem.color}
                          onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {editingIndex !== null ? (
                    <>
                      <Button onClick={() => updateItem(editingIndex)} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Actualizar
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setEditingIndex(null)
                        setNewItem({ name: '', color: '#000000' })
                      }} size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button onClick={addItem} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar {setting.config_type === 'simple_list' ? 'Elemento' : 'Estado'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="font-medium">Elementos Configurados</h4>
                <div className="space-y-2">
                  {Array.isArray(items) && items.length > 0 ? (
                    items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md bg-background">
                        <div className="flex items-center space-x-3">
                          {setting.config_type === 'colored_list' && (
                            <div 
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: (item as ColoredListItem).color }}
                            />
                          )}
                          <span className="font-medium">{(item as any).name || item}</span>
                          {setting.config_type === 'colored_list' && (
                            <span className="text-sm text-muted-foreground font-mono">
                              {(item as ColoredListItem).color}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(index)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteItem(index)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border rounded-md">
                      No hay elementos configurados
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: JSON View */}
          <div>
            {renderJSONView()}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Import missing components
import { List } from "lucide-react"
import { Badge } from "@/components/ui/badge"
