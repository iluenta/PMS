"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { supabase, isDemoMode, mockData, type CommissionSetting } from "@/lib/supabase"
import { Settings, Plus, Edit, Percent, DollarSign, Globe, Building2 } from "lucide-react"

export default function CommissionSettings() {
  const [commissionSettings, setCommissionSettings] = useState<CommissionSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSetting, setEditingSetting] = useState<CommissionSetting | null>(null)

  useEffect(() => {
    fetchCommissionSettings()
  }, [])

  const fetchCommissionSettings = async () => {
    try {
      if (isDemoMode) {
        setCommissionSettings(mockData.commissionSettings)
        return
      }

      const { data, error } = await supabase
        .from("commission_settings")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setCommissionSettings(data || [])
    } catch (error) {
      console.error("Error fetching commission settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (setting: CommissionSetting) => {
    setEditingSetting(setting)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingSetting(null)
    setIsDialogOpen(true)
  }

  const toggleActive = async (setting: CommissionSetting) => {
    try {
      if (isDemoMode) {
        alert(`Canal ${setting.is_active ? "desactivado" : "activado"} (Demo)`)
        return
      }

      const { error } = await supabase
        .from("commission_settings")
        .update({ is_active: !setting.is_active })
        .eq("id", setting.id)

      if (error) throw error
      fetchCommissionSettings()
    } catch (error) {
      console.error("Error updating commission setting:", error)
    }
  }

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case "ota":
        return <Globe className="h-5 w-5" />
      case "direct":
        return <Building2 className="h-5 w-5" />
      default:
        return <Settings className="h-5 w-5" />
    }
  }

  const getChannelTypeLabel = (channelType: string) => {
    switch (channelType) {
      case "ota":
        return "OTA"
      case "direct":
        return "Directo"
      default:
        return "Otro"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración de Comisiones</h1>
          <p className="mt-2 text-gray-600">Gestiona las comisiones por canal de venta</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Canal
            </Button>
          </DialogTrigger>
          <CommissionDialog
            setting={editingSetting}
            onClose={() => setIsDialogOpen(false)}
            onSave={fetchCommissionSettings}
          />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {commissionSettings.map((setting) => (
          <Card key={setting.id} className={`${!setting.is_active ? "opacity-60" : ""}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 text-blue-600">{getChannelIcon(setting.channel_type)}</div>
                  <div>
                    <CardTitle className="text-lg">{setting.channel_name}</CardTitle>
                    <CardDescription>{getChannelTypeLabel(setting.channel_type)}</CardDescription>
                  </div>
                </div>
                <Switch checked={setting.is_active} onCheckedChange={() => toggleActive(setting)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Tipo de comisión</span>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    {setting.commission_type === "percentage" ? (
                      <Percent className="h-3 w-3" />
                    ) : (
                      <DollarSign className="h-3 w-3" />
                    )}
                    <span>{setting.commission_type === "percentage" ? "Porcentaje" : "Fijo"}</span>
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Comisión</span>
                  <div className="text-right">
                    {setting.commission_type === "percentage" ? (
                      <span className="text-lg font-bold text-red-600">{setting.commission_rate}%</span>
                    ) : (
                      <span className="text-lg font-bold text-red-600">€{setting.fixed_amount}</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(setting)} className="w-full">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {commissionSettings.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay configuraciones</h3>
            <p className="text-gray-500 mb-4">Configura las comisiones para tus canales de venta</p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Canal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CommissionDialog({
  setting,
  onClose,
  onSave,
}: {
  setting: CommissionSetting | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    channel_name: "",
    channel_type: "ota",
    commission_rate: 0,
    commission_type: "percentage",
    fixed_amount: 0,
    is_active: true,
  })

  useEffect(() => {
    if (setting) {
      setFormData({
        channel_name: setting.channel_name,
        channel_type: setting.channel_type,
        commission_rate: setting.commission_rate,
        commission_type: setting.commission_type,
        fixed_amount: setting.fixed_amount,
        is_active: setting.is_active,
      })
    } else {
      setFormData({
        channel_name: "",
        channel_type: "ota",
        commission_rate: 0,
        commission_type: "percentage",
        fixed_amount: 0,
        is_active: true,
      })
    }
  }, [setting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isDemoMode) {
        alert(setting ? "Configuración actualizada (Demo)" : "Configuración creada (Demo)")
        onSave()
        onClose()
        return
      }

      if (setting) {
        const { error } = await supabase.from("commission_settings").update(formData).eq("id", setting.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("commission_settings").insert([
          {
            ...formData,
            owner_id: "550e8400-e29b-41d4-a716-446655440000", // Demo user ID
          },
        ])

        if (error) throw error
      }

      onSave()
      onClose()
    } catch (error) {
      console.error("Error saving commission setting:", error)
    }
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{setting ? "Editar Canal" : "Nuevo Canal"}</DialogTitle>
        <DialogDescription>
          {setting ? "Modifica la configuración del canal" : "Configura un nuevo canal de venta"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="channel_name">Nombre del canal</Label>
          <Input
            id="channel_name"
            value={formData.channel_name}
            onChange={(e) => setFormData({ ...formData, channel_name: e.target.value })}
            placeholder="ej. Booking.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="channel_type">Tipo de canal</Label>
          <Select
            value={formData.channel_type}
            onValueChange={(value) => setFormData({ ...formData, channel_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ota">OTA (Online Travel Agency)</SelectItem>
              <SelectItem value="direct">Canal Directo</SelectItem>
              <SelectItem value="other">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="commission_type">Tipo de comisión</Label>
          <Select
            value={formData.commission_type}
            onValueChange={(value) => setFormData({ ...formData, commission_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Porcentaje</SelectItem>
              <SelectItem value="fixed">Cantidad fija</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.commission_type === "percentage" ? (
          <div className="space-y-2">
            <Label htmlFor="commission_rate">Porcentaje de comisión (%)</Label>
            <Input
              id="commission_rate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.commission_rate}
              onChange={(e) => setFormData({ ...formData, commission_rate: Number.parseFloat(e.target.value) })}
              required
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="fixed_amount">Cantidad fija (€)</Label>
            <Input
              id="fixed_amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.fixed_amount}
              onChange={(e) => setFormData({ ...formData, fixed_amount: Number.parseFloat(e.target.value) })}
              required
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label htmlFor="is_active">Canal activo</Label>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{setting ? "Actualizar" : "Crear"} Canal</Button>
        </div>
      </form>
    </DialogContent>
  )
}
