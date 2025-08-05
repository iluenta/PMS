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
import { CreditCard, Plus, Edit, CheckCircle, Clock, AlertCircle, DollarSign, Building, Trash2 } from "lucide-react"

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    if (selectedPropertyId) {
      fetchReservations(selectedPropertyId)
      fetchPayments(selectedPropertyId)
      const property = properties.find(p => p.id === selectedPropertyId)
      setSelectedProperty(property || null)
    } else {
      setReservations([])
      setPayments([])
      setSelectedProperty(null)
    }
  }, [selectedPropertyId, properties])

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("is_active", true)
        .order("name")

      if (error) throw error
      setProperties(data || [])
    } catch (error) {
      console.error("Error fetching properties:", error)
    }
  }

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
      
      // Obtengo todos los pagos sin filtro por ahora
      const { data: allPayments, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .order("date", { ascending: false })

      if (paymentsError) {
        console.error("❌ Error fetching payments:", paymentsError)
        throw paymentsError
      }

      console.log("📊 Total payments found:", allPayments?.length || 0)
      console.log("📋 Sample payments:", allPayments?.slice(0, 3))

      // Por ahora, mostrar todos los pagos para debuggear
      setPayments(allPayments || [])
    } catch (error) {
      console.error("❌ Error fetching payments:", error)
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
      if (selectedPropertyId) {
        await fetchPayments(selectedPropertyId)
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

      {/* Selector de Propiedad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Seleccionar Propiedad
          </CardTitle>
          <CardDescription>
            Elige una propiedad para gestionar sus pagos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="property-select">Propiedad</Label>
            <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
              <SelectTrigger className="w-full md:w-80">
                <SelectValue placeholder="Selecciona una propiedad" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProperty && (
              <div className="text-sm text-gray-600 mt-2">
                <strong>Propiedad seleccionada:</strong> {selectedProperty.name}
                {selectedProperty.address && (
                  <span className="block text-xs text-gray-500">
                    {selectedProperty.address}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pagos */}
      {selectedPropertyId && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Pagos de {selectedProperty?.name}</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAdd} disabled={!selectedPropertyId}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Pago
                </Button>
              </DialogTrigger>
              <PaymentDialog
                payment={editingPayment}
                propertyId={selectedPropertyId}
                reservations={reservations}
                getReservationPaymentProgress={getReservationPaymentProgress}
                onClose={() => setIsDialogOpen(false)}
                onSave={() => fetchPayments(selectedPropertyId)}
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
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay pagos</h3>
                <p className="text-gray-500 mb-4">Los pagos de esta propiedad aparecerán aquí</p>
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Pago
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {payments.map((payment) => (
                <Card key={payment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                        <div>
                          <CardTitle className="text-base">
                            €{payment.amount.toFixed(2)}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {payment.customer_name}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge className={getStatusColor(payment.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(payment.status)}
                            <span className="capitalize text-xs">{payment.status}</span>
                          </div>
                        </Badge>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(payment)}>
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(payment)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Método:</span>
                        <span className="font-medium">{getMethodLabel(payment.method)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fecha:</span>
                        <span className="font-medium">{new Date(payment.date).toLocaleDateString()}</span>
                      </div>
                      {payment.reference && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Ref:</span>
                          <span className="font-medium">{payment.reference}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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

  // Función para obtener reservas no pagadas al 100%
  const getUnpaidReservations = () => {
    return reservations.filter(reservation => {
      const progress = getReservationPaymentProgress(reservation.id)
      return progress.percentage < 100
    })
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
    if (payment) {
      setFormData({
        customer_name: payment.customer_name,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        date: payment.date.split('T')[0],
        reference: payment.reference || "",
        notes: payment.notes || "",
        fee: payment.fee || 0,
        reservation_id: payment.reservation_id || "no_reservation",
      })
    }
  }, [payment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
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
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number.parseFloat(e.target.value) })}
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
              value={formData.fee}
              onChange={(e) => setFormData({ ...formData, fee: Number.parseFloat(e.target.value) })}
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