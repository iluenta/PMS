import { supabase, type Expense } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface RecurrenceData {
  isRecurring: boolean
  startDate: string
  endDate: string
  frequency: 'daily' | 'weekly' | 'monthly'
  interval: number
}

export function useRecurringExpenses() {
  const { toast } = useToast()

  // Función principal para crear gastos recurrentes
  const createRecurringExpenses = async (baseExpense: Expense, recurrenceData: RecurrenceData) => {
    console.log('Creating recurring expenses with data:', { baseExpense, recurrenceData })

    try {
      const { startDate, endDate, frequency } = recurrenceData
      const startDateObj = new Date(startDate)
      const endDateObj = new Date(endDate)
      
      console.log('Date range:', { startDate: startDateObj, endDate: endDateObj, frequency, interval: recurrenceData.interval })

      if (frequency !== 'monthly') {
        throw new Error('Solo se soporta frecuencia mensual por ahora')
      }

      const newExpenses: any[] = []

      // Generar gastos según la frecuencia especificada
      let currentDate = new Date(startDateObj)
      let expenseCount = 0

      // Crear el primer gasto con la fecha de inicio
      expenseCount++
      const firstDateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
      console.log(`Creating FIRST expense ${expenseCount} for date: ${firstDateString}`)

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
    createRecurringExpenses,
  }
}








