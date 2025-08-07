"use client"

import { useState, useEffect } from "react"
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
import { supabase, type Payment, type Property, type Reservation } from "@/lib/supabase"
import { useProperty } from "@/hooks/useProperty"
import { CreditCard, Plus, Edit, CheckCircle, Clock, AlertCircle, DollarSign, Building, Trash2 } from "lucide-react"

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)

  const { selectedProperty } = useProperty()

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
      console.log("🔍 Fetching reservations for property:", propertyId)
      
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .eq("property_id", propertyId)
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
      console.log("🔍 Fetching payments for property:", propertyId)
      
      // Primero obtener todas las reservas de la propiedad
      const { data: propertyReservations, error: reservationsError } = await supabase
        .from("reservations")
        .select("id")
        .eq("property_id", propertyId)

      if (reservationsError) {
        console.error("❌ Error fetching property reservations:", reservationsError)
        throw reservationsError
      }

      const reservationIds = propertyReservations?.map(r => r.id) || []
      console.log("📊 Found reservation IDs:", reservationIds)

      if (reservationIds.length === 0) {
        console.log("📊 No reservations found for property, setting empty payments")
        setPayments([])
        return
      }

      // Luego obtener los pagos que correspondan a estas reservas
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .in("reservation_id", reservationIds)
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

  // Función para calcular el progreso de pago de una reserva
  const getReservationPaymentProgress = (reservationId: string) => {
    const reservationPayments = payments.filter(p => p.reservation_id === reservationId)
    const totalPaid = reservationPayments.reduce((sum, p) => sum + p.amount, 0)
    const reservation = reservations.find(r => r.id === reservationId)
    const totalAmount = reservation?.total_amount || 0
    return { totalPaid, totalAmount, percentage: totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0 }
  }

  // Función para obtener reservas no pagadas al 100%
  const getUnpaidReservations = () => {
    return reservations.filter(reservation => {
      const progress = getReservationPaymentProgress(reservation.id)
      return progress.percentage < 100
    })
  }

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

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    console.log("➕ Opening new payment dialog")
    setEditingPayment(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (payment: Payment) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este pago? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const { error } = await supabase
        .from("payments")
        .delete()
        .eq("id", payment.id)

      if (error) throw error

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

      {/* Lista de Pagos */}
      {selectedProperty ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Pagos de {selectedProperty.name}</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAdd} disabled={!selectedProperty}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Pago
                </Button>
              </DialogTrigger>
              <PaymentDialog
                payment={editingPayment}
                propertyId={selectedProperty.id}
                reservations={reservations}
                getReservationPaymentProgress={getReservationPaymentProgress}
                onClose={() => {
                  console.log("🚪 Closing dialog and clearing state")
                  setIsDialogOpen(false)
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
          ) : payments.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pagos</h3>
                <p className="text-gray-500 mb-4">Comienza agregando tu primer pago</p>
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Pago
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {payments.map((payment) => (
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
                        onClick={() => handleDelete(payment)}
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
  propertyId,
  reservations,
  getReservationPaymentProgress,
  onClose,
  onSave,
}: {
  payment: Payment | null
  propertyId: string
  reservations: Reservation[]
  getReservationPaymentProgress: (reservationId: string) => { totalPaid: number; totalAmount: number; percentage: number }
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    customer_name: "",
    amount: 0,
    method: "credit_card" as Payment['method'],
    status: "pending" as Payment['status'],
    date: new Date().toISOString().split('T')[0],
    reference: "",
    notes: "",
    fee: 0,
    reservation_id: "",
  })

  const { selectedProperty } = useProperty()

  // Función para limpiar el formulario
  const clearForm = () => {
    console.log("🧹 Clearing form data")
    setFormData({
      customer_name: "",
      amount: 0,
      method: "credit_card" as Payment['method'],
      status: "pending" as Payment['status'],
      date: new Date().toISOString().split('T')[0],
      reference: "",
      notes: "",
      fee: 0,
      reservation_id: "",
    })
  }

  // Función para obtener reservas no pagadas al 100% de la propiedad seleccionada
  const getUnpaidReservations = () => {
    if (!selectedProperty) return []
    
    return reservations.filter(reservation => {
      // Asegurar que la reserva pertenece a la propiedad seleccionada
      if (reservation.property_id !== selectedProperty.id) return false
      
      const progress = getReservationPaymentProgress(reservation.id)
      return progress.percentage < 100
    })
  }

  // Función para calcular el importe requerido según el canal
  const calculateRequiredAmount = (reservation: Reservation): number => {
    // Determinar el canal de la reserva
    let channelName = 'Propio' // Default
    
    // Verificar si hay property_channel configurado
    if (reservation.property_channel?.channel?.name) {
      channelName = reservation.property_channel.channel.name
    } else if (reservation.external_source) {
      // Si no hay property_channel, usar external_source
      channelName = reservation.external_source
    }
    
    // Normalizar nombres de canal propio
    const propioChannels = ['Propio', 'Direct', 'Direct Booking', 'Canal Directo', 'Directo']
    const isPropioChannel = propioChannels.some(name => 
      channelName.toLowerCase().includes(name.toLowerCase())
    )
    
    // Siempre calcular el importe requerido restando las comisiones
    const channelCommission = reservation.channel_commission || 0
    const collectionCommission = reservation.collection_commission || 0
    const totalCommissions = channelCommission + collectionCommission
    
    let result: number
    
    if (isPropioChannel && totalCommissions === 0) {
      // Para canal propio sin comisiones: TOTAL (sin comisiones)
      result = reservation.total_amount || 0
    } else {
      // Para canales con comisiones o canales propios con comisiones configuradas:
      // TOTAL - (comisión venta + comisión cobro) - [(comisión venta + comisión cobro) * 21%]
      // O lo que es lo mismo: TOTAL - (comisión venta + comisión cobro) * 1.21
      const totalCommissionsWithIVA = totalCommissions * 1.21
      result = (reservation.total_amount || 0) - totalCommissionsWithIVA
    }
    
    // Redondear a 2 decimales como en el ejemplo: 479.29
    const roundedResult = Math.round(result * 100) / 100
    const finalResult = Math.max(0, roundedResult)
    
    console.log('calculateRequiredAmount:', {
      reservationId: reservation.id,
      channelName,
      isPropioChannel,
      total_amount: reservation.total_amount,
      channel_commission: channelCommission,
      collection_commission: collectionCommission,
      totalCommissions,
      totalCommissionsWithIVA: totalCommissions * 1.21,
      result,
      roundedResult,
      finalResult,
      // Agregar información adicional para debugging
      raw_channel_commission: reservation.channel_commission,
      raw_collection_commission: reservation.collection_commission
    })
    
    return finalResult
  }

  // Función para auto-rellenar el nombre del huésped cuando se selecciona una reserva
  const handleReservationChange = (reservationId: string) => {
    const selectedReservation = reservations.find(r => r.id === reservationId)
    console.log("🔍 Selected reservation:", selectedReservation)
    
    setFormData({
      ...formData,
      reservation_id: reservationId,
      customer_name: selectedReservation?.guest?.name || ""
    })
  }

  useEffect(() => {
    console.log("🔄 useEffect triggered with payment:", payment)
    
    if (payment) {
      // Si hay un pago, cargar sus datos para edición
      console.log("📝 Loading payment data for editing:", payment)
      setFormData({
        customer_name: payment.customer_name,
        amount: payment.amount || 0,
        method: payment.method,
        status: payment.status,
        date: payment.date.split('T')[0],
        reference: payment.reference || "",
        notes: payment.notes || "",
        fee: payment.fee || 0,
        reservation_id: payment.reservation_id || "no_reservation",
      })
    } else {
      // Si no hay pago, limpiar el formulario para nuevo pago
      clearForm()
    }
  }, [payment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validación del importe del pago
      if (formData.reservation_id && formData.reservation_id !== "no_reservation" && formData.amount > 0) {
        const selectedReservation = reservations.find(r => r.id === formData.reservation_id)
        if (selectedReservation) {
          // Calcular el importe requerido para esta reserva
          const requiredAmount = calculateRequiredAmount(selectedReservation)
          
          // Obtener los pagos existentes para esta reserva (excluyendo el pago actual si estamos editando)
          const { data: existingPayments } = await supabase
            .from("payments")
            .select("id, amount")
            .eq("reservation_id", formData.reservation_id)
            .eq("status", "completed")
          
          let totalExistingPayments = 0
          if (existingPayments) {
            totalExistingPayments = existingPayments.reduce((sum, p) => {
              // Si estamos editando, excluir el importe del pago actual
              if (payment && p.id === payment.id) {
                return sum
              }
              return sum + (p.amount || 0)
            }, 0)
          }
          
          const pendingAmount = Math.max(0, requiredAmount - totalExistingPayments)
          const newTotalPayments = totalExistingPayments + formData.amount
          
          // Debug logging
          console.log('Payment validation:', {
            reservationId: formData.reservation_id,
            requiredAmount,
            totalExistingPayments,
            newPaymentAmount: formData.amount,
            newTotalPayments,
            pendingAmount,
            isEditing: !!payment
          })
          
          // Validar que no se exceda el importe requerido
          if (newTotalPayments > requiredAmount) {
            const excessAmount = newTotalPayments - requiredAmount
            const warningMessage = `⚠️ Advertencia: El importe del pago excede el importe requerido.

Importe requerido: €${requiredAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Pagos realizados: €${totalExistingPayments.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Importe pendiente: €${pendingAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
      }

      if (payment) {
        const { error } = await supabase
          .from("payments")
          .update(paymentData)
          .eq("id", payment.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from("payments")
          .insert([paymentData])

        if (error) throw error
      }

      onSave()
      onClose()
    } catch (error) {
      console.error("Error saving payment:", error)
    }
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{payment ? "Editar Pago" : "Nuevo Pago"}</DialogTitle>
        <DialogDescription>
          {payment ? "Modifica los datos del pago" : "Registra un nuevo pago para esta propiedad"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Reserva como primer campo */}
        <div className="space-y-2">
          <Label htmlFor="reservation_id">Reserva *</Label>
          <Select
            value={formData.reservation_id}
            onValueChange={handleReservationChange}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una reserva" />
            </SelectTrigger>
            <SelectContent>
              {getUnpaidReservations().map((reservation) => (
                <SelectItem key={reservation.id} value={reservation.id}>
                  {reservation.guest?.name || "Sin nombre"} - {reservation.check_in} a {reservation.check_out} (€{reservation.total_amount})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Nombre del Cliente</Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              required
              readOnly={formData.reservation_id !== "" && formData.reservation_id !== "no_reservation"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Importe (€)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount || ""}
              onChange={(e) => {
                const value = e.target.value
                const numValue = value === "" ? 0 : Number.parseFloat(value) || 0
                setFormData({ ...formData, amount: numValue })
              }}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="method">Método de Pago</Label>
            <Select
              value={formData.method}
              onValueChange={(value) => setFormData({ ...formData, method: value as Payment['method'] })}
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
              onValueChange={(value) => setFormData({ ...formData, status: value as Payment['status'] })}
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
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
              onChange={(e) => {
                const value = e.target.value
                const numValue = value === "" ? 0 : Number.parseFloat(value) || 0
                setFormData({ ...formData, fee: numValue })
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reference">Referencia</Label>
          <Input
            id="reference"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            placeholder="Número de referencia del pago"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notas adicionales sobre el pago"
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{payment ? "Actualizar" : "Crear"} Pago</Button>
        </div>
      </form>
    </DialogContent>
  )
} 