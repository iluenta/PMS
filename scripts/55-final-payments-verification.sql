-- Script de verificación final que incluye payments junto con todas las demás tablas
-- Este script debe ejecutarse después de todos los scripts de seguridad y multi-tenant

-- 1. Verificación general del estado de RLS en todas las tablas críticas (INCLUYENDO PAYMENTS)
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
AND tablename IN (
    'users',           -- 🔐 Usuarios
    'properties',      -- 🏠 Propiedades
    'bookings',        -- 📅 Reservas
    'people',          -- 👤 Personas
    'documents',       -- 📄 Documentos
    'expenses',        -- 💰 Gastos
    'reservations',    -- 🗓️ Reservas (legacy)
    'payments'         -- 💳 Pagos (NUEVO)
)
ORDER BY tablename;

-- 2. Verificación de políticas RLS por tabla (INCLUYENDO PAYMENTS)
WITH table_policies AS (
    SELECT 
        tablename,
        COUNT(*) as policy_count,
        STRING_AGG(cmd, ', ' ORDER BY cmd) as operations
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN (
        'users', 'properties', 'bookings', 'people', 
        'documents', 'expenses', 'reservations', 'payments'
    )
    GROUP BY tablename
)
SELECT 
    tp.tablename,
    tp.policy_count,
    tp.operations,
    CASE 
        WHEN tp.policy_count >= 4 THEN '✅ COMPLETA'
        WHEN tp.policy_count >= 2 THEN '⚠️ PARCIAL'
        ELSE '❌ INCOMPLETA'
    END as security_status
FROM table_policies tp
ORDER BY tp.tablename;

-- 3. Verificación específica de la tabla payments
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICACIÓN ESPECÍFICA DE PAYMENTS ===';
    
    -- Verificar RLS
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'payments' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✅ RLS habilitado en payments';
    ELSE
        RAISE NOTICE '❌ RLS NO habilitado en payments - CRÍTICO';
    END IF;
    
    -- Verificar políticas
    DECLARE
        payments_policies INTEGER;
        multi_tenant_policies INTEGER;
    BEGIN
        SELECT COUNT(*) INTO payments_policies
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'payments';
        
        SELECT COUNT(*) INTO multi_tenant_policies
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'payments'
        AND qual LIKE '%tenant_id%';
        
        IF payments_policies >= 4 THEN
            RAISE NOTICE '✅ Políticas completas en payments (% de 4)', payments_policies;
        ELSE
            RAISE NOTICE '❌ Políticas incompletas en payments (% de 4)', payments_policies;
        END IF;
        
        IF multi_tenant_policies = 4 THEN
            RAISE NOTICE '✅ Todas las políticas son multi-tenant (% de 4)', multi_tenant_policies;
        ELSE
            RAISE NOTICE '⚠️ ADVERTENCIA: % políticas no son multi-tenant', 4 - multi_tenant_policies;
        END IF;
    END;
END $$;

-- 4. Verificación de multi-tenant en todas las tablas (INCLUYENDO PAYMENTS)
SELECT 
    tablename,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = tablename 
            AND column_name = 'tenant_id'
        ) THEN '✅ CON tenant_id'
        ELSE '❌ SIN tenant_id'
    END as multi_tenant_status
FROM (
    VALUES 
        ('users'),
        ('properties'),
        ('bookings'),
        ('people'),
        ('documents'),
        ('expenses'),
        ('reservations'),
        ('payments')
) AS critical_tables(tablename)
ORDER BY tablename;

-- 5. Verificación de que las políticas multi-tenant están funcionando (INCLUYENDO PAYMENTS)
-- Buscar políticas que usen tenant_id
SELECT 
    p.tablename,
    p.policyname,
    p.cmd,
    CASE 
        WHEN p.qual LIKE '%tenant_id%' THEN '✅ Multi-tenant'
        WHEN p.qual LIKE '%auth.uid%' THEN '🔐 Usuario específico'
        ELSE '❓ Desconocida'
    END as policy_type
FROM pg_policies p
WHERE p.schemaname = 'public' 
AND p.tablename IN (
    'users', 'properties', 'bookings', 'people', 
    'documents', 'expenses', 'reservations', 'payments'
)
ORDER BY p.tablename, p.cmd;

-- 6. Verificación específica de la tabla users
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICACIÓN ESPECÍFICA DE USERS ===';
    
    -- Verificar RLS
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'users' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✅ RLS habilitado en users';
    ELSE
        RAISE NOTICE '❌ RLS NO habilitado en users - CRÍTICO';
    END IF;
    
    -- Verificar políticas
    DECLARE
        users_policies INTEGER;
    BEGIN
        SELECT COUNT(*) INTO users_policies
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users';
        
        IF users_policies >= 4 THEN
            RAISE NOTICE '✅ Políticas completas en users (% de 4)', users_policies;
        ELSE
            RAISE NOTICE '❌ Políticas incompletas en users (% de 4)', users_policies;
        END IF;
        
        -- Verificar que las políticas son restrictivas
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'users'
            AND qual = 'true'
        ) THEN
            RAISE NOTICE '✅ Todas las políticas son restrictivas';
        ELSE
            RAISE NOTICE '⚠️ ADVERTENCIA: Algunas políticas son demasiado permisivas';
        END IF;
    END;
