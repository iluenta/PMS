-- Script para agregar multi-tenant a la tabla documents
-- Fecha: 2025-01-27
-- Descripción: Agregar campo tenant_id y políticas RLS a documents

-- 1. AGREGAR COLUMNA tenant_id
ALTER TABLE public.documents 
ADD COLUMN tenant_id integer;

-- 2. CREAR ÍNDICE PARA PERFORMANCE
CREATE INDEX idx_documents_tenant_id ON public.documents(tenant_id);

-- 3. MIGRAR DATOS EXISTENTES
-- Asignar tenant_id basado en la propiedad asociada (expense_id -> expenses -> properties -> tenant_id)
UPDATE public.documents 
SET tenant_id = (
  SELECT p.tenant_id 
  FROM public.expenses e 
  JOIN public.properties p ON e.property_id = p.id 
  WHERE e.id = documents.expense_id
)
WHERE documents.expense_id IS NOT NULL;

-- Para documentos sin expense_id, asignar tenant_id = 1 (default)
UPDATE public.documents 
SET tenant_id = 1 
WHERE tenant_id IS NULL;

-- 4. HACER tenant_id NOT NULL
ALTER TABLE public.documents 
ALTER COLUMN tenant_id SET NOT NULL;

-- 5. AGREGAR FOREIGN KEY
ALTER TABLE public.documents 
ADD CONSTRAINT documents_tenant_id_fkey 
FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);

-- 6. HABILITAR ROW LEVEL SECURITY
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 7. CREAR POLÍTICAS RLS
-- Política para SELECT: usuarios solo pueden ver documentos de su tenant
CREATE POLICY "Users can view documents from their tenant" ON public.documents
FOR SELECT USING (
  tenant_id IN (
    SELECT tenant_id FROM public.users WHERE id = auth.uid()
  )
);

-- Política para INSERT: usuarios solo pueden crear documentos en su tenant
CREATE POLICY "Users can create documents in their tenant" ON public.documents
FOR INSERT WITH CHECK (
  tenant_id IN (
    SELECT tenant_id FROM public.users WHERE id = auth.uid()
  )
);

-- Política para UPDATE: usuarios solo pueden modificar documentos de su tenant
CREATE POLICY "Users can update documents from their tenant" ON public.documents
FOR UPDATE USING (
  tenant_id IN (
    SELECT tenant_id FROM public.users WHERE id = auth.uid()
  )
);

-- Política para DELETE: usuarios solo pueden eliminar documentos de su tenant
CREATE POLICY "Users can delete documents from their tenant" ON public.documents
FOR DELETE USING (
  tenant_id IN (
    SELECT tenant_id FROM public.users WHERE id = auth.uid()
  )
);

-- 8. VERIFICAR IMPLEMENTACIÓN
SELECT 
  'documents' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) as records_with_tenant,
  COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) as records_without_tenant
FROM public.documents;

-- Verificar distribución por tenant
SELECT 
  tenant_id,
  COUNT(*) as document_count
FROM public.documents 
GROUP BY tenant_id 
ORDER BY tenant_id;

-- Verificar que RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'documents';

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
WHERE tablename = 'documents';

