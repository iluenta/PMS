"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { supabase, isDemoMode, mockData, type Guest } from "@/lib/supabase"
import { Users, Plus, Edit, Mail, Phone, MapPin, User } from "lucide-react"

export default function Guests() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchGuests()
  }, [])

  const fetchGuests = async () => {
    try {
      if (isDemoMode) {
        setGuests(mockData.guests)
        return
      }

      const { data, error } = await supabase.from("guests").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setGuests(data || [])
    } catch (error) {
      console.error("Error fetching guests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingGuest(null)
    setIsDialogOpen(true)
  }

  const filteredGuests = guests.filter(
    (guest) =>
      `${guest.first_name} ${guest.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
          <h1 className="text-3xl font-bold text-gray-900">Huéspedes</h1>
          <p className="mt-2 text-gray-600">Gestiona la información de tus huéspedes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Huésped
            </Button>
          </DialogTrigger>
          <GuestDialog guest={editingGuest} onClose={() => setIsDialogOpen(false)} onSave={fetchGuests} />
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar huéspedes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredGuests.map((guest) => (
          <Card key={guest.id}>
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg">
                    {guest.first_name} {guest.last_name}
                  </CardTitle>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {guest.country}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="truncate">{guest.email}</span>
                </div>
                {guest.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{guest.phone}</span>
                  </div>
                )}
                {guest.notes && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-1">Notas:</p>
                    <p className="text-xs bg-gray-50 p-2 rounded line-clamp-2">{guest.notes}</p>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Registrado: {new Date(guest.created_at).toLocaleDateString()}
                </span>
                <Button variant="outline" size="sm" onClick={() => handleEdit(guest)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGuests.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No se encontraron huéspedes" : "No hay huéspedes"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? "Intenta con otros términos de búsqueda"
                : "Los huéspedes aparecerán aquí cuando realicen reservas"}
            </p>
            {!searchTerm && (
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Huésped
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function GuestDialog({
  guest,
  onClose,
  onSave,
}: {
  guest: Guest | null
  onClose: () => void
  onSave: () => void
}) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    country: "",
    date_of_birth: "",
    id_number: "",
    notes: "",
  })

  useEffect(() => {
    if (guest) {
      setFormData({
        first_name: guest.first_name,
        last_name: guest.last_name,
        email: guest.email,
        phone: guest.phone || "",
        country: guest.country || "",
        date_of_birth: guest.date_of_birth || "",
        id_number: guest.id_number || "",
        notes: guest.notes || "",
      })
    } else {
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        country: "",
        date_of_birth: "",
        id_number: "",
        notes: "",
      })
    }
  }, [guest])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (isDemoMode) {
        alert(guest ? "Huésped actualizado (Demo)" : "Huésped creado (Demo)")
        onSave()
        onClose()
        return
      }

      if (guest) {
        const { error } = await supabase.from("guests").update(formData).eq("id", guest.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("guests").insert([formData])

        if (error) throw error
      }

      onSave()
      onClose()
    } catch (error) {
      console.error("Error saving guest:", error)
    }
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{guest ? "Editar Huésped" : "Nuevo Huésped"}</DialogTitle>
        <DialogDescription>{guest ? "Modifica los datos del huésped" : "Agrega un nuevo huésped"}</DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">Nombre</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Apellidos</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Fecha de nacimiento</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="id_number">Documento de identidad</Label>
            <Input
              id="id_number"
              value={formData.id_number}
              onChange={(e) => setFormData({ ...formData, id_number: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notas</Label>
          <Input
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Información adicional sobre el huésped..."
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">{guest ? "Actualizar" : "Crear"} Huésped</Button>
        </div>
      </form>
    </DialogContent>
  )
}
