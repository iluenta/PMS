"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase, type Booking, type Property, type Guest, isDemoMode, mockData } from "@/lib/supabase"
import { Calendar, Plus, Edit, Building2, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      if (isDemoMode) {
        const mockBookingsWithRelations = mockData.bookings.map((booking) => ({
          ...booking,
          property: mockData.properties.find((p) => p.id === booking.property_id),
          guest: mockData.guests.find((g) => g.id === booking.guest_id),
        }))

        setBookings(mockBookingsWithRelations)
        setProperties(mockData.properties)
        setGuests(mockData.guests)
        return
      }

      // Fetch bookings with related data
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select(`
          *,
          property:properties(*),
          guest:guests(*)
        `)
        .order("created_at", { ascending: false })

      // Fetch properties for the form
      const { data: propertiesData } = await supabase.from("properties").select("*").eq("status", "active")

      // Fetch guests for the form
      const { data: guestsData } = await supabase.from("guests").select("*")

      if (bookingsData) setBookings(bookingsData)
      if (propertiesData) setProperties(propertiesData)
      if (guestsData) setGuests(guestsData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingBooking(null)
    setIsDialogOpen(true)
  }

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
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
          <h1 className="text-3xl font-bold text-gray-900">Reservas</h1>
          <p className="mt-2 text-gray-600">Gestiona todas las reservas de tus propiedades</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Reserva
            </Button>
          </DialogTrigger>
          <BookingDialog
            booking={editingBooking}
            properties={properties}
            guests={guests}
            onClose={() => setIsDialogOpen(false)}
            onSave={fetchData}
          />
        </Dialog>
      </div>

      <div className="grid gap-6">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">
                      {booking.guest?.first_name} {booking.guest?.last_name}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Building2 className="h-4 w-4 mr-1" />
                      {booking.property?.name}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(booking.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(booking.status)}
                      <span className="capitalize">{booking.status}</span>
                    </div>
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(booking)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Check-in</p>
                  <p className="text-lg font-semibold">
                    {new Date(booking.check_in).toLocaleDateString("es-ES", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Check-out</p>
                  <p className="text-lg font-semibold">
                    {new Date(booking.check_out).toLocaleDateString("es-ES", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Duración</p>
                  <p className="text-lg font-semibold">{calculateNights(booking.check_in, booking.check_out)} noches</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="text-lg font-semibold text-green-600">€{booking.total_amount}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-500">Huéspedes</p>
                  <p>{booking.guests_count} personas</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Canal</p>
                  <p>{booking.booking_source}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Contacto</p>
                  <p>{booking.guest?.email}</p>
                </div>
              </div>

              {booking.special_requests && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 mb-1">Solicitudes especiales</p>
                  <p className="text-sm text-gray-700">{booking.special_requests}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {bookings.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reservas</h3>
            <p className="text-gray-500 mb-4">Las reservas aparecerán aquí cuando las recibas</p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Reserva
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function BookingDialog({
  booking,
  properties,
  guests,
  onClose,
  onSave,
}: {
  booking: Booking | null
  properties: Property[]
  guests: Guest[]
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    property_id: "",
    guest_id: "",
    check_in: "",
    check_out: "",
    guests_count: 1,
    total_amount: 0,
    status: "pending",
    booking_source: "Direct",
    special_requests: "",
  })

  useEffect(() => {
    if (booking) {
      setFormData({
        property_id: booking.property_id,
        guest_id: booking.guest_id,
        check_in: booking.check_in,
        check_out: booking.check_out,
        guests_count: booking.guests_count || 1,
        total_amount: booking.total_amount || 0,
        status: booking.status || "pending",
        booking_source: booking.booking_source || "Direct",
        special_requests: booking.special_requests || "",
      })
    } else {
      setFormData({
        property_id: "",
        guest_id: "",
        check_in: "",
        check_out: "",
        guests_count: 1,
        total_amount: 0,
        status: "pending",
        booking_source: "Direct",
        special_requests: "",
      })
    }
  }, [booking])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isDemoMode) {
        alert(booking ? "Reserva actualizada (Demo)" : "Reserva creada (Demo)")
        onSave()
        onClose()
        return
      }

      if (booking) {
        const { error } = await supabase.from("bookings").update(formData).eq("id", booking.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("bookings").insert([formData])

        if (error) throw error
      }

      onSave()
      onClose()
    } catch (error) {
      console.error("Error saving booking:", error)
    }
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{booking ? "Editar Reserva" : "Nueva Reserva"}</DialogTitle>
        <DialogDescription>{booking ? "Modifica los datos de la reserva" : "Crea una nueva reserva"}</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="property_id">Propiedad</Label>
            <Select
              value={formData.property_id}
              onValueChange={(value) => setFormData({ ...formData, property_id: value })}
            >
              <SelectTrigger>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="guest_id">Huésped</Label>
            <Select value={formData.guest_id} onValueChange={(value) => setFormData({ ...formData, guest_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un huésped" />
              </SelectTrigger>
              <SelectContent>
                {guests.map((guest) => (
                  <SelectItem key={guest.id} value={guest.id}>
                    {guest.first_name} {guest.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="check_in">Check-in</Label>
            <Input
              id="check_in"
              type="date"
              value={formData.check_in}
              onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="check_out">Check-out</Label>
            <Input
              id="check_out"
              type="date"
              value={formData.check_out}
              onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guests_count">Huéspedes</Label>
            <Input
              id="guests_count"
              type="number"
              min="1"
              value={formData.guests_count}
              onChange={(e) => setFormData({ ...formData, guests_count: Number.parseInt(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total_amount">Total (€)</Label>
            <Input
              id="total_amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.total_amount}
              onChange={(e) => setFormData({ ...formData, total_amount: Number.parseFloat(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="confirmed">Confirmada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="booking_source">Canal de reserva</Label>
          <Select
            value={formData.booking_source}
            onValueChange={(value) => setFormData({ ...formData, booking_source: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Direct">Directo</SelectItem>
              <SelectItem value="Booking.com">Booking.com</SelectItem>
              <SelectItem value="Airbnb">Airbnb</SelectItem>
              <SelectItem value="Expedia">Expedia</SelectItem>
              <SelectItem value="VRBO">VRBO</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="special_requests">Solicitudes especiales</Label>
          <Input
            id="special_requests"
            value={formData.special_requests}
            onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
            placeholder="Solicitudes del huésped..."
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{booking ? "Actualizar" : "Crear"} Reserva</Button>
        </div>
      </form>
    </DialogContent>
  )
}
