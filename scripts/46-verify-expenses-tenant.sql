-- Script para verificar la implementación multi-tenant de expenses
-- Fecha: 2025-01-27
-- Descripción: Verificar que tenant_id y RLS están correctamente implementados

-- 1. VERIFICAR QUE LA COLUMNA tenant_id EXISTE
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'expenses' 
AND column_name = 'tenant_id';

-- 2. VERIFICAR QUE NO HAY VALORES NULL
SELECT 
  'expenses' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) as records_with_tenant,
  COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) as records_without_tenant
FROM public.expenses;

-- 3. VERIFICAR DISTRIBUCIÓN POR TENANT
SELECT 
  tenant_id,
  COUNT(*) as expense_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM public.expenses 
GROUP BY tenant_id 
ORDER BY tenant_id;

-- 4. VERIFICAR QUE RLS ESTÁ HABILITADO
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'expenses';

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
AND tc.table_name = 'expenses'
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
WHERE tablename = 'expenses'
ORDER BY policyname;

-- 7. VERIFICAR ÍNDICES
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'expenses'
AND indexname LIKE '%tenant%';

-- 8. VERIFICAR INTEGRIDAD DE DATOS
-- Verificar que todos los gastos tienen un tenant_id válido
SELECT 
  'expenses_with_invalid_tenant' as issue,
  COUNT(*) as count
FROM public.expenses e
LEFT JOIN public.tenants t ON e.tenant_id = t.id
WHERE t.id IS NULL;

-- 9. VERIFICAR RELACIONES CON OTRAS TABLAS
-- Verificar gastos que no tienen property_id asociado
SELECT 
  'expenses_without_property' as issue,
  COUNT(*) as count
FROM public.expenses
WHERE property_id IS NULL;

-- Verificar gastos que no tienen vendor_id asociado
SELECT 
  'expenses_without_vendor' as issue,
  COUNT(*) as count
FROM public.expenses
WHERE vendor_id IS NULL;

-- 10. VERIFICAR PERFORMANCE
-- Verificar que el índice tenant_id está siendo usado
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM public.expenses 
WHERE tenant_id = 1 
LIMIT 10;

-- 11. VERIFICAR RELACIONES CON DOCUMENTS
-- Verificar que los gastos tienen documentos asociados del mismo tenant
SELECT 
  'expenses_documents_tenant_mismatch' as issue,
  COUNT(*) as count
FROM public.expenses e
JOIN public.documents d ON e.id = d.expense_id
WHERE e.tenant_id != d.tenant_id;

-- 12. VERIFICAR RELACIONES CON PAYMENTS (futuro)
-- Verificar que los gastos tienen pagos asociados del mismo tenant (cuando se implemente)
-- SELECT 
--   'expenses_payments_tenant_mismatch' as issue,
--   COUNT(*) as count
-- FROM public.expenses e
-- JOIN public.payments p ON e.id = p.expense_id
-- WHERE e.tenant_id != p.tenant_id;
