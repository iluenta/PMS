// Hook orquestador principal refactorizado
import { 
  usePropertyExpensesData,
  usePropertyExpensesFilters,
  usePropertyExpensesModal,
  usePropertyExpensesDocuments,
  useRecurringExpenses
} from "./hooks"
import { type Expense } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export function usePropertyExpenses() {
  const { toast } = useToast()
  
  // Hook de datos principales
  const data = usePropertyExpensesData()
  
  // Hook de filtros (depende de los datos)
  const filters = usePropertyExpensesFilters({
    expenses: data.expenses,
    categories: data.categories,
    subcategories: data.subcategories
  })
  
  // Hooks independientes
  const modal = usePropertyExpensesModal()
  const documents = usePropertyExpensesDocuments()
  const recurring = useRecurringExpenses()

  // Funciones que combinan múltiples hooks
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!modal.formData.description) {
      toast({ title: "Error", description: "La descripción es obligatoria", variant: "destructive" })
      return
    }
    
    if (!modal.formData.amount || modal.formData.amount <= 0) {
      toast({ title: "Error", description: "El importe debe ser mayor que 0", variant: "destructive" })
      return
    }
    
    if (!modal.formData.date) {
      toast({ title: "Error", description: "La fecha es obligatoria", variant: "destructive" })
      return
    }
    
    if (!modal.formData.category) {
      toast({ title: "Error", description: "La categoría es obligatoria", variant: "destructive" })
      return
    }
    
    if (!modal.formData.vendor) {
      toast({ title: "Error", description: "El proveedor es obligatorio", variant: "destructive" })
      return
    }

    try {
      // Preparar datos del gasto
      const expenseData: Partial<Expense> = {
        description: modal.formData.description,
        amount: modal.formData.amount,
        date: modal.formData.date,
        category_id: modal.formData.category,
        subcategory_id: modal.formData.subcategory === "none" ? undefined : modal.formData.subcategory,
        payment_method: modal.formData.payment_method,
        status: modal.formData.status,
        notes: modal.formData.notes,
        reservation_id: modal.formData.reservation_id === "none" ? undefined : modal.formData.reservation_id,
        vendor: modal.formData.vendor,
        vendor_id: modal.formData.vendor_id || undefined,
        is_recurring: modal.formData.is_recurring
      }

      let result
      if (modal.editingExpense) {
        // Actualizar gasto existente
        result = await data.updateExpense(modal.editingExpense.id, expenseData)
      } else {
        // Crear nuevo gasto
        result = await data.createExpense(expenseData)
      }

      if (result) {
        toast({
          title: "Éxito",
          description: modal.editingExpense ? "Gasto actualizado correctamente" : "Gasto creado correctamente"
        })
        modal.resetModalState()
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      toast({
        title: "Error",
        description: "Error al procesar el gasto",
        variant: "destructive"
      })
    }
  }

  const confirmDelete = async () => {
    if (!modal.expenseToDelete) return

    const success = await data.deleteExpense(modal.expenseToDelete.id)
    if (success) {
      toast({
        title: "Éxito",
        description: "Gasto eliminado correctamente"
      })
      modal.resetModalState()
    }
  }

  // Combinar todas las APIs de los hooks especializados
  return {
    // Estados principales de data
    expenses: filters.filteredExpenses, // Usar los filtrados
    reservations: data.reservations,
    loading: data.loading,
    categories: data.categories,
    subcategories: data.subcategories,
    loadingCategories: data.loadingCategories,
    
    // Estados de filtros
    searchTerm: filters.searchTerm,
    statusFilter: filters.statusFilter,
    categoryFilter: filters.categoryFilter,
    subcategoryFilter: filters.subcategoryFilter,
    dateRangeFilter: filters.dateRangeFilter,
    yearFilter: filters.yearFilter,
    sortFilter: filters.sortFilter,
    filteredSubcategoriesForFilter: filters.filteredSubcategoriesForFilter,
    availableYears: filters.availableYears,
    summary: filters.summary,
    
    // Estados de modal
    isDialogOpen: modal.isDialogOpen,
    editingExpense: modal.editingExpense,
    isDeleteDialogOpen: modal.isDeleteDialogOpen,
    expenseToDelete: modal.expenseToDelete,
    activeTab: modal.activeTab,
    formData: modal.formData,
    
    // Estados de documentos
    documents: documents.documents,
    uploading: documents.uploading,
    
    // Setters de filtros
    setSearchTerm: filters.setSearchTerm,
    setStatusFilter: filters.setStatusFilter,
    setCategoryFilter: filters.setCategoryFilter,
    setSubcategoryFilter: filters.setSubcategoryFilter,
    setDateRangeFilter: filters.setDateRangeFilter,
    setSortFilter: filters.setSortFilter,
    setYearFilter: filters.setYearFilter,
    
    // Setters de modal
    setIsDialogOpen: modal.setIsDialogOpen,
    setEditingExpense: modal.setEditingExpense,
    setIsDeleteDialogOpen: modal.setIsDeleteDialogOpen,
    setExpenseToDelete: modal.setExpenseToDelete,
    setActiveTab: modal.setActiveTab,
    setFormData: modal.setFormData,
    
    // Funciones de modal
    handleCreateExpense: modal.handleCreateExpense,
    handleEditExpense: modal.handleEditExpense,
    handleDeleteExpense: modal.handleDeleteExpense,
    formatGuestName: modal.formatGuestName,
    
    // Funciones de documentos
    loadDocuments: documents.loadDocuments,
    handleUpload: documents.handleUpload,
    handleDownload: documents.handleDownload,
    handleDeleteDocument: documents.handleDeleteDocument,
    
    // Funciones de recurrencia
    createRecurringExpenses: recurring.createRecurringExpenses,
    
    // Funciones combinadas
    handleSubmit,
    confirmDelete,
  }
}
