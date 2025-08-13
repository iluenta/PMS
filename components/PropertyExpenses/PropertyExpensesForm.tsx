import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProviderPicker } from "@/components/people/ProviderPicker"
import { Receipt, Building2, Users, DollarSign, FileText, Paperclip } from "lucide-react"
import type { Expense, Reservation } from "@/lib/supabase"
import type { ExpenseCategory, ExpenseSubcategory } from "@/types/expenses"
import type { DocumentMeta } from "@/types/documents"

interface PropertyExpensesFormProps {
  expense: Expense | null
  formData: {
    description: string
    amount: number
    date: string
    category: string
    subcategory: string
    payment_method: string
    status: string
    notes: string
    reservation_id: string
    vendor: string
    vendor_id: string
  }
  setFormData: (data: any) => void
  categories: ExpenseCategory[]
  subcategories: ExpenseSubcategory[]
  reservations: Reservation[]
  documents: DocumentMeta[]
  uploading: boolean
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDownload: (path: string) => void
  onDeleteDocument: (docId: string) => void
  formatGuestName: (reservation: any) => string
}

export default function PropertyExpensesForm({
  expense,
  formData,
  setFormData,
  categories,
  subcategories,
  reservations,
  documents,
  uploading,
  onSubmit,
  onClose,
  onUpload,
  onDownload,
  onDeleteDocument,
  formatGuestName,
}: PropertyExpensesFormProps) {
  // Subcategorías visibles según categoría seleccionada
  const filteredSubcategories = formData.category 
    ? subcategories.filter(sub => sub.category_id === formData.category)
    : subcategories

  // Reserva seleccionada
  const selectedReservation = reservations.find(r => r.id === formData.reservation_id)

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Primera fila: Información básica */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-blue-600" />
          Información del Gasto
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Descripción <span className="text-red-500">*</span>
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción del gasto..."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
              Importe (€) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium text-gray-700">
              Fecha <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium text-gray-700">
              Categoría <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: "" })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subcategory" className="text-sm font-medium text-gray-700">
              Subcategoría
            </Label>
            <Select 
              value={formData.subcategory} 
              onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
              disabled={!formData.category}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una subcategoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin subcategoría</SelectItem>
                {filteredSubcategories.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="payment_method" className="text-sm font-medium text-gray-700">
              Método de pago <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
              Estado <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="approved">Aprobado</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="rejected">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Segunda fila: Proveedor y Reserva */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-green-600" />
          Proveedor y Reserva
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Proveedor */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Proveedor <span className="text-red-500">*</span>
              </Label>
              <ProviderPicker
                value={{ name: formData.vendor, personId: formData.vendor_id }}
                onChange={(val) => setFormData({ ...formData, vendor: val.name, vendor_id: val.personId || "" })}
              />
            </div>
          </div>

          {/* Reserva asociada */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reservation" className="text-sm font-medium text-gray-700">
                Reserva asociada
              </Label>
              <Select value={formData.reservation_id} onValueChange={(value) => setFormData({ ...formData, reservation_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una reserva (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin reserva asociada</SelectItem>
                  {reservations.map((reservation) => (
                    <SelectItem key={reservation.id} value={reservation.id}>
                      {formatGuestName(reservation)} - {new Date(reservation.check_in).toLocaleDateString('es-ES')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Información de la reserva seleccionada */}
            {selectedReservation && (
              <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Información de la reserva:</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Huésped:</strong> {formatGuestName(selectedReservation)}</p>
                  <p><strong>Check-in:</strong> {new Date(selectedReservation.check_in).toLocaleDateString('es-ES')}</p>
                  <p><strong>Check-out:</strong> {new Date(selectedReservation.check_out).toLocaleDateString('es-ES')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Cuarta fila: Notas */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-600" />
          Notas
        </h3>
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notas adicionales</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notas adicionales sobre el gasto..."
            rows={3}
          />
        </div>
      </div>

      {/* Quinta fila: Documentos */}
      {expense?.id && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Paperclip className="h-5 w-5 text-orange-600" />
            Documentos
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-gray-600">Adjunta justificantes en PDF o imagen (máx. 10MB)</p>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg"
                  onChange={onUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${uploading ? "bg-gray-200 text-gray-500" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                  <Paperclip className="h-4 w-4" />
                  {uploading ? "Subiendo..." : "Subir documento"}
                </span>
              </label>
            </div>

            {documents.length === 0 ? (
              <p className="text-sm text-gray-600">No hay documentos adjuntos</p>
            ) : (
              <ul className="divide-y divide-gray-100 rounded-md border border-gray-100">
                {documents.map(doc => (
                  <li key={doc.id} className="flex items-center justify-between gap-3 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.original_name}</p>
                        <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => onDownload(doc.storage_path)} 
                        className="rounded-xl"
                      >
                        Descargar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onDeleteDocument(doc.id)} 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          {expense ? "Actualizar" : "Crear"} Gasto
        </Button>
      </div>
    </form>
  )
}
