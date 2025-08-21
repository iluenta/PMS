-- Script para implementar multi-tenant en la tabla people
-- Fecha: 2025-01-27
-- Descripción: Agregar tenant_id a people, crear políticas RLS y migrar datos

-- 1. AGREGAR COLUMNA tenant_id A LA TABLA people
ALTER TABLE public.people 
ADD COLUMN tenant_id integer;

-- 2. CREAR ÍNDICE PARA OPTIMIZAR CONSULTAS POR tenant_id
CREATE INDEX idx_people_tenant_id ON public.people(tenant_id);

-- 3. MIGRAR DATOS EXISTENTES: Asignar tenant_id basado en las reservas asociadas
-- Primero, asignar tenant_id a personas que están en reservas
UPDATE public.people 
SET tenant_id = r.tenant_id 
FROM public.reservations r 
WHERE r.person_id = people.id 
  AND r.tenant_id IS NOT NULL
  AND people.tenant_id IS NULL;

-- 4. Para personas sin reservas, asignar tenant_id = 1 (tenant por defecto)
-- Esto es temporal hasta que se implemente lógica de negocio específica
UPDATE public.people 
SET tenant_id = 1 
WHERE tenant_id IS NULL;

-- 5. HACER tenant_id NOT NULL después de la migración
ALTER TABLE public.people 
ALTER COLUMN tenant_id SET NOT NULL;

-- 6. AGREGAR FOREIGN KEY CONSTRAINT
ALTER TABLE public.people 
ADD CONSTRAINT people_tenant_id_fkey 
FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);

-- 7. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- 8. CREAR POLÍTICAS RLS PARA ACCESO POR TENANT

-- Política para SELECT: Usuarios solo pueden ver personas de su tenant
CREATE POLICY "Users can only see people from their tenant" ON public.people
FOR SELECT USING (
  tenant_id = (
    SELECT tenant_id FROM public.users 
    WHERE id = auth.uid()
  )
);

-- Política para INSERT: Usuarios solo pueden crear personas en su tenant
CREATE POLICY "Users can only create people in their tenant" ON public.people
FOR INSERT WITH CHECK (
  tenant_id = (
    SELECT tenant_id FROM public.users 
    WHERE id = auth.uid()
  )
);

-- Política para UPDATE: Usuarios solo pueden modificar personas de su tenant
CREATE POLICY "Users can only update people from their tenant" ON public.people
FOR UPDATE USING (
  tenant_id = (
    SELECT tenant_id FROM public.users 
    WHERE id = auth.uid()
  )
);

-- Política para DELETE: Usuarios solo pueden eliminar personas de su tenant
CREATE POLICY "Users can only delete people from their tenant" ON public.people
FOR DELETE USING (
  tenant_id = (
    SELECT tenant_id FROM public.users 
    WHERE id = auth.uid()
  )
);

-- 9. VERIFICAR QUE LA MIGRACIÓN FUE EXITOSA
-- Esta consulta debe devolver 0 filas (todas las personas deben tener tenant_id)
SELECT COUNT(*) as people_without_tenant 
FROM public.people 
WHERE tenant_id IS NULL;

-- 10. VERIFICAR DISTRIBUCIÓN DE PERSONAS POR TENANT
SELECT 
  t.name as tenant_name,
  COUNT(p.id) as people_count
FROM public.tenants t
LEFT JOIN public.people p ON t.id = p.tenant_id
GROUP BY t.id, t.name
ORDER BY t.id;

-- 11. VERIFICAR RELACIONES ENTRE PERSONAS Y RESERVAS
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
