-- Script para verificar el estado actual de RLS y políticas
-- Ejecutar en la base de datos de producción

-- 1. Verificar qué tablas tienen RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. Verificar qué políticas RLS existen
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. Verificar tablas sin políticas RLS (CRÍTICO)
SELECT 
    t.tablename,
    CASE WHEN p.policyname IS NULL THEN 'SIN POLÍTICAS' ELSE 'CON POLÍTICAS' END as status
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public' 
    AND t.tablename NOT LIKE 'pg_%'
    AND t.tablename NOT LIKE 'sql_%'
    AND p.policyname IS NULL
ORDER BY t.tablename;

-- 4. Contar políticas por tabla
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 5. Verificar políticas específicas para acceso autenticado
SELECT 
    tablename,
    policyname,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
    AND (qual LIKE '%authenticated%' OR qual LIKE '%auth.uid%' OR qual LIKE '%true%')
ORDER BY tablename, policyname; 