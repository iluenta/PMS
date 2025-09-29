import { useState, useEffect } from "react"
import { supabase, type Expense, type Property, type Reservation } from "@/lib/supabase"
import { getExpenseCategories, getExpenseSubcategories } from "@/lib/expenses"
import { type ExpenseCategory, type ExpenseSubcategory, type ExpenseWithJoins } from "@/types/expenses"
import { useProperty } from "@/contexts/PropertyContext"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

export function usePropertyExpensesData() {
  const { selectedProperty } = useProperty()
  const { user } = useAuth()
  const { toast } = useToast()
  
  // Estados principales de datos
  const [expenses, setExpenses] = useState<ExpenseWithJoins[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados para categorías y subcategorías
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [subcategories, setSubcategories] = useState<ExpenseSubcategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Función principal de fetch de datos
  const fetchData = async () => {
    if (!selectedProperty || !user?.tenant_id) return

    try {
      setLoading(true)
      

      // Primero probar query simple sin joins para diagnosticar
      console.log('Trying simple query first...')
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('property_id', selectedProperty.id)
        .eq('tenant_id', user.tenant_id)
        .order('date', { ascending: false })

      

      if (expensesError) {
        console.error('Error fetching expenses:')
        console.error('Error object:', expensesError)
        console.error('Error stringified:', JSON.stringify(expensesError, null, 2))
        console.error('Error code:', expensesError.code)
        console.error('Error message:', expensesError.message)
        console.error('Error details:', expensesError.details)
        throw expensesError
      }

      
      setExpenses(expensesData || [])

      // Fetch reservations
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select('*')
        .eq('property_id', selectedProperty.id)
        .eq('tenant_id', user.tenant_id)

      console.log('Reservations data:', reservationsData)

      if (reservationsError) {
        console.error('Error fetching reservations:', reservationsError)
      } else {
        setReservations(reservationsData as Reservation[] || [])
      }

    } catch (error) {
      console.error('Error in fetchData:', error)
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch de categorías y subcategorías
  useEffect(() => {
    const loadCategoriesAndSubcategories = async () => {
      try {
        setLoadingCategories(true)
        
        const [categoriesData, subcategoriesData] = await Promise.all([
          getExpenseCategories(),
          getExpenseSubcategories()
        ])
        
        setCategories(categoriesData)
        setSubcategories(subcategoriesData)
      } catch (error) {
        console.error('Error loading categories:', error)
        toast({
          title: "Error",
          description: "Error al cargar categorías",
          variant: "destructive",
        })
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategoriesAndSubcategories()
  }, [toast])

  // Fetch datos cuando cambia la propiedad seleccionada
  useEffect(() => {
    if (selectedProperty) {
      fetchData()
    }
  }, [selectedProperty])

  // CRUD Operations
  const createExpense = async (expenseData: Partial<Expense>) => {
    if (!selectedProperty?.id || !user?.tenant_id) return null

    try {
      // Convertir strings vacíos a null para campos UUID
      const newExpense = {
        ...expenseData,
        tenant_id: user.tenant_id,
        property_id: selectedProperty.id,
        category_id: expenseData.category_id || null,
        subcategory_id: expenseData.subcategory_id === "" || expenseData.subcategory_id === "none" ? null : expenseData.subcategory_id,
        reservation_id: expenseData.reservation_id === "" || expenseData.reservation_id === "none" ? null : expenseData.reservation_id,
        vendor_id: expenseData.vendor_id || null
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert([newExpense])
        .select()

      if (error) throw error

      await fetchData() // Recargar datos
      return data[0]
    } catch (error) {
      console.error('Error creating expense:', error)
      if (error instanceof Error) {
        console.error('Detailed error message:', error.message)
      }
      toast({
        title: "Error",
        description: "Error al crear el gasto",
        variant: "destructive",
      })
      return null
    }
  }

  const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
    try {
      // Convertir strings vacíos a null para campos UUID
      const updatedExpense = {
        ...expenseData,
        category_id: expenseData.category_id || null,
        subcategory_id: expenseData.subcategory_id === "" || expenseData.subcategory_id === "none" ? null : expenseData.subcategory_id,
        reservation_id: expenseData.reservation_id === "" || expenseData.reservation_id === "none" ? null : expenseData.reservation_id,
        vendor_id: expenseData.vendor_id || null
      }

      const { data, error } = await supabase
        .from('expenses')
        .update(updatedExpense)
        .eq('id', id)
        .select()

      if (error) throw error

      await fetchData() // Recargar datos
      return data[0]
    } catch (error) {
      console.error('Error updating expense:', error)
      toast({
        title: "Error",
        description: "Error al actualizar el gasto",
        variant: "destructive",
      })
      return null
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchData() // Recargar datos
      return true
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast({
        title: "Error",
        description: "Error al eliminar el gasto",
        variant: "destructive",
      })
      return false
    }
  }

  return {
    // Estados
    expenses,
    reservations,
    loading,
    categories,
    subcategories,
    loadingCategories,
    
    // Funciones
    fetchData,
    createExpense,
    updateExpense,
    deleteExpense,
  }
}
