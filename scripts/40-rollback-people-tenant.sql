-- Script de rollback para multi-tenant en people
-- Fecha: 2025-01-27
-- Descripción: Revertir cambios de multi-tenant en caso de problemas
-- ⚠️ ADVERTENCIA: Este script eliminará la separación multi-tenant

-- 1. ELIMINAR POLÍTICAS RLS
DROP POLICY IF EXISTS "Users can only see people from their tenant" ON public.people;
DROP POLICY IF EXISTS "Users can only create people in their tenant" ON public.people;
DROP POLICY IF EXISTS "Users can only update people from their tenant" ON public.people;
DROP POLICY IF EXISTS "Users can only delete people from their tenant" ON public.people;

-- 2. DESHABILITAR ROW LEVEL SECURITY
ALTER TABLE public.people DISABLE ROW LEVEL SECURITY;

-- 3. ELIMINAR FOREIGN KEY CONSTRAINT
ALTER TABLE public.people 
DROP CONSTRAINT IF EXISTS people_tenant_id_fkey;

-- 4. ELIMINAR ÍNDICE
DROP INDEX IF EXISTS idx_people_tenant_id;

-- 5. ELIMINAR COLUMNA tenant_id
ALTER TABLE public.people 
DROP COLUMN IF EXISTS tenant_id;

-- 6. VERIFICAR QUE LA TABLA ESTÁ EN SU ESTADO ORIGINAL
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'people' 
ORDER BY ordinal_position;

-- 7. VERIFICAR QUE NO HAY POLÍTICAS RLS ACTIVAS
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE tablename = 'people';

-- 8. VERIFICAR QUE RLS ESTÁ DESHABILITADO
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'people';

-- NOTA: Después de ejecutar este rollback, la tabla people
-- volverá a su estado original sin separación multi-tenant.
-- Todos los usuarios podrán ver todas las personas nuevamente.
