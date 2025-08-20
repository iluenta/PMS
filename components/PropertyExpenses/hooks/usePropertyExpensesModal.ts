import { useState } from "react"
import { type Expense } from "@/lib/supabase"

export function usePropertyExpensesModal() {
  // Estados de modales y UI
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    description: "",
    amount: 0,
    date: "",
    category: "",
    subcategory: "",
    payment_method: "",
    status: "pending",
    notes: "",
    reservation_id: "",
    vendor: "",
    vendor_id: "",
    is_recurring: false
  })

  // Función auxiliar para formatear el nombre del huésped
  const formatGuestName = (reservation: any): string => {
    if (!reservation) return "Sin información"
    
    // Si tiene person_id, intentar obtener el nombre de la tabla people
    if (reservation.person_id) {
      // Por ahora, usamos el guest JSONB como fallback
      // TODO: Implementar join con tabla people cuando esté disponible
    }
    
    // Intentar obtener el nombre del guest JSONB
    if (reservation.guest) {
      const guest = reservation.guest
      
      // Diferentes posibles estructuras del JSONB guest
      if (guest.name) {
        return guest.name
      }
      
      if (guest.first_name || guest.last_name) {
        const firstName = guest.first_name || ""
        const lastName = guest.last_name || ""
        return `${firstName} ${lastName}`.trim()
      }
      
      if (guest.full_name) {
        return guest.full_name
      }
      
      // Si es un string directo
      if (typeof guest === 'string') {
        return guest
      }
    }
    
    return "Huésped sin nombre"
  }

  // Función para abrir modal de creación
  const handleCreateExpense = () => {
    setEditingExpense(null)
    setFormData({
      description: "",
      amount: 0,
      date: "",
      category: "",
      subcategory: "",
      payment_method: "",
      status: "pending",
      notes: "",
      reservation_id: "",
      vendor: "",
      vendor_id: "",
      is_recurring: false
    })
    setIsDialogOpen(true)
  }

  // Función para abrir modal de edición
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    
    // Llenar el formulario con los datos del gasto
    setFormData({
      description: expense.description || "",
      amount: expense.amount || 0,
      date: expense.date || "",
      category: expense.category_id || "",
      subcategory: expense.subcategory_id || "none",
      payment_method: expense.payment_method || "",
      status: expense.status || "pending",
      notes: expense.notes || "",
      reservation_id: expense.reservation_id || "none",
      vendor: expense.vendor || "",
      vendor_id: expense.vendor_id || "",
      is_recurring: expense.is_recurring || false
    })
    
    setIsDialogOpen(true)
  }

  // Función para abrir diálogo de eliminación
  const handleDeleteExpense = (expense: Expense) => {
    setExpenseToDelete(expense)
    setIsDeleteDialogOpen(true)
  }

  // Función para resetear estados al cerrar modales
  const resetModalState = () => {
    setIsDialogOpen(false)
    setEditingExpense(null)
    setIsDeleteDialogOpen(false)
    setExpenseToDelete(null)
    setFormData({
      description: "",
      amount: 0,
      date: "",
      category: "",
      subcategory: "",
      payment_method: "",
      status: "pending",
      notes: "",
      reservation_id: "",
      vendor: "",
      vendor_id: "",
      is_recurring: false
    })
  }

  return {
    // Estados de modales
    isDialogOpen,
    editingExpense,
    isDeleteDialogOpen,
    expenseToDelete,
    activeTab,
    formData,
    
    // Setters
    setIsDialogOpen,
    setEditingExpense,
    setIsDeleteDialogOpen,
    setExpenseToDelete,
    setActiveTab,
    setFormData,
    
    // Funciones
    handleCreateExpense,
    handleEditExpense,
    handleDeleteExpense,
    formatGuestName,
    resetModalState,
  }
}








