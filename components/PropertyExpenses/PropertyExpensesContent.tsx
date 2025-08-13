'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Receipt } from "lucide-react"
import { usePropertyExpenses } from "./usePropertyExpenses"
import PropertyExpensesSummary from "./PropertyExpensesSummary"
import PropertyExpensesFilters from "./PropertyExpensesFilters"
import PropertyExpensesTable from "./PropertyExpensesTable"
import PropertyExpensesForm from "./PropertyExpensesForm"
import { CreateRecurrenceModal } from "./CreateRecurrenceModal"
import type { Expense } from "@/lib/supabase"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

export function PropertyExpensesContent() {
  const {
    // Estados
    expenses,
    loading,
    isDialogOpen,
    editingExpense,
    isDeleteDialogOpen,
    expenseToDelete,
    summary,
    formData,
    categories,
    subcategories,
    reservations,
    documents,
    uploading,
    
    // Filtros
    searchTerm,
    statusFilter,
    categoryFilter,
    subcategoryFilter,
    dateRangeFilter,
    sortFilter,
    filteredSubcategoriesForFilter,
    loadingCategories,
    
    // Setters
    setIsDialogOpen,
    setEditingExpense,
    setIsDeleteDialogOpen,
    setExpenseToDelete,
    setFormData,
    setSearchTerm,
    setStatusFilter,
    setCategoryFilter,
    setSubcategoryFilter,
    setDateRangeFilter,
    setSortFilter,
    
    // Funciones
    handleCreateExpense,
    handleEditExpense,
    handleDeleteExpense,
    confirmDelete,
    handleSubmit,
    handleUpload,
    handleDownload,
    handleDeleteDocument,
    formatGuestName,
    createRecurringExpenses,
  } = usePropertyExpenses()

  const [isRecurrenceModalOpen, setIsRecurrenceModalOpen] = useState(false)
  const [selectedExpenseForRecurrence, setSelectedExpenseForRecurrence] = useState<Expense | null>(null)

  const handleCreateRecurrence = (expense: Expense) => {
    setSelectedExpenseForRecurrence(expense)
    setIsRecurrenceModalOpen(true)
  }

  const handleRecurrenceCreated = async (recurrenceData: any) => {
    if (!selectedExpenseForRecurrence) return
    
    try {
      await createRecurringExpenses(selectedExpenseForRecurrence, recurrenceData)
      setIsRecurrenceModalOpen(false)
      setSelectedExpenseForRecurrence(null)
    } catch (error) {
      console.error('Error en handleRecurrenceCreated:', error)
      // El error ya se maneja en createRecurringExpenses
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gastos de la Propiedad</h1>
          <p className="text-gray-600">Gestiona todos los gastos asociados a esta propiedad</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleCreateExpense} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Gasto
          </Button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <PropertyExpensesSummary summary={summary} />

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Filtros y Búsqueda
          </CardTitle>
          <CardDescription>
            Filtra y busca gastos por diferentes criterios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PropertyExpensesFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            subcategoryFilter={subcategoryFilter}
            setSubcategoryFilter={setSubcategoryFilter}
            dateRangeFilter={dateRangeFilter}
            setDateRangeFilter={setDateRangeFilter}
            sortFilter={sortFilter}
            setSortFilter={setSortFilter}
            categories={categories}
            subcategories={subcategories}
            filteredSubcategoriesForFilter={filteredSubcategoriesForFilter}
            loadingCategories={loadingCategories}
          />
        </CardContent>
      </Card>

      {/* Tabla de gastos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Gastos</CardTitle>
          <CardDescription>
            {expenses.length} gastos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PropertyExpensesTable
            expenses={expenses}
            loading={loading}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
            onCreateRecurrence={handleCreateRecurrence}
          />
        </CardContent>
      </Card>

      {/* Modal de formulario */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? "Editar Gasto" : "Nuevo Gasto"}
            </DialogTitle>
            <DialogDescription>
              {editingExpense 
                ? "Modifica la información del gasto seleccionado" 
                : "Completa la información para crear un nuevo gasto"
              }
            </DialogDescription>
          </DialogHeader>
          <PropertyExpensesForm
            expense={editingExpense}
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            subcategories={subcategories}
            reservations={reservations}
            documents={documents}
            uploading={uploading}
            onSubmit={handleSubmit}
            onClose={() => setIsDialogOpen(false)}
            onUpload={(e) => editingExpense?.id && handleUpload(e, editingExpense.id)}
            onDownload={handleDownload}
            onDeleteDocument={handleDeleteDocument}
            formatGuestName={formatGuestName}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación de eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el gasto
              "{expenseToDelete?.description}" y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de recurrencia */}
      <CreateRecurrenceModal
        isOpen={isRecurrenceModalOpen}
        onClose={() => setIsRecurrenceModalOpen(false)}
        expense={selectedExpenseForRecurrence}
        onCreateRecurrence={handleRecurrenceCreated}
      />

    </div>
  )
}
