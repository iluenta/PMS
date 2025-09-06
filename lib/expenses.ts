import { supabase } from "./supabase"
import type { 
  ExpenseCategory, 
  ExpenseSubcategory, 
  ExpenseSubcategoryWithCategory,
  CreateExpenseCategoryData,
  UpdateExpenseCategoryData,
  CreateExpenseSubcategoryData,
  UpdateExpenseSubcategoryData
} from "@/types/expenses"

// ============================================================================
// Categorías de Gastos
// ============================================================================

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // Mock data
    return [
      {
        id: "1",
        description: "Mantenimiento",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      },
      {
        id: "2", 
        description: "Servicios",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      },
      {
        id: "3",
        description: "Suministros",
        created_at: "2024-01-01T00:00:00Z", 
        updated_at: "2024-01-01T00:00:00Z"
      },
      {
        id: "4",
        description: "Marketing",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      },
      {
        id: "5",
        description: "Seguros",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      },
      {
        id: "6",
        description: "Impuestos",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      },
      {
        id: "7",
        description: "Otros",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      }
    ]
  }

  const { data, error } = await supabase
    .from("expense_categories")
    .select("*")
    .order("description")

  if (error) {
    console.error("Error fetching expense categories:", error)
    throw error
  }

  return data || []
}

export async function createExpenseCategory(categoryData: CreateExpenseCategoryData): Promise<ExpenseCategory> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // Mock creation
    const newCategory: ExpenseCategory = {
      id: Math.random().toString(36).substr(2, 9),
      description: categoryData.description || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    return newCategory
  }

  const { data, error } = await supabase
    .from("expense_categories")
    .insert([categoryData])
    .select()
    .single()

  if (error) {
    console.error("Error creating expense category:", error)
    throw error
  }

  return data
}

export async function updateExpenseCategory(id: string, categoryData: UpdateExpenseCategoryData): Promise<ExpenseCategory> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // Mock update
    return {
      id,
      description: categoryData.description || "",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: new Date().toISOString()
    }
  }

  const { data, error } = await supabase
    .from("expense_categories")
    .update(categoryData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating expense category:", error)
    throw error
  }

  return data
}

export async function deleteExpenseCategory(id: string): Promise<void> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // Mock deletion
    return
  }

  const { error } = await supabase
    .from("expense_categories")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting expense category:", error)
    throw error
  }
}

// ============================================================================
// Subcategorías de Gastos
// ============================================================================

export async function getExpenseSubcategories(): Promise<ExpenseSubcategoryWithCategory[]> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // Mock data
    return [
      {
        id: "1",
        category_id: "1",
        description: "Fontanería",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        category: {
          id: "1",
          description: "Mantenimiento",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
        }
      },
      {
        id: "2",
        category_id: "1", 
        description: "Electricidad",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        category: {
          id: "1",
          description: "Mantenimiento",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
        }
      },
      {
        id: "3",
        category_id: "2",
        description: "Limpieza",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        category: {
          id: "2",
          description: "Servicios",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z"
        }
      }
    ]
  }

  const { data, error } = await supabase
    .from("expense_subcategories")
    .select(`
      *,
      category:expense_categories(*)
    `)
    .order("description")

  if (error) {
    console.error("Error fetching expense subcategories:", error)
    throw error
  }

  return data || []
}

export async function getExpenseSubcategoriesByCategory(categoryId: string): Promise<ExpenseSubcategory[]> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // Mock data filtered by category
    const mockSubcategories = [
      {
        id: "1",
        category_id: "1",
        description: "Fontanería",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      },
      {
        id: "2",
        category_id: "1",
        description: "Electricidad", 
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      }
    ]
    return mockSubcategories.filter(sub => sub.category_id === categoryId)
  }

  const { data, error } = await supabase
    .from("expense_subcategories")
    .select("*")
    .eq("category_id", categoryId)
    .order("description")

  if (error) {
    console.error("Error fetching expense subcategories by category:", error)
    throw error
  }

  return data || []
}

export async function createExpenseSubcategory(subcategoryData: CreateExpenseSubcategoryData): Promise<ExpenseSubcategory> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // Mock creation
    const newSubcategory: ExpenseSubcategory = {
      id: Math.random().toString(36).substr(2, 9),
      category_id: subcategoryData.category_id,
      description: subcategoryData.description || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    return newSubcategory
  }

  const { data, error } = await supabase
    .from("expense_subcategories")
    .insert([subcategoryData])
    .select()
    .single()

  if (error) {
    console.error("Error creating expense subcategory:", error)
    throw error
  }

  return data
}

export async function updateExpenseSubcategory(id: string, subcategoryData: UpdateExpenseSubcategoryData): Promise<ExpenseSubcategory> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // Mock update
    return {
      id,
      category_id: subcategoryData.category_id || "1",
      description: subcategoryData.description || "",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: new Date().toISOString()
    }
  }

  const { data, error } = await supabase
    .from("expense_subcategories")
    .update(subcategoryData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating expense subcategory:", error)
    throw error
  }

  return data
}

export async function deleteExpenseSubcategory(id: string): Promise<void> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // Mock deletion
    return
  }

  const { error } = await supabase
    .from("expense_subcategories")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting expense subcategory:", error)
    throw error
  }
}
