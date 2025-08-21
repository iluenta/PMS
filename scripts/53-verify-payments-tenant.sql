-- Script para verificar que la implementación multi-tenant de payments se realizó correctamente
-- Este script debe ejecutarse después de ejecutar 52-add-tenant-to-payments.sql

-- 1. Verificar que la columna tenant_id existe
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name = 'tenant_id' THEN '🔑 CLAVE MULTI-TENANT'
        WHEN column_name = 'reservation_id' THEN '📅 REFERENCIA A RESERVA'
        WHEN column_name = 'invoice_id' THEN '🧾 REFERENCIA A FACTURA'
        WHEN column_name = 'amount' THEN '💰 IMPORTE'
        WHEN column_name = 'status' THEN '📊 ESTADO'
        ELSE '📋 CAMPO NORMAL'
    END as description
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'payments'
ORDER BY ordinal_position;

-- 2. Verificar que RLS está habilitado
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

-- 3. Verificar todas las políticas RLS existentes en payments
SELECT 
    policyname,
    cmd as operation,
    permissive,
    roles,
    qual as using_condition,
    with_check as check_condition,
    CASE 
        WHEN cmd = 'SELECT' THEN '🔍 Ver pagos'
        WHEN cmd = 'INSERT' THEN '➕ Crear pagos'
        WHEN cmd = 'UPDATE' THEN '✏️ Actualizar pagos'
        WHEN cmd = 'DELETE' THEN '🗑️ Eliminar pagos'
        ELSE '❓ Operación desconocida'
    END as description
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'payments'
ORDER BY cmd;

-- 4. Verificar que las políticas están correctamente configuradas
DO $$
DECLARE
    policy_count INTEGER;
    rls_enabled BOOLEAN;
    tenant_id_exists BOOLEAN;
BEGIN
    -- Contar políticas
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'payments';
    
    -- Verificar RLS
    SELECT rowsecurity INTO rls_enabled
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'payments';
    
    -- Verificar que tenant_id existe
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'payments' 
        AND column_name = 'tenant_id'
    ) INTO tenant_id_exists;
    
    RAISE NOTICE '=== VERIFICACIÓN DE SEGURIDAD PAYMENTS ===';
    RAISE NOTICE 'Columna tenant_id existe: %', CASE WHEN tenant_id_exists THEN '✅ SÍ' ELSE '❌ NO' END;
    RAISE NOTICE 'RLS habilitado: %', CASE WHEN rls_enabled THEN '✅ SÍ' ELSE '❌ NO' END;
    RAISE NOTICE 'Total de políticas: %', policy_count;
    
    -- Verificar políticas específicas
    IF policy_count >= 4 THEN
        RAISE NOTICE '✅ Políticas completas: SELECT, INSERT, UPDATE, DELETE';
    ELSE
        RAISE NOTICE '❌ Políticas incompletas: faltan % políticas', 4 - policy_count;
    END IF;
    
    -- Verificar que las políticas están correctas
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'payments'
        AND cmd = 'SELECT' 
        AND qual LIKE '%tenant_id%'
    ) THEN
        RAISE NOTICE '✅ Política SELECT correcta (multi-tenant)';
    ELSE
        RAISE NOTICE '❌ Política SELECT incorrecta o faltante';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'payments'
        AND cmd = 'INSERT' 
        AND with_check LIKE '%tenant_id%'
    ) THEN
        RAISE NOTICE '✅ Política INSERT correcta (multi-tenant)';
    ELSE
        RAISE NOTICE '❌ Política INSERT incorrecta o faltante';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'payments'
        AND cmd = 'UPDATE' 
        AND qual LIKE '%tenant_id%'
    ) THEN
        RAISE NOTICE '✅ Política UPDATE correcta (multi-tenant)';
    ELSE
        RAISE NOTICE '❌ Política UPDATE incorrecta o faltante';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'payments'
        AND cmd = 'DELETE' 
        AND qual LIKE '%tenant_id%'
    ) THEN
        RAISE NOTICE '✅ Política DELETE correcta (multi-tenant)';
    ELSE
        RAISE NOTICE '❌ Política DELETE incorrecta o faltante';
    END IF;
    
    -- Resumen final
    IF tenant_id_exists AND rls_enabled AND policy_count >= 4 THEN
        RAISE NOTICE '🎉 MULTI-TENANT PAYMENTS IMPLEMENTADO EXITOSAMENTE';
    ELSE
        RAISE NOTICE '⚠️ PROBLEMAS DETECTADOS en la implementación multi-tenant de payments';
    END IF;
END $$;

-- 5. Verificar que no hay políticas problemáticas o duplicadas
SELECT 
    policyname,
    COUNT(*) as duplicate_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'payments'
GROUP BY policyname
HAVING COUNT(*) > 1;

-- 6. Verificar que las políticas no son demasiado permisivas
SELECT 
    policyname,
    cmd,
    qual,
    CASE 
        WHEN qual = 'true' THEN '⚠️ DEMASIADO PERMISIVA'
        WHEN qual LIKE '%tenant_id%' THEN '✅ MULTI-TENANT'
        WHEN qual LIKE '%auth.uid%' THEN '🔐 Usuario específico'
        ELSE '❓ DESCONOCIDA'
    END as security_level
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'payments'
ORDER BY cmd;

-- 7. Verificar la integridad de los datos
-- Contar pagos por tenant
SELECT 
    tenant_id,
    COUNT(*) as payment_count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount,
    MIN(amount) as min_amount,
    MAX(amount) as max_amount
FROM public.payments 
GROUP BY tenant_id 
ORDER BY tenant_id;

-- 8. Verificar que no hay pagos sin tenant_id
SELECT 
    'Pagos sin tenant_id' as check_type,
    COUNT(*) as count
FROM public.payments 
WHERE tenant_id IS NULL

UNION ALL

SELECT 
    'Total de pagos' as check_type,
    COUNT(*) as count
FROM public.payments;

-- 9. Verificar la relación con reservas y propiedades
-- Mostrar algunos ejemplos de la cadena de relaciones
SELECT 
    p.id as payment_id,
    p.amount,
    p.status,
    p.tenant_id as payment_tenant,
    r.id as reservation_id,
    r.guest->>'name' as guest_name,
    prop.tenant_id as property_tenant,
    CASE 
        WHEN p.tenant_id = prop.tenant_id THEN '✅ CONSISTENTE'
        ELSE '❌ INCONSISTENTE'
    END as tenant_consistency
FROM public.payments p
LEFT JOIN public.reservations r ON p.reservation_id = r.id
LEFT JOIN public.properties prop ON r.property_id = prop.id
ORDER BY p.created_at DESC
LIMIT 10;

-- 10. Verificar el índice de tenant_id
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'payments' 
AND indexname LIKE '%tenant%';

-- 11. Verificar la foreign key constraint
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'payments'
AND kcu.column_name = 'tenant_id';
