# Implementación Multi-Tenant para Tabla Expenses

## 📋 Resumen

Este documento describe la implementación de multi-tenancy para la tabla `expenses` siguiendo el mismo patrón establecido para `reservations`, `people` y `documents`.

## 🎯 Objetivo

Agregar separación multi-tenant a la tabla `expenses` para garantizar que:
- Cada gasto pertenezca a un tenant específico
- Los usuarios solo puedan acceder a gastos de su propio tenant
- Se mantenga la integridad referencial con otras tablas
- Se preserve la relación con `documents` y futuras tablas como `payments`

## 🗄️ Estructura de la Tabla

### Tabla Original
```sql
CREATE TABLE public.expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  description text NOT NULL,
  amount numeric NOT NULL,
  vendor character varying,
  date date NOT NULL,
  status character varying NOT NULL DEFAULT 'pending',
  payment_method character varying,
  reference character varying,
  notes text,
  receipt_url text,
  property_id uuid,
  is_recurring boolean DEFAULT false,
  next_due_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  reservation_id uuid,
  category_id uuid,
  subcategory_id uuid,
  vendor_id uuid,
  CONSTRAINT expenses_pkey PRIMARY KEY (id),
  CONSTRAINT expenses_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.people(id),
  CONSTRAINT expenses_subcategory_id_fkey FOREIGN KEY (subcategory_id) REFERENCES public.expense_subcategories(id),
  CONSTRAINT expenses_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.expense_categories(id)
);
```

### Cambios Aplicados
- ✅ Agregada columna `tenant_id integer NOT NULL`
- ✅ Creado índice `idx_expenses_tenant_id`
- ✅ Agregada FK `expenses_tenant_id_fkey` → `tenants(id)`
- ✅ Habilitado RLS (Row Level Security)
- ✅ Creadas políticas RLS para SELECT, INSERT, UPDATE, DELETE

## 🔧 Scripts de Implementación

### 1. Script Principal
**Archivo**: `scripts/45-add-tenant-to-expenses.sql`
- Agrega columna `tenant_id`
- Crea índice para performance
- Migra datos existentes
- Configura RLS y políticas

### 2. Script de Verificación
**Archivo**: `scripts/46-verify-expenses-tenant.sql`
- Verifica implementación correcta
- Valida integridad de datos
- Comprueba políticas RLS
- Verifica relaciones con `documents`

### 3. Script de Rollback
**Archivo**: `scripts/47-rollback-expenses-tenant.sql`
- Revierte todos los cambios
- Deshabilita RLS
- Elimina columna `tenant_id`

## 📊 Migración de Datos

### Estrategia de Migración
1. **Gastos con property_id**: Se asigna `tenant_id` basado en la propiedad asociada
   ```sql
   UPDATE public.expenses 
   SET tenant_id = (
     SELECT p.tenant_id 
     FROM public.properties p 
     WHERE p.id = expenses.property_id
   )
   WHERE expenses.property_id IS NOT NULL;
   ```

2. **Gastos sin property_id**: Se asigna `tenant_id = 1` (default)

### Verificación de Migración
```sql
-- Verificar distribución por tenant
SELECT 
  tenant_id,
  COUNT(*) as expense_count
FROM public.expenses 
GROUP BY tenant_id 
ORDER BY tenant_id;
```

## 🔒 Políticas RLS

### Política SELECT
```sql
CREATE POLICY "Users can view expenses from their tenant" ON public.expenses
FOR SELECT USING (
  tenant_id IN (
    SELECT tenant_id FROM public.users WHERE id = auth.uid()
  )
);
```

### Política INSERT
```sql
CREATE POLICY "Users can create expenses in their tenant" ON public.expenses
FOR INSERT WITH CHECK (
  tenant_id IN (
    SELECT tenant_id FROM public.users WHERE id = auth.uid()
  )
);
```

### Política UPDATE
```sql
CREATE POLICY "Users can update expenses from their tenant" ON public.expenses
FOR UPDATE USING (
  tenant_id IN (
    SELECT tenant_id FROM public.users WHERE id = auth.uid()
  )
);
```

