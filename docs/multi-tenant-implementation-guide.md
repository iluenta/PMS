# Guía de Implementación Multi-Tenant para Reservations

## 📋 Resumen

Este documento describe la implementación de separación multi-tenant para la tabla `reservations` en TuriGest. La implementación incluye cambios en la base de datos, políticas de seguridad y código de la aplicación.

## 🎯 Objetivos

- Implementar separación automática de reservas por tenant
- Asegurar que los usuarios solo vean reservas de su organización
- Mantener la integridad referencial con propiedades
- Implementar políticas de seguridad a nivel de fila (RLS)

## 🗄️ Cambios en Base de Datos

### 1. Estructura de la Tabla

**Antes:**
```sql
CREATE TABLE public.reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  guest jsonb NOT NULL,
  property_id uuid NOT NULL,
  -- ... otros campos
  -- NO había tenant_id
);
```

**Después:**
```sql
CREATE TABLE public.reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  guest jsonb NOT NULL,
  property_id uuid NOT NULL,
  tenant_id integer NOT NULL, -- ✅ NUEVO CAMPO
  -- ... otros campos
  CONSTRAINT reservations_tenant_id_fkey 
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
```

### 2. Índices

```sql
CREATE INDEX idx_reservations_tenant_id ON public.reservations(tenant_id);
```

### 3. Políticas RLS

```sql
-- SELECT: Solo ver reservas del tenant del usuario
CREATE POLICY "Users can only see reservations from their tenant" ON public.reservations
FOR SELECT USING (
  tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- INSERT: Solo crear reservas en el tenant del usuario
CREATE POLICY "Users can only create reservations in their tenant" ON public.reservations
FOR INSERT WITH CHECK (
  tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- UPDATE: Solo modificar reservas del tenant del usuario
CREATE POLICY "Users can only update reservations from their tenant" ON public.reservations
FOR UPDATE USING (
  tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- DELETE: Solo eliminar reservas del tenant del usuario
CREATE POLICY "Users can only delete reservations from their tenant" ON public.reservations
FOR DELETE USING (
  tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);
```

## 🔄 Migración de Datos

### 1. Asignación Automática de tenant_id

```sql
UPDATE public.reservations 
SET tenant_id = p.tenant_id 
FROM public.properties p 
WHERE reservations.property_id = p.id 
  AND reservations.tenant_id IS NULL;
```

### 2. Verificación de Integridad

```sql
-- Verificar que no hay reservas sin tenant_id
SELECT COUNT(*) as reservations_without_tenant 
FROM public.reservations 
WHERE tenant_id IS NULL;

-- Verificar distribución por tenant
SELECT 
  t.name as tenant_name,
  COUNT(r.id) as reservation_count
FROM public.tenants t
LEFT JOIN public.reservations r ON t.id = r.tenant_id
GROUP BY t.id, t.name;
```

## 💻 Cambios en el Código

### 1. Componente Bookings.tsx

**Importaciones agregadas:**
```typescript
import { useAuth } from "@/contexts/AuthContext"
```

**Contexto agregado:**
```typescript
const { user } = useAuth()
```

**Filtrado por tenant en fetchData:**
```typescript
// Solo cargar propiedades del tenant actual
const { data: propertiesData, error: propertiesError } = await supabase
  .from("properties")
  .select("*")
  .eq("status", "active")
  .eq("tenant_id", user?.tenant_id)
```

**tenant_id en handleSubmit:**
```typescript
const submitData = {
  // ... otros campos
  tenant_id: user?.tenant_id // ✅ Agregar tenant_id del usuario
}
```

**useEffect con dependencia de tenant:**
```typescript
useEffect(() => {
  if (user?.tenant_id) {
    fetchData()
  }
}, [selectedProperty, user?.tenant_id])
```

## 🚀 Proceso de Implementación

### Fase 1: Preparación
1. ✅ Crear scripts SQL de implementación
2. ✅ Crear scripts de verificación
3. ✅ Crear scripts de rollback
4. ✅ Modificar código de la aplicación

### Fase 2: Ejecución
1. 🔄 Ejecutar script de implementación en base de datos
2. 🔄 Verificar que la migración fue exitosa
3. 🔄 Probar funcionalidad en la aplicación

### Fase 3: Validación
1. 🔄 Crear nueva reserva y verificar tenant_id
2. 🔄 Verificar que usuarios solo ven reservas de su tenant
3. 🔄 Probar todas las operaciones CRUD

## 📁 Archivos Creados/Modificados

### Scripts SQL
- `scripts/35-add-tenant-to-reservations.sql` - Implementación principal
- `scripts/36-verify-reservations-tenant.sql` - Verificación
- `scripts/37-rollback-reservations-tenant.sql` - Rollback

### Código
- `components/Bookings.tsx` - Modificado para usar tenant_id

### Documentación
- `docs/multi-tenant-implementation-guide.md` - Esta guía

## 🧪 Testing

### 1. Verificación de Base de Datos
```bash
# Ejecutar script de verificación
psql -d your_database -f scripts/36-verify-reservations-tenant.sql
```

### 2. Testing de Aplicación
1. Crear nueva reserva
2. Verificar que se asigna tenant_id correcto
3. Cambiar de usuario/tenant
4. Verificar que solo ve reservas del nuevo tenant

### 3. Verificación de Seguridad
1. Usuario A no puede ver reservas de Usuario B
2. Usuario A no puede modificar reservas de Usuario B
3. Políticas RLS funcionan correctamente

## ⚠️ Consideraciones Importantes

### 1. Dependencias
- La tabla `properties` debe tener `tenant_id` implementado
- La tabla `users` debe tener `tenant_id` implementado
- El contexto `AuthContext` debe estar funcionando

### 2. Performance
- El índice `idx_reservations_tenant_id` es crítico para el rendimiento
- Las consultas ahora incluyen filtro por tenant automáticamente

### 3. Seguridad
- RLS está habilitado por defecto
- Todas las operaciones están protegidas por políticas
- No hay forma de eludir la separación multi-tenant

## 🔄 Rollback

Si algo sale mal, ejecutar:
```bash
psql -d your_database -f scripts/37-rollback-reservations-tenant.sql
```

## 📚 Próximos Pasos

Una vez validada esta implementación para `reservations`, aplicar el mismo patrón a:

1. **expenses** - Gastos por tenant
2. **payments** - Pagos por tenant  
3. **guests** - Huéspedes por tenant
4. **channels** - Canales por tenant
5. **documents** - Documentos por tenant

## 📞 Soporte

Para problemas o preguntas sobre esta implementación:
1. Revisar logs de la aplicación
2. Ejecutar scripts de verificación
3. Verificar políticas RLS en Supabase
4. Consultar esta documentación

