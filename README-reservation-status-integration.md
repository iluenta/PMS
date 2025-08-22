# Integración de Estados de Reserva con Settings

## 🎯 Objetivo

Conectar el estado de la reserva con la tabla `settings` usando la clave `reservation_statuses`, permitiendo que los estados se configuren dinámicamente desde la base de datos en lugar de estar hardcodeados.

## 🗄️ Estructura de la Base de Datos

### Tabla Settings
```sql
-- La configuración reservation_statuses se almacena como:
{
  "key": "reservation_statuses",
  "config_type": "colored_list",
  "value": [
    {"name": "Pendiente", "color": "#fbbf24"},
    {"name": "Confirmada", "color": "#34d399"},
    {"name": "Cancelada", "color": "#f87171"},
    {"name": "Completada", "color": "#60a5fa"}
  ]
}
```

## 🔧 Componentes Disponibles

### 1. ReservationStatusBadge
Muestra el estado como un badge con el color correspondiente.

```tsx
import { ReservationStatusBadge } from '@/components/ui/reservation-status'

// Uso básico
<ReservationStatusBadge statusName="Confirmada" />

// Con icono
<ReservationStatusBadge statusName="Pendiente" showIcon />
```

### 2. ReservationStatusColor
Muestra solo el indicador de color del estado.

```tsx
import { ReservationStatusColor } from '@/components/ui/reservation-status'

<ReservationStatusColor statusName="Cancelada" className="w-4 h-4" />
```

### 3. ReservationStatusSelect
Select avanzado con popover y búsqueda.

```tsx
import { ReservationStatusSelect } from '@/components/ui/reservation-status'

<ReservationStatusSelect
  value={selectedStatus}
  onValueChange={setSelectedStatus}
  placeholder="Seleccionar estado..."
/>
```

### 4. ReservationStatusSelectSimple
Select simple para formularios básicos.

```tsx
import { ReservationStatusSelectSimple } from '@/components/ui/reservation-status'

<ReservationStatusSelectSimple
  value={selectedStatus}
  onValueChange={setSelectedStatus}
  placeholder="Seleccionar estado..."
/>
```

## 🪝 Hooks Disponibles

### 1. useReservationStatuses
Hook principal para obtener todos los estados de reserva.

```tsx
import { useReservationStatuses } from '@/hooks/useReservationStatuses'

function MyComponent() {
  const { statuses, loading, error, refreshStatuses } = useReservationStatuses()

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {statuses.map(status => (
        <div key={status.name} style={{ color: status.color }}>
          {status.name}
        </div>
      ))}
    </div>
  )
}
```

### 2. useReservationStatusByName
Hook para obtener un estado específico por nombre.

```tsx
import { useReservationStatusByName } from '@/hooks/useReservationStatuses'

function StatusDisplay({ statusName }: { statusName: string }) {
  const { status, loading, error } = useReservationStatusByName(statusName)

  if (loading) return <div>Cargando...</div>
  if (error || !status) return <div>Estado no encontrado</div>

  return (
    <div style={{ backgroundColor: status.color, color: 'white' }}>
      {status.name}
    </div>
  )
}
```

## 🚀 Funciones de Utilidad

### 1. getReservationStatuses()
```tsx
import { getReservationStatuses } from '@/lib/settings'

// Obtener estados de forma síncrona
const statuses = await getReservationStatuses()
```

### 2. getReservationStatusByName()
```tsx
import { getReservationStatusByName } from '@/lib/settings'

// Obtener estado específico
const status = await getReservationStatusByName('Confirmada')
```

### 3. isValidReservationStatus()
```tsx
import { isValidReservationStatus } from '@/lib/settings'

// Validar si un estado existe
const isValid = await isValidReservationStatus('Confirmada')
```

## 📝 Ejemplo de Implementación Completa

### Formulario de Reserva
```tsx
import { useState } from 'react'
import { ReservationStatusSelect } from '@/components/ui/reservation-status'
import { ReservationStatusBadge } from '@/components/ui/reservation-status'

export function ReservationForm() {
  const [status, setStatus] = useState('')

  return (
    <form className="space-y-4">
      <div>
        <label>Estado de la Reserva</label>
        <ReservationStatusSelect
          value={status}
          onValueChange={setStatus}
          placeholder="Seleccionar estado..."
        />
      </div>

      {status && (
        <div>
          <label>Estado Seleccionado:</label>
          <ReservationStatusBadge statusName={status} showIcon />
        </div>
      )}

      <button type="submit">Guardar Reserva</button>
    </form>
  )
}
```

### Tabla de Reservas
```tsx
import { ReservationStatusBadge } from '@/components/ui/reservation-status'

export function ReservationsTable({ reservations }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Estado</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        {reservations.map(reservation => (
          <tr key={reservation.id}>
            <td>{reservation.clientName}</td>
            <td>
              <ReservationStatusBadge 
                statusName={reservation.status} 
                showIcon 
              />
            </td>
            <td>{reservation.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

## 🔄 Flujo de Datos

```
1. Componente se monta
   ↓
