-- Script de rollback para revertir la implementación multi-tenant de payments
-- ⚠️ SOLO USAR EN CASO DE EMERGENCIA - DESHABILITA LA SEGURIDAD MULTI-TENANT
-- Este script debe ejecutarse SOLO si hay problemas críticos con payments

-- 1. Verificar el estado actual antes del rollback
DO $$
BEGIN
    RAISE NOTICE '⚠️ ROLLBACK MULTI-TENANT PAYMENTS - ESTADO ACTUAL ===';
    
    -- Verificar si tenant_id existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'tenant_id'
    ) THEN
        RAISE NOTICE 'Columna tenant_id existe - se procederá a eliminarla';
    ELSE
        RAISE NOTICE 'Columna tenant_id NO existe - no hay nada que hacer';
        RETURN;
    END IF;
    
    -- Verificar si RLS está habilitado
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'payments' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE 'RLS está habilitado - se procederá a deshabilitarlo';
    ELSE
        RAISE NOTICE 'RLS ya está deshabilitado';
    END IF;
    
    -- Contar políticas existentes
    RAISE NOTICE 'Políticas que se eliminarán: %', (
        SELECT COUNT(*) FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'payments'
    );
END $$;

-- 2. Eliminar todas las políticas RLS existentes
DROP POLICY IF EXISTS "Users can view payments for their tenant" ON public.payments;
DROP POLICY IF EXISTS "Users can insert payments for their tenant" ON public.payments;
DROP POLICY IF EXISTS "Users can update payments for their tenant" ON public.payments;
DROP POLICY IF EXISTS "Users can delete payments for their tenant" ON public.payments;

-- 3. Deshabilitar RLS en la tabla payments
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;

-- 4. Eliminar la foreign key constraint
ALTER TABLE public.payments 
DROP CONSTRAINT IF EXISTS fk_payments_tenant_id;

-- 5. Eliminar el índice de tenant_id
DROP INDEX IF EXISTS idx_payments_tenant_id;

-- 6. Eliminar la columna tenant_id
ALTER TABLE public.payments 
DROP COLUMN IF EXISTS tenant_id;

-- 7. Verificar que el rollback se completó
DO $$
BEGIN
    RAISE NOTICE '=== ROLLBACK COMPLETADO ===';
    
    -- Verificar que tenant_id fue eliminada
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'tenant_id'
    ) THEN
        RAISE NOTICE '✅ Columna tenant_id eliminada exitosamente';
    ELSE
        RAISE NOTICE '❌ ERROR: Columna tenant_id no se pudo eliminar';
    END IF;
    
    -- Verificar que RLS está deshabilitado
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'payments' 
        AND rowsecurity = false
    ) THEN
        RAISE NOTICE '✅ RLS deshabilitado exitosamente en payments';
    ELSE
        RAISE NOTICE '❌ ERROR: RLS no se pudo deshabilitar en payments';
    END IF;
    
    -- Verificar que no hay políticas
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'payments'
    ) THEN
        RAISE NOTICE '✅ Todas las políticas RLS eliminadas';
    ELSE
        RAISE NOTICE '⚠️ ADVERTENCIA: Algunas políticas RLS aún existen';
    END IF;
    
    RAISE NOTICE '⚠️ ADVERTENCIA: La tabla payments ahora es ACCESIBLE para todos los usuarios autenticados';
    RAISE NOTICE '⚠️ ADVERTENCIA: Esto significa que cualquier usuario puede ver/editar pagos de otros usuarios';
    RAISE NOTICE '⚠️ ADVERTENCIA: Ejecutar 52-add-tenant-to-payments.sql para restaurar la seguridad multi-tenant';
END $$;

-- 8. Mostrar el estado final
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ HABILITADO'
        ELSE '❌ DESHABILITADO (INSECURO)'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'payments';

-- 9. Verificar que no hay políticas
SELECT 
    'No hay políticas RLS' as message,
    COUNT(*) as remaining_policies
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'payments';

-- 10. Verificar que tenant_id fue eliminada
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'payments'
ORDER BY ordinal_position;

-- 11. Mostrar el estado de la tabla payments
SELECT 
    'Estado de la tabla payments después del rollback' as info,
    COUNT(*) as total_payments,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount
FROM public.payments;
