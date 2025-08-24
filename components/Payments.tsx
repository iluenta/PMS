"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  supabase,
  type Payment,
  type Reservation,
  calculateRequiredAmount,
  calculateReservationAmounts,
  calculatePaymentStatus,
} from "@/lib/supabase"
import { useProperty } from "@/hooks/useProperty"
import { useAuth } from "@/contexts/AuthContext"
import { CreditCard, Plus, Edit, CheckCircle, Clock, AlertCircle, DollarSign, Building, Trash2 } from "lucide-react"

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [channelFilter, setChannelFilter] = useState<string>("all")
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all")
  const [sortFilter, setSortFilter] = useState<string>("date_desc")

  const { selectedProperty } = useProperty()
  const { user } = useAuth()
  // Actualiza el campo reservations.payment_status basado en pagos "completed"
  const updateReservationPaymentStatus = async (reservationId: string) => {
    if (!reservationId) return
    try {
      // Obtener la reserva actual
      const { data: reservation, error: reservationError } = await supabase
        .from("reservations")
        .select("*")
        .eq("id", reservationId)
        .single()

      if (reservationError || !reservation) {
        console.error("❌ Error fetching reservation for status update:", reservationError)
        return
      }

      // Obtener pagos completados de la reserva
      const { data: completedPayments, error: paymentsError } = await supabase
        .from("payments")
        .select("id, amount, status")
        .eq("reservation_id", reservationId)
        .eq("status", "completed")

      if (paymentsError) {
        console.error("❌ Error fetching payments for status update:", paymentsError)
        return
      }

      // Calcular nuevo estado
      const newStatus = calculatePaymentStatus(reservation as Reservation, completedPayments || [])

      if (reservation.payment_status !== newStatus) {
        const { error: updateError } = await supabase
          .from("reservations")
          .update({ payment_status: newStatus })
          .eq("id", reservationId)

        if (updateError) {
          console.error("❌ Error updating reservation payment_status:", updateError)
        } else {
          // Refrescar listado de reservas para reflejar el nuevo estado
          if (selectedProperty) await fetchReservations(selectedProperty.id)
        }
      }
    } catch (error) {
      console.error("💥 Exception updating reservation payment_status:", error)
    }
  }

  useEffect(() => {
    if (selectedProperty) {
      fetchReservations(selectedProperty.id)
      fetchPayments(selectedProperty.id)
    } else {
      setReservations([])
      setPayments([])
      setLoading(false)
    }
  }, [selectedProperty])

  const fetchReservations = async (propertyId: string) => {
    try {
  
      
      // Verificar que el usuario tenga tenant_id
      if (!user?.tenant_id) {
        console.warn("⚠️ Usuario sin tenant_id, no se pueden cargar reservas")
        setReservations([])
        return
      }

      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("property_id", propertyId)
        .eq("tenant_id", user.tenant_id) // Filtrar por tenant_id
        .neq("status", "cancelled")
        .order("check_in", { ascending: false })

      if (error) {
        console.error("❌ Error fetching reservations:", error)
        throw error
      }

      console.log("📊 Reservations found:", data?.length || 0)
      console.log("📋 Sample reservation:", data?.[0])
      
      setReservations(data || [])
    } catch (error) {
      console.error("❌ Error fetching reservations:", error)
      setReservations([])
    }
  }

  const fetchPayments = async (propertyId: string) => {
    try {
      setLoading(true)
  
      
      // Verificar que el usuario tenga tenant_id
      if (!user?.tenant_id) {
        console.warn("⚠️ Usuario sin tenant_id, no se pueden cargar pagos")
        setPayments([])
        return
      }

      // Primero obtener todas las reservas de la propiedad del tenant del usuario
      const { data: propertyReservations, error: reservationsError } = await supabase
        .from("reservations")
        .select("id")
        .eq("property_id", propertyId)
        .eq("tenant_id", user.tenant_id) // Filtrar por tenant_id

      if (reservationsError) {
        console.error("❌ Error fetching property reservations:", reservationsError)
        throw reservationsError
      }

      const reservationIds = propertyReservations?.map(r => r.id) || []
      

      if (reservationIds.length === 0) {
        console.log("📊 No reservations found for property, setting empty payments")
        setPayments([])
        return
      }

      // Luego obtener los pagos que correspondan a estas reservas del tenant del usuario
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .in("reservation_id", reservationIds)
        .eq("tenant_id", user.tenant_id) // Filtrar por tenant_id
        .order("date", { ascending: false })

      if (paymentsError) {
        console.error("❌ Error fetching payments:", paymentsError)
        throw paymentsError
      }

      console.log("📊 Total payments found:", paymentsData?.length || 0)
      console.log("📋 Sample payments:", paymentsData?.slice(0, 3))

      setPayments(paymentsData || [])
    } catch (error) {
      console.error("❌ Error fetching payments:", error)
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  // Función para calcular el progreso de pago de una reserva (solo pagos completados)
  const getReservationPaymentProgress = (reservationId: string) => {
    const reservationPayments = payments.filter(p => p.reservation_id === reservationId && p.status === 'completed')
    const totalPaid = reservationPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const reservation = reservations.find(r => r.id === reservationId)
    
    if (!reservation) {
      console.log(`❌ No se encontró la reserva ${reservationId}`)
      return { totalPaid, totalAmount: 0, percentage: 0 }
    }
    
    // Usar calculateRequiredAmount en lugar de total_amount para obtener el importe real requerido
    const totalAmount = calculateRequiredAmount(reservation)
    
    console.log(`💰 Reserva ${reservation.guest?.name}:`)
    console.log(`  - Pagos completados: ${reservationPayments.length}`)
    console.log(`  - Total pagado: €${totalPaid}`)
    console.log(`  - Total requerido: €${totalAmount}`)
    console.log(`  - Porcentaje: ${totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0}%`)
    
    return { 
      totalPaid, 
      totalAmount, 
      percentage: totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0 
    }
  }

  // Función para obtener reservas no pagadas al 100%
  const getUnpaidReservations = () => {
    const unpaid = reservations.filter(reservation => {
      const progress = getReservationPaymentProgress(reservation.id)
      const isUnpaid = progress.percentage < 100
      
      if (isUnpaid) {
        console.log(`📋 Reserva no pagada: ${reservation.guest?.name} - ${progress.percentage.toFixed(1)}% pagado`)
      }
      
      return isUnpaid
    })
    
    
    return unpaid
  }

  // Helpers para filtros
  const getReservationById = (id: string | null | undefined) => reservations.find(r => r.id === id)
  const getChannelNameForPayment = (payment: Payment) => {
    const res = getReservationById(payment.reservation_id || undefined)
    if (!res) return ""
    const source = (res as any).external_source || "Direct"
    // Normalizar
    if (source === "Direct") return "Propio"
    return source
  }

  const availableChannels = useMemo(() => {
    const names = new Set<string>()
    for (const p of payments) {
      const name = getChannelNameForPayment(p)
      if (name) names.add(name)
    }
    return Array.from(names)
  }, [payments, reservations])

  const filteredPayments = useMemo(() => {
    let list = [...payments]

    // Buscar por nombre del cliente, referencia o nombre del huésped de la reserva
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase().trim()
      list = list.filter(p => {
        const customer = p.customer_name?.toLowerCase() || ""
        const reference = p.reference?.toLowerCase() || ""
        const guest = getReservationById(p.reservation_id || undefined)?.guest?.name?.toLowerCase() || ""
        return customer.includes(s) || reference.includes(s) || guest.includes(s)
      })
    }

    // Estado
    if (statusFilter !== "all") list = list.filter(p => p.status === statusFilter)

    // Canal
    if (channelFilter !== "all") list = list.filter(p => getChannelNameForPayment(p) === channelFilter)

    // Rango de fechas sobre la fecha del pago
    if (dateRangeFilter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      list = list.filter(p => {
        const d = p.date ? new Date(p.date) : null
        if (!d) return false
        const daysDiff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        switch (dateRangeFilter) {
          case "pending": // usamos mismo nombre; aquí significa fecha futura
            return d > today
          case "today":
            return daysDiff === 0
          case "this_week":
            return daysDiff >= 0 && daysDiff <= 7
          case "this_month":
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
          case "past":
            return d < today
          default:
            return true
        }
      })
    }

    // Ordenar
    list.sort((a, b) => {
      switch (sortFilter) {
        case "date_desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "date_asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "amount_desc":
          return (b.amount || 0) - (a.amount || 0)
        case "amount_asc":
          return (a.amount || 0) - (b.amount || 0)
        default:
          return 0
      }
    })

    return list
  }, [payments, reservations, searchTerm, statusFilter, channelFilter, dateRangeFilter, sortFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "failed":
        return <AlertCircle className="h-4 w-4" />
      case "refunded":
        return <DollarSign className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "credit_card":
        return "Tarjeta de Crédito"
      case "bank_transfer":
        return "Transferencia Bancaria"
      case "cash":
        return "Efectivo"
      case "paypal":
        return "PayPal"
      case "check":
        return "Cheque"
      case "bizum":
        return "Bizum"
      default:
        return method
    }
  }

  const [formData, setFormData] = useState({
    reservation_id: "",
    customer_name: "",
    amount: "",
    method: "credit_card",
    status: "completed",
    date: new Date().toISOString().split("T")[0],
    reference: "",
    notes: "",
    fee: "0",
  })

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment)
    setShowPaymentDialog(true)
  }

  const handleAdd = () => {
    console.log("➕ Opening new payment dialog")
    setEditingPayment(null)
    // Reset the form state
    setFormData({
      reservation_id: "",
      customer_name: "",
      amount: "",
      method: "credit_card",
      status: "completed",
      date: new Date().toISOString().split("T")[0],
      reference: "",
      notes: "",
      fee: "0",
    })
    // Open the dialog
    setShowPaymentDialog(true)
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (!user?.tenant_id) {
      console.error("❌ Usuario sin tenant_id, no se puede eliminar el pago")
      return
    }

    if (!confirm("¿Estás seguro de que quieres eliminar este pago? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const { error } = await supabase
        .from("payments")
        .delete()
        .eq("id", paymentId)
        .eq("tenant_id", user.tenant_id) // Verificar que pertenece al tenant del usuario

      if (error) throw error

      // Si el pago eliminado estaba asociado a una reserva, recalcular su estado
      if (editingPayment?.reservation_id) await updateReservationPaymentStatus(editingPayment.reservation_id)

      // Recargar los datos
      if (selectedProperty) {
        await fetchPayments(selectedProperty.id)
      }
    } catch (error) {
      console.error("Error deleting payment:", error)
      alert("Error al eliminar el pago")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pagos de Reservas</h1>
          <p className="mt-2 text-gray-600">Gestiona los pagos de las reservas por propiedad</p>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Buscar */}
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <Input
              id="search"
              placeholder="Nombre, referencia, huésped..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="completed">Completados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="failed">Fallidos</SelectItem>
                <SelectItem value="refunded">Reembolsados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Canal */}
          <div className="space-y-2">
            <Label htmlFor="channel">Canal</Label>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los canales" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los canales</SelectItem>
                {availableChannels.map((c: string) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rango de fechas */}
          <div className="space-y-2">
            <Label htmlFor="dateRange">Rango de fechas</Label>
            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Pendientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las fechas</SelectItem>
                <SelectItem value="pending">Futuras</SelectItem>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="this_week">Esta semana</SelectItem>
                <SelectItem value="this_month">Este mes</SelectItem>
                <SelectItem value="past">Pasadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ordenar */}
          <div className="space-y-2">
            <Label htmlFor="sort">Ordenar</Label>
            <Select value={sortFilter} onValueChange={setSortFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Fecha (reciente)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Fecha (reciente)</SelectItem>
                <SelectItem value="date_asc">Fecha (antigua)</SelectItem>
                <SelectItem value="amount_desc">Importe (mayor)</SelectItem>
                <SelectItem value="amount_asc">Importe (menor)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Lista de Pagos */}
      {selectedProperty ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Pagos de {selectedProperty.name}</h2>
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
              <DialogTrigger asChild>
                <Button onClick={handleAdd} disabled={!selectedProperty} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Pago
                </Button>
              </DialogTrigger>
              <PaymentDialog
                key={editingPayment?.id || 'new-payment'}
                payment={editingPayment}
                formData={formData}
                onFormDataChange={setFormData}
                propertyId={selectedProperty.id}
                reservations={reservations}
                getReservationPaymentProgress={getReservationPaymentProgress}
                updateReservationPaymentStatus={updateReservationPaymentStatus}
                payments={payments}
                onClose={() => {
                  console.log("🚪 Closing dialog and clearing state")
                  setShowPaymentDialog(false)
                  setEditingPayment(null)
                }}
                onSave={() => fetchPayments(selectedProperty.id)}
              />
            </Dialog>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
           ) : filteredPayments.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pagos</h3>
                <p className="text-gray-500 mb-4">Comienza agregando tu primer pago</p>
                <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Pago
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPayments.map((payment: Payment) => (
                <Card key={payment.id} className="p-4">
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            {payment.customer_name || "Cliente sin nombre"}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {payment.reference && `Ref: ${payment.reference}`}
                            {payment.reference && payment.date && " • "}
                            {payment.date && new Date(payment.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-lg font-semibold text-gray-900">
                          €{payment.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getMethodLabel(payment.method)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 text-xs">
                          {payment.status === "completed" && "Completado"}
                          {payment.status === "pending" && "Pendiente"}
                          {payment.status === "failed" && "Fallido"}
                          {payment.status === "refunded" && "Reembolsado"}
                        </span>
                      </Badge>
                    </div>
                    
                    {payment.notes && (
                      <div className="p-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-600">{payment.notes}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(payment)}
                        className="h-8 px-2"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePayment(payment.id)}
                        className="text-red-600 hover:text-red-700 h-8 px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una propiedad</h3>
          <p className="text-gray-500">Elige una propiedad para ver sus pagos</p>
        </div>
      )}
    </div>
  )
}

function PaymentDialog({
  payment,
  formData,
  onFormDataChange,
  propertyId,
  reservations,
  getReservationPaymentProgress,
  updateReservationPaymentStatus,
  payments,
  onClose,
  onSave,
}: {
  payment: Payment | null
  formData: {
    reservation_id: string
    customer_name: string
    amount: string
    method: string
    status: string
    date: string
    reference: string
    notes: string
    fee: string
  }
  onFormDataChange: (data: {
    reservation_id: string
    customer_name: string
    amount: string
    method: string
    status: string
    date: string
    reference: string
    notes: string
    fee: string
  }) => void
  propertyId: string
  reservations: Reservation[]
  getReservationPaymentProgress: (reservationId: string) => { totalPaid: number; totalAmount: number; percentage: number }
  updateReservationPaymentStatus: (reservationId: string) => Promise<void>
  payments: Payment[]
  onClose: () => void
  onSave: () => void
}) {
  const { user } = useAuth()
  // Estado para controlar si mostrar todas las reservas o solo las pendientes
  const [showAllReservations, setShowAllReservations] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Función para manejar el cambio del checkbox
  const handleCheckboxChange = (checked: boolean) => {
    console.log("✅ Checkbox cambiado:", checked)
    setShowAllReservations(checked)
    setIsInitialLoad(false)
  }

  // Función para obtener reservas no pagadas al 100% de la propiedad seleccionada
  const getUnpaidReservations = () => {
    if (!user?.tenant_id) return []
    
    console.log("🔍 Buscando reservas no pagadas para propiedad:", propertyId)
    console.log("📊 Total de reservas disponibles:", reservations.length)
    
    const unpaid = reservations.filter(reservation => {
      // Asegurar que la reserva pertenece a la propiedad seleccionada
      if (reservation.property_id !== propertyId) {
        console.log(`❌ Reserva ${reservation.id} no pertenece a la propiedad ${propertyId}`)
        return false
      }
      
      // Calcular el progreso de pagos para esta reserva
      const { totalPaid, totalAmount, percentage } = getReservationPaymentProgress(reservation.id)
      
      console.log(`📋 Reserva ${reservation.guest?.name}: totalPaid=${totalPaid}, totalAmount=${totalAmount}, percentage=${percentage}%`)
      
      // Incluir reservas que no estén pagadas al 100%
      const isUnpaid = percentage < 100
      if (isUnpaid) {
        console.log(`✅ Reserva NO pagada: ${reservation.guest?.name} - ${percentage.toFixed(1)}% pagado`)
      } else {
        console.log(`❌ Reserva pagada al 100%: ${reservation.guest?.name} - ${percentage.toFixed(1)}% pagado`)
      }
      
      return isUnpaid
    })
    
    console.log(`📊 Reservas no pagadas encontradas: ${unpaid.length}`)
    return unpaid
  }

  // Función para obtener todas las reservas que deben aparecer en el Select
  const allReservationsForSelect = useMemo(() => {
    console.log("🔄 Recalculando reservas para mostrar. showAllReservations:", showAllReservations, "isInitialLoad:", isInitialLoad)
    
    // Si es la carga inicial o no se muestran todas las reservas, mostrar solo las no pagadas
    if (isInitialLoad || !showAllReservations) {
      const unpaidReservations = getUnpaidReservations()
      console.log("📋 Primera carga - Mostrando solo reservas no pagadas:", unpaidReservations.length)
      return unpaidReservations
    }
    
    // Mostrar todas las reservas si el checkbox está marcado
    console.log("📋 Mostrando TODAS las reservas:", reservations.length)
    return reservations.filter(r => r.property_id === propertyId)
  }, [showAllReservations, propertyId, reservations, isInitialLoad])

  // Función para manejar cambios en el formulario
  const handleInputChange = (field: string, value: string | number) => {
    onFormDataChange(prev => ({
      ...prev,
      [field]: String(value) // Convertir a string para mantener consistencia
    }))
  }

  // Función para manejar la selección de reserva
  const handleReservationChange = (reservationId: string) => {
    const reservation = reservations.find(r => r.id === reservationId)
    if (reservation) {
      onFormDataChange(prev => ({
        ...prev,
        reservation_id: reservationId,
        customer_name: reservation.guest?.name || ""
      }))
    }
  }

  // Reset form when the payment prop changes
  useEffect(() => {
    if (payment) {
      console.log("📝 Loading payment data for editing:", payment)
      onFormDataChange({
        reservation_id: payment.reservation_id || "",
        customer_name: payment.customer_name || "",
        amount: String(payment.amount || ""),
        method: payment.method,
        status: payment.status,
        date: payment.date.split('T')[0],
        reference: payment.reference || "",
        notes: payment.notes || "",
        fee: String(payment.fee || "0"),
      })
    } else {
      // Reset form for new payment
      console.log("🆕 Resetting form for new payment")
      onFormDataChange({
        reservation_id: "",
        customer_name: "",
        amount: "",
        method: "credit_card",
        status: "completed",
        date: new Date().toISOString().split("T")[0],
        reference: "",
        notes: "",
        fee: "0",
      })
    }
    // Reset UI states
    setShowAllReservations(false)
    setIsInitialLoad(true)
  }, [payment]) // Only depend on payment prop

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Verificar que el usuario tenga tenant_id
      if (!user?.tenant_id) {
        console.error("❌ Usuario sin tenant_id, no se puede crear/editar el pago")
        alert("Error: No se pudo identificar tu organización. Por favor, contacta al administrador.")
        return
      }

      // Validación del importe del pago
      if (formData.reservation_id && formData.reservation_id !== "no_reservation") {
        const selectedReservation = reservations.find(r => r.id === formData.reservation_id)
        if (selectedReservation) {
          const { totalPaid, totalAmount, percentage } = getReservationPaymentProgress(formData.reservation_id)
          const newPaymentAmount = parseFloat(formData.amount)
          const newTotalPayments = totalPaid + newPaymentAmount
          const requiredAmount = calculateRequiredAmount(selectedReservation)

          // Validar que no se exceda el importe requerido
          if (newTotalPayments > requiredAmount) {
            const excessAmount = newTotalPayments - requiredAmount
            const warningMessage = `⚠️ Advertencia: El importe del pago excede el importe requerido.

Importe requerido: €${requiredAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Pagos realizados: €${totalPaid.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Importe pendiente: €${(requiredAmount - totalPaid).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Exceso: €${excessAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

¿Desea continuar con el pago de todas formas?`

            const shouldContinue = confirm(warningMessage)
            if (!shouldContinue) {
              return
            }
          }
        }
      }

      const paymentData = {
        ...formData,
        reservation_id: formData.reservation_id === "no_reservation" ? null : formData.reservation_id,
        tenant_id: user.tenant_id, // Agregar tenant_id del usuario autenticado
      }

      if (payment) {
        const { error } = await supabase
          .from("payments")
          .update(paymentData)
          .eq("id", payment.id)
          .eq("tenant_id", user.tenant_id) // Verificar que pertenece al tenant del usuario

        if (error) throw error
        // Actualizar estado de la reserva
        if (paymentData.reservation_id) await updateReservationPaymentStatus(paymentData.reservation_id)
      } else {
        const { error } = await supabase
          .from("payments")
          .insert([paymentData])

        if (error) throw error
        // Actualizar estado de la reserva
        if (paymentData.reservation_id) await updateReservationPaymentStatus(paymentData.reservation_id)
      }

      onSave()
      onClose()
    } catch (error) {
      console.error("Error saving payment:", error)
      alert("Error al guardar el pago. Por favor, intenta nuevamente.")
    }
  }

  // Obtener la reserva seleccionada para mostrar los importes
  const selectedReservation = formData.reservation_id && formData.reservation_id !== "no_reservation" 
    ? reservations.find(r => r.id === formData.reservation_id) 
    : null

  const reservationAmounts = selectedReservation ? calculateReservationAmounts(selectedReservation) : null
  
  // Usar useMemo para estabilizar el cálculo de pagos parciales
  const totalCompletedPaidForSelected = useMemo(() => {
    if (!selectedReservation) return 0
    
    const partialsForSelected: Payment[] = (payments as Payment[]).filter(
      (p: Payment) => p.reservation_id === selectedReservation.id && p.status === 'completed'
    )
    
    return partialsForSelected.reduce((sum: number, p: Payment) => sum + (p.amount || 0), 0)
  }, [selectedReservation?.id, payments])

  // Actualizar automáticamente el importe cuando se seleccione una reserva
  useEffect(() => {
    if (selectedReservation && reservationAmounts) {
      const calculatedAmount = Math.max(0, reservationAmounts.finalAmount - totalCompletedPaidForSelected)
      console.log("💰 Actualizando importe automáticamente:", {
        finalAmount: reservationAmounts.finalAmount,
        totalCompletedPaid: totalCompletedPaidForSelected,
        calculatedAmount: calculatedAmount
      })
      
      onFormDataChange(prev => ({
        ...prev,
        amount: String(calculatedAmount.toFixed(2))
      }))
    }
  }, [selectedReservation?.id, reservationAmounts?.finalAmount, totalCompletedPaidForSelected])

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{payment ? "Editar Pago" : "Nuevo Pago"}</DialogTitle>
        <DialogDescription>
          {payment ? "Modifica los datos del pago" : "Registra un nuevo pago para esta propiedad"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Checkbox para mostrar todas las reservas */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showAllReservations"
            checked={showAllReservations}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Label htmlFor="showAllReservations" className="text-sm font-medium text-gray-700">
            Mostrar todas las reservas
          </Label>
        </div>

                 {/* Reserva como primer campo */}
         <div className="space-y-2">
           <Label htmlFor="reservation_id">Reserva *</Label>
           <Select
             value={formData.reservation_id}
             onValueChange={(value) => {
               console.log("🔽 Selected reservation:", value)
               handleReservationChange(value)
             }}
             disabled={!propertyId}
           >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar reserva" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no_reservation">
                Sin reserva específica
              </SelectItem>
              {allReservationsForSelect.map((reservation) => (
                <SelectItem key={reservation.id} value={reservation.id}>
                  {reservation.guest?.name || "Sin nombre"} - {reservation.check_in} a {reservation.check_out}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!showAllReservations && (
            <p className="text-xs text-gray-500">
              Mostrando solo reservas pendientes de pago. Marca el checkbox para ver todas las reservas.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Nombre del Cliente</Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) => handleInputChange("customer_name", e.target.value)}
              required
              readOnly={formData.reservation_id !== "" && formData.reservation_id !== "no_reservation"}
            />
          </div>
        </div>

        {/* Sección específica de importes */}
        {selectedReservation && reservationAmounts && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900">Desglose de Importes</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Importe Total de la Reserva</Label>
                <Input
                  value={`€${reservationAmounts.totalAmount.toFixed(2)}`}
                  readOnly
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Comisión de Venta</Label>
                <Input
                  value={`€${reservationAmounts.channelCommission.toFixed(2)}`}
                  readOnly
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Comisión de Cobro</Label>
                <Input
                  value={`€${reservationAmounts.collectionCommission.toFixed(2)}`}
                  readOnly
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">IVA (21% de comisiones)</Label>
                <Input
                  value={`€${reservationAmounts.commissionIVA.toFixed(2)}`}
                  readOnly
                  className="bg-white"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="text-sm font-medium text-gray-700">Pagos parciales realizados (completados)</Label>
                <Input
                  value={`€${totalCompletedPaidForSelected.toFixed(2)}`}
                  readOnly
                  className="bg-white"
                />
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Importe Final (Calculado)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange("amount", e.target.value)}
                  className="bg-white font-semibold"
                  required
                />
                <p className="text-xs text-gray-500">
                  Importe calculado: €{reservationAmounts.finalAmount.toFixed(2)} − Pagos parciales €{totalCompletedPaidForSelected.toFixed(2)} = €{Math.max(0, reservationAmounts.finalAmount - totalCompletedPaidForSelected).toFixed(2)} — Puedes modificar este valor
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Campo de importe editable solo si no hay reserva seleccionada */}
        {(!selectedReservation || !reservationAmounts) && (
          <div className="space-y-2">
            <Label htmlFor="amount">Importe del Pago (€)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount || ""}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              required
              className="font-semibold"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="method">Método de Pago</Label>
            <Select
              value={formData.method}
              onValueChange={(value) => handleInputChange("method", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Tarjeta de Crédito</SelectItem>
                <SelectItem value="bank_transfer">Transferencia Bancaria</SelectItem>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="check">Cheque</SelectItem>
                <SelectItem value="bizum">Bizum</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="failed">Fallido</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Fecha de Pago</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fee">Cargo Adicional (€)</Label>
            <Input
              id="fee"
              type="number"
              min="0"
              step="0.01"
              value={formData.fee || ""}
              onChange={(e) => handleInputChange("fee", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reference">Referencia</Label>
          <Input
            id="reference"
            value={formData.reference}
            onChange={(e) => handleInputChange("reference", e.target.value)}
            placeholder="Número de referencia del pago"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder="Notas adicionales sobre el pago"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="border-blue-600 text-blue-600 hover:bg-blue-50">
            Cancelar
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{payment ? "Actualizar" : "Crear"} Pago</Button>
        </div>
      </form>
    </DialogContent>
  )
} 