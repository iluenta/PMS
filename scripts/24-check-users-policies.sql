-- Script para verificar las políticas de la tabla users
-- Ejecutar después del fix de recursión

-- 1. Verificar políticas actuales de users
SELECT 
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users'
ORDER BY policyname;

-- 2. Verificar que RLS está habilitado en users
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- 3. Verificar que la política simple está activa
SELECT 
    'USERS TABLE STATUS' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ POLÍTICAS ACTIVAS'
        ELSE '❌ SIN POLÍTICAS'
    END as status,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users'; 