2. Hook useReservationStatuses se ejecuta
   ↓
3. Función getReservationStatuses() se llama
   ↓
4. Se consulta la tabla settings con key='reservation_statuses'
   ↓
5. Se parsea el JSONB value
   ↓
6. Se retornan los estados con colores
   ↓
7. Componente se renderiza con los datos
```

## 🛡️ Manejo de Errores

### Fallback Automático
Si no se puede cargar la configuración, se usan valores por defecto:

```tsx
// Valores por defecto si falla la carga
const defaultStatuses = [
  { name: 'Pendiente', color: '#fbbf24' },
  { name: 'Confirmada', color: '#34d399' },
  { name: 'Cancelada', color: '#f87171' },
  { name: 'Completada', color: '#60a5fa' }
]
```

### Estados de Carga
- **Loading**: Muestra indicador de carga
- **Error**: Muestra mensaje de error con fallback
- **Success**: Muestra los estados cargados

## 🎨 Personalización de Colores

### Cambiar Colores
Para cambiar los colores, modifica la configuración en la tabla `settings`:

```sql
UPDATE public.settings 
SET value = '[
  {"name": "Pendiente", "color": "#ff6b6b"},
  {"name": "Confirmada", "color": "#51cf66"},
  {"name": "Cancelada", "color": "#ff922b"},
  {"name": "Completada", "color": "#339af0"}
]'::jsonb
WHERE key = 'reservation_statuses';
```

### Agregar Nuevos Estados
```sql
UPDATE public.settings 
SET value = jsonb_array_append(
  value, 
  '{"name": "En Revisión", "color": "#fcc419"}'
)
WHERE key = 'reservation_statuses';
```

## 🔧 Configuración Inicial

### 1. Ejecutar Script SQL
```sql
-- Ejecutar scripts/63-complete-simple-settings-setup.sql
-- Esto crea la tabla settings con datos de ejemplo
```

### 2. Verificar Configuración
```sql
-- Verificar que reservation_statuses existe
SELECT * FROM public.settings WHERE key = 'reservation_statuses';
```

### 3. Importar Componentes
```tsx
// En tu componente
import { 
  ReservationStatusSelect, 
  ReservationStatusBadge 
} from '@/components/ui/reservation-status'
```

## 📱 Responsive Design

Los componentes están diseñados para ser responsive:

- **Mobile**: Select simple y badges compactos
- **Tablet**: Select con popover optimizado
- **Desktop**: Select avanzado con búsqueda completa

## 🧪 Testing

### Componentes de Prueba
```tsx
// components/examples/ReservationFormExample.tsx
// Muestra todos los componentes en acción
```

### Verificación de Funcionalidad
```sql
-- scripts/64-test-settings-functionality.sql
-- Prueba que todo funciona correctamente
```

## 🚀 Beneficios de la Integración

1. **Configuración Centralizada**: Todos los estados en una sola tabla
2. **Actualización en Tiempo Real**: Cambios se reflejan inmediatamente
3. **Consistencia Visual**: Colores uniformes en toda la aplicación
4. **Mantenimiento Fácil**: Modificar estados sin tocar código
5. **Fallback Inteligente**: Funciona incluso si falla la configuración
6. **Tipado Seguro**: TypeScript para prevenir errores
7. **Componentes Reutilizables**: Fácil de usar en cualquier parte

## 🔍 Troubleshooting

### Problema: Estados no se cargan
**Solución**: Verificar que la tabla `settings` existe y tiene datos

### Problema: Colores no se muestran
**Solución**: Verificar que el JSONB tiene el formato correcto

### Problema: Componente no se renderiza
**Solución**: Verificar que el hook se está ejecutando correctamente

### Problema: Error de permisos
**Solución**: Ejecutar el script de configuración RLS

## 📚 Recursos Adicionales

- [README-database-setup.md](./README-database-setup.md) - Configuración de base de datos
- [README-settings-configurations.md](./README-settings-configurations.md) - Configuraciones del sistema
- [scripts/63-complete-simple-settings-setup.sql](./scripts/63-complete-simple-settings-setup.sql) - Script de configuración
- [scripts/64-test-settings-functionality.sql](./scripts/64-test-settings-functionality.sql) - Script de pruebas

## 🎉 ¡Listo!

Con esta integración, los estados de reserva ahora:
- ✅ Se cargan dinámicamente desde la base de datos
- ✅ Tienen colores configurables
- ✅ Se actualizan en tiempo real
- ✅ Tienen fallbacks inteligentes
- ✅ Son fáciles de usar en cualquier componente
- ✅ Mantienen consistencia visual en toda la aplicación
