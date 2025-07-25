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
import { supabase, isDemoMode, mockData, type BookingPayment, type Booking } from "@/lib/supabase"
import { CreditCard, Plus, Edit, CheckCircle, Clock, AlertCircle, DollarSign } from "lucide-react"

export default function BookingPayments() {
  const [payments, setPayments] = useState<BookingPayment[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<BookingPayment | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      if (isDemoMode) {
        const paymentsWithBookings = mockData.bookingPayments.map((payment) => ({
          ...payment,
          booking: mockData.bookings.find((b) => b.id === payment.booking_id),
        }))

        setPayments(paymentsWithBookings)
        setBookings(mockData.bookings)
        return
      }

      // Fetch payments with booking info
      const { data: paymentsData } = await supabase
        .from("booking_payments")
        .select(`
          *,
          booking:bookings(
            *,
            property:properties(*),
            guest:guests(*)
          )
        `)
        .order("created_at", { ascending: false })

      // Fetch bookings for the form
      const { data: bookingsData } = await supabase.from("bookings").select(`
          *,
          property:properties(*),
          guest:guests(*)
        `)

      if (paymentsData) setPayments(paymentsData)
      if (bookingsData) setBookings(bookingsData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
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

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return "Depósito"
      case "balance":
        return "Saldo"
      case "refund":
        return "Reembolso"
      default:
        return type
    }
  }

  const handleEdit = (payment: BookingPayment) => {
    setEditingPayment(payment)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingPayment(null)
    setIsDialogOpen(true)
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
          <p className="mt-2 text-gray-600">Gestiona los pagos y comisiones de las reservas</p>
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
            bookings={bookings}
            onClose={() => setIsDialogOpen(false)}
            onSave={fetchData}
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
                      {getPaymentTypeLabel(payment.payment_type)} - €{payment.amount}
                    </CardTitle>
                    <CardDescription>
                      {payment.booking?.guest?.first_name} {payment.booking?.guest?.last_name} -{" "}
                      {payment.booking?.property?.name}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(payment.payment_status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(payment.payment_status)}
                      <span className="capitalize">{payment.payment_status}</span>
                    </div>
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(payment)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Importe bruto</p>
                  <p className="text-lg font-semibold">€{payment.amount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Comisión</p>
                  <p className="text-lg font-semibold text-red-600">-€{payment.commission_amount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Importe neto</p>
                  <p className="text-lg font-semibold text-green-600">€{payment.net_amount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Método</p>
                  <p className="text-lg font-semibold capitalize">{payment.payment_method}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-500">Fecha de pago</p>
                  <p>{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : "Pendiente"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Referencia</p>
                  <p>{payment.reference_number || "N/A"}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Canal</p>
                  <p>{payment.booking?.booking_source}</p>
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
  bookings,
  onClose,
  onSave,
}: {
  payment: BookingPayment | null
  bookings: Booking[]
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    booking_id: "",
    payment_type: "deposit",
    amount: 0,
    commission_amount: 0,
    net_amount: 0,
    payment_method: "card",
    payment_status: "pending",
    payment_date: "",
    reference_number: "",
    notes: "",
  })

  useEffect(() => {
    if (payment) {
      setFormData({
        booking_id: payment.booking_id,
        payment_type: payment.payment_type,
        amount: payment.amount,
        commission_amount: payment.commission_amount,
        net_amount: payment.net_amount,
        payment_method: payment.payment_method,
        payment_status: payment.payment_status,
        payment_date: payment.payment_date || "",
        reference_number: payment.reference_number || "",
        notes: payment.notes || "",
      })
    } else {
      setFormData({
        booking_id: "",
        payment_type: "deposit",
        amount: 0,
        commission_amount: 0,
        net_amount: 0,
        payment_method: "card",
        payment_status: "pending",
        payment_date: "",
        reference_number: "",
        notes: "",
      })
    }
  }, [payment])

  // Calculate commission and net amount when amount or booking changes
  useEffect(() => {
    if (formData.booking_id && formData.amount > 0) {
      const selectedBooking = bookings.find((b) => b.id === formData.booking_id)
      if (selectedBooking) {
        const commissionRate = selectedBooking.commission_rate || 0
        const commissionAmount = (formData.amount * commissionRate) / 100
        const netAmount = formData.amount - commissionAmount

        setFormData((prev) => ({
          ...prev,
          commission_amount: Number.parseFloat(commissionAmount.toFixed(2)),
          net_amount: Number.parseFloat(netAmount.toFixed(2)),
        }))
      }
    }
  }, [formData.booking_id, formData.amount, bookings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isDemoMode) {
        alert(payment ? "Pago actualizado (Demo)" : "Pago creado (Demo)")
        onSave()
        onClose()
        return
      }

      if (payment) {
        const { error } = await supabase.from("booking_payments").update(formData).eq("id", payment.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("booking_payments").insert([formData])

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
        <DialogDescription>{payment ? "Modifica los datos del pago" : "Registra un nuevo pago"}</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="booking_id">Reserva</Label>
          <Select
            value={formData.booking_id}
            onValueChange={(value) => setFormData({ ...formData, booking_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una reserva" />
            </SelectTrigger>
            <SelectContent>
              {bookings.map((booking) => (
                <SelectItem key={booking.id} value={booking.id}>
                  {booking.guest?.first_name} {booking.guest?.last_name} - {booking.property?.name} (€
                  {booking.total_amount})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="payment_type">Tipo de pago</Label>
            <Select
              value={formData.payment_type}
              onValueChange={(value) => setFormData({ ...formData, payment_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deposit">Depósito</SelectItem>
                <SelectItem value="balance">Saldo</SelectItem>
                <SelectItem value="refund">Reembolso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment_method">Método de pago</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="card">Tarjeta</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Importe bruto (€)</Label>
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
          <div className="space-y-2">
            <Label htmlFor="commission_amount">Comisión (€)</Label>
            <Input
              id="commission_amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.commission_amount}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="net_amount">Importe neto (€)</Label>
            <Input
              id="net_amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.net_amount}
              readOnly
              className="bg-gray-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="payment_status">Estado</Label>
            <Select
              value={formData.payment_status}
              onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
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
          <div className="space-y-2">
            <Label htmlFor="payment_date">Fecha de pago</Label>
            <Input
              id="payment_date"
              type="date"
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reference_number">Número de referencia</Label>
          <Input
            id="reference_number"
            value={formData.reference_number}
            onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
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
