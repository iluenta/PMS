"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ChannelPicker } from '@/components/people/ChannelPicker'
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { 
  getChannels,
  createChannel,
  updateChannel,
  deleteChannel
} from "@/lib/channels"
import {
  getExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  getExpenseSubcategories,
  createExpenseSubcategory,
  updateExpenseSubcategory,
  deleteExpenseSubcategory
} from "@/lib/expenses"
import type { DistributionChannel, CreateChannelData, UpdateChannelData } from "@/types/channels"
import type { 
  ExpenseCategory, 
  ExpenseSubcategory, 
  ExpenseSubcategoryWithCategory,
  CreateExpenseCategoryData,
  CreateExpenseSubcategoryData
} from "@/types/expenses"
import { Plus, Edit, Globe, Trash2, Settings as SettingsIcon, Users, Shield, Database, Upload, X, FolderOpen, FolderTree } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function Settings() {
  const { user } = useAuth()
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
  const [channelPerson, setChannelPerson] = useState<{ name: string; personId?: string }>({ name: "" })

  // Estados para categorías y subcategorías
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [subcategories, setSubcategories] = useState<ExpenseSubcategoryWithCategory[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<ExpenseSubcategory | null>(null)
  const [categoryFormData, setCategoryFormData] = useState<CreateExpenseCategoryData>({
    description: ""
  })
  const [subcategoryFormData, setSubcategoryFormData] = useState<CreateExpenseSubcategoryData>({
    category_id: "",
    description: ""
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

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true)
      const categoriesData = await getExpenseCategories()
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error loading categories:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive"
      })
    } finally {
      setCategoriesLoading(false)
    }
  }

  const loadSubcategories = async () => {
    try {
      setSubcategoriesLoading(true)
      const subcategoriesData = await getExpenseSubcategories()
      setSubcategories(subcategoriesData)
    } catch (error) {
      console.error("Error loading subcategories:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las subcategorías",
        variant: "destructive"
      })
    } finally {
      setSubcategoriesLoading(false)
    }
  }

  // Load data only when the respective tab is activated for the first time
  useEffect(() => {
    if (activeTab === "channels" && channels.length === 0) {
      loadChannels()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === "expense-categories" && categories.length === 0) {
      loadCategories()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab === "expense-categories" && subcategories.length === 0) {
      loadSubcategories()
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
        await updateChannel(editingChannel.id, { name: formData.name, person_id: channelPerson.personId || null }, logoFile || undefined, deleteExistingLogo)
        toast({
          title: "Canal actualizado",
          description: "El canal se ha actualizado correctamente"
        })
      } else {
        // Crear la persona si el usuario escribió nombre pero no seleccionó entidad
        let personId = channelPerson.personId || null
        if (!personId && formData.name.trim()) {
          try {
            const peopleApi = await import('@/lib/peopleService')
            const createdPerson = await peopleApi.createPerson({ 
              person_type: 'distribution_channel', 
              company_name: formData.name,
              tenant_id: user?.tenant_id
            } as any)
            personId = createdPerson.id
          } catch (e) {
            // Continuar sin bloquear si falla la creación; FK podría permitir null en tu esquema actual
          }
        }
        const created = await createChannel({ name: formData.name, person_id: personId }, logoFile || undefined)
        toast({
          title: "Canal creado",
          description: "El canal se ha creado correctamente"
        })
      }
      
      setIsDialogOpen(false)
      setEditingChannel(null)
      resetForm()
      setChannelPerson({ name: "", personId: undefined })
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

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingCategory) {
        await updateExpenseCategory(editingCategory.id, categoryFormData)
        toast({
          title: "Categoría actualizada",
          description: "La categoría se ha actualizado correctamente"
        })
      } else {
        await createExpenseCategory(categoryFormData)
        toast({
          title: "Categoría creada",
          description: "La categoría se ha creado correctamente"
        })
      }
      
      setIsCategoryDialogOpen(false)
      setEditingCategory(null)
      setCategoryFormData({ description: "" })
      loadCategories()
    } catch (error) {
      console.error("Error saving category:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la categoría",
        variant: "destructive"
      })
    }
  }

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingSubcategory) {
        await updateExpenseSubcategory(editingSubcategory.id, subcategoryFormData)
        toast({
          title: "Subcategoría actualizada",
          description: "La subcategoría se ha actualizado correctamente"
        })
      } else {
        await createExpenseSubcategory(subcategoryFormData)
        toast({
          title: "Subcategoría creada",
          description: "La subcategoría se ha creado correctamente"
        })
      }
      
      setIsSubcategoryDialogOpen(false)
      setEditingSubcategory(null)
      setSubcategoryFormData({ category_id: "", description: "" })
      loadSubcategories()
    } catch (error) {
      console.error("Error saving subcategory:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la subcategoría",
        variant: "destructive"
      })
    }
  }

  const handleEdit = (channel: DistributionChannel) => {
    setEditingChannel(channel)
    setFormData({ name: channel.name, logo: channel.logo || "" })
    if (channel.logo) {
      setLogoPreview(channel.logo)
    }
    // Preload associated person if present: we don't know the name, so keep personId and lazy fetch name
    setChannelPerson({ name: '', personId: channel.person_id })
    setIsDialogOpen(true)
  }

  const handleEditCategory = (category: ExpenseCategory) => {
    setEditingCategory(category)
    setCategoryFormData({ description: category.description })
    setIsCategoryDialogOpen(true)
  }

  const handleEditSubcategory = (subcategory: ExpenseSubcategory) => {
    setEditingSubcategory(subcategory)
    setSubcategoryFormData({ 
      category_id: subcategory.category_id, 
      description: subcategory.description 
    })
    setIsSubcategoryDialogOpen(true)
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

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta categoría?")) return
    
    try {
      await deleteExpenseCategory(id)
      toast({
        title: "Categoría eliminada",
        description: "La categoría se ha eliminado correctamente"
      })
      loadCategories()
      loadSubcategories() // Reload subcategories as they might be affected
    } catch (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive"
      })
    }
  }

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta subcategoría?")) return
    
    try {
      await deleteExpenseSubcategory(id)
      toast({
        title: "Subcategoría eliminada",
        description: "La subcategoría se ha eliminado correctamente"
      })
      loadSubcategories()
    } catch (error) {
      console.error("Error deleting subcategory:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la subcategoría",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({ name: "", logo: "" })
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general" className="flex items-center space-x-2">
              <SettingsIcon className="h-4 w-4" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="channels" className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Canales</span>
            </TabsTrigger>
            <TabsTrigger value="expense-categories" className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4" />
              <span>Categorías</span>
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
                    setChannelPerson({ name: "", personId: undefined })
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
                       <Label>Entidad (People) asociada</Label>
                       <ChannelPicker
                         value={{ name: channelPerson.name, personId: channelPerson.personId }}
                         onChange={(v) => setChannelPerson({ name: v.name, personId: v.personId })}
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
                            <Button type="button" variant="ghost" size="sm" onClick={removeLogo} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
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
                          setChannelPerson({ name: "", personId: undefined })
                        }}
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
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
                          className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                          onClick={() => handleEdit(channel)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(channel.id)}
                          className="border-red-600 text-red-600 hover:bg-red-50"
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
                <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Canal
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Expense Categories Tab */}
          <TabsContent value="expense-categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Gestión de Categorías y Subcategorías</h2>
                <p className="text-muted-foreground mt-1">
                  Administra las categorías y subcategorías para los gastos
                </p>
              </div>
            </div>

            {/* Tabs for Categories and Subcategories */}
            <Tabs defaultValue="categories" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="categories">Categorías</TabsTrigger>
                <TabsTrigger value="subcategories">Subcategorías</TabsTrigger>
              </TabsList>

              {/* Categories Tab */}
              <TabsContent value="categories" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Categorías de Gastos</h3>
                    <p className="text-sm text-muted-foreground">
                      Gestiona las categorías principales de gastos
                    </p>
                  </div>
                  <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingCategory(null)
                        setCategoryFormData({ description: "" })
                      }} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir Categoría
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingCategory 
                            ? "Modifica la información de la categoría"
                            : "Crea una nueva categoría de gastos"
                          }
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCategorySubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="category-description">Nombre</Label>
                          <Input
                            id="category-description"
                            value={categoryFormData.description}
                            onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                            placeholder="Ej: Mantenimiento, Servicios, etc."
                            required
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsCategoryDialogOpen(false)
                              setEditingCategory(null)
                              setCategoryFormData({ description: "" })
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit">
                            {editingCategory ? "Actualizar" : "Crear"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Categories Table */}
                <Card>
                  <CardContent className="p-0">
                    {categoriesLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-medium">Nombre</TableHead>
                            <TableHead className="font-medium">Descripción</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categories.map((category) => (
                            <TableRow key={category.id}>
                              <TableCell className="font-medium">{category.description}</TableCell>
                              <TableCell className="text-muted-foreground">
                                Categoría de {category.description.toLowerCase()}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditCategory(category)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {categories.length === 0 && !categoriesLoading && (
                  <div className="text-center py-12">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      No hay categorías configuradas
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Comienza creando categorías de gastos
                    </p>
                    <Button onClick={() => setIsCategoryDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primera Categoría
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Subcategories Tab */}
              <TabsContent value="subcategories" className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Subcategorías de Gastos</h3>
                    <p className="text-sm text-muted-foreground">
                      Gestiona las subcategorías asociadas a cada categoría
                    </p>
                  </div>
                  <Dialog open={isSubcategoryDialogOpen} onOpenChange={setIsSubcategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingSubcategory(null)
                        setSubcategoryFormData({ category_id: "", description: "" })
                      }}>
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir Subcategoría
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingSubcategory ? "Editar Subcategoría" : "Nueva Subcategoría"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingSubcategory 
                            ? "Modifica la información de la subcategoría"
                            : "Crea una nueva subcategoría de gastos"
                          }
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubcategorySubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="subcategory-category">Categoría Padre</Label>
                          <Select 
                            value={subcategoryFormData.category_id} 
                            onValueChange={(value) => setSubcategoryFormData({ ...subcategoryFormData, category_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="subcategory-description">Nombre</Label>
                          <Input
                            id="subcategory-description"
                            value={subcategoryFormData.description}
                            onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, description: e.target.value })}
                            placeholder="Ej: Fontanería, Electricidad, etc."
                            required
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsSubcategoryDialogOpen(false)
                              setEditingSubcategory(null)
                              setSubcategoryFormData({ category_id: "", description: "" })
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit">
                            {editingSubcategory ? "Actualizar" : "Crear"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Subcategories Table */}
                <Card>
                  <CardContent className="p-0">
                    {subcategoriesLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-medium">Nombre</TableHead>
                            <TableHead className="font-medium">Descripción</TableHead>
                            <TableHead className="font-medium">Categoría Padre</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subcategories.map((subcategory) => (
                            <TableRow key={subcategory.id}>
                              <TableCell className="font-medium">{subcategory.description}</TableCell>
                              <TableCell className="text-muted-foreground">
                                Subcategoría de {subcategory.description.toLowerCase()}
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">
                                  {subcategory.category?.description || "Sin categoría"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditSubcategory(subcategory)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteSubcategory(subcategory.id)}
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {subcategories.length === 0 && !subcategoriesLoading && (
                  <div className="text-center py-12">
                    <FolderTree className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      No hay subcategorías configuradas
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Comienza creando subcategorías de gastos
                    </p>
                    <Button onClick={() => setIsSubcategoryDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Primera Subcategoría
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
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