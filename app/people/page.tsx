"use client"

import { useEffect, useMemo, useState } from 'react'
import { Layout } from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, UserSquare2, Users, Building2, Truck, User, Search, Mail, Phone } from 'lucide-react'
import type { Person, PersonType } from '@/types/people'
import { listPeople, deletePerson } from '@/lib/peopleService'
import PersonForm from '@/components/PersonForm'

const PERSON_TYPE_CONFIG = {
  guest: {
    label: 'Huéspedes',
    icon: Users,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Personas que se hospedan en las propiedades'
  },
  provider: {
    label: 'Proveedores',
    icon: Building2,
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Empresas y personas que proveen servicios'
  },
  distribution_channel: {
    label: 'Canales de Distribución',
    icon: Truck,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Plataformas y canales de venta'
  },
  other: {
    label: 'Otros',
    icon: User,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Otros tipos de personas'
  }
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<PersonType>('guest')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await listPeople({ person_type: activeTab })
        setPeople(data)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [activeTab])

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
    const data = await listPeople({ person_type: activeTab })
    setPeople(data)
  }

  const getPersonDisplayName = (person: Person) => {
    if (person.company_name) {
      return person.company_name
    }
    const fullName = `${person.first_name || ''} ${person.last_name || ''}`.trim()
    return fullName || 'Sin nombre'
  }

  const getPersonSubtitle = (person: Person) => {
    if (person.company_name && (person.first_name || person.last_name)) {
      return `${person.first_name || ''} ${person.last_name || ''}`.trim()
    }
    return null
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
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
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingPerson ? 'Editar persona' : 'Nueva persona'}</DialogTitle>
              </DialogHeader>
              <PersonForm
                person={editingPerson}
                onClose={() => setIsDialogOpen(false)}
                onSaved={async () => {
                  const data = await listPeople({ person_type: activeTab })
                  setPeople(data)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <Label htmlFor="search" className="sr-only">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre, empresa o email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PersonType)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {Object.entries(PERSON_TYPE_CONFIG).map(([type, config]) => {
              const IconComponent = config.icon
              return (
                <TabsTrigger key={type} value={type} className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4" />
                  {config.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {Object.entries(PERSON_TYPE_CONFIG).map(([type, config]) => {
            const IconComponent = config.icon
            const typePeople = people.filter(p => p.person_type === type)
            const filteredTypePeople = filtered.filter(p => p.person_type === type)
            
            return (
              <TabsContent key={type} value={type} className="space-y-4">
                {/* Tab Header */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{config.label}</h2>
                    <p className="text-sm text-gray-600">{config.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {filteredTypePeople.length} de {typePeople.length} personas
                    </p>
                  </div>
                </div>

                {/* People Cards Grid */}
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredTypePeople.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="text-gray-400 mb-4">
                      <IconComponent className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {search ? 'No se encontraron resultados' : 'No hay personas'}
                    </h3>
                    <p className="text-gray-500">
                      {search 
                        ? 'Intenta con otros términos de búsqueda'
                        : `No hay ${config.label.toLowerCase()} registrados aún`
                      }
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTypePeople.map(person => (
                      <Card key={person.id} className="hover:shadow-md transition-shadow duration-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                                {getPersonDisplayName(person)}
                              </CardTitle>
                              {getPersonSubtitle(person) && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {getPersonSubtitle(person)}
                                </p>
                              )}
                            </div>
                            <Badge className={`${config.color} text-xs font-medium`}>
                              {config.label}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Contact Info */}
                          <div className="space-y-2">
                            {person.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="truncate">{person.email}</span>
                              </div>
                            )}
                            {person.phone && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{person.phone}</span>
                              </div>
                            )}
                          </div>

                          {/* Location Info */}
                          {(person.city || person.country) && (
                            <div className="text-xs text-gray-500">
                              {[person.city, person.country].filter(Boolean).join(', ')}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-2 border-t border-gray-100">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setEditingPerson(person); setIsDialogOpen(true) }}
                              className="flex-1 h-8 text-xs border-blue-600 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(person)}
                              className="flex-1 h-8 text-xs border-red-600 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </Layout>
  )
}


