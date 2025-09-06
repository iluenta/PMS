// Tipos para gastos de propiedades

import type { Expense, Reservation } from '@/lib/supabase'

// Tipo base para gastos con joins (sin campos adicionales requeridos)
export interface ExpenseWithJoins extends Expense {
  categories?: { description: string }
  subcategories?: { description: string }
  reservations?: {
    id: string
    guest: any
    check_in: string
    check_out: string
    property_id: string
  }
  people?: { name: string }
}

// Tipo específico para datos de la base de datos (con campos adicionales)
export interface ExpenseWithJoinsFromDB extends ExpenseWithJoins {
  created_at: string
  updated_at: string
}

// Tipos para categorías de gastos
export interface ExpenseCategory {
  id: string
  description: string
  created_at: string
  updated_at: string
}

export interface ExpenseSubcategory {
  id: string
  category_id: string
  description: string
  created_at: string
  updated_at: string
}

export interface ExpenseSubcategoryWithCategory extends ExpenseSubcategory {
  category: ExpenseCategory
}

export interface CreateExpenseCategoryData {
  description: string
}

export interface UpdateExpenseCategoryData {
  description?: string
}

export interface CreateExpenseSubcategoryData {
  category_id: string
  description: string
}

export interface UpdateExpenseSubcategoryData {
  category_id?: string
  description?: string
}

// Re-exportar tipos desde supabase para compatibilidad
export type { Expense, Reservation } from '@/lib/supabase'