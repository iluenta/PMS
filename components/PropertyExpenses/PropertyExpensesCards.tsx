import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Receipt, Building2, Calendar, Euro, RefreshCw } from "lucide-react"
import type { Expense } from "@/lib/supabase"

// Tipo extendido para gastos con joins - debe coincidir exactamente con usePropertyExpensesData
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

interface PropertyExpensesCardsProps {
  expenses: ExpenseWithJoins[]
  loading: boolean
  onEdit: (expense: ExpenseWithJoins) => void
  onDelete: (expense: ExpenseWithJoins) => void
  onCreateRecurrence: (expense: ExpenseWithJoins) => void
}

export default function PropertyExpensesCards({ 
  expenses, 
  loading, 
  onEdit, 
  onDelete,
  onCreateRecurrence
}: PropertyExpensesCardsProps) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const formatAmount = (amount: number) => {
    return `€${amount.toLocaleString('es-ES', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {expenses.map((expense) => (
        <Card key={expense.id} className="p-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col space-y-4">
            {/* Header con título y estado */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Receipt className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {expense.description}
                  </h3>
                  {expense.is_recurring && (
                    <div className="flex items-center gap-1 mt-1">
                      <RefreshCw className="h-3 w-3 text-blue-500" />
                      <span className="text-xs text-blue-600 font-medium">Recurrente</span>
                    </div>
                  )}
                </div>
              </div>
              {getStatusBadge(expense.status || "pending")}
            </div>

            {/* Importe principal */}
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-lg font-semibold text-gray-900">
                  {formatAmount(expense.amount)}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {expense.vendor && (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      <span>{expense.vendor}</span>
                    </div>
                  )}
                  {expense.payment_method && (
                    <div className="flex items-center gap-1">
                      {getPaymentMethodIcon(expense.payment_method)}
                      <span className="capitalize">{expense.payment_method}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="space-y-2">
              {/* Fecha */}
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(expense.date)}</span>
              </div>

              {/* Categoría */}
              {expense.category && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span>{expense.category}</span>
                </div>
              )}

              {/* Subcategoría */}
              {expense.subcategory && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>{expense.subcategory}</span>
                </div>
              )}

              {/* Notas */}
              {expense.notes && (
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {expense.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-2 pt-2 border-t">
              {/* Botón Recurrente */}
              {expense.is_recurring && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCreateRecurrence(expense)}
                  className="h-8 px-2 text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
              
              {/* Botón Editar */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(expense)}
                className="h-8 px-2"
              >
                <Edit className="h-3 w-3" />
              </Button>
              
              {/* Botón Eliminar */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(expense)}
                className="h-8 px-2 text-red-600 border-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