### Política DELETE
```sql
CREATE POLICY "Users can delete expenses from their tenant" ON public.expenses
FOR DELETE USING (
  tenant_id IN (
    SELECT tenant_id FROM public.users WHERE id = auth.uid()
  )
);
```

## 🔗 Relaciones con Otras Tablas

### Tabla Documents
- Los `documents` están vinculados a `expenses` a través de `expense_id`
- Ambos deben tener el mismo `tenant_id` para mantener integridad
- La verificación se incluye en el script de verificación

### Tabla Properties
- Los `expenses` están vinculados a `properties` a través de `property_id`
- El `tenant_id` se deriva de la propiedad asociada
- Garantiza consistencia multi-tenant

### Tabla People (Vendors)
- Los `expenses` pueden tener un `vendor_id` que apunta a `people`
- Los `people` ya tienen `tenant_id` implementado
- Se mantiene la integridad referencial

## 🚀 Proceso de Implementación

### Paso 1: Ejecutar Script Principal
```bash
# Conectar a Supabase y ejecutar:
\i scripts/45-add-tenant-to-expenses.sql
```

### Paso 2: Verificar Implementación
```bash
# Ejecutar script de verificación:
\i scripts/46-verify-expenses-tenant.sql
```

### Paso 3: Verificar en Aplicación
- ✅ Login exitoso sin errores
- ✅ Acceso a gastos funcionando
- ✅ Creación de nuevos gastos funcionando
- ✅ Filtrado por tenant funcionando
- ✅ Relación con documentos funcionando

## 🔍 Verificaciones Post-Implementación

### 1. Verificar Columna
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'expenses' 
AND column_name = 'tenant_id';
```

### 2. Verificar RLS
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'expenses';
```

### 3. Verificar Políticas
```sql
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'expenses';
```

### 4. Verificar Índices
```sql
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'expenses'
AND indexname LIKE '%tenant%';
```

### 5. Verificar Relaciones
```sql
-- Verificar integridad con documents
SELECT COUNT(*) FROM public.expenses e
JOIN public.documents d ON e.id = d.expense_id
WHERE e.tenant_id != d.tenant_id;
```

## ⚠️ Consideraciones Importantes

### Seguridad
- **RLS habilitado**: Garantiza separación de datos por tenant
- **Políticas estrictas**: Usuarios solo acceden a su propio tenant
- **Validación en aplicación**: Doble verificación de tenant_id

### Performance
- **Índice en tenant_id**: Optimiza consultas filtradas por tenant
- **Cache de usuario**: Evita consultas repetidas a `users` table
- **Relaciones optimizadas**: Joins eficientes con `properties`

### Integridad
- **FK constraints**: Garantiza tenant_id válido
- **Migración de datos**: Preserva datos existentes
- **Relaciones consistentes**: Mantiene coherencia con `documents`
- **Rollback disponible**: Permite revertir cambios si es necesario

## 📈 Próximos Pasos

### Tablas Pendientes
1. **Pagos** (`payments`) - Última tabla por implementar

### Consideraciones Futuras
- Implementar auditoría de cambios en `tenant_id`
- Agregar métricas de uso por tenant
- Optimizar consultas multi-tenant
- Implementar validaciones de integridad en tiempo real

## 🆘 Solución de Problemas

### Error: "Policy already exists"
```sql
-- Eliminar política existente antes de recrear
DROP POLICY IF EXISTS "policy_name" ON public.expenses;
```

### Error: "Column already exists"
```sql
-- Verificar si la columna existe
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'expenses' AND column_name = 'tenant_id';
```

### Error: "RLS already enabled"
```sql
-- Verificar estado de RLS
SELECT schemaname, tablename, rowsecurity
FROM pg_tables WHERE tablename = 'expenses';
```

### Error: "Foreign key constraint violation"
```sql
-- Verificar que todos los gastos tienen tenant_id válido
SELECT COUNT(*) FROM public.expenses e
LEFT JOIN public.tenants t ON e.tenant_id = t.id
WHERE t.id IS NULL;
```

## 📞 Contacto

Para dudas o problemas con esta implementación, revisar:
1. Logs de la aplicación
2. Scripts de verificación
3. Documentación de `reservations`, `people` y `documents`
4. Scripts de rollback si es necesario
5. Verificación de relaciones con tablas dependientes
