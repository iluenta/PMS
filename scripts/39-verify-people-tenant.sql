-- Script de verificación para multi-tenant en people
-- Fecha: 2025-01-27
-- Descripción: Verificar que la implementación multi-tenant funciona correctamente

-- 1. VERIFICAR QUE LA COLUMNA tenant_id EXISTE
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'people' 
  AND column_name = 'tenant_id';

-- 2. VERIFICAR QUE NO HAY PERSONAS SIN tenant_id
SELECT 
  COUNT(*) as total_people,
  COUNT(tenant_id) as people_with_tenant,
  COUNT(*) - COUNT(tenant_id) as people_without_tenant
FROM public.people;

-- 3. VERIFICAR DISTRIBUCIÓN DE PERSONAS POR TENANT
SELECT 
  t.id as tenant_id,
  t.name as tenant_name,
  COUNT(p.id) as people_count,
  MIN(p.created_at) as oldest_person,
  MAX(p.created_at) as newest_person
FROM public.tenants t
LEFT JOIN public.people p ON t.id = p.tenant_id
GROUP BY t.id, t.name
ORDER BY t.id;

-- 4. VERIFICAR QUE LAS POLÍTICAS RLS ESTÁN ACTIVAS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'people'
ORDER BY policyname;

-- 5. VERIFICAR QUE RLS ESTÁ HABILITADO
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'people';

-- 6. VERIFICAR RELACIONES ENTRE PERSONAS Y RESERVAS
SELECT 
  p.id as person_id,
  p.tenant_id as person_tenant,
  r.id as reservation_id,
  r.tenant_id as reservation_tenant,
  CASE 
    WHEN p.tenant_id = r.tenant_id THEN 'OK - Tenants coinciden'
    ELSE 'ERROR - Tenants no coinciden'
  END as validation
FROM public.people p
JOIN public.reservations r ON p.id = r.person_id
WHERE p.tenant_id != r.tenant_id
LIMIT 10;

-- 7. VERIFICAR QUE NO HAY PERSONAS HUÉRFANAS (sin tenant válido)
SELECT 
  COUNT(*) as orphaned_people
FROM public.people p
LEFT JOIN public.tenants t ON p.tenant_id = t.id
WHERE t.id IS NULL;

-- 8. VERIFICAR ÍNDICES
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'people'
  AND indexname LIKE '%tenant%';

-- 9. VERIFICAR CONSTRAINTS
SELECT 
  conname,
  contype,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.people'::regclass
  AND conname LIKE '%tenant%';

-- 10. VERIFICAR QUE LAS PERSONAS NUEVAS SE CREAN CON tenant_id CORRECTO
-- (Este test se debe ejecutar después de crear una nueva persona desde la aplicación)
SELECT 
  p.id,
  p.tenant_id,
  p.created_at,
  p.first_name,
  p.last_name
FROM public.people p
WHERE p.created_at >= NOW() - INTERVAL '1 hour'
ORDER BY p.created_at DESC
LIMIT 5;

-- 11. VERIFICAR ACCESO POR TENANT (simular consulta de usuario)
-- Esto debe devolver solo personas del tenant del usuario autenticado
-- Nota: Solo funciona si estás autenticado en Supabase
SELECT 
  p.id,
  p.first_name,
  p.last_name,
  p.tenant_id,
  p.created_at
FROM public.people p
WHERE p.tenant_id = (
  SELECT tenant_id FROM public.users 
  WHERE id = auth.uid()
)
LIMIT 10;
