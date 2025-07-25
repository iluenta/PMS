"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { supabase, isDemoMode, mockData, type PropertyExpense, type Property, type Booking } from "@/lib/supabase"
import { Receipt, Plus, Edit, CheckCircle, Clock, AlertCircle, Building2 } from "lucide-react"

export default function PropertyExpenses() {
  const [expenses, setExpenses] = useState<PropertyExpense[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<PropertyExpense | null>(null)
  const [filterProperty, setFilterProperty] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      if (isDemoMode) {
        const expensesWithRelations = mockData.propertyExpenses.map((expense) => ({
          ...expense,
          property: mockData.properties.find((p) => p.id === expense.property_id),
          booking: expense.booking_id ? mockData.bookings.find((b) => b.id === expense.booking_id) : undefined,
        }))

        setExpenses(expensesWithRelations)
        setProperties(mockData.properties)
        setBookings(mockData.bookings)
        return
      }

      // Fetch expenses with related data
      const { data: expensesData } = await supabase
        .from("property_expenses")
        .select(`
          *,
          property:properties(*),
          booking:bookings(
            *,
            guest:guests(*)
          )
        `)
        .order("expense_date", { ascending: false })

      // Fetch properties for filters and form
      const { data: propertiesData } = await supabase.from("properties").select("*").eq("status", "active")

      // Fetch bookings for the form
      const { data: bookingsData } = await supabase.from("bookings").select(`
          *,
          property:properties(*),
          guest:guests(*)
        `)

      if (expensesData) setExpenses(expensesData)
      if (propertiesData) setProperties(propertiesData)
      if (bookingsData) setBookings(bookingsData)
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
      case "overdue":
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
      case "overdue":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getExpenseTypeLabel = (type: string) => {
    switch (type) {
      case "cleaning":
        return "Limpieza"
      case "maintenance":
        return "Mantenimiento"
      case "supplies":
        return "Suministros"
      case "utilities":
        return "Servicios"
      case "other":
        return "Otros"
      default:
        return type
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "operational":
        return "Operacional"
      case "maintenance":
        return "Mantenimiento"
      case "marketing":
        return "Marketing"
      case "administrative":
        return "Administrativo"
      default:
        return category
    }
  }

  const handleEdit = (expense: PropertyExpense) => {
    setEditingExpense(expense)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingExpense(null)
    setIsDialogOpen(true)
  }

  const filteredExpenses = expenses.filter((expense) => {
    if (filterProperty !== "all" && expense.property_id !== filterProperty) return false
    if (filterStatus !== "all" && expense.status !== filterStatus) return false
    return true
  })

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

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
          <h1 className="text-3xl font-bold text-gray-900">Gastos de Propiedades</h1>
          <p className="mt-2 text-gray-600">Gestiona los gastos operacionales y de mantenimiento</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Gasto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <ExpenseDialog
              expense={editingExpense}
              properties={properties}
              bookings={bookings}
              onClose={() => setIsDialogOpen(false)}
              onSave={fetchData}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">€{totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total gastos filtrados</p>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label htmlFor="filter-property">Filtrar por propiedad</Label>
          <Select value={filterProperty} onValueChange={setFilterProperty}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las propiedades</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-status">Filtrar por estado</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="paid">Pagado</SelectItem>
              <SelectItem value="overdue">Vencido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={() => {
              setFilterProperty("all")
              setFilterStatus("all")
            }}
            className="w-full"
          >
            Limpiar filtros
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredExpenses.map((expense) => (
          <Card key={expense.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Receipt className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{expense.description}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Building2 className="h-4 w-4 mr-1" />
                      {expense.property?.name}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(expense.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(expense.status)}
                      <span className="capitalize">{expense.status}</span>
                    </div>
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(expense)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Importe</p>
                  <p className="text-lg font-semibold text-red-600">€{expense.amount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo</p>
                  <p className="text-lg font-semibold">{getExpenseTypeLabel(expense.expense_type)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Categoría</p>
                  <p className="text-lg font-semibold">{getCategoryLabel(expense.category)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha</p>
                  <p className="text-lg font-semibold">{new Date(expense.expense_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-500">Proveedor</p>
                  <p>{expense.vendor_name || "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Método de pago</p>
                  <p className="capitalize">{expense.payment_method || "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Recurrente</p>
                  <div className="flex items-center space-x-2">
                    <span>{expense.is_recurring ? "Sí" : "No"}</span>
                    {expense.is_recurring && expense.recurring_frequency && (
                      <Badge variant="outline" className="text-xs">
                        {expense.recurring_frequency}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {expense.booking && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">Asociado a reserva</p>
                  <p className="text-sm text-blue-700">
                    {expense.booking.guest?.first_name} {expense.booking.guest?.last_name} -{" "}
                    {new Date(expense.booking.check_in).toLocaleDateString()} a{" "}
                    {new Date(expense.booking.check_out).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExpenses.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay gastos</h3>
            <p className="text-gray-500 mb-4">Los gastos de las propiedades aparecerán aquí</p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Gasto
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ExpenseDialog({
  expense,
  properties,
  bookings,
  onClose,
  onSave,
}: {
  expense: PropertyExpense | null
  properties: Property[]
  bookings: Booking[]
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    property_id: "",
    booking_id: "",
    expense_type: "cleaning",
    category: "operational",
    description: "",
    amount: 0,
    expense_date: new Date().toISOString().split("T")[0],
    payment_method: "",
    vendor_name: "",
    is_recurring: false,
    recurring_frequency: "",
    status: "pending",
  })

  useEffect(() => {
    if (expense) {
      setFormData({
        property_id: expense.property_id,
        booking_id: expense.booking_id || "",
        expense_type: expense.expense_type,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        expense_date: expense.expense_date,
        payment_method: expense.payment_method || "",
        vendor_name: expense.vendor_name || "",
        is_recurring: expense.is_recurring,
        recurring_frequency: expense.recurring_frequency || "",
        status: expense.status,
      })
    } else {
      setFormData({
        property_id: "",
        booking_id: "",
        expense_type: "cleaning",
        category: "operational",
        description: "",
        amount: 0,
        expense_date: new Date().toISOString().split("T")[0],
        payment_method: "",
        vendor_name: "",
        is_recurring: false,
        recurring_frequency: "",
        status: "pending",
      })
    }
  }, [expense])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isDemoMode) {
        alert(expense ? "Gasto actualizado (Demo)" : "Gasto creado (Demo)")
        onSave()
        onClose()
        return
      }

      const submitData = {
        ...formData,
        booking_id: formData.booking_id || null,
      }

      if (expense) {
        const { error } = await supabase.from("property_expenses").update(submitData).eq("id", expense.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("property_expenses").insert([submitData])

        if (error) throw error
      }

      onSave()
      onClose()
    } catch (error) {
      console.error("Error saving expense:", error)
    }
  }

  const filteredBookings = bookings.filter((booking) => booking.property_id === formData.property_id)

  return (
    <>
      <DialogHeader>
        <DialogTitle>{expense ? "Editar Gasto" : "Nuevo Gasto"}</DialogTitle>
        <DialogDescription>{expense ? "Modifica los datos del gasto" : "Registra un nuevo gasto"}</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="property_id">Propiedad</Label>
          <Select
            value={formData.property_id}
            onValueChange={(value) => setFormData({ ...formData, property_id: value, booking_id: "" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una propiedad" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="booking_id">Reserva asociada (opcional)</Label>
          <Select
            value={formData.booking_id}
            onValueChange={(value) => setFormData({ ...formData, booking_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una reserva (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin reserva asociada</SelectItem>
              {filteredBookings.map((booking) => (
                <SelectItem key={booking.id} value={booking.id}>
                  {booking.guest?.first_name} {booking.guest?.last_name} -{" "}
                  {new Date(booking.check_in).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expense_type">Tipo de gasto</Label>
            <Select
              value={formData.expense_type}
              onValueChange={(value) => setFormData({ ...formData, expense_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cleaning">Limpieza</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
                <SelectItem value="supplies">Suministros</SelectItem>
                <SelectItem value="utilities">Servicios</SelectItem>
                <SelectItem value="other">Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operational">Operacional</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="administrative">Administrativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe el gasto"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Importe (€)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number.parseFloat(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense_date">Fecha del gasto</Label>
            <Input
              id="expense_date"
              type="date"
              value={formData.expense_date}
              onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vendor_name">Proveedor</Label>
            <Input
              id="vendor_name"
              value={formData.vendor_name}
              onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
              placeholder="Nombre del proveedor"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment_method">Método de pago</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
            >
              <SelectTrigger>
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
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="is_recurring"
              checked={formData.is_recurring}
              onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
            />
            <Label htmlFor="is_recurring">Gasto recurrente</Label>
          </div>

          {formData.is_recurring && (
            <div className="space-y-2">
              <Label htmlFor="recurring_frequency">Frecuencia</Label>
              <Select
                value={formData.recurring_frequency}
                onValueChange={(value) => setFormData({ ...formData, recurring_frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Mensual</SelectItem>
                  <SelectItem value="quarterly">Trimestral</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="paid">Pagado</SelectItem>
              <SelectItem value="overdue">Vencido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{expense ? "Actualizar" : "Crear"} Gasto</Button>
        </div>
      </form>
    </>
  )
}
