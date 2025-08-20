import { useState, useEffect, useMemo } from "react"
import { supabase, type Expense, type Property, type Reservation } from "@/lib/supabase"
import { getExpenseCategories, getExpenseSubcategories } from "@/lib/expenses"
import { type ExpenseCategory, type ExpenseSubcategory } from "@/types/expenses"
import { useProperty } from "@/contexts/PropertyContext"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { listExpenseDocuments, uploadExpenseDocument, getSignedDocumentUrl, deleteExpenseDocument } from "@/lib/documents"
import type { DocumentMeta } from "@/types/documents"

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

export function usePropertyExpenses() {
  const { selectedProperty, properties } = useProperty()
  const { user } = useAuth()
  const { toast } = useToast()
  
  // Estados principales
  const [expenses, setExpenses] = useState<ExpenseWithJoins[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>("all")
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all")
  const [sortFilter, setSortFilter] = useState<string>("date_desc")

  // Estados para categorías y subcategorías desde la base de datos
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [subcategories, setSubcategories] = useState<ExpenseSubcategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  // Estados del formulario
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
    is_recurring: false,
  })

  // Estados para documentos
  const [documents, setDocuments] = useState<DocumentMeta[]>([])
  const [uploading, setUploading] = useState(false)

  // Cargar datos cuando cambia la propiedad seleccionada
  useEffect(() => {
    if (selectedProperty) {
      fetchData()
    }
  }, [selectedProperty])

  // Cargar categorías y subcategorías para los filtros del listado
  useEffect(() => {
    const loadCategoriesAndSubcategories = async () => {
      try {
        setLoadingCategories(true)
        const [cats, subs] = await Promise.all([
          getExpenseCategories(),
          getExpenseSubcategories(),
        ])
        setCategories(cats)
        setSubcategories(subs)
      } catch (error) {
        console.error("Error loading categories/subcategories:", error)
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategoriesAndSubcategories()
  }, [])

  // Al cambiar la categoría del filtro, resetear subcategoría
  useEffect(() => {
    setSubcategoryFilter("all")
  }, [categoryFilter])

  // Subcategorías visibles en el filtro según categoría seleccionada
  const filteredSubcategoriesForFilter = useMemo(() => {
    if (categoryFilter === "all") return subcategories
    return subcategories.filter(sub => sub.category_id === categoryFilter)
  }, [categoryFilter, subcategories])

  const fetchData = async () => {
    if (!selectedProperty) return
    
    try {
      setLoading(true)

             // Obtener gastos - consulta simple primero para diagnosticar
       console.log("Fetching expenses for property:", selectedProperty.id)
       console.log("Selected property:", selectedProperty)
       
               const { data: expensesData, error: expensesError } = await supabase
          .from("expenses")
          .select(`
            *,
            categories:expense_categories(description),
            subcategories:expense_subcategories(description)
          `)
          .eq("property_id", selectedProperty.id)
          .order("date", { ascending: false })

      console.log("Raw expenses query result:", { data: expensesData, error: expensesError })

      if (expensesError) {
        console.error("Error fetching expenses:", expensesError)
        throw expensesError
      }

      console.log("Expenses data:", expensesData)

      // Obtener reservas para el selector
      const { data: reservationsData, error: reservationsError } = await supabase
        .from("reservations")
        .select("id, guest, check_in, check_out, property_id, person_id")
        .eq("property_id", selectedProperty.id)
        .order("check_in", { ascending: false })

      if (reservationsError) {
        console.error("Error fetching reservations:", reservationsError)
        throw reservationsError
      }

      console.log("Reservations data:", reservationsData)

      setExpenses(expensesData || [])
      setReservations((reservationsData as Reservation[]) || [])
         } catch (error) {
       console.error("Error fetching data:", error)
       console.error("Error details:", {
         message: error instanceof Error ? error.message : 'Unknown error',
         stack: error instanceof Error ? error.stack : undefined,
         error: error
       })
       
       // Mostrar mensaje de error más específico
       let errorMessage = "No se pudieron cargar los datos"
       if (error instanceof Error && error.message) {
         errorMessage = error.message
       } else if (typeof error === 'object' && error !== null) {
         const errorObj = error as any
         if (errorObj.message) errorMessage = errorObj.message
         else if (errorObj.error_description) errorMessage = errorObj.error_description
         else if (errorObj.details) errorMessage = errorObj.details
       }
       
       toast({
         title: "Error",
         description: errorMessage,
         variant: "destructive",
       })
     } finally {
       setLoading(false)
     }
  }

  // Gastos filtrados y ordenados
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses]

    // Filtro de búsqueda
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((expense) => {
        const description = expense.description?.toLowerCase() || ""
        const notes = expense.notes?.toLowerCase() || ""
        const vendor = expense.vendor?.toLowerCase() || ""
        const category = expense.categories?.description?.toLowerCase() || ""
        const subcategory = expense.subcategories?.description?.toLowerCase() || ""
        
        return description.includes(search) || 
               notes.includes(search) || 
               vendor.includes(search) || 
               category.includes(search) || 
               subcategory.includes(search)
      })
    }

    // Filtro de estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((expense) => expense.status === statusFilter)
    }

           // Filtro de categoría
       if (categoryFilter !== "all") {
         filtered = filtered.filter((expense) => expense.category_id === categoryFilter)
       }

       // Filtro de subcategoría
       if (subcategoryFilter !== "all") {
         filtered = filtered.filter((expense) => expense.subcategory_id === subcategoryFilter)
       }

    // Filtro de rango de fechas
    if (dateRangeFilter !== "all") {
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      
             filtered = filtered.filter((expense) => {
         const expenseDate = new Date(expense.date)
        switch (dateRangeFilter) {
          case "today":
            return expenseDate.toDateString() === today.toDateString()
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return expenseDate >= weekAgo
          case "month":
            return expenseDate >= startOfMonth && expenseDate <= endOfMonth
          case "quarter":
            const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1)
            return expenseDate >= quarterStart
          case "year":
            const yearStart = new Date(today.getFullYear(), 0, 1)
            return expenseDate >= yearStart
          default:
            return true
        }
      })
    }

    // Ordenamiento
         switch (sortFilter) {
       case "date_desc":
         filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
         break
       case "date_asc":
         filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
         break
      case "amount_desc":
        filtered.sort((a, b) => (b.amount || 0) - (a.amount || 0))
        break
      case "amount_asc":
        filtered.sort((a, b) => (a.amount || 0) - (b.amount || 0))
        break
      case "description_asc":
        filtered.sort((a, b) => (a.description || "").localeCompare(b.description || ""))
        break
      case "description_desc":
        filtered.sort((a, b) => (b.description || "").localeCompare(a.description || ""))
        break
    }

    return filtered
  }, [expenses, searchTerm, statusFilter, categoryFilter, subcategoryFilter, dateRangeFilter, sortFilter])

  // Cálculos de resumen
  const summary = useMemo(() => {
    const total = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0)
    const pending = filteredExpenses
      .filter(expense => expense.status === "pending")
      .reduce((sum, expense) => sum + (expense.amount || 0), 0)
    const completed = filteredExpenses
      .filter(expense => expense.status === "completed")
      .reduce((sum, expense) => sum + (expense.amount || 0), 0)
    const cancelled = filteredExpenses
      .filter(expense => expense.status === "cancelled")
      .reduce((sum, expense) => sum + (expense.amount || 0), 0)

    return { total, pending, completed, cancelled, count: filteredExpenses.length }
  }, [filteredExpenses])

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
      
      // Si no hay nombre, usar email o teléfono como identificador
      if (guest.email) {
        return `Huésped (${guest.email})`
      }
      
      if (guest.phone) {
        return `Huésped (${guest.phone})`
      }
    }
    
    return "Huésped sin nombre"
  }

  // Funciones de manejo
  const handleCreateExpense = () => {
    setEditingExpense(null)
    setFormData({
      description: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      category: "",
      subcategory: "",
      payment_method: "",
      status: "pending",
      notes: "",
      reservation_id: "",
      vendor: "",
      vendor_id: "",
      is_recurring: false,
    })
    setIsDialogOpen(true)
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    
    // Buscar la reserva asociada
    const reservation = reservations.find(r => r.id === expense.reservation_id)
    let guestName = ""
    let guestEmail = ""
    let guestPhone = ""
    
    if (reservation?.guest) {
      const guest = reservation.guest
      guestName = `${guest.first_name || ""} ${guest.last_name || ""}`.trim()
      guestEmail = guest.email || ""
      guestPhone = guest.phone || ""
    }

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
      is_recurring: expense.is_recurring || false,
    })

    // Cargar documentos si existe
    if (expense.id) {
      loadDocuments(expense.id)
    }

    setIsDialogOpen(true)
  }

  const handleDeleteExpense = (expense: Expense) => {
    setExpenseToDelete(expense)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!expenseToDelete) return

    try {
             const { error } = await supabase
         .from("expenses")
         .delete()
         .eq("id", expenseToDelete.id)

      if (error) throw error

      toast({
        title: "Gasto eliminado",
        description: "El gasto se ha eliminado correctamente",
      })

      setExpenses(prev => prev.filter(e => e.id !== expenseToDelete.id))
      setIsDeleteDialogOpen(false)
      setExpenseToDelete(null)
    } catch (error) {
      console.error("Error deleting expense:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el gasto",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación
    if (!formData.description.trim()) {
      toast({ title: "Error", description: "La descripción es obligatoria", variant: "destructive" })
      return
    }
    if (!formData.amount || formData.amount <= 0) {
      toast({ title: "Error", description: "El importe debe ser mayor a 0", variant: "destructive" })
      return
    }
    if (!formData.date) {
      toast({ title: "Error", description: "La fecha es obligatoria", variant: "destructive" })
      return
    }
    if (!formData.category) {
      toast({ title: "Error", description: "La categoría es obligatoria", variant: "destructive" })
      return
    }
    if (!formData.payment_method) {
      toast({ title: "Error", description: "El método de pago es obligatorio", variant: "destructive" })
      return
    }
    if (!formData.status) {
      toast({ title: "Error", description: "El estado es obligatorio", variant: "destructive" })
      return
    }
    if (!formData.vendor || !formData.vendor.trim()) {
      toast({ title: "Error", description: "El proveedor es obligatorio", variant: "destructive" })
      return
    }

         try {
       if (editingExpense) {
                   // Actualizar gasto existente
          const updateData = {
            description: formData.description,
            amount: formData.amount,
            date: formData.date,
            category_id: formData.category || null,
            subcategory_id: formData.subcategory === "none" || !formData.subcategory ? null : formData.subcategory,
            payment_method: formData.payment_method,
            status: formData.status,
            notes: formData.notes,
            reservation_id: formData.reservation_id === "none" || !formData.reservation_id ? null : formData.reservation_id,
            vendor: formData.vendor,
            vendor_id: formData.vendor_id || null,
            is_recurring: formData.is_recurring,
            next_due_date: formData.recurrence_end_date || null,
            updated_at: new Date().toISOString(),
          }
         
         console.log("Updating expense with data:", updateData)
         console.log("Expense ID:", editingExpense.id)
         
                  const { data: updateResult, error } = await supabase
           .from("expenses")
           .update(updateData)
           .eq("id", editingExpense.id)
           .select()

         if (error) {
           console.error("Supabase update error:", error)
           console.error("Update data that caused error:", updateData)
           console.error("Expense ID being updated:", editingExpense.id)
           throw error
         }

        toast({
          title: "Gasto actualizado",
          description: "El gasto se ha actualizado correctamente",
        })
             } else {
         // Crear nuevo gasto
         const insertData = {
           property_id: selectedProperty!.id,
           description: formData.description,
           amount: formData.amount,
           date: formData.date,
           category_id: formData.category || null,
           subcategory_id: formData.subcategory === "none" || !formData.subcategory ? null : formData.subcategory,
           payment_method: formData.payment_method,
           status: formData.status,
           notes: formData.notes,
           reservation_id: formData.reservation_id === "none" || !formData.reservation_id ? null : formData.reservation_id,
           vendor: formData.vendor,
           vendor_id: formData.vendor_id || null,
           is_recurring: formData.is_recurring,
           next_due_date: formData.recurrence_end_date || null,
         }
         
         console.log("Creating expense with data:", insertData)
         
                  const { data: insertResult, error } = await supabase
           .from("expenses")
           .insert(insertData)
           .select()

         if (error) {
           console.error("Supabase insert error:", error)
           console.error("Insert data that caused error:", insertData)
           throw error
         }

        toast({
          title: "Gasto creado",
          description: "El gasto se ha creado correctamente",
        })
      }

      setIsDialogOpen(false)
      setEditingExpense(null)
      fetchData()
         } catch (error) {
       console.error("Error saving expense:", error)
       console.error("Error details:", {
         message: error instanceof Error ? error.message : 'Unknown error',
         stack: error instanceof Error ? error.stack : undefined,
         error: error
       })
       
       // Mostrar mensaje de error más específico para Supabase
       let errorMessage = "No se pudo guardar el gasto"
       
       if (error && typeof error === 'object') {
         const errorObj = error as any
         
         console.error("Full error object:", errorObj)
         console.error("Error code:", errorObj.code)
         console.error("Error message:", errorObj.message)
         console.error("Error details:", errorObj.details)
         console.error("Error hint:", errorObj.hint)
         
         // Manejar errores específicos de Supabase
         if (errorObj.code) {
           switch (errorObj.code) {
             case '23505': // Unique violation
               errorMessage = "Ya existe un gasto con estos datos"
               break
             case '23503': // Foreign key violation
               errorMessage = "Referencia inválida (categoría, subcategoría o reserva)"
               break
             case '23514': // Check violation
               errorMessage = `Datos inválidos en el formulario: ${errorObj.message || errorObj.details || errorObj.hint || 'Verificar restricciones de la base de datos'}`
               break
             case '42P01': // Undefined table
               errorMessage = "Error de configuración de base de datos"
               break
             default:
               errorMessage = errorObj.message || errorObj.details || errorObj.error_description || "Error de base de datos"
           }
         } else if (errorObj.message) {
           errorMessage = errorObj.message
         } else if (errorObj.error_description) {
           errorMessage = errorObj.error_description
         } else if (errorObj.details) {
           errorMessage = errorObj.details
         }
       } else if (error instanceof Error && error.message) {
         errorMessage = error.message
       }
       
       console.error("Final error message:", errorMessage)
       
       toast({
         title: "Error",
         description: errorMessage,
         variant: "destructive",
       })
     }
  }

  const loadDocuments = async (expenseId: string) => {
    try {
      const docs = await listExpenseDocuments(expenseId)
      setDocuments(docs)
    } catch (error) {
      console.error("Error loading documents:", error)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, expenseId: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      await uploadExpenseDocument({
        expenseId,
        file,
        originalName: file.name,
        mimeType: file.type,
        uploadedBy: user?.id || undefined,
      })
      const docs = await listExpenseDocuments(expenseId)
      setDocuments(docs)
      toast({ title: "Documento subido", description: file.name })
      e.target.value = ""
    } catch (error) {
      console.error("Error uploading document:", error)
      const message =
        (error instanceof Error && error.message) ||
        (error as any)?.message ||
        (error as any)?.error_description ||
        "No se pudo subir el documento"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (path: string) => {
    try {
      const url = await getSignedDocumentUrl({ path })
      window.open(url, "_blank")
    } catch (error) {
      console.error("Error getting signed url:", error)
      toast({ title: "Error", description: "No se pudo descargar el documento", variant: "destructive" })
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    const confirmed = confirm("¿Eliminar este documento?")
    if (!confirmed) return
    try {
      await deleteExpenseDocument(docId)
      setDocuments(prev => prev.filter(d => d.id !== docId))
      toast({ title: "Documento eliminado" })
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({ title: "Error", description: "No se pudo eliminar el documento", variant: "destructive" })
    }
  }

  const createRecurringExpenses = async (baseExpense: Expense, recurrenceData: any) => {
    try {
      const { isRecurring, startDate, endDate, frequency, interval } = recurrenceData
      
      console.log('Creating recurring expenses with data:', { baseExpense, recurrenceData })
      
      if (!isRecurring || !startDate || !endDate) {
        throw new Error("Datos de recurrencia incompletos")
      }

      const startDateObj = new Date(startDate)
      const endDateObj = new Date(endDate)
      const newExpenses = []

      console.log('Date range:', { startDate: startDateObj, endDate: endDateObj, frequency, interval })

      // Generar gastos según la frecuencia especificada
      let currentDate = new Date(startDateObj)
      let expenseCount = 0

      // Crear el primer gasto con la fecha de inicio
      expenseCount++
      const firstDateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
      console.log(`Creating FIRST expense ${expenseCount} for date: ${firstDateString}`)
      console.log(`currentDate.gethmont: ${currentDate.getMonth()}`)

      
      // Crear copia del gasto base para la primera fecha
      const firstExpense = {
        ...baseExpense,
        id: undefined, // Se generará automáticamente
        date: firstDateString,
        status: 'pending',
        notes: `${baseExpense.notes || ''} [Gasto recurrente generado automáticamente]`.trim(),
        is_recurring: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Limpiar campos que no deben copiarse
      delete firstExpense.id
      delete firstExpense.next_due_date
      delete (firstExpense as any).categories
      delete (firstExpense as any).subcategories

      console.log('=== INSERTING FIRST EXPENSE ===')
      console.log('First expense to insert:', firstExpense)
      console.log('================================')

      // Insertar el primer gasto
      const { data: firstData, error: firstError } = await supabase
        .from('expenses')
        .insert([firstExpense])
        .select()

      if (firstError) {
        console.error('Error inserting first expense:', firstError)
        throw firstError
      }

      console.log('First expense created successfully:', firstData[0])
      newExpenses.push(firstData[0])

      // Ahora generar los gastos siguientes manteniendo el día invariable
      const originalDay = startDateObj.getDate()
      const originalMonth = startDateObj.getMonth()
      const originalYear = startDateObj.getFullYear()
      
      let monthsToAdd = 1

      while (true) {
        // Calcular el mes y año objetivo
        let targetMonth = originalMonth + monthsToAdd
        let targetYear = originalYear
        
        // Ajustar año si el mes excede 12
        while (targetMonth > 11) {
          targetMonth -= 12
          targetYear += 1
        }
        
        console.log(`Generating expense ${expenseCount + 1}: Day ${originalDay}, Month ${targetMonth + 1}, Year ${targetYear}`)
        
        // Crear fecha manteniendo el día original
        let targetDate = new Date(targetYear, targetMonth, originalDay)
        
        // Si el día no existe en ese mes (ej: 31 Feb), ajustar al último día del mes
        if (targetDate.getMonth() !== targetMonth) {
          targetDate = new Date(targetYear, targetMonth + 1, 0) // Último día del mes
        }
        
        // Convertir fecha a string sin usar UTC
        const dateString = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`
        console.log(`Target date calculated: ${dateString}`)
        
        // Verificar si excede la fecha final
        if (targetDate > endDateObj) {
           console.log(`Target date ${dateString} exceeds end date, stopping generation`)
           break
        }

        console.log(`Creating expense ${expenseCount + 1} for date: ${dateString} (month ${monthsToAdd})`)
        
        // Crear copia del gasto base
        const newExpense = {
          ...baseExpense,
          id: undefined, // Se generará automáticamente
          date: dateString,
          status: 'pending',
          notes: `${baseExpense.notes || ''} [Gasto recurrente generado automáticamente]`.trim(),
          is_recurring: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        // Limpiar campos que no deben copiarse
        delete newExpense.id
        delete newExpense.next_due_date
        
        // Eliminar campos de join que no existen en la tabla expenses
        delete (newExpense as any).categories
        delete (newExpense as any).subcategories

        console.log('=== INSERTING EXPENSE ===')
        console.log('Expense to insert:', newExpense)
        console.log('Expense keys:', Object.keys(newExpense))
        console.log('Expense values:', Object.values(newExpense))
        console.log('Expense stringified:', JSON.stringify(newExpense, null, 2))
        console.log('========================')

        // Insertar en la base de datos
        const { data, error } = await supabase
          .from('expenses')
          .insert([newExpense])
          .select()

        if (error) {
          // Logging detallado del error
          console.log('=== SUPABASE INSERT ERROR ===')
          console.log('Error object:', error)
          console.log('Error type:', typeof error)
          console.log('Error constructor:', error.constructor.name)
          console.log('Error keys:', Object.keys(error))
          console.log('Error values:', Object.values(error))
          console.log('Error stringified:', JSON.stringify(error, null, 2))
          
          // Intentar acceder a propiedades específicas
          console.log('Error.code:', error.code)
          console.log('Error.message:', error.message)
          console.log('Error.details:', error.details)
          console.log('Error.hint:', error.hint)
          console.log('Error.error_description:', (error as any).error_description)
          
          // Datos que se intentaron insertar
          console.log('Expense data that caused error:', newExpense)
          console.log('================================')
          
          // Mostrar mensaje de error más específico
          let errorMessage = "Error al crear gasto recurrente"
          
          // Intentar extraer información del error de múltiples formas
          if (error && typeof error === 'object') {
            const errorObj = error as any
            
            if (errorObj.code) {
              switch (errorObj.code) {
                case '23505': // Unique violation
                  errorMessage = "Ya existe un gasto con estos datos para esta fecha"
                  break
                case '23503': // Foreign key violation
                  errorMessage = "Referencia inválida (categoría, subcategoría o reserva)"
                  break
                case '23514': // Check violation
                  errorMessage = `Datos inválidos: ${errorObj.message || errorObj.details || errorObj.hint || 'Verificar restricciones'}`
                  break
                case '42P01': // Undefined table
                  errorMessage = "Error de configuración de base de datos"
                  break
                default:
                  errorMessage = errorObj.message || errorObj.details || errorObj.error_description || "Error de base de datos"
              }
            } else if (errorObj.message) {
              errorMessage = errorObj.message
            } else if (errorObj.details) {
              errorMessage = errorObj.details
            } else if (errorObj.error_description) {
              errorMessage = errorObj.error_description
            } else {
              // Si no hay información específica, mostrar el objeto completo
              errorMessage = `Error de base de datos: ${JSON.stringify(errorObj)}`
            }
          } else if (error instanceof Error && error.message) {
            errorMessage = error.message
          } else {
            errorMessage = `Error desconocido: ${String(error)}`
          }
          
          throw new Error(errorMessage)
        }

        console.log('Expense created successfully:', data[0])
        newExpenses.push(data[0])
        
        // Incrementar el contador de meses para la siguiente iteración
        monthsToAdd++
        expenseCount++
      }

      console.log(`Successfully created ${newExpenses.length} recurring expenses`)

      // Recargar la lista de gastos
      await fetchData()
      
      toast({
        title: "Gastos recurrentes creados",
        description: `Se han generado ${newExpenses.length} gastos recurrentes`
      })

      return newExpenses
    } catch (error) {
       console.log('Error creating recurring expenses:', error)
       console.log('Full error object:', error)
       
       const message = error instanceof Error ? error.message : "Error desconocido al crear gastos recurrentes"
       toast({ title: "Error", description: message, variant: "destructive" })
       throw error
     }
  }

  return {
    // Estados
    expenses: filteredExpenses,
    reservations,
    loading,
    isDialogOpen,
    editingExpense,
    isDeleteDialogOpen,
    expenseToDelete,
    activeTab,
    searchTerm,
    statusFilter,
    categoryFilter,
    subcategoryFilter,
    dateRangeFilter,
    sortFilter,
    categories,
    subcategories,
    loadingCategories,
    filteredSubcategoriesForFilter,
    formData,
    documents,
    uploading,
    summary,
    
    // Setters
    setIsDialogOpen,
    setEditingExpense,
    setIsDeleteDialogOpen,
    setExpenseToDelete,
    setActiveTab,
    setSearchTerm,
    setStatusFilter,
    setCategoryFilter,
    setSubcategoryFilter,
    setDateRangeFilter,
    setSortFilter,
    setFormData,
    
    // Funciones
    handleCreateExpense,
     handleEditExpense,
     handleDeleteExpense,
     confirmDelete,
     handleSubmit,
     loadDocuments,
     handleUpload,
     handleDownload,
     handleDeleteDocument,
     formatGuestName,
     createRecurringExpenses,
   }
}
