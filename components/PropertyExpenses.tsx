"use client"

import type React from "react"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { supabase, isDemoMode, mockData, type Expense, type Property, type Reservation } from "@/lib/supabase"
import { getExpenseCategories, getExpenseSubcategories } from "@/lib/expenses"
import { type ExpenseCategory, type ExpenseSubcategory } from "@/types/expenses"
import { Receipt, Plus, Edit, CheckCircle, Clock, AlertCircle, Building2, Trash2, Filter, Search } from "lucide-react"
import { useProperty } from "@/contexts/PropertyContext"

export default function PropertyExpenses() {
  const { selectedProperty, properties } = useProperty()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>("all")
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all")
  const [sortFilter, setSortFilter] = useState<string>("date_desc")

  // Estados para categorías y subcategorías desde la base de datos
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [subcategories, setSubcategories] = useState<ExpenseSubcategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    if (selectedProperty) {
      fetchData()
    }
  }, [selectedProperty])

  // Cargar categorías y subcategorías para los filtros del listado
  useEffect(() => {
    const loadCategoriesAndSubcategories = async () => {
      try {
        setLoadingCategories(true)
        const [cats, subs] = await Promise.all([
          getExpenseCategories(),
          getExpenseSubcategories(),
        ])
        setCategories(cats)
        setSubcategories(subs)
      } catch (error) {
        console.error("Error loading categories/subcategories:", error)
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategoriesAndSubcategories()
  }, [])

  // Al cambiar la categoría del filtro, resetear subcategoría
  useEffect(() => {
    setSubcategoryFilter("all")
  }, [categoryFilter])

  // Subcategorías visibles en el filtro según categoría seleccionada
  const filteredSubcategoriesForFilter = useMemo(() => {
    if (categoryFilter === "all") return subcategories
    return subcategories.filter(sub => sub.category_id === categoryFilter)
  }, [categoryFilter, subcategories])

  const fetchData = async () => {
    if (!selectedProperty) return
    
    try {
      setLoading(true)
      if (isDemoMode) {
        // Mock data for expenses
        const mockExpenses: Expense[] = [
          {
            id: "1",
            category_id: "cat-maintenance",
            subcategory_id: "sub-plumbing",
            description: "Reparación grifo cocina",
            amount: 85.00,
            vendor: "Fontanería Express",
            date: "2024-02-18",
            status: "paid",
            payment_method: "transfer",
            reference: "REF001",
            notes: "Reparación urgente",
            property_id: selectedProperty.id,
            created_at: "2024-02-18T10:00:00Z",
            updated_at: "2024-02-18T10:00:00Z"
          },
          {
            id: "2",
            category_id: "cat-utilities",
            subcategory_id: "sub-electricity",
            description: "Factura electricidad febrero",
            amount: 120.00,
            vendor: "Iberdrola",
            date: "2024-02-28",
            status: "pending",
            payment_method: "transfer",
            reference: "REF002",
            property_id: selectedProperty.id,
            created_at: "2024-02-28T10:00:00Z",
            updated_at: "2024-02-28T10:00:00Z"
          }
        ]

        setExpenses(mockExpenses)
        setReservations([])
        return
      }

      // Fetch expenses for the selected property
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .eq("property_id", selectedProperty.id)
        .order("date", { ascending: false })

      if (expensesError) {
        console.error("Error fetching expenses:", expensesError)
      }

      // Fetch reservations for the selected property
      const { data: reservationsData } = await supabase
        .from("reservations")
        .select("*")
        .eq("property_id", selectedProperty.id)

      if (expensesData) {
        setExpenses(expensesData)
      } else {
        setExpenses([])
      }
      
      if (reservationsData) setReservations(reservationsData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Obtener nombre de categoría por ID
  function getCategoryNameForExpense(expense: Expense): string {
    if (expense.category_id) {
      const cat = categories.find(c => c.id === expense.category_id)
      if (cat?.description) return cat.description
    }
    return ""
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingExpense(null)
    setIsDialogOpen(true)
  }

  const handleDelete = (expense: Expense) => {
    setExpenseToDelete(expense)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!expenseToDelete) return

    try {
      if (isDemoMode) {
        // Mock deletion
        setExpenses(expenses.filter(e => e.id !== expenseToDelete.id))
        setIsDeleteDialogOpen(false)
        setExpenseToDelete(null)
        return
      }

      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseToDelete.id)

      if (error) throw error

      // Remove from local state
      setExpenses(expenses.filter(e => e.id !== expenseToDelete.id))
      setIsDeleteDialogOpen(false)
      setExpenseToDelete(null)
    } catch (error) {
      console.error("Error deleting expense:", error)
      alert("Error al eliminar el gasto")
    }
  }

  // Helpers para filtros
  const getPropertyNameForExpense = (expense: Expense) => {
    return selectedProperty?.name || "Sin propiedad"
  }

  const availableCategories = useMemo(() => {
    const categories = new Set<string>()
    for (const expense of expenses) {
      if (expense.category) categories.add(expense.category)
    }
    return Array.from(categories)
  }, [expenses])

  const filteredExpenses = useMemo(() => {
    let list = [...expenses]

    // Buscar por descripción, proveedor, referencia o notas
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase().trim()
      list = list.filter(expense => {
        const description = expense.description?.toLowerCase() || ""
        const vendor = expense.vendor?.toLowerCase() || ""
        const reference = expense.reference?.toLowerCase() || ""
        const notes = expense.notes?.toLowerCase() || ""
        return description.includes(s) || vendor.includes(s) || reference.includes(s) || notes.includes(s)
      })
    }

    // Estado
    if (statusFilter !== "all") list = list.filter(expense => expense.status === statusFilter)

    // Categoría (por ID)
    if (categoryFilter !== "all") list = list.filter(expense => expense.category_id === categoryFilter)

    // Subcategoría (por ID)
    if (subcategoryFilter !== "all") list = list.filter(expense => expense.subcategory_id === subcategoryFilter)

    // Rango de fechas sobre la fecha del gasto
    if (dateRangeFilter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      list = list.filter(expense => {
        const d = expense.date ? new Date(expense.date) : null
        if (!d) return false
        const daysDiff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        switch (dateRangeFilter) {
          case "pending": // usamos mismo nombre; aquí significa fecha futura
            return d > today
          case "today":
            return daysDiff === 0
          case "this_week":
            return daysDiff >= 0 && daysDiff <= 7
          case "this_month":
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
          case "past":
            return d < today
          default:
            return true
        }
      })
    }

    // Ordenar
    list.sort((a, b) => {
      switch (sortFilter) {
        case "date_desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "date_asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "amount_desc":
          return (b.amount || 0) - (a.amount || 0)
        case "amount_asc":
          return (a.amount || 0) - (b.amount || 0)
        default:
          return 0
      }
    })

    return list
  }, [expenses, searchTerm, statusFilter, categoryFilter, subcategoryFilter, dateRangeFilter, sortFilter])

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!selectedProperty) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay propiedad seleccionada</h3>
          <p className="text-gray-500">Selecciona una propiedad para ver sus gastos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      {/* Cabecera con Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
        <CardHeader className="pb-6">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                Gestión de Gastos
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Gestiona los gastos operacionales y de mantenimiento de{" "}
                <span className="font-semibold text-blue-600">{selectedProperty.name}</span>
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAdd} className="shadow-sm rounded-xl">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Gasto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <ExpenseDialog
                  expense={editingExpense}
                  properties={properties}
                  reservations={reservations}
                  onClose={() => setIsDialogOpen(false)}
                  onSave={fetchData}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Navegación por pestañas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 rounded-xl">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="paid">Pagados</TabsTrigger>
          <TabsTrigger value="approved">Aprobados</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-8 mt-8">
          {/* Panel de Filtros */}
          <Card className="p-6 shadow-sm border-0 bg-white rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Buscar */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Descripción, proveedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="paid">Pagado</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="approved">Aprobado</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">Categoría</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategoría */}
              <div className="space-y-2">
                <Label htmlFor="subcategory" className="text-sm font-medium">Subcategoría</Label>
                <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter} disabled={categoryFilter === "all"}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={categoryFilter === "all" ? "Selecciona una categoría primero" : "Todas las subcategorías"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las subcategorías</SelectItem>
                    {filteredSubcategoriesForFilter.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rango de fechas */}
              <div className="space-y-2">
                <Label htmlFor="dateRange" className="text-sm font-medium">Rango de fechas</Label>
                <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Todas las fechas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las fechas</SelectItem>
                    <SelectItem value="pending">Futuras</SelectItem>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="this_week">Esta semana</SelectItem>
                    <SelectItem value="this_month">Este mes</SelectItem>
                    <SelectItem value="past">Pasadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ordenar */}
              <div className="space-y-2">
                <Label htmlFor="sort" className="text-sm font-medium">Ordenar</Label>
                <Select value={sortFilter} onValueChange={setSortFilter}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Fecha (reciente)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">Fecha (reciente)</SelectItem>
                    <SelectItem value="date_asc">Fecha (antigua)</SelectItem>
                    <SelectItem value="amount_desc">Importe (mayor)</SelectItem>
                    <SelectItem value="amount_asc">Importe (menor)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Resumen Financiero */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total gastos filtrados</p>
                  <p className="text-3xl font-bold text-gray-900">€{totalExpenses.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Gastos encontrados</p>
                  <p className="text-2xl font-semibold text-blue-600">{filteredExpenses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses List */}
          <div className="space-y-6">
            {filteredExpenses.length === 0 ? (
              <Card className="border-0 shadow-sm rounded-2xl">
                <CardContent className="p-12 text-center">
                  <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron gastos</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    No hay gastos que coincidan con los filtros aplicados. 
                    Intenta ajustar los criterios de búsqueda o crear un nuevo gasto.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExpenses.map((expense: Expense) => (
                  <Card key={expense.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm group rounded-2xl">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-blue-100 rounded-xl">
                            <Receipt className="h-4 w-4 text-blue-600" />
                          </div>
                          <Badge 
                            variant={expense.status === 'paid' ? 'default' : expense.status === 'pending' ? 'secondary' : 'outline'}
                            className={`rounded-full ${
                              expense.status === 'paid' 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : expense.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(expense.status)}
                              <span className="capitalize font-medium">{expense.status}</span>
                            </div>
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(expense)}
                            className="h-8 w-8 p-0 rounded-full"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(expense)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-lg font-semibold line-clamp-2">
                        {expense.description}
                      </CardTitle>
                      <CardDescription className="flex items-center text-sm">
                        <Building2 className="h-3 w-3 mr-1" />
                        {getPropertyNameForExpense(expense)}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* Información principal */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Importe</p>
                          <p className="text-xl font-bold text-red-600">€{expense.amount?.toFixed(2)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Categoría</p>
                          <p className="font-semibold text-gray-900">{getCategoryNameForExpense(expense)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(expense.date).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Proveedor</p>
                          <p className="font-medium text-gray-900 truncate">
                            {expense.vendor || "N/A"}
                          </p>
                        </div>
                      </div>
                      
                      {/* Información adicional */}
                      {(expense.reference || expense.reservation_id) && (
                        <div className="pt-4 border-t border-gray-100 space-y-2">
                          {expense.reference && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-500">Referencia</span>
                              <span className="text-xs font-medium text-gray-900">{expense.reference}</span>
                            </div>
                          )}
                          
                          {expense.reservation_id && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-500">Reserva</span>
                              <Badge variant="outline" className="text-xs rounded-full">
                                {expense.reservation_id}
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-8 mt-8">
          {/* Contenido para "Pendientes" */}
          <div className="space-y-8">
            {/* Panel de Filtros */}
            <Card className="p-6 shadow-sm border-0 bg-white rounded-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Buscar */}
                <div className="space-y-2">
                  <Label htmlFor="search-pending" className="text-sm font-medium">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search-pending"
                      placeholder="Descripción, proveedor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                {/* Categoría */}
                <div className="space-y-2">
                  <Label htmlFor="category-pending" className="text-sm font-medium">Categoría</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subcategoría */}
                <div className="space-y-2">
                  <Label htmlFor="subcategory-pending" className="text-sm font-medium">Subcategoría</Label>
                <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter} disabled={categoryFilter === "all"}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Todas las subcategorías" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">Todas las subcategorías</SelectItem>
                    {filteredSubcategoriesForFilter.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ordenar */}
                <div className="space-y-2">
                  <Label htmlFor="sort-pending" className="text-sm font-medium">Ordenar</Label>
                  <Select value={sortFilter} onValueChange={setSortFilter}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Fecha (reciente)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date_desc">Fecha (reciente)</SelectItem>
                      <SelectItem value="date_asc">Fecha (antigua)</SelectItem>
                      <SelectItem value="amount_desc">Importe (mayor)</SelectItem>
                      <SelectItem value="amount_asc">Importe (menor)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Resumen Financiero */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-0 shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total gastos pendientes</p>
                    <p className="text-3xl font-bold text-gray-900">
                      €{filteredExpenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + (e.amount || 0), 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Gastos pendientes</p>
                    <p className="text-2xl font-semibold text-yellow-600">
                      {filteredExpenses.filter(e => e.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de gastos pendientes */}
            <div className="space-y-6">
              {filteredExpenses.filter(e => e.status === 'pending').length === 0 ? (
                <Card className="border-0 shadow-sm rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay gastos pendientes</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Todos los gastos han sido procesados o no hay gastos pendientes.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExpenses.filter(e => e.status === 'pending').map((expense: Expense) => (
                    <Card key={expense.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm group rounded-2xl">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-yellow-100 rounded-xl">
                              <Clock className="h-4 w-4 text-yellow-600" />
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded-full">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span className="capitalize font-medium">Pendiente</span>
                              </div>
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEdit(expense)}
                              className="h-8 w-8 p-0 rounded-full"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(expense)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="text-lg font-semibold line-clamp-2">
                          {expense.description}
                        </CardTitle>
                        <CardDescription className="flex items-center text-sm">
                          <Building2 className="h-3 w-3 mr-1" />
                          {getPropertyNameForExpense(expense)}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Importe</p>
                            <p className="text-xl font-bold text-red-600">€{expense.amount?.toFixed(2)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Categoría</p>
                            <p className="font-semibold text-gray-900">{getCategoryNameForExpense(expense)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(expense.date).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Proveedor</p>
                            <p className="font-medium text-gray-900 truncate">
                              {expense.vendor || "N/A"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="paid" className="space-y-8 mt-8">
          {/* Contenido para "Pagados" */}
          <div className="space-y-8">
            {/* Panel de Filtros */}
            <Card className="p-6 shadow-sm border-0 bg-white rounded-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Buscar */}
                <div className="space-y-2">
                  <Label htmlFor="search-paid" className="text-sm font-medium">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search-paid"
                      placeholder="Descripción, proveedor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                {/* Categoría */}
                <div className="space-y-2">
                  <Label htmlFor="category-paid" className="text-sm font-medium">Categoría</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subcategoría */}
                <div className="space-y-2">
                  <Label htmlFor="subcategory-paid" className="text-sm font-medium">Subcategoría</Label>
                <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter} disabled={categoryFilter === "all"}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Todas las subcategorías" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">Todas las subcategorías</SelectItem>
                    {filteredSubcategoriesForFilter.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ordenar */}
                <div className="space-y-2">
                  <Label htmlFor="sort-paid" className="text-sm font-medium">Ordenar</Label>
                  <Select value={sortFilter} onValueChange={setSortFilter}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Fecha (reciente)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date_desc">Fecha (reciente)</SelectItem>
                      <SelectItem value="date_asc">Fecha (antigua)</SelectItem>
                      <SelectItem value="amount_desc">Importe (mayor)</SelectItem>
                      <SelectItem value="amount_asc">Importe (menor)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Resumen Financiero */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-0 shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total gastos pagados</p>
                    <p className="text-3xl font-bold text-gray-900">
                      €{filteredExpenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + (e.amount || 0), 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Gastos pagados</p>
                    <p className="text-2xl font-semibold text-green-600">
                      {filteredExpenses.filter(e => e.status === 'paid').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de gastos pagados */}
            <div className="space-y-6">
              {filteredExpenses.filter(e => e.status === 'paid').length === 0 ? (
                <Card className="border-0 shadow-sm rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay gastos pagados</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      No se han registrado gastos pagados aún.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExpenses.filter(e => e.status === 'paid').map((expense: Expense) => (
                    <Card key={expense.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm group rounded-2xl">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-green-100 rounded-xl">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200 rounded-full">
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="h-3 w-3" />
                                <span className="capitalize font-medium">Pagado</span>
                              </div>
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEdit(expense)}
                              className="h-8 w-8 p-0 rounded-full"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(expense)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="text-lg font-semibold line-clamp-2">
                          {expense.description}
                        </CardTitle>
                        <CardDescription className="flex items-center text-sm">
                          <Building2 className="h-3 w-3 mr-1" />
                          {getPropertyNameForExpense(expense)}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Importe</p>
                            <p className="text-xl font-bold text-red-600">€{expense.amount?.toFixed(2)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Categoría</p>
                            <p className="font-semibold text-gray-900">{getCategoryNameForExpense(expense)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(expense.date).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Proveedor</p>
                            <p className="font-medium text-gray-900 truncate">
                              {expense.vendor || "N/A"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="approved" className="space-y-8 mt-8">
          {/* Contenido para "Aprobados" */}
          <div className="space-y-8">
            {/* Panel de Filtros */}
            <Card className="p-6 shadow-sm border-0 bg-white rounded-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Buscar */}
                <div className="space-y-2">
                  <Label htmlFor="search-approved" className="text-sm font-medium">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search-approved"
                      placeholder="Descripción, proveedor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-xl"
                    />
                  </div>
                </div>

                {/* Categoría */}
                <div className="space-y-2">
                  <Label htmlFor="category-approved" className="text-sm font-medium">Categoría</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subcategoría */}
                <div className="space-y-2">
                  <Label htmlFor="subcategory-approved" className="text-sm font-medium">Subcategoría</Label>
                <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter} disabled={categoryFilter === "all"}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Todas las subcategorías" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="all">Todas las subcategorías</SelectItem>
                    {filteredSubcategoriesForFilter.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ordenar */}
                <div className="space-y-2">
                  <Label htmlFor="sort-approved" className="text-sm font-medium">Ordenar</Label>
                  <Select value={sortFilter} onValueChange={setSortFilter}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Fecha (reciente)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date_desc">Fecha (reciente)</SelectItem>
                      <SelectItem value="date_asc">Fecha (antigua)</SelectItem>
                      <SelectItem value="amount_desc">Importe (mayor)</SelectItem>
                      <SelectItem value="amount_asc">Importe (menor)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Resumen Financiero */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total gastos aprobados</p>
                    <p className="text-3xl font-bold text-gray-900">
                      €{filteredExpenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + (e.amount || 0), 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Gastos aprobados</p>
                    <p className="text-2xl font-semibold text-blue-600">
                      {filteredExpenses.filter(e => e.status === 'approved').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de gastos aprobados */}
            <div className="space-y-6">
              {filteredExpenses.filter(e => e.status === 'approved').length === 0 ? (
                <Card className="border-0 shadow-sm rounded-2xl">
                  <CardContent className="p-12 text-center">
                    <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay gastos aprobados</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      No se han registrado gastos aprobados aún.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExpenses.filter(e => e.status === 'approved').map((expense: Expense) => (
                    <Card key={expense.id} className="hover:shadow-lg transition-all duration-200 border-0 shadow-sm group rounded-2xl">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-blue-100 rounded-xl">
                              <CheckCircle className="h-4 w-4 text-blue-600" />
                            </div>
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-full">
                              <div className="flex items-center space-x-1">
                                <CheckCircle className="h-3 w-3" />
                                <span className="capitalize font-medium">Aprobado</span>
                              </div>
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEdit(expense)}
                              className="h-8 w-8 p-0 rounded-full"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(expense)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="text-lg font-semibold line-clamp-2">
                          {expense.description}
                        </CardTitle>
                        <CardDescription className="flex items-center text-sm">
                          <Building2 className="h-3 w-3 mr-1" />
                          {getPropertyNameForExpense(expense)}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Importe</p>
                            <p className="text-xl font-bold text-red-600">€{expense.amount?.toFixed(2)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Categoría</p>
                            <p className="font-semibold text-gray-900">{getCategoryNameForExpense(expense)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(expense.date).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Proveedor</p>
                            <p className="font-medium text-gray-900 truncate">
                              {expense.vendor || "N/A"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Confirmar eliminación</DialogTitle>
            <DialogDescription className="text-gray-600">
              ¿Estás seguro de que quieres eliminar el gasto "{expenseToDelete?.description}"? 
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              className="rounded-xl"
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ExpenseDialog({
  expense,
  properties,
  reservations,
  onClose,
  onSave,
}: {
  expense: Expense | null
  properties: Property[]
  reservations: Reservation[]
  onClose: () => void
  onSave: () => void
}) {
  const { selectedProperty } = useProperty()
  
  // Inicializar formData sin dependencias dinámicas
  const [formData, setFormData] = useState({
    property_id: "",
    reservation_id: "",
    category_id: "",
    subcategory_id: "",
    description: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    payment_method: "transfer",
    vendor: "",
    reference: "",
    notes: "",
    status: "pending",
  })

  // Estados para categorías y subcategorías
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [subcategories, setSubcategories] = useState<ExpenseSubcategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Cargar categorías y subcategorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        
        if (isDemoMode) {
          // Mock data para demo
          const mockCategories: ExpenseCategory[] = [
            { id: "1", description: "Mantenimiento", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
            { id: "2", description: "Servicios", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
            { id: "3", description: "Suministros", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
            { id: "4", description: "Marketing", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
            { id: "5", description: "Seguros", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
            { id: "6", description: "Impuestos", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
            { id: "7", description: "Otros", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" }
          ]
          setCategories(mockCategories)
          
          const mockSubcategories: ExpenseSubcategory[] = [
            { id: "1", category_id: "1", description: "Fontanería", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
            { id: "2", category_id: "1", description: "Electricidad", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
            { id: "3", category_id: "2", description: "Limpieza", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
            { id: "4", category_id: "3", description: "Amenities", created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" }
          ]
          setSubcategories(mockSubcategories)
        } else {
          // Cargar categorías desde la base de datos
          const { data: categoriesData, error: categoriesError } = await supabase
            .from("expense_categories")
            .select("*")
            .order("description")

          if (categoriesError) {
            console.error("Error loading categories:", categoriesError)
          } else {
            setCategories(categoriesData || [])
          }

          // Cargar subcategorías desde la base de datos
          const { data: subcategoriesData, error: subcategoriesError } = await supabase
            .from("expense_subcategories")
            .select("*")
            .order("description")

          if (subcategoriesError) {
            console.error("Error loading subcategories:", subcategoriesError)
          } else {
            setSubcategories(subcategoriesData || [])
          }
        }
      } catch (error) {
        console.error("Error loading categories and subcategories:", error)
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [])

  // Cargar subcategorías cuando cambie la categoría seleccionada
  const handleCategoryChange = (categoryId: string) => {
    setFormData({ ...formData, category_id: categoryId, subcategory_id: "" })
  }

  // Obtener subcategorías filtradas por categoría
  const getFilteredSubcategories = () => {
    if (!formData.category_id) return []
    return subcategories.filter(sub => sub.category_id === formData.category_id)
  }

  // DEBUG logs removed

  // Valores efectivos mostrados en el formulario (tolerantes a reseteos)
  const viewData = useMemo(() => {
    const parsedAmount =
      formData.amount ??
      (typeof expense?.amount === "number" ? expense.amount : Number(expense?.amount ?? 0))

    return {
      property_id: formData.property_id || (expense?.property_id ?? ""),
      reservation_id:
        formData.reservation_id || (expense?.reservation_id ? String(expense.reservation_id) : ""),
      category_id: formData.category_id || (expense?.category_id ?? ""),
      subcategory_id: formData.subcategory_id || (expense?.subcategory_id ?? ""),
      description: formData.description || (expense?.description ?? ""),
      amount: parsedAmount,
      date: formData.date || (expense?.date ?? new Date().toISOString().split("T")[0]),
      payment_method: formData.payment_method || (expense?.payment_method ?? "transfer"),
      vendor: formData.vendor || (expense?.vendor ?? ""),
      reference: formData.reference || (expense?.reference ?? ""),
      notes: formData.notes || (expense?.notes ?? ""),
      status: formData.status || (expense?.status ?? "pending"),
    }
  }, [formData, expense])

  // Obtener el nombre de la categoría seleccionada
  const getSelectedCategoryName = () => {
    if (!formData.category_id) return ""
    const category = categories.find(cat => cat.id === formData.category_id)
    return category?.description || ""
  }

  // Obtener el nombre de la subcategoría seleccionada
  const getSelectedSubcategoryName = () => {
    if (!formData.subcategory_id) return ""
    const subcategory = subcategories.find(sub => sub.id === formData.subcategory_id)
    return subcategory?.description || ""
  }

  // Setear property_id inicial
  useEffect(() => {
    if (selectedProperty?.id && !formData.property_id) {
      setFormData(prev => ({ ...prev, property_id: selectedProperty.id }))
    }
  }, [selectedProperty?.id, formData.property_id])

  useEffect(() => {
    if (expense && categories.length > 0) {
      // Solo cargar cuando hay expense Y las categorías están cargadas
      // loading expense data
      
      const newFormData = {
        property_id: expense.property_id || selectedProperty?.id || "",
        reservation_id: expense.reservation_id ? String(expense.reservation_id) : "",
        category_id: expense.category_id || "",
        subcategory_id: expense.subcategory_id || "",
        description: expense.description || "",
        amount: typeof expense.amount === "number" ? expense.amount : Number(expense.amount ?? 0),
        date: expense.date || new Date().toISOString().split("T")[0],
        payment_method: expense.payment_method || "transfer",
        vendor: expense.vendor || "",
        reference: expense.reference || "",
        notes: expense.notes || "",
        status: expense.status || "pending",
      }
      setFormData(newFormData)
    } else if (!expense && selectedProperty?.id) {
      // Si no hay expense, resetear el formulario para nuevo gasto
      // reset form for new expense
      setFormData({
        property_id: selectedProperty.id,
        reservation_id: "",
        category_id: "",
        subcategory_id: "",
        description: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        payment_method: "transfer",
        vendor: "",
        reference: "",
        notes: "",
        status: "pending",
      })
    }
  }, [expense, categories.length, selectedProperty?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isDemoMode) {
        alert(expense ? "Gasto actualizado (Demo)" : "Gasto creado (Demo)")
        onSave()
        onClose()
        return
      }

      // Validar datos requeridos
      if (!formData.description || !formData.amount || !formData.date) {
        alert("Por favor, completa todos los campos requeridos")
        return
      }

      // Preparar datos para envío según la estructura exacta de la tabla expenses
      const submitData: any = {
        property_id: formData.property_id,
        description: formData.description,
        amount: formData.amount,
        date: formData.date,
        status: formData.status,
        payment_method: formData.payment_method,
        vendor: formData.vendor || null,
        reference: formData.reference || null,
        notes: formData.notes || null,
      }

      // Agregar campos opcionales solo si tienen valor
      if (formData.reservation_id) {
        submitData.reservation_id = formData.reservation_id
      }

      if (formData.category_id) {
        submitData.category_id = formData.category_id
      }

      if (formData.subcategory_id) {
        submitData.subcategory_id = formData.subcategory_id
      }

      // No enviar texto de categoría/subcategoría. IDs ya incluidos arriba

      // submitting data

      if (expense) {
        const { error } = await supabase.from("expenses").update(submitData).eq("id", expense.id)

        if (error) {
          console.error("Error updating expense:", error)
          throw error
        }
      } else {
        const { error } = await supabase.from("expenses").insert([submitData])

        if (error) {
          console.error("Error creating expense:", error)
          throw error
        }
      }

      onSave()
      onClose()
    } catch (error) {
      console.error("Error saving expense:", error)
      alert(`Error al guardar el gasto: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  const filteredReservations = reservations.filter((reservation) => reservation.property_id === selectedProperty?.id)

  const [extraReservation, setExtraReservation] = useState<Reservation | null>(null)

  const currentReservationId = (formData.reservation_id && formData.reservation_id !== "")
    ? formData.reservation_id
    : (expense?.reservation_id ? String(expense.reservation_id) : "")

  useEffect(() => {
    const shouldFetch = Boolean(currentReservationId) && !filteredReservations.some(r => r.id === currentReservationId)
    if (!shouldFetch) {
      setExtraReservation(null)
      return
    }
    ;(async () => {
      const { data } = await supabase
        .from("reservations")
        .select("*")
        .eq("id", currentReservationId)
        .maybeSingle()
      if (data) setExtraReservation(data as Reservation)
    })()
  }, [currentReservationId, filteredReservations.length])

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">
          {expense ? "Editar Gasto" : "Nuevo Gasto"}
        </DialogTitle>
        <DialogDescription className="text-gray-600">
          {expense ? "Modifica los datos del gasto" : "Registra un nuevo gasto para la propiedad"}
        </DialogDescription>
      </DialogHeader>

      <form key={expense?.id || 'new'} onSubmit={handleSubmit} className="space-y-8">
        {/* Información de la Propiedad */}
        {selectedProperty && (
          <Card className="p-6 border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Propiedad</Label>
                <p className="font-semibold text-gray-900">{selectedProperty.name}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Información Básica */}
        <Card className="p-6 border-0 shadow-sm rounded-2xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-gray-100 rounded-xl">
              <Receipt className="h-4 w-4 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
          </div>
          
          <div className="space-y-6">
            {/* Reserva asociada */}
            <div className="space-y-2">
              <Label htmlFor="reservation_id" className="text-sm font-medium">Reserva asociada (opcional)</Label>
              <Select
                value={currentReservationId || "none"}
                onValueChange={(value) => setFormData({ ...formData, reservation_id: value === "none" ? "" : value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecciona una reserva (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin reserva asociada</SelectItem>
                  {extraReservation && (
                    <SelectItem value={extraReservation.id}>
                      {extraReservation.guest?.name || "Reserva actual"} - {new Date(extraReservation.check_in).toLocaleDateString()}
                    </SelectItem>
                  )}
                  {filteredReservations.map((reservation) => (
                    <SelectItem key={reservation.id} value={reservation.id}>
                      {reservation.guest?.name || "Sin nombre"} -{" "}
                      {new Date(reservation.check_in).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Descripción del gasto</Label>
              <Textarea
                id="description"
                value={viewData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe detalladamente el gasto realizado..."
                className="rounded-xl"
                required
              />
            </div>

            {/* Categoría y Subcategoría */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">Categoría</Label>
                <Select value={viewData.category_id || ""} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="rounded-xl">
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
                <Label htmlFor="subcategory" className="text-sm font-medium">Subcategoría (opcional)</Label>
                <Select
                  value={viewData.subcategory_id || "none"}
                  onValueChange={(value) => setFormData({ ...formData, subcategory_id: value === "none" ? "" : value })}
                  disabled={!viewData.category_id}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecciona una subcategoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin subcategoría</SelectItem>
                    {getFilteredSubcategories().map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Proveedor */}
            <div className="space-y-2">
              <Label htmlFor="vendor" className="text-sm font-medium">Proveedor</Label>
              <Input
                id="vendor"
                value={viewData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="Nombre del proveedor"
                className="rounded-xl"
              />
            </div>
          </div>
        </Card>

        {/* Información Financiera */}
        <Card className="p-6 border-0 shadow-sm rounded-2xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-green-100 rounded-xl">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Información Financiera</h3>
          </div>
          
          <div className="space-y-6">
            {/* Importe y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">Importe (€)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={Number.isFinite(viewData.amount as any) ? viewData.amount : ""}
                  onChange={(e) => {
                    const v = e.target.value
                    setFormData({ ...formData, amount: v === "" ? 0 : Number.parseFloat(v) })
                  }}
                  className="rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">Fecha del gasto</Label>
                <Input
                  id="date"
                  type="date"
                  value={viewData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Método de pago y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_method" className="text-sm font-medium">Método de pago</Label>
                <Select
                  value={viewData.payment_method || ""}
                  onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecciona método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Tarjeta</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="check">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">Estado</Label>
                <Select value={viewData.status || ""} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="paid">Pagado</SelectItem>
                    <SelectItem value="approved">Aprobado</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Información Adicional */}
        <Card className="p-6 border-0 shadow-sm rounded-2xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Edit className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Información Adicional</h3>
          </div>
          
          <div className="space-y-6">
            {/* Referencia */}
            <div className="space-y-2">
              <Label htmlFor="reference" className="text-sm font-medium">Referencia (opcional)</Label>
              <Input
                id="reference"
                value={viewData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Referencia de la transacción"
                className="rounded-xl"
              />
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Notas (opcional)</Label>
              <Textarea
                id="notes"
                value={viewData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionales sobre el gasto..."
                className="rounded-xl"
              />
            </div>
          </div>
        </Card>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="rounded-xl"
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            className="rounded-xl shadow-sm"
          >
            {expense ? "Actualizar" : "Crear"} Gasto
          </Button>
        </div>
      </form>
    </>
  )
}
