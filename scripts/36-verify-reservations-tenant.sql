-- Script de verificación para multi-tenant en reservations
-- Fecha: 2025-01-27
-- Descripción: Verificar que la implementación multi-tenant funciona correctamente

-- 1. VERIFICAR QUE LA COLUMNA tenant_id EXISTE
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'reservations' 
  AND column_name = 'tenant_id';

-- 2. VERIFICAR QUE NO HAY RESERVAS SIN tenant_id
SELECT 
  COUNT(*) as total_reservations,
  COUNT(tenant_id) as reservations_with_tenant,
  COUNT(*) - COUNT(tenant_id) as reservations_without_tenant
FROM public.reservations;

-- 3. VERIFICAR DISTRIBUCIÓN DE RESERVAS POR TENANT
SELECT 
  t.id as tenant_id,
  t.name as tenant_name,
  COUNT(r.id) as reservation_count,
  MIN(r.created_at) as oldest_reservation,
  MAX(r.created_at) as newest_reservation
FROM public.tenants t
LEFT JOIN public.reservations r ON t.id = r.tenant_id
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
WHERE tablename = 'reservations'
ORDER BY policyname;

-- 5. VERIFICAR QUE RLS ESTÁ HABILITADO
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'reservations';

-- 6. VERIFICAR RELACIONES ENTRE RESERVAS Y PROPIEDADES
SELECT 
  r.id as reservation_id,
  r.tenant_id as reservation_tenant,
  p.id as property_id,
  p.tenant_id as property_tenant,
  CASE 
    WHEN r.tenant_id = p.tenant_id THEN 'OK - Tenants coinciden'
    ELSE 'ERROR - Tenants no coinciden'
  END as validation
FROM public.reservations r
JOIN public.properties p ON r.property_id = p.id
WHERE r.tenant_id != p.tenant_id
LIMIT 10;

-- 7. VERIFICAR QUE NO HAY RESERVAS HUÉRFANAS (sin propiedad válida)
SELECT 
  COUNT(*) as orphaned_reservations
FROM public.reservations r
LEFT JOIN public.properties p ON r.property_id = p.id
WHERE p.id IS NULL;

-- 8. VERIFICAR ÍNDICES
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'reservations'
  AND indexname LIKE '%tenant%';

-- 9. VERIFICAR CONSTRAINTS
SELECT 
  conname,
  contype,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.reservations'::regclass
  AND conname LIKE '%tenant%';

-- 10. VERIFICAR QUE LAS RESERVAS NUEVAS SE CREAN CON tenant_id CORRECTO
-- (Este test se debe ejecutar después de crear una nueva reserva desde la aplicación)
SELECT 
  r.id,
  r.tenant_id,
  r.created_at,
  r.property_id,
  p.tenant_id as property_tenant_id
FROM public.reservations r
JOIN public.properties p ON r.property_id = p.id
WHERE r.created_at >= NOW() - INTERVAL '1 hour'
ORDER BY r.created_at DESC
LIMIT 5;
