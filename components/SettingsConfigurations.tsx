"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { 
  getSettings,
  createSetting,
  updateSetting,
  deleteSetting,
  getSettingsByType,
  validateSettingValue
} from "@/lib/settings"
import type { 
  Setting, 
  CreateSettingData, 
  UpdateSettingData, 
  ConfigType,
  ConfigValue,
  ColoredListItem
} from "@/types/settings"
import { Plus, Edit, Trash2, Settings as SettingsIcon, Palette, List, Database, Eye, Save, X } from "lucide-react"
import ConfigItemsManager from "./ConfigItemsManager"
import { useAuth } from "@/contexts/AuthContext"

export default function SettingsConfigurations() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null)
  const [activeTab, setActiveTab] = useState<ConfigType>('simple_list')
  const [selectedSetting, setSelectedSetting] = useState<Setting | null>(null)
  const [isConfigItemsDialogOpen, setIsConfigItemsDialogOpen] = useState(false)
  
  const [formData, setFormData] = useState<CreateSettingData>({
    key: "",
    description: "",
    config_type: 'simple_list',
    value: []
  })

  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const settingsData = await getSettings()
      setSettings(settingsData)
    } catch (error) {
      console.error("Error loading settings:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingSetting) {
        await updateSetting(editingSetting.id, formData)
        toast({
          title: "Configuración actualizada",
          description: "La configuración se ha actualizado correctamente"
        })
      } else {
        await createSetting({
          ...formData,
          tenant_id: user?.tenant_id || null
        })
        toast({
          title: "Configuración creada",
          description: "La configuración se ha creado correctamente"
        })
      }
      
      setIsDialogOpen(false)
      setEditingSetting(null)
      resetForm()
      loadSettings()
    } catch (error) {
      console.error("Error saving setting:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (setting: Setting) => {
    setEditingSetting(setting)
    setFormData({
      key: setting.key,
      description: setting.description || "",
      config_type: setting.config_type,
      value: setting.value
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta configuración?")) return
    
    try {
      await deleteSetting(id)
      toast({
        title: "Configuración eliminada",
        description: "La configuración se ha eliminado correctamente"
      })
      loadSettings()
    } catch (error) {
      console.error("Error deleting setting:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la configuración",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      key: "",
      description: "",
      config_type: 'simple_list',
      value: []
    })
  }

  const handleConfigTypeChange = (configType: ConfigType) => {
    setFormData({
      ...formData,
      config_type: configType,
      value: configType === 'simple_list' ? [] : []
    })
  }

  const openConfigItemsDialog = (setting: Setting) => {
    setSelectedSetting(setting)
    setIsConfigItemsDialogOpen(true)
  }

  const getConfigTypeLabel = (configType: ConfigType) => {
    return configType === 'simple_list' ? 'Lista Simple' : 'Lista con Colores'
  }

  const getConfigTypeIcon = (configType: ConfigType) => {
    return configType === 'simple_list' ? <List className="h-4 w-4" /> : <Palette className="h-4 w-4" />
  }

  const getConfigTypeBadgeVariant = (configType: ConfigType) => {
    return configType === 'simple_list' ? 'secondary' : 'default'
  }

  const formatValue = (value: ConfigValue, configType: ConfigType) => {
    if (configType === 'simple_list' && Array.isArray(value)) {
      return (value as string[]).join(', ')
    } else if (configType === 'colored_list' && Array.isArray(value)) {
      return `${(value as ColoredListItem[]).length} elementos`
    }
    return 'Sin valor'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Configuraciones del Sistema</h2>
          <p className="text-muted-foreground mt-2">
            Administra las configuraciones clave-valor del sistema
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingSetting(null)
              resetForm()
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Configuración
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingSetting ? "Editar Configuración" : "Nueva Configuración"}
              </DialogTitle>
              <DialogDescription>
                {editingSetting 
                  ? "Modifica la información de la configuración"
                  : "Crea una nueva configuración del sistema"
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="key">Clave</Label>
                  <Input
                    id="key"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="Ej: reservation_statuses"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="config_type">Tipo de Configuración</Label>
                  <Select 
                    value={formData.config_type} 
                    onValueChange={(value: ConfigType) => handleConfigTypeChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple_list">
                        <div className="flex items-center space-x-2">
                          <List className="h-4 w-4" />
                          <span>Lista Simple</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="colored_list">
                        <div className="flex items-center space-x-2">
                          <Palette className="h-4 w-4" />
                          <span>Lista con Colores</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción de la configuración"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Valor Inicial</Label>
                <div className="p-4 border rounded-md bg-muted">
                  <p className="text-sm text-muted-foreground">
                    {formData.config_type === 'simple_list' 
                      ? 'Lista simple: se pueden agregar elementos después de crear la configuración'
                      : 'Lista con colores: se pueden agregar elementos con colores después de crear la configuración'
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false)
                    setEditingSetting(null)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingSetting ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Settings List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Clave</TableHead>
                  <TableHead className="font-medium">Descripción</TableHead>
                  <TableHead className="font-medium">Tipo</TableHead>
                  <TableHead className="font-medium">Valor</TableHead>
                  <TableHead className="font-medium">Tenant</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell className="font-mono text-sm">{setting.key}</TableCell>
                    <TableCell>{setting.description}</TableCell>
                    <TableCell>
                      <Badge variant={getConfigTypeBadgeVariant(setting.config_type)}>
                        {getConfigTypeIcon(setting.config_type)}
                        <span className="ml-2">{getConfigTypeLabel(setting.config_type)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatValue(setting.value, setting.config_type)}
                    </TableCell>
                    <TableCell>
                      {setting.tenant_id ? (
                        <Badge variant="outline">Tenant {setting.tenant_id}</Badge>
                      ) : (
                        <Badge variant="secondary">Global</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openConfigItemsDialog(setting)}
                          title="Gestionar elementos"
                        >
                          <Database className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(setting)}
                          title="Editar configuración"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(setting.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          title="Eliminar configuración"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {settings.length === 0 && !loading && (
        <div className="text-center py-12">
          <SettingsIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No hay configuraciones configuradas
          </h3>
          <p className="text-muted-foreground mb-4">
            Comienza creando configuraciones del sistema
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Primera Configuración
          </Button>
        </div>
      )}

      {/* Config Items Management Dialog */}
      {selectedSetting && (
        <ConfigItemsManager
          setting={selectedSetting}
          isOpen={isConfigItemsDialogOpen}
          onClose={() => {
            setIsConfigItemsDialogOpen(false)
            setSelectedSetting(null)
          }}
          onSave={() => {
            setIsConfigItemsDialogOpen(false)
            setSelectedSetting(null)
            loadSettings()
          }}
        />
      )}
    </div>
  )
}


