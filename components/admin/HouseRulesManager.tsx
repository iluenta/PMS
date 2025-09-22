"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { IconSelector } from "@/components/ui/IconSelector"
import { HouseRule } from "@/types/guides"
import { getHouseRules, createHouseRule, updateHouseRule, deleteHouseRule } from "@/lib/guides"

interface HouseRulesManagerProps {
  guideId: string
}

export function HouseRulesManager({ guideId }: HouseRulesManagerProps) {
  const [rules, setRules] = useState<HouseRule[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRule, setEditingRule] = useState<HouseRule | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  // Cargar normas al montar el componente
  useEffect(() => {
    loadRules()
  }, [guideId])

  const loadRules = async () => {
    try {
      setLoading(true)
      const rulesData = await getHouseRules(guideId)
      setRules(rulesData || [])
    } catch (error) {
      console.error('Error loading house rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (rule: HouseRule) => {
    setEditingRule(rule)
    setIsAddingNew(false)
  }

  const handleAddNew = () => {
    setEditingRule({
      id: "",
      tenant_id: 0,
      guide_id: guideId,
      title: "",
      description: "",
      icon: "fas fa-info-circle",
      order_index: rules.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    setIsAddingNew(true)
  }

  const handleSave = async () => {
    if (!editingRule) return

    try {
      if (isAddingNew) {
        // Crear nueva norma
        const newRule = await createHouseRule({
          guide_id: guideId,
          title: editingRule.title,
          description: editingRule.description,
          icon: editingRule.icon,
          order_index: editingRule.order_index
        })
        
        if (newRule) {
          setRules([...rules, newRule])
        }
      } else {
        // Actualizar norma existente
        const updatedRule = await updateHouseRule(editingRule.id, {
          title: editingRule.title,
          description: editingRule.description,
          icon: editingRule.icon,
          order_index: editingRule.order_index
        })
        
        if (updatedRule) {
          setRules(rules.map(rule => rule.id === editingRule.id ? updatedRule : rule))
        }
      }
      
      setEditingRule(null)
      setIsAddingNew(false)
    } catch (error) {
      console.error('Error saving house rule:', error)
    }
  }

  const handleDelete = async (ruleId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta norma?")) {
      try {
        const success = await deleteHouseRule(ruleId)
        if (success) {
          setRules(rules.filter(rule => rule.id !== ruleId))
        }
      } catch (error) {
        console.error('Error deleting house rule:', error)
      }
    }
  }

  const handleCancel = () => {
    setEditingRule(null)
    setIsAddingNew(false)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mb-4"></i>
          <p className="text-gray-600">Cargando normas...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-clipboard-list text-blue-600"></i>
              Normas de la Casa ({rules.length})
            </CardTitle>
            <Button onClick={handleAddNew}>
              <i className="fas fa-plus mr-2"></i>
              Agregar Norma
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-clipboard-list text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600">No hay normas de la casa creadas</p>
              <p className="text-sm text-gray-500 mt-2 mb-4">Crea las normas para que los huéspedes sepan qué esperar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className={`${rule.icon} text-blue-600`}></i>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">{rule.title}</h4>
                        <p className="text-sm text-gray-600">{rule.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(rule)}>
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(rule.id)}>
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingRule && (
        <Card>
          <CardHeader>
            <CardTitle>{isAddingNew ? "Agregar Nueva Norma" : "Editar Norma"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rule-title">Título</Label>
                  <Input
                    id="rule-title"
                    value={editingRule.title}
                    onChange={(e) => setEditingRule({ ...editingRule, title: e.target.value })}
                    placeholder="Título de la norma"
                  />
                </div>
                <IconSelector
                  value={editingRule.icon}
                  onChange={(icon) => setEditingRule({ ...editingRule, icon })}
                  category="general"
                  label="Icono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rule-description">Descripción</Label>
                <Textarea
                  id="rule-description"
                  value={editingRule.description}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  placeholder="Descripción de la norma"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rule-order">Orden</Label>
                <Input
                  id="rule-order"
                  type="number"
                  value={editingRule.order_index || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, order_index: e.target.value ? Number.parseInt(e.target.value) : 0 })}
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
    </div>
  )
}