END $$;

-- 7. Verificación específica de la tabla bookings
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICACIÓN ESPECÍFICA DE BOOKINGS ===';
    
    -- Verificar RLS
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'bookings' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✅ RLS habilitado en bookings';
    ELSE
        RAISE NOTICE '❌ RLS NO habilitado en bookings - CRÍTICO';
    END IF;
    
    -- Verificar políticas
    DECLARE
        bookings_policies INTEGER;
        complex_policies INTEGER;
    BEGIN
        SELECT COUNT(*) INTO bookings_policies
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'bookings';
        
        SELECT COUNT(*) INTO complex_policies
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'bookings'
        AND (qual LIKE '%EXISTS%' OR qual LIKE '%JOIN%');
        
        IF bookings_policies >= 4 THEN
            RAISE NOTICE '✅ Políticas completas en bookings (% de 4)', bookings_policies;
        ELSE
            RAISE NOTICE '❌ Políticas incompletas en bookings (% de 4)', bookings_policies;
        END IF;
        
        IF complex_policies = 0 THEN
            RAISE NOTICE '✅ Todas las políticas son simples (sin EXISTS/JOIN)';
        ELSE
            RAISE NOTICE '⚠️ ADVERTENCIA: % políticas complejas pueden causar bucles', complex_policies;
        END IF;
    END;
END $$;

-- 8. Resumen final de seguridad (INCLUYENDO PAYMENTS)
DO $$
BEGIN
    RAISE NOTICE '=== RESUMEN FINAL DE SEGURIDAD (INCLUYENDO PAYMENTS) ===';
    
    -- Contar tablas con RLS habilitado
    DECLARE
        tables_with_rls INTEGER;
        total_critical_tables INTEGER := 8; -- Incluye payments
        tables_with_policies INTEGER;
        multi_tenant_tables INTEGER;
    BEGIN
        SELECT COUNT(*) INTO tables_with_rls
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'users', 'properties', 'bookings', 'people', 
            'documents', 'expenses', 'reservations', 'payments'
        )
        AND rowsecurity = true;
        
        SELECT COUNT(*) INTO tables_with_policies
        FROM (
            SELECT DISTINCT tablename
            FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename IN (
                'users', 'properties', 'bookings', 'people', 
                'documents', 'expenses', 'reservations', 'payments'
            )
        ) t;
        
        SELECT COUNT(*) INTO multi_tenant_tables
        FROM (
            VALUES 
                ('users'), ('properties'), ('bookings'), ('people'), 
                ('documents'), ('expenses'), ('reservations'), ('payments')
        ) AS critical_tables(tablename)
        WHERE EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = critical_tables.tablename 
            AND column_name = 'tenant_id'
        );
        
        RAISE NOTICE 'Tablas críticas con RLS habilitado: % de %', tables_with_rls, total_critical_tables;
        RAISE NOTICE 'Tablas críticas con políticas RLS: % de %', tables_with_policies, total_critical_tables;
        RAISE NOTICE 'Tablas críticas con multi-tenant: % de %', multi_tenant_tables, total_critical_tables;
        
        -- Evaluación final
        IF tables_with_rls = total_critical_tables 
           AND tables_with_policies = total_critical_tables 
           AND multi_tenant_tables = total_critical_tables THEN
            RAISE NOTICE '🎉 SEGURIDAD COMPLETA: Todas las tablas críticas están protegidas (INCLUYENDO PAYMENTS)';
        ELSIF tables_with_rls >= total_critical_tables * 0.8 
              AND tables_with_policies >= total_critical_tables * 0.8 
              AND multi_tenant_tables >= total_critical_tables * 0.8 THEN
            RAISE NOTICE '⚠️ SEGURIDAD PARCIAL: La mayoría de las tablas están protegidas';
        ELSE
            RAISE NOTICE '❌ SEGURIDAD INSUFICIENTE: Muchas tablas críticas no están protegidas';
        END IF;
    END;
END $$;

-- 9. Verificación de integridad de datos en payments
SELECT 
    'Verificación de integridad de payments' as check_type,
    COUNT(*) as total_payments,
    COUNT(CASE WHEN tenant_id IS NOT NULL THEN 1 END) as payments_with_tenant,
    COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) as payments_without_tenant,
    CASE 
        WHEN COUNT(CASE WHEN tenant_id IS NULL THEN 1 END) = 0 THEN '✅ TODOS LOS PAGOS TIENEN TENANT_ID'
        ELSE '❌ HAY PAGOS SIN TENANT_ID'
    END as integrity_status
FROM public.payments;

-- 10. Distribución de pagos por tenant
SELECT 
    tenant_id,
    COUNT(*) as payment_count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount
FROM public.payments 
GROUP BY tenant_id 
ORDER BY tenant_id;
