-- Script para hacer rollback de la implementación multi-tenant de expenses
-- Fecha: 2025-01-27
-- Descripción: Revertir cambios de tenant_id y RLS en expenses

-- ⚠️ ADVERTENCIA: Este script eliminará todas las políticas RLS y la columna tenant_id
-- Solo ejecutar si es necesario revertir completamente los cambios

-- 1. ELIMINAR POLÍTICAS RLS
DROP POLICY IF EXISTS "Users can view expenses from their tenant" ON public.expenses;
DROP POLICY IF EXISTS "Users can create expenses in their tenant" ON public.expenses;
DROP POLICY IF EXISTS "Users can update expenses from their tenant" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete expenses from their tenant" ON public.expenses;

-- 2. DESHABILITAR ROW LEVEL SECURITY
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;

-- 3. ELIMINAR FOREIGN KEY
ALTER TABLE public.expenses 
DROP CONSTRAINT IF EXISTS expenses_tenant_id_fkey;

-- 4. ELIMINAR ÍNDICE
DROP INDEX IF EXISTS idx_expenses_tenant_id;

-- 5. ELIMINAR COLUMNA tenant_id
ALTER TABLE public.expenses 
DROP COLUMN IF EXISTS tenant_id;

-- 6. VERIFICAR ROLLBACK
-- Verificar que RLS está deshabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'expenses';

-- Verificar que no hay políticas RLS activas
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE tablename = 'expenses';

-- Verificar que la columna tenant_id no existe
SELECT 
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'expenses' 
AND column_name = 'tenant_id';

-- Verificar estructura final de la tabla
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'expenses'
ORDER BY ordinal_position;
