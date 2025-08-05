# Actualización Automática del Estado de Pago de Reservas

## 🎯 Funcionalidad Implementada

Se ha implementado un sistema automático para actualizar el estado de pago de las reservas basándose en los pagos recibidos y el canal de distribución, **usando JavaScript** para mantener consistencia con el resto de la aplicación.

## 📋 Lógica de Cálculo

### Para Canal "Propio" (Directo)
- **Importe requerido para completar**: `TOTAL (sin comisiones)`
- **Fórmula**: `total_amount`

### Para Otros Canales (Airbnb, Booking, etc.)
- **Importe requerido para completar**: `TOTAL - [(comisión venta + comisión cobro) * 21%]`
- **Fórmula**: `total_amount - ((channel_commission + collection_commission) * 0.21)`

## 🔄 Estados de Pago

- **`pending`**: No se ha recibido ningún pago
- **`partial`**: Se ha recibido al menos un pago pero no se ha completado el importe requerido
- **`paid`**: Se ha recibido el importe completo o superior

## 🛠️ Componentes Actualizados

### 1. Componente React (`components/BookingPayments.tsx`)
- **Actualizado**: Para usar la tabla `payments` en lugar de `booking_payments`
- **Nuevas características**:
  - Interfaz adaptada a la estructura de `payments`
  - Auto-completado del nombre del cliente al seleccionar una reserva
  - Visualización del estado de pago de la reserva
  - Mensaje informativo sobre actualización automática
  - **Lógica JavaScript** para calcular y actualizar estados de pago automáticamente

### 2. Interfaces TypeScript (`lib/supabase.ts`)
- **Agregadas**: Interfaces `DistributionChannel` y `PropertyChannel`
- **Actualizada**: Interface `Reservation` con campos `property_channel_id` y `property_channel`
- **Mejorada**: Tipado más preciso para las relaciones entre tablas

## 🧪 Funciones JavaScript Implementadas

### `calculateRequiredAmount(reservation: Reservation): number`
Calcula el importe requerido según el canal:
- **Propio**: `total_amount`
- **Otros**: `total_amount - ((channel_commission + collection_commission) * 0.21)`

### `calculatePaymentStatus(reservation: Reservation, payments: Payment[]): string`
Calcula el estado de pago basándose en los pagos recibidos:
- **`paid`**: Si `totalPayments >= requiredAmount`
- **`partial`**: Si `totalPayments > 0` pero `< requiredAmount`
- **`pending`**: Si `totalPayments = 0`

### `updateReservationPaymentStatus(reservationId: string): Promise<void>`
Actualiza automáticamente el estado de pago de una reserva:
1. Obtiene la reserva y sus pagos
2. Calcula el nuevo estado
3. Actualiza la base de datos solo si el estado ha cambiado

## 📊 Ejemplo de Cálculo

### Reserva con Canal "Propio"
- **Total**: 615.50€
- **Comisiones**: 0€ (Propio)
- **Importe requerido**: 615.50€
- **Estado**: `paid` cuando se reciban 615.50€ o más

### Reserva con Canal Externo
- **Total**: 615.50€
- **Comisión venta**: 104.65€
- **Comisión cobro**: 8€
- **Cálculo**: 615.50€ - ((104.65€ + 8€) * 21%) = 615.50€ - 23.66€ = 591.84€
- **Estado**: `paid` cuando se reciban 591.84€ o más

## 🚀 Cómo Probar

1. **Probar en la aplicación**:
   - Ir a `/booking-payments`
   - Crear un nuevo pago
   - Seleccionar una reserva
   - Completar los datos del pago
   - Verificar que el estado de pago de la reserva se actualiza automáticamente

2. **Verificar en la base de datos**:
   ```sql
   -- Verificar el estado de pago de las reservas
   SELECT id, guest->>'name' as customer_name, payment_status, total_amount
   FROM reservations 
   ORDER BY created_at DESC;
   ```

## ⚠️ Notas Importantes

- El estado de pago se actualiza **automáticamente** al crear, editar o eliminar pagos
- Solo los pagos con estado `completed` se consideran para el cálculo
- La lógica se ejecuta en **JavaScript** para mantener consistencia con el resto de la aplicación
- Los logs de debug se pueden ver en la consola del navegador
- **No se requieren funciones SQL** - todo se maneja en el frontend

## 🔧 Archivos Modificados

1. `components/BookingPayments.tsx` - Componente actualizado con lógica JavaScript
2. `lib/supabase.ts` - Interfaces actualizadas para mejor tipado

## ✅ Estado Actual

- ✅ **Lógica JavaScript implementada** - Consistente con el resto de la aplicación
- ✅ **Componente React actualizado** - Interfaz mejorada
- ✅ **Interfaces TypeScript actualizadas** - Mejor tipado
- ✅ **Build exitoso** - Sin errores de compilación
- ✅ **Servidor funcionando** - Listo para pruebas
- ✅ **Sin dependencias SQL** - Todo manejado en JavaScript

## 🎯 Ventajas de la Implementación JavaScript

1. **Consistencia**: Misma tecnología que el resto de la aplicación
2. **Mantenibilidad**: Más fácil de debuggear y modificar
3. **Flexibilidad**: Lógica de negocio en el frontend
4. **Simplicidad**: No requiere funciones SQL complejas
5. **Testing**: Más fácil de testear con herramientas JavaScript 