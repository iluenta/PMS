-- Script para verificar la implementación multi-tenant de documents
-- Fecha: 2025-01-27
-- Descripción: Verificar que tenant_id y RLS están correctamente implementados

-- 1. VERIFICAR QUE LA COLUMNA tenant_id EXISTE
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'documents' 
AND column_name = 'tenant_id';

-- 2. VERIFICAR QUE NO HAY VALORES NULL
SELECT 
  'documents' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) as records_with_tenant,
  COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) as records_without_tenant
FROM public.documents;

-- 3. VERIFICAR DISTRIBUCIÓN POR TENANT
SELECT 
  tenant_id,
  COUNT(*) as document_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM public.documents 
GROUP BY tenant_id 
ORDER BY tenant_id;

-- 4. VERIFICAR QUE RLS ESTÁ HABILITADO
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'documents';

-- 5. VERIFICAR RELACIONES FOREIGN KEY
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'documents'
AND kcu.column_name = 'tenant_id';

-- 6. VERIFICAR POLÍTICAS RLS
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
WHERE tablename = 'documents'
ORDER BY policyname;

-- 7. VERIFICAR ÍNDICES
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'documents'
AND indexname LIKE '%tenant%';

-- 8. VERIFICAR INTEGRIDAD DE DATOS
-- Verificar que todos los documentos tienen un tenant_id válido
SELECT 
  'documents_with_invalid_tenant' as issue,
  COUNT(*) as count
FROM public.documents d
LEFT JOIN public.tenants t ON d.tenant_id = t.id
WHERE t.id IS NULL;

-- 9. VERIFICAR RELACIONES CON OTRAS TABLAS
-- Verificar documentos que no tienen expense_id asociado
SELECT 
  'documents_without_expense' as issue,
  COUNT(*) as count
FROM public.documents
WHERE expense_id IS NULL;

-- 10. VERIFICAR PERFORMANCE
-- Verificar que el índice tenant_id está siendo usado
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.documents 
WHERE tenant_id = 1 
LIMIT 10;

