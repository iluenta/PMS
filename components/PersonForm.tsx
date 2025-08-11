"use client"

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { CreatePersonInput, Person, PersonType, UpdatePersonInput } from '@/types/people'
import { createPerson, updatePerson } from '@/lib/peopleService'

interface Props {
  person?: Person | null
  onClose: () => void
  onSaved: () => void
}

export default function PersonForm({ person, onClose, onSaved }: Props) {
  const normalizeType = (t: string | undefined): PersonType => {
    const v = (t || '').toLowerCase()
    if (v === 'guest' || v === 'provider' || v === 'distribution_channel' || v === 'other') return v as PersonType
    return 'other'
  }
  const [formData, setFormData] = useState<CreatePersonInput>({
    person_type: 'guest',
    first_name: '',
    last_name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    fiscal_id_type: '',
    fiscal_id: '',
    notes: '',
  })
  const isEditing = !!person

  useEffect(() => {
    if (person) {
      const { id: _id, created_at: _c, updated_at: _u, ...rest } = person
      const person_type = normalizeType((person as any).person_type as string)
      // Asegurar que el tipo normalizado prevalece
      setFormData({ ...(rest as UpdatePersonInput), person_type })
    }
  }, [person])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.company_name && !formData.first_name) {
      alert('Nombre o empresa es obligatorio')
      return
    }
    try {
      if (isEditing && person) {
        await updatePerson(person.id, formData)
      } else {
        await createPerson(formData)
      }
      onSaved()
      onClose()
    } catch (err: any) {
      alert(err?.message || 'No se pudo guardar')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select
            key={`person-type-${formData.person_type ?? 'none'}`}
            value={formData.person_type ?? undefined}
            onValueChange={(v) => setFormData(prev => ({ ...prev, person_type: v as PersonType }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="guest">Huésped</SelectItem>
              <SelectItem value="provider">Proveedor</SelectItem>
              <SelectItem value="distribution_channel">Canal distribución</SelectItem>
              <SelectItem value="other">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nombre</Label>
          <Input value={formData.first_name || ''} onChange={e => setFormData(prev => ({ ...prev, first_name: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Apellidos</Label>
          <Input value={formData.last_name || ''} onChange={e => setFormData(prev => ({ ...prev, last_name: e.target.value }))} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Empresa</Label>
        <Input value={formData.company_name || ''} onChange={e => setFormData(prev => ({ ...prev, company_name: e.target.value }))} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input type="email" value={formData.email || ''} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Teléfono</Label>
          <Input value={formData.phone || ''} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>País</Label>
          <Input value={formData.country || ''} onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Provincia/Estado</Label>
          <Input value={formData.state || ''} onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Código Postal</Label>
          <Input value={formData.postal_code || ''} onChange={e => setFormData(prev => ({ ...prev, postal_code: e.target.value }))} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Dirección</Label>
        <Input value={formData.address || ''} onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo documento fiscal</Label>
          <Input value={formData.fiscal_id_type || ''} onChange={e => setFormData(prev => ({ ...prev, fiscal_id_type: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label>Número fiscal</Label>
          <Input value={formData.fiscal_id || ''} onChange={e => setFormData(prev => ({ ...prev, fiscal_id: e.target.value }))} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notas</Label>
        <Textarea rows={3} value={formData.notes || ''} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit">{isEditing ? 'Actualizar' : 'Crear'}</Button>
      </div>
    </form>
  )
}


