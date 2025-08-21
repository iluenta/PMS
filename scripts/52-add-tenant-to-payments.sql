-- Script para agregar tenant_id a la tabla payments e implementar multi-tenant
-- Este script sigue el mismo patrón que expenses, documents, people y reservations

-- 1. Verificar el estado actual de la tabla payments
DO $$
BEGIN
    RAISE NOTICE '=== ESTADO ACTUAL DE LA TABLA PAYMENTS ===';
    
    -- Verificar si ya existe tenant_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'tenant_id'
    ) THEN
        RAISE NOTICE '✅ La columna tenant_id ya existe en payments';
        RETURN;
    ELSE
        RAISE NOTICE '📋 Agregando columna tenant_id a payments...';
    END IF;
END $$;

-- 2. Agregar columna tenant_id a payments
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS tenant_id INTEGER;

-- 3. Crear índice para mejorar el rendimiento de consultas por tenant
CREATE INDEX IF NOT EXISTS idx_payments_tenant_id 
ON public.payments(tenant_id);

-- 4. Migrar datos existentes
-- Los pagos se asocian a reservas, que a su vez se asocian a propiedades
-- Por lo tanto, obtenemos el tenant_id de la propiedad a través de la reserva
UPDATE public.payments 
SET tenant_id = (
    SELECT p.tenant_id 
    FROM public.reservations r
    JOIN public.properties p ON r.property_id = p.id
    WHERE r.id = payments.reservation_id
)
WHERE payments.reservation_id IS NOT NULL;

-- Para pagos sin reserva (pagos generales), asignar al tenant 1 por defecto
UPDATE public.payments 
SET tenant_id = 1
WHERE tenant_id IS NULL;

-- 5. Hacer tenant_id NOT NULL después de migrar los datos
ALTER TABLE public.payments 
ALTER COLUMN tenant_id SET NOT NULL;

-- 6. Agregar foreign key constraint a la tabla tenants
ALTER TABLE public.payments 
ADD CONSTRAINT fk_payments_tenant_id 
FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- 7. Habilitar RLS en la tabla payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 8. Crear políticas RLS para multi-tenant
-- Política para SELECT: Usuarios solo pueden ver pagos de su tenant
CREATE POLICY "Users can view payments for their tenant" 
ON public.payments 
FOR SELECT 
TO authenticated 
USING (
    tenant_id = (
        SELECT tenant_id 
        FROM public.users 
        WHERE id = auth.uid()
    )
);

-- Política para INSERT: Usuarios solo pueden crear pagos en su tenant
CREATE POLICY "Users can insert payments for their tenant" 
ON public.payments 
FOR INSERT 
TO authenticated 
WITH CHECK (
    tenant_id = (
        SELECT tenant_id 
        FROM public.users 
        WHERE id = auth.uid()
    )
);

-- Política para UPDATE: Usuarios solo pueden actualizar pagos de su tenant
CREATE POLICY "Users can update payments for their tenant" 
ON public.payments 
FOR UPDATE 
TO authenticated 
USING (
    tenant_id = (
        SELECT tenant_id 
        FROM public.users 
        WHERE id = auth.uid()
    )
);

-- Política para DELETE: Usuarios solo pueden eliminar pagos de su tenant
CREATE POLICY "Users can delete payments for their tenant" 
ON public.payments 
FOR DELETE 
TO authenticated 
USING (
    tenant_id = (
        SELECT tenant_id 
        FROM public.users 
        WHERE id = auth.uid()
    )
);

-- 9. Verificar la migración
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICACIÓN DE MIGRACIÓN PAYMENTS ===';
    
    -- Contar pagos por tenant
    DECLARE
        tenant_1_count INTEGER;
        tenant_2_count INTEGER;
        null_tenant_count INTEGER;
        total_payments INTEGER;
    BEGIN
        SELECT COUNT(*) INTO total_payments FROM public.payments;
        
        SELECT COUNT(*) INTO tenant_1_count 
        FROM public.payments WHERE tenant_id = 1;
        
        SELECT COUNT(*) INTO tenant_2_count 
        FROM public.payments WHERE tenant_id = 2;
        
        SELECT COUNT(*) INTO null_tenant_count 
        FROM public.payments WHERE tenant_id IS NULL;
        
        RAISE NOTICE 'Total de pagos: %', total_payments;
        RAISE NOTICE 'Pagos en tenant 1: %', tenant_1_count;
        RAISE NOTICE 'Pagos en tenant 2: %', tenant_2_count;
        RAISE NOTICE 'Pagos sin tenant: %', null_tenant_count;
        
        IF null_tenant_count = 0 THEN
            RAISE NOTICE '✅ Todos los pagos tienen tenant_id asignado';
        ELSE
            RAISE NOTICE '⚠️ ADVERTENCIA: % pagos no tienen tenant_id', null_tenant_count;
        END IF;
    END;
    
    -- Verificar que RLS está habilitado
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'payments' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✅ RLS habilitado en payments';
    ELSE
        RAISE NOTICE '❌ RLS NO habilitado en payments';
    END IF;
    
    -- Verificar políticas
    DECLARE
        policies_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO policies_count
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'payments';
        
        IF policies_count = 4 THEN
            RAISE NOTICE '✅ Todas las políticas RLS creadas (% de 4)', policies_count;
        ELSE
            RAISE NOTICE '❌ Políticas incompletas (% de 4)', policies_count;
        END IF;
    END;
END $$;

-- 10. Mostrar el estado final
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ HABILITADO'
        ELSE '❌ DESHABILITADO'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'payments';

-- 11. Mostrar las políticas creadas
SELECT 
    policyname,
    cmd as operation,
    CASE 
        WHEN qual LIKE '%tenant_id%' THEN '🔑 Multi-tenant'
        ELSE '❓ Desconocida'
    END as policy_type
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'payments'
ORDER BY cmd;

-- 12. Mostrar distribución de datos por tenant
SELECT 
    tenant_id,
    COUNT(*) as payment_count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount
FROM public.payments 
GROUP BY tenant_id 
ORDER BY tenant_id;
