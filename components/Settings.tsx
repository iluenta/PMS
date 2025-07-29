"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { 
  getChannels,
  createChannel,
  updateChannel,
  deleteChannel
} from "@/lib/channels"
import type { DistributionChannel, CreateChannelData, UpdateChannelData } from "@/types/channels"
import { Plus, Edit, Globe, Trash2, Settings as SettingsIcon, Users, Shield, Database, Upload, X } from "lucide-react"

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general")
  const [channels, setChannels] = useState<DistributionChannel[]>([])
  const [loading, setLoading] = useState(true)
  const [channelsLoading, setChannelsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingChannel, setEditingChannel] = useState<DistributionChannel | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateChannelData>({
    name: "",
    logo: ""
  })
  const { toast } = useToast()

  useEffect(() => {
    // Component has mounted, so we can turn off the main loader.
    setLoading(false)
  }, [])

  const loadChannels = async () => {
    try {
      setChannelsLoading(true)
      const channelsData = await getChannels()
      setChannels(channelsData)
    } catch (error) {
      console.error("Error loading channels:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los canales",
        variant: "destructive"
      })
    } finally {
      setChannelsLoading(false)
    }
  }

  // Load channels only when the channels tab is activated for the first time
  useEffect(() => {
    if (activeTab === "channels" && channels.length === 0) {
      loadChannels()
    }
  }, [activeTab])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    // Also remove from form data if it exists
    if (formData.logo) {
      setFormData({ ...formData, logo: "" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingChannel) {
        const deleteExistingLogo = editingChannel.logo ? !formData.logo : false
        await updateChannel(editingChannel.id, { name: formData.name }, logoFile || undefined, deleteExistingLogo)
        toast({
          title: "Canal actualizado",
          description: "El canal se ha actualizado correctamente"
        })
      } else {
        await createChannel({ name: formData.name }, logoFile || undefined)
        toast({
          title: "Canal creado",
          description: "El canal se ha creado correctamente"
        })
      }
      
      setIsDialogOpen(false)
      setEditingChannel(null)
      resetForm()
      loadChannels()
    } catch (error) {
      console.error("Error saving channel:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el canal",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (channel: DistributionChannel) => {
    setEditingChannel(channel)
    setFormData({
      name: channel.name,
      logo: channel.logo || ""
    })
    setLogoPreview(channel.logo || null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este canal?")) return
    
    try {
      await deleteChannel(id)
      toast({
        title: "Canal eliminado",
        description: "El canal se ha eliminado correctamente"
      })
      loadChannels()
    } catch (error) {
      console.error("Error deleting channel:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el canal",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      logo: ""
    })
    setLogoFile(null)
    setLogoPreview(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground mt-2">
          Administra la configuración del sistema
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <SettingsIcon className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="channels" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Canales</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Seguridad</span>
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración General</CardTitle>
                <CardDescription>
                  Configuración básica del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Modo Demo</h3>
                    <p className="text-sm text-muted-foreground">
                      Activa el modo demo para usar datos de prueba
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notificaciones</h3>
                    <p className="text-sm text-muted-foreground">
                      Recibe notificaciones por email
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Channels Tab */}
          <TabsContent value="channels" className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">Gestión de Canales</h2>
                <p className="text-muted-foreground mt-2">
                  Administra los canales de distribución disponibles
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingChannel(null)
                    resetForm()
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Canal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingChannel ? "Editar Canal" : "Nuevo Canal"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingChannel 
                        ? "Modifica la información del canal de distribución"
                        : "Crea un nuevo canal de distribución"
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del Canal</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej: Booking.com, Airbnb, Directo"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="logo">Logo del Canal</Label>
                      <div className="flex items-center space-x-4">
                        <div className="w-24 h-24 rounded-md border border-dashed flex items-center justify-center bg-muted overflow-hidden">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                          ) : (
                            <Globe className="h-10 w-10 text-muted-foreground" />
                          )}
                        </div>
                        <div className="space-y-2">
                          <Input id="logo" type="file" onChange={handleLogoChange} accept="image/*" className="hidden" />
                          <Label htmlFor="logo" className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                            <Upload className="h-4 w-4 mr-2" />
                            {logoPreview ? "Cambiar" : "Subir"}
                          </Label>
                          {logoPreview && (
                            <Button type="button" variant="ghost" size="sm" onClick={removeLogo} className="text-red-600">
                              <X className="h-4 w-4 mr-1" />
                              Eliminar
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sube una imagen para el logo del canal (opcional, máx 5MB)
                      </p>
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false)
                          setEditingChannel(null)
                          resetForm()
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingChannel ? "Actualizar" : "Crear"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Channels Grid */}
            {channelsLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channels.map((channel) => (
                  <Card key={channel.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        {channel.logo ? (
                          <img 
                            src={channel.logo} 
                            alt={`${channel.name} logo`}
                            className="h-8 w-8 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <Globe className="h-8 w-8 text-blue-600" />
                        )}
                        <div>
                          <CardTitle className="text-lg">{channel.name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Logo Info */}
                      {channel.logo && (
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Logo:</span>
                          <a
                            href={channel.logo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 truncate max-w-[150px]"
                          >
                            Ver imagen
                          </a>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(channel)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(channel.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {channels.length === 0 && !channelsLoading && (
              <div className="text-center py-12">
                <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No hay canales configurados
                </h3>
                <p className="text-muted-foreground mb-4">
                  Comienza creando canales de distribución
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Canal
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
                <CardDescription>
                  Administra usuarios y permisos del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Funcionalidad en desarrollo
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Seguridad</CardTitle>
                <CardDescription>
                  Configuración de seguridad y autenticación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Autenticación de dos factores</h3>
                    <p className="text-sm text-muted-foreground">
                      Requiere código adicional para el acceso
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Sesiones múltiples</h3>
                    <p className="text-sm text-muted-foreground">
                      Permite múltiples sesiones simultáneas
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
} 