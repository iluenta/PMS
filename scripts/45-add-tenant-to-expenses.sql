-- Script para agregar multi-tenant a la tabla expenses
-- Fecha: 2025-01-27
-- Descripción: Agregar campo tenant_id y políticas RLS a expenses

-- 1. AGREGAR COLUMNA tenant_id
ALTER TABLE public.expenses 
ADD COLUMN tenant_id integer;

-- 2. CREAR ÍNDICE PARA PERFORMANCE
CREATE INDEX idx_expenses_tenant_id ON public.expenses(tenant_id);

-- 3. MIGRAR DATOS EXISTENTES
-- Asignar tenant_id basado en la propiedad asociada (property_id -> properties -> tenant_id)
UPDATE public.expenses 
SET tenant_id = (
  SELECT p.tenant_id 
  FROM public.properties p 
  WHERE p.id = expenses.property_id
)
WHERE expenses.property_id IS NOT NULL;

-- Para gastos sin property_id, asignar tenant_id = 1 (default)
UPDATE public.expenses 
SET tenant_id = 1 
WHERE tenant_id IS NULL;

-- 4. HACER tenant_id NOT NULL
ALTER TABLE public.expenses 
ALTER COLUMN tenant_id SET NOT NULL;

-- 5. AGREGAR FOREIGN KEY
ALTER TABLE public.expenses 
ADD CONSTRAINT expenses_tenant_id_fkey 
FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);

-- 6. HABILITAR ROW LEVEL SECURITY
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- 7. CREAR POLÍTICAS RLS
-- Política para SELECT: usuarios solo pueden ver gastos de su tenant
CREATE POLICY "Users can view expenses from their tenant" ON public.expenses
FOR SELECT USING (
  tenant_id IN (
    SELECT tenant_id FROM public.users WHERE id = auth.uid()
  )
);

-- Política para INSERT: usuarios solo pueden crear gastos en su tenant
CREATE POLICY "Users can create expenses in their tenant" ON public.expenses
FOR INSERT WITH CHECK (
  tenant_id IN (
    SELECT tenant_id FROM public.users WHERE id = auth.uid()
  )
);

-- Política para UPDATE: usuarios solo pueden modificar gastos de su tenant
CREATE POLICY "Users can update expenses from their tenant" ON public.expenses
FOR UPDATE USING (
  tenant_id IN (
    SELECT tenant_id FROM public.users WHERE id = auth.uid()
  )
);

-- Política para DELETE: usuarios solo pueden eliminar gastos de su tenant
CREATE POLICY "Users can delete expenses from their tenant" ON public.expenses
FOR DELETE USING (
  tenant_id IN (
    SELECT tenant_id FROM public.users WHERE id = auth.uid()
  )
);

-- 8. VERIFICAR IMPLEMENTACIÓN
SELECT 
  'expenses' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) as records_with_tenant,
  COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) as records_without_tenant
FROM public.expenses;

-- Verificar distribución por tenant
SELECT 
  tenant_id,
  COUNT(*) as expense_count
FROM public.expenses 
GROUP BY tenant_id 
ORDER BY tenant_id;

-- Verificar que RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'expenses';

-- Verificar políticas RLS
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
WHERE tablename = 'expenses';
