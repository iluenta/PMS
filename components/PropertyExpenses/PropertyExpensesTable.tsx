import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Receipt, Building2, Users, Calendar, Euro } from "lucide-react"
import type { Expense } from "@/lib/supabase"

// Tipo extendido para gastos con joins
interface ExpenseWithJoins extends Expense {
  categories?: { description: string }
  subcategories?: { description: string }
  reservations?: {
    id: string
    guest: any
    check_in: string
    check_out: string
    property_id: string
  }
}

interface PropertyExpensesTableProps {
  expenses: ExpenseWithJoins[]
  loading: boolean
  onEdit: (expense: ExpenseWithJoins) => void
  onDelete: (expense: ExpenseWithJoins) => void
  onCreateRecurrence: (expense: ExpenseWithJoins) => void
}

export default function PropertyExpensesTable({ 
  expenses, 
  loading, 
  onEdit, 
  onDelete,
  onCreateRecurrence
}: PropertyExpensesTableProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </CardContent>
      </Card>
    )
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">No hay gastos</p>
          <p className="text-sm text-gray-400">Crea tu primer gasto para comenzar</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Pendiente</Badge>
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completado</Badge>
      case "cancelled":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <Euro className="h-4 w-4" />
      case "card":
        return <div className="w-4 h-4 bg-blue-600 rounded-sm" />
      case "transfer":
        return <div className="w-4 h-4 bg-green-600 rounded-sm" />
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded-sm" />
    }
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <Card key={expense.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              {/* Información principal */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {expense.description}
                  </h3>
                  {getStatusBadge(expense.status || "pending")}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  {/* Importe */}
                  <div className="flex items-center gap-2">
                    <Euro className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">
                      {(expense.amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </span>
                  </div>

                  {/* Fecha */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      {new Date(expense.date).toLocaleDateString('es-ES')}
                    </span>
                  </div>

                  {/* Categoría */}
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      {expense.categories?.description || "Sin categoría"}
                    </span>
                  </div>

                  {/* Método de pago */}
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon(expense.payment_method || "")}
                    <span className="text-gray-600 capitalize">
                      {expense.payment_method || "No especificado"}
                    </span>
                  </div>
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* Subcategoría */}
                  {expense.subcategories?.description && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Subcategoría:</span>
                      <span className="text-gray-700">{expense.subcategories.description}</span>
                    </div>
                  )}

                  {/* Proveedor */}
                  {expense.vendor && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{expense.vendor}</span>
                    </div>
                  )}

                  {/* Reserva asociada */}
                  {expense.reservations && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">
                        {expense.reservations.guest ? 
                          `${expense.reservations.guest.first_name || ""} ${expense.reservations.guest.last_name || ""}`.trim() || "Huésped sin nombre" :
                          "Sin reserva asociada"
                        }
                      </span>
                    </div>
                  )}

                  {/* Notas */}
                  {expense.notes && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 mt-1">Notas:</span>
                      <span className="text-gray-700 text-sm">{expense.notes}</span>
                    </div>
                  )}
                </div>

                {/* Información de recurrencia */}
                {expense.is_recurring && (
                  <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-md">
                    <span>🔄 Recurrente</span>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCreateRecurrence(expense)}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  <span className="mr-1">🔄</span>
                  Recurrente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(expense)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(expense)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
