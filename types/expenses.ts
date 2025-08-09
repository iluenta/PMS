// Tipos para categorías de gastos
export interface ExpenseCategory {
  id: string
  description: string
  created_at: string
  updated_at: string
}

// Tipos para subcategorías de gastos
export interface ExpenseSubcategory {
  id: string
  category_id: string
  description: string
  created_at: string
  updated_at: string
}

// Tipos para mostrar subcategorías con información de la categoría
export interface ExpenseSubcategoryWithCategory extends ExpenseSubcategory {
  category?: ExpenseCategory
}

// DTOs para operaciones CRUD
export interface CreateExpenseCategoryData {
  description: string
}

export interface UpdateExpenseCategoryData {
  description: string
}

export interface CreateExpenseSubcategoryData {
  category_id: string
  description: string
}

export interface UpdateExpenseSubcategoryData {
  category_id?: string
  description: string
}
