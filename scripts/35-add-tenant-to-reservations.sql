-- Script para implementar multi-tenant en la tabla reservations
-- Fecha: 2025-01-27
-- Descripción: Agregar tenant_id a reservations, crear políticas RLS y migrar datos

-- 1. AGREGAR COLUMNA tenant_id A LA TABLA reservations
ALTER TABLE public.reservations 
ADD COLUMN tenant_id integer;

-- 2. CREAR ÍNDICE PARA OPTIMIZAR CONSULTAS POR tenant_id
CREATE INDEX idx_reservations_tenant_id ON public.reservations(tenant_id);

-- 3. MIGRAR DATOS EXISTENTES: Asignar tenant_id basado en la propiedad asociada
UPDATE public.reservations 
SET tenant_id = p.tenant_id 
FROM public.properties p 
WHERE reservations.property_id = p.id 
  AND reservations.tenant_id IS NULL;

-- 4. HACER tenant_id NOT NULL después de la migración
ALTER TABLE public.reservations 
ALTER COLUMN tenant_id SET NOT NULL;

-- 5. AGREGAR FOREIGN KEY CONSTRAINT
ALTER TABLE public.reservations 
ADD CONSTRAINT reservations_tenant_id_fkey 
FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);

-- 6. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- 7. CREAR POLÍTICAS RLS PARA ACCESO POR TENANT

-- Política para SELECT: Usuarios solo pueden ver reservas de su tenant
CREATE POLICY "Users can only see reservations from their tenant" ON public.reservations
FOR SELECT USING (
  tenant_id = (
    SELECT tenant_id FROM public.users 
    WHERE id = auth.uid()
  )
);

-- Política para INSERT: Usuarios solo pueden crear reservas en su tenant
CREATE POLICY "Users can only create reservations in their tenant" ON public.reservations
FOR INSERT WITH CHECK (
  tenant_id = (
    SELECT tenant_id FROM public.users 
    WHERE id = auth.uid()
  )
);

-- Política para UPDATE: Usuarios solo pueden modificar reservas de su tenant
CREATE POLICY "Users can only update reservations from their tenant" ON public.reservations
FOR UPDATE USING (
  tenant_id = (
    SELECT tenant_id FROM public.users 
    WHERE id = auth.uid()
  )
);

-- Política para DELETE: Usuarios solo pueden eliminar reservas de su tenant
CREATE POLICY "Users can only delete reservations from their tenant" ON public.reservations
FOR DELETE USING (
  tenant_id = (
    SELECT tenant_id FROM public.users 
    WHERE id = auth.uid()
  )
);

-- 8. VERIFICAR QUE LA MIGRACIÓN FUE EXITOSA
-- Esta consulta debe devolver 0 filas (todas las reservas deben tener tenant_id)
SELECT COUNT(*) as reservations_without_tenant 
FROM public.reservations 
WHERE tenant_id IS NULL;

-- 9. VERIFICAR DISTRIBUCIÓN DE RESERVAS POR TENANT
SELECT 
  t.name as tenant_name,
  COUNT(r.id) as reservation_count
FROM public.tenants t
LEFT JOIN public.reservations r ON t.id = r.tenant_id
GROUP BY t.id, t.name
ORDER BY t.id;
