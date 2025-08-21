# Implementación Multi-Tenant para Tabla Documents

## 📋 Resumen

Este documento describe la implementación de multi-tenancy para la tabla `documents` siguiendo el mismo patrón establecido para `reservations` y `people`.

## 🎯 Objetivo

Agregar separación multi-tenant a la tabla `documents` para garantizar que:
- Cada documento pertenezca a un tenant específico
- Los usuarios solo puedan acceder a documentos de su propio tenant
- Se mantenga la integridad referencial con otras tablas

## 🗄️ Estructura de la Tabla

### Tabla Original
```sql
CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  expense_id uuid,
  original_name text NOT NULL,
  storage_path text NOT NULL,
  mime_type text NOT NULL,
  size integer NOT NULL,
  uploaded_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT documents_pkey PRIMARY KEY (id),
  CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id),
  CONSTRAINT documents_expense_id_fkey FOREIGN KEY (expense_id) REFERENCES public.expenses(id)
);
```

### Cambios Aplicados
- ✅ Agregada columna `tenant_id integer NOT NULL`
- ✅ Creado índice `idx_documents_tenant_id`
- ✅ Agregada FK `documents_tenant_id_fkey` → `tenants(id)`
- ✅ Habilitado RLS (Row Level Security)
- ✅ Creadas políticas RLS para SELECT, INSERT, UPDATE, DELETE

## 🔧 Scripts de Implementación

### 1. Script Principal
**Archivo**: `scripts/42-add-tenant-to-documents.sql`
- Agrega columna `tenant_id`
- Crea índice para performance
- Migra datos existentes
- Configura RLS y políticas

### 2. Script de Verificación
**Archivo**: `scripts/43-verify-documents-tenant.sql`
- Verifica implementación correcta
- Valida integridad de datos
- Comprueba políticas RLS

### 3. Script de Rollback
**Archivo**: `scripts/44-rollback-documents-tenant.sql`
- Revierte todos los cambios
- Deshabilita RLS
- Elimina columna `tenant_id`

## 📊 Migración de Datos

### Estrategia de Migración
1. **Documentos con expense_id**: Se asigna `tenant_id` basado en la propiedad asociada
   ```sql
   UPDATE public.documents 
   SET tenant_id = (
     SELECT p.tenant_id 
     FROM public.expenses e 
     JOIN public.properties p ON e.property_id = p.id 
     WHERE e.id = documents.expense_id
   )
   WHERE documents.expense_id IS NOT NULL;
   ```

2. **Documentos sin expense_id**: Se asigna `tenant_id = 1` (default)

### Verificación de Migración
```sql
-- Verificar distribución por tenant
SELECT 
  tenant_id,
  COUNT(*) as document_count
FROM public.documents 
GROUP BY tenant_id 
ORDER BY tenant_id;
```

## 🔒 Políticas RLS

### Política SELECT
```sql
CREATE POLICY "Users can view documents from their tenant" ON public.documents
FOR SELECT USING (
  tenant_id IN (
    SELECT tenant_id FROM public.users WHERE id = auth.uid()
  )
);
```

### Política INSERT
```sql
CREATE POLICY "Users can create documents in their tenant" ON public.documents
FOR INSERT WITH CHECK (
  tenant_id IN (
    SELECT tenant_id FROM public.users WHERE id = auth.uid()
  )
);
```

### Política UPDATE
```sql
CREATE POLICY "Users can update documents from their tenant" ON public.documents
FOR UPDATE USING (
  tenant_id IN (
    SELECT tenant_id FROM public.users WHERE id = auth.uid()
  )
);
```

### Política DELETE
```sql
CREATE POLICY "Users can delete documents from their tenant" ON public.documents
FOR DELETE USING (
  tenant_id IN (
    SELECT tenant_id FROM public.users WHERE id = auth.uid()
  )
);
```

## 🚀 Proceso de Implementación

### Paso 1: Ejecutar Script Principal
```bash
# Conectar a Supabase y ejecutar:
\i scripts/42-add-tenant-to-documents.sql
```

### Paso 2: Verificar Implementación
```bash
# Ejecutar script de verificación:
\i scripts/43-verify-documents-tenant.sql
```

### Paso 3: Verificar en Aplicación
- ✅ Login exitoso sin errores
- ✅ Acceso a documentos funcionando
- ✅ Creación de nuevos documentos funcionando
- ✅ Filtrado por tenant funcionando

## 🔍 Verificaciones Post-Implementación

### 1. Verificar Columna
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'documents' 
AND column_name = 'tenant_id';
```

### 2. Verificar RLS
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables 
WHERE tablename = 'documents';
```

### 3. Verificar Políticas
```sql
SELECT policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'documents';
```

### 4. Verificar Índices
```sql
SELECT indexname, indexdef
FROM pg_indexes 
WHERE tablename = 'documents'
AND indexname LIKE '%tenant%';
```

## ⚠️ Consideraciones Importantes

### Seguridad
- **RLS habilitado**: Garantiza separación de datos por tenant
- **Políticas estrictas**: Usuarios solo acceden a su propio tenant
- **Validación en aplicación**: Doble verificación de tenant_id

### Performance
- **Índice en tenant_id**: Optimiza consultas filtradas por tenant
- **Cache de usuario**: Evita consultas repetidas a `users` table

### Integridad
- **FK constraints**: Garantiza tenant_id válido
- **Migración de datos**: Preserva datos existentes
- **Rollback disponible**: Permite revertir cambios si es necesario

## 📈 Próximos Pasos

### Tablas Pendientes
1. **Gastos** (`expenses`) - Dejado para el final
2. **Pagos** (`payments`) - Dejado para el final

### Consideraciones Futuras
- Implementar auditoría de cambios en `tenant_id`
- Agregar métricas de uso por tenant
- Optimizar consultas multi-tenant

## 🆘 Solución de Problemas

### Error: "Policy already exists"
```sql
-- Eliminar política existente antes de recrear
DROP POLICY IF EXISTS "policy_name" ON public.documents;
```

### Error: "Column already exists"
```sql
-- Verificar si la columna existe
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'documents' AND column_name = 'tenant_id';
```

### Error: "RLS already enabled"
```sql
-- Verificar estado de RLS
SELECT schemaname, tablename, rowsecurity
FROM pg_tables WHERE tablename = 'documents';
```

## 📞 Contacto

Para dudas o problemas con esta implementación, revisar:
1. Logs de la aplicación
2. Scripts de verificación
3. Documentación de `reservations` y `people`
4. Scripts de rollback si es necesario

