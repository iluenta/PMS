import { useState, useEffect, useMemo } from "react"
import { type ExpenseCategory, type ExpenseSubcategory } from "@/types/expenses"

// Tipo extendido para gastos con joins
interface ExpenseWithJoins {
  id: string
  description: string
  amount: number
  date: string
  status: string
  categories?: { description: string }
  subcategories?: { description: string }
  reservations?: {
    id: string
    guest: any
    check_in: string
    check_out: string
    property_id: string
  }
  [key: string]: any
}

interface FilterOptions {
  expenses: ExpenseWithJoins[]
  categories: ExpenseCategory[]
  subcategories: ExpenseSubcategory[]
}

export function usePropertyExpensesFilters({ expenses, categories, subcategories }: FilterOptions) {
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>("all")
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all")
  const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString())
  const [sortFilter, setSortFilter] = useState<string>("date_desc")

  // Reset subcategory filter cuando cambia category
  useEffect(() => {
    setSubcategoryFilter("all")
  }, [categoryFilter])

  // Función para obtener años disponibles basados en datos existentes
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years = new Set<number>()
    
    // Años disponibles basados en los gastos existentes
    expenses.forEach(expense => {
      if (expense.date) {
        years.add(new Date(expense.date).getFullYear())
      }
    })
    
    // Siempre incluir el año actual
    years.add(currentYear)
    
    // Ordenar de más reciente a más antiguo
    return Array.from(years).sort((a, b) => b - a)
  }, [expenses])

  // Función para verificar si una fecha está en el año seleccionado
  const isDateInYear = (date: string, year: string) => {
    if (year === "all") return true
    const dateYear = new Date(date).getFullYear().toString()
    return dateYear === year
  }

  // Subcategorías filtradas para el filtro
  const filteredSubcategoriesForFilter = useMemo(() => {
    if (categoryFilter === "all") return subcategories
    return subcategories.filter(sub => sub.category_id === categoryFilter)
  }, [subcategories, categoryFilter])

  // Aplicar filtros y ordenación
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses]

    // Filtro por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(expense => 
        expense.description.toLowerCase().includes(term) ||
        expense.vendor?.toLowerCase().includes(term) ||
        expense.categories?.description.toLowerCase().includes(term) ||
        expense.subcategories?.description.toLowerCase().includes(term)
      )
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(expense => expense.status === statusFilter)
    }

    // Filtro por categoría
    if (categoryFilter !== "all") {
      filtered = filtered.filter(expense => expense.category_id === categoryFilter)
    }

    // Filtro por subcategoría
    if (subcategoryFilter !== "all") {
      filtered = filtered.filter(expense => expense.subcategory_id === subcategoryFilter)
    }

    // Filtro por rango de fechas
    if (dateRangeFilter !== "all") {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      switch (dateRangeFilter) {
        case "today":
          filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date)
            return expenseDate >= startOfDay
          })
          break
        case "week":
          const weekAgo = new Date(startOfDay)
          weekAgo.setDate(weekAgo.getDate() - 7)
          filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date)
            return expenseDate >= weekAgo
          })
          break
        case "month":
          const monthAgo = new Date(startOfDay)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date)
            return expenseDate >= monthAgo
          })
          break
        case "year":
          const yearAgo = new Date(startOfDay)
          yearAgo.setFullYear(yearAgo.getFullYear() - 1)
          filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date)
            return expenseDate >= yearAgo
          })
          break
      }
    }

    // Filtro por año (basado en la fecha del gasto)
    if (yearFilter !== "all") {
      filtered = filtered.filter(expense => isDateInYear(expense.date, yearFilter))
    }

    // Ordenación
    switch (sortFilter) {
      case "date_asc":
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        break
      case "date_desc":
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case "amount_asc":
        filtered.sort((a, b) => a.amount - b.amount)
        break
      case "amount_desc":
        filtered.sort((a, b) => b.amount - a.amount)
        break
      case "description_asc":
        filtered.sort((a, b) => a.description.localeCompare(b.description))
        break
      case "description_desc":
        filtered.sort((a, b) => b.description.localeCompare(a.description))
        break
      default:
        // date_desc por defecto
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }

    return filtered
  }, [expenses, searchTerm, statusFilter, categoryFilter, subcategoryFilter, dateRangeFilter, yearFilter, sortFilter])

  // Resumen calculado
  const summary = useMemo(() => {
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const pending = filteredExpenses.filter(e => e.status === 'pending').reduce((sum, expense) => sum + expense.amount, 0)
    const completed = filteredExpenses.filter(e => e.status === 'completed').reduce((sum, expense) => sum + expense.amount, 0)
    const cancelled = filteredExpenses.filter(e => e.status === 'cancelled').reduce((sum, expense) => sum + expense.amount, 0)
    
    return { total, pending, completed, cancelled, count: filteredExpenses.length }
  }, [filteredExpenses])

  return {
    // Estados de filtros
    searchTerm,
    statusFilter,
    categoryFilter,
    subcategoryFilter,
    dateRangeFilter,
    yearFilter,
    sortFilter,
    
    // Setters de filtros
    setSearchTerm,
    setStatusFilter,
    setCategoryFilter,
    setSubcategoryFilter,
    setDateRangeFilter,
    setYearFilter,
    setSortFilter,
    
    // Datos calculados
    filteredExpenses,
    filteredSubcategoriesForFilter,
    availableYears,
    summary,
  }
}








