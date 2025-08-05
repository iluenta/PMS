"use client"

import type React from "react"

import { useEffect, useState } from "react"
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
import { supabase, isDemoMode, mockData, type Payment, type Reservation } from "@/lib/supabase"
import { CreditCard, Plus, Edit, CheckCircle, Clock, AlertCircle, DollarSign, Trash2 } from "lucide-react"

export default function BookingPayments() {
  console.log('BookingPayments component is rendering')
  const [payments, setPayments] = useState<Payment[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    console.log('fetchData is being called')
    try {
      if (isDemoMode) {
        // En modo demo, usar datos mock pero adaptados a la estructura de payments
        const mockPayments: Payment[] = []

        setPayments(mockPayments)
        setReservations(mockData.bookings.map(booking => ({
          id: booking.id,
          guest: { name: `${booking.guest?.first_name} ${booking.guest?.last_name}`, email: booking.guest?.email },
          property_id: booking.property_id,
          check_in: booking.check_in,
          check_out: booking.check_out,
          nights: 1,
          guests: booking.guests_count,
          adults: booking.guests_count,
          children: 0,
          status: booking.status,
          payment_status: "pending",
          total_amount: booking.total_amount,
          base_amount: booking.total_amount,
          cleaning_fee: 0,
          taxes: 0,
          channel_commission: (booking as any).channel_commission ?? 0,
          collection_commission: (booking as any).collection_commission ?? 0,
          property_channel_id: "mock-channel-id", // Mock ID para demo
          created_at: booking.created_at,
          updated_at: booking.updated_at
        })))
        return
      }

      // Fetch payments with reservation info
      const { data: paymentsData } = await supabase
        .from("payments")
        .select(`
          *,
          reservation:reservations(
            *,
            property:properties(*),
            property_channel:property_channels(
              channel:distribution_channels(*)
            )
          )
        `)
        .order("created_at", { ascending: false })

      // Fetch reservations for the form
      const { data: reservationsData } = await supabase.from("reservations").select(`
          *,
          property:properties(*),
          property_channel:property_channels(
            channel:distribution_channels(*)
          )
        `)

      if (paymentsData) setPayments(paymentsData)
      if (reservationsData) setReservations(reservationsData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Función para calcular el importe requerido según el canal
  const calculateRequiredAmount = (reservation: Reservation): number => {
    const channelName = reservation.property_channel?.channel?.name || 'Propio'
    
    if (channelName === 'Propio') {
      // Para canal propio: TOTAL (sin comisiones)
      return reservation.total_amount
    } else {
      // Para otros canales: TOTAL - [(comisión venta + comisión cobro) * 21%]
      const channelCommission = reservation.channel_commission || 0
      const collectionCommission = reservation.collection_commission || 0
      return reservation.total_amount - ((channelCommission + collectionCommission) * 0.21)
    }
  }

  // Función para calcular el nuevo estado de pago de una reserva
  const calculatePaymentStatus = (reservation: Reservation, payments: Payment[]): string => {
    const reservationPayments = payments.filter(p => p.reservation_id === reservation.id && p.status === 'completed')
    const totalPayments = reservationPayments.reduce((sum, p) => sum + p.amount, 0)
    const requiredAmount = calculateRequiredAmount(reservation)

    if (totalPayments >= requiredAmount) {
      return 'paid'
    } else if (totalPayments > 0) {
      return 'partial'
    } else {
      return 'pending'
    }
  }

  // Función para actualizar el estado de pago de una reserva
  const updateReservationPaymentStatus = async (reservationId: string) => {
    try {
      if (isDemoMode) {
        console.log('Demo mode: Payment status would be updated for reservation', reservationId)
        return
      }

      // Obtener la reserva actualizada
      const { data: reservation } = await supabase
        .from("reservations")
        .select(`
          *,
          property_channel:property_channels(
            channel:distribution_channels(*)
          )
        `)
        .eq("id", reservationId)
        .single()

      if (!reservation) return

      // Obtener todos los pagos de esta reserva
      const { data: reservationPayments } = await supabase
        .from("payments")
        .select("*")
        .eq("reservation_id", reservationId)

      if (!reservationPayments) return

      // Calcular el nuevo estado
      const newPaymentStatus = calculatePaymentStatus(reservation, reservationPayments)

      // Actualizar solo si el estado ha cambiado
      if (reservation.payment_status !== newPaymentStatus) {
        const { error } = await supabase
          .from("reservations")
          .update({ 
            payment_status: newPaymentStatus,
            updated_at: new Date().toISOString()
          })
          .eq("id", reservationId)

        if (error) {
          console.error("Error updating reservation payment status:", error)
        } else {
          console.log(`Reservation ${reservationId} payment status updated from ${reservation.payment_status} to ${newPaymentStatus}`)
        }
      }
    } catch (error) {
      console.error("Error updating reservation payment status:", error)
    }
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
        return "Tarjeta de crédito"
      case "bank_transfer":
        return "Transferencia bancaria"
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
    setEditingPayment(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (payment: Payment) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este pago? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      if (isDemoMode) {
        alert("Pago eliminado (Demo)")
        setPayments(payments.filter(p => p.id !== payment.id))
        // Actualizar el estado de pago de la reserva después de eliminar el pago
        if (payment.reservation_id) {
          await updateReservationPaymentStatus(payment.reservation_id)
        }
        return
      }

      const { error } = await supabase
        .from("payments")
        .delete()
        .eq("id", payment.id)

      if (error) throw error

      // Actualizar el estado de pago de la reserva después de eliminar el pago
      if (payment.reservation_id) {
        await updateReservationPaymentStatus(payment.reservation_id)
      }

      // Recargar los datos
      await fetchData()
    } catch (error) {
      console.error("Error deleting payment:", error)
      alert("Error al eliminar el pago")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pagos de Reservas</h1>
          <p className="mt-2 text-gray-600">Gestiona los pagos de las reservas. El estado de pago se actualiza automáticamente.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Pago
            </Button>
          </DialogTrigger>
          <PaymentDialog
            payment={editingPayment}
            reservations={reservations}
            onClose={() => setIsDialogOpen(false)}
            onSave={fetchData}
            onPaymentSaved={updateReservationPaymentStatus}
          />
        </Dialog>
      </div>

      <div className="grid gap-6">
        {payments.map((payment) => (
          <Card key={payment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">
                      €{payment.amount} - {getMethodLabel(payment.method)}
                    </CardTitle>
                    <CardDescription>
                      {payment.customer_name} - {payment.reservation?.property?.name}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(payment.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(payment.status)}
                      <span className="capitalize">{payment.status}</span>
                    </div>
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(payment)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(payment)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    style={{ 
                      display: 'inline-flex !important',
                      backgroundColor: '#fef2f2',
                      borderColor: '#dc2626',
                      color: '#dc2626',
                      minWidth: '80px',
                      visibility: 'visible !important',
                      opacity: '1 !important'
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                  {/* Debug: Verificar que el botón se renderiza */}
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#ff0000', 
                    backgroundColor: '#ffff00',
                    padding: '2px 4px',
                    fontWeight: 'bold',
                    border: '2px solid red'
                  }}>DEBUG v3</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Importe</p>
                  <p className="text-lg font-semibold">€{payment.amount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Comisión</p>
                  <p className="text-lg font-semibold text-red-600">-€{payment.fee || 0}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Neto</p>
                  <p className="text-lg font-semibold text-green-600">€{(payment.amount - (payment.fee || 0)).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Método</p>
                  <p className="text-lg font-semibold capitalize">{getMethodLabel(payment.method)}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-500">Fecha de pago</p>
                  <p>{payment.date ? new Date(payment.date).toLocaleDateString() : "Pendiente"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Referencia</p>
                  <p>{payment.reference || "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Estado de reserva</p>
                  <Badge className={getStatusColor(payment.reservation?.payment_status || "pending")}>
                    {payment.reservation?.payment_status || "pending"}
                  </Badge>
                </div>
              </div>

              {payment.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Notas</p>
                  <p className="text-sm text-gray-700">{payment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {payments.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pagos</h3>
            <p className="text-gray-500 mb-4">Los pagos de las reservas aparecerán aquí</p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Pago
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function PaymentDialog({
  payment,
  reservations,
  onClose,
  onSave,
  onPaymentSaved,
}: {
  payment: Payment | null
  reservations: Reservation[]
  onClose: () => void
  onSave: () => void
  onPaymentSaved: (reservationId: string) => Promise<void>
}) {
  const [formData, setFormData] = useState({
    reservation_id: "",
    customer_name: "",
    amount: 0,
    method: "credit_card" as Payment["method"],
    status: "pending" as Payment["status"],
    date: "",
    reference: "",
    notes: "",
    fee: 0,
  })

  useEffect(() => {
    if (payment) {
      setFormData({
        reservation_id: payment.reservation_id || "",
        customer_name: payment.customer_name,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        date: payment.date ? new Date(payment.date).toISOString().split('T')[0] : "",
        reference: payment.reference || "",
        notes: payment.notes || "",
        fee: payment.fee || 0,
      })
    } else {
      setFormData({
        reservation_id: "",
        customer_name: "",
        amount: 0,
        method: "credit_card",
        status: "pending",
        date: "",
        reference: "",
        notes: "",
        fee: 0,
      })
    }
  }, [payment])

  // Auto-fill customer name when reservation is selected
  useEffect(() => {
    if (formData.reservation_id) {
      const selectedReservation = reservations.find((r) => r.id === formData.reservation_id)
      if (selectedReservation) {
        setFormData((prev) => ({
          ...prev,
          customer_name: selectedReservation.guest.name || "",
        }))
      }
    }
  }, [formData.reservation_id, reservations])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isDemoMode) {
        alert(payment ? "Pago actualizado (Demo)" : "Pago creado (Demo)")
        onSave()
        onClose()
        return
      }

      const paymentData = {
        ...formData,
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
      }

      if (payment) {
        const { error } = await supabase.from("payments").update(paymentData).eq("id", payment.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("payments").insert([paymentData])

        if (error) throw error
      }

      // Actualizar el estado de pago de la reserva después de guardar el pago
      if (formData.reservation_id) {
        await onPaymentSaved(formData.reservation_id)
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
          {payment ? "Modifica los datos del pago" : "Registra un nuevo pago. El estado de pago de la reserva se actualizará automáticamente."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reservation_id">Reserva</Label>
          <Select
            value={formData.reservation_id}
            onValueChange={(value) => setFormData({ ...formData, reservation_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una reserva" />
            </SelectTrigger>
            <SelectContent>
              {reservations.map((reservation) => (
                <SelectItem key={reservation.id} value={reservation.id}>
                  {reservation.guest.name} - {reservation.property?.name} (€{reservation.total_amount})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Cliente</Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Importe (€)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number.parseFloat(e.target.value) })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="method">Método de pago</Label>
            <Select
              value={formData.method}
              onValueChange={(value) => setFormData({ ...formData, method: value as Payment["method"] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Tarjeta de crédito</SelectItem>
                <SelectItem value="bank_transfer">Transferencia bancaria</SelectItem>
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
              onValueChange={(value) => setFormData({ ...formData, status: value as Payment["status"] })}
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
            <Label htmlFor="date">Fecha de pago</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fee">Comisión (€)</Label>
            <Input
              id="fee"
              type="number"
              min="0"
              step="0.01"
              value={formData.fee}
              onChange={(e) => setFormData({ ...formData, fee: Number.parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reference">Número de referencia</Label>
          <Input
            id="reference"
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            placeholder="Referencia del pago"
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
