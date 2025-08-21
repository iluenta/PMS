-- Script de verificación final para confirmar que toda la seguridad está funcionando
-- Este script debe ejecutarse después de todos los scripts de seguridad

-- 1. Verificación general del estado de RLS en todas las tablas críticas
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
    'reservations'     -- 🗓️ Reservas (legacy)
)
ORDER BY tablename;

-- 2. Verificación de políticas RLS por tabla
WITH table_policies AS (
    SELECT 
        tablename,
        COUNT(*) as policy_count,
        STRING_AGG(cmd, ', ' ORDER BY cmd) as operations
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN (
        'users', 'properties', 'bookings', 'people', 
        'documents', 'expenses', 'reservations'
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

-- 3. Verificación específica de la tabla users
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
    END;
    
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
END $$;

-- 4. Verificación específica de la tabla bookings
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

-- 5. Verificación de multi-tenant en todas las tablas
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
        ('reservations')
) AS critical_tables(tablename)
ORDER BY tablename;

-- 6. Verificación de que las políticas multi-tenant están funcionando
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
    'documents', 'expenses', 'reservations'
)
ORDER BY p.tablename, p.cmd;

-- 7. Resumen final de seguridad
DO $$
BEGIN
    RAISE NOTICE '=== RESUMEN FINAL DE SEGURIDAD ===';
    
    -- Contar tablas con RLS habilitado
    DECLARE
        tables_with_rls INTEGER;
        total_critical_tables INTEGER := 7;
        tables_with_policies INTEGER;
        multi_tenant_tables INTEGER;
    BEGIN
        SELECT COUNT(*) INTO tables_with_rls
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'users', 'properties', 'bookings', 'people', 
            'documents', 'expenses', 'reservations'
        )
        AND rowsecurity = true;
        
        SELECT COUNT(*) INTO tables_with_policies
        FROM (
            SELECT DISTINCT tablename
            FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename IN (
                'users', 'properties', 'bookings', 'people', 
                'documents', 'expenses', 'reservations'
            )
        ) t;
        
        SELECT COUNT(*) INTO multi_tenant_tables
        FROM (
            VALUES 
                ('users'), ('properties'), ('bookings'), ('people'), 
                ('documents'), ('expenses'), ('reservations')
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
            RAISE NOTICE '🎉 SEGURIDAD COMPLETA: Todas las tablas críticas están protegidas';
        ELSIF tables_with_rls >= total_critical_tables * 0.8 
              AND tables_with_policies >= total_critical_tables * 0.8 
              AND multi_tenant_tables >= total_critical_tables * 0.8 THEN
            RAISE NOTICE '⚠️ SEGURIDAD PARCIAL: La mayoría de las tablas están protegidas';
        ELSE
            RAISE NOTICE '❌ SEGURIDAD INSUFICIENTE: Muchas tablas críticas no están protegidas';
        END IF;
    END;
END $$;
