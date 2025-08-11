"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, UserSquare2 } from 'lucide-react'
import type { Person, PersonType } from '@/types/people'
import { listPeople, deletePerson } from '@/lib/peopleService'

function getTypeColor(type: PersonType) {
  switch (type) {
    case 'guest':
      return 'bg-blue-100 text-blue-800'
    case 'provider':
      return 'bg-green-100 text-green-800'
    case 'distribution_channel':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<PersonType | 'all'>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await listPeople(typeFilter === 'all' ? undefined : { person_type: typeFilter })
        setPeople(data)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [typeFilter])

  const filtered = useMemo(() => {
    if (!search.trim()) return people
    const s = search.toLowerCase().trim()
    return people.filter(p => {
      const name = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase()
      const company = (p.company_name || '').toLowerCase()
      const email = (p.email || '').toLowerCase()
      return name.includes(s) || company.includes(s) || email.includes(s)
    })
  }, [people, search])

  const handleDelete = async (person: Person) => {
    const ok = confirm('¿Eliminar esta persona?')
    if (!ok) return
    await deletePerson(person.id)
    const data = await listPeople(typeFilter === 'all' ? undefined : { person_type: typeFilter })
    setPeople(data)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserSquare2 className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Personas</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingPerson(null); setIsDialogOpen(true) }}>
              <Plus className="h-4 w-4 mr-2" /> Nueva persona
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingPerson ? 'Editar persona' : 'Nueva persona'}</DialogTitle>
            </DialogHeader>
            {/* Paso 5 implementará <PersonForm />. Por ahora, placeholder visual. */}
            <div className="text-sm text-gray-600">
              El formulario de creación/edición se añadirá en el Paso 5.
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Buscar</Label>
            <Input placeholder="Nombre, empresa o email" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as PersonType | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="guest">Huésped</SelectItem>
                <SelectItem value="provider">Proveedor</SelectItem>
                <SelectItem value="distribution_channel">Canal distribución</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="rounded-xl border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4 py-3">Tipo</TableHead>
              <TableHead className="px-4 py-3">Nombre / Empresa</TableHead>
              <TableHead className="px-4 py-3 hidden md:table-cell">Email</TableHead>
              <TableHead className="px-4 py-3 hidden md:table-cell">Teléfono</TableHead>
              <TableHead className="px-4 py-3 hidden lg:table-cell">País</TableHead>
              <TableHead className="px-4 py-3 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell className="px-4 py-6" colSpan={6}>Cargando…</TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-6" colSpan={6}>No hay personas</TableCell>
              </TableRow>
            ) : (
              filtered.map(person => (
                <TableRow key={person.id} className="odd:bg-muted/30 hover:bg-muted">
                  <TableCell className="px-4 py-3 align-top">
                    <Badge className={`${getTypeColor(person.person_type)} rounded-full capitalize`}>
                      {person.person_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top">
                    <div className="font-medium text-gray-900">
                      {person.company_name || `${person.first_name || ''} ${person.last_name || ''}`.trim() || '—'}
                    </div>
                    <div className="md:hidden text-xs text-gray-500 mt-1">
                      {person.email || ''}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 align-top hidden md:table-cell">{person.email || '—'}</TableCell>
                  <TableCell className="px-4 py-3 align-top hidden md:table-cell">{person.phone || '—'}</TableCell>
                  <TableCell className="px-4 py-3 align-top hidden lg:table-cell">{person.country || '—'}</TableCell>
                  <TableCell className="px-4 py-3 align-top">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setEditingPerson(person); setIsDialogOpen(true) }}
                        className="h-8 px-2"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(person)}
                        className="h-8 px-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}


