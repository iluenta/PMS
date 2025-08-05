-- Script de verificación final - Confirmar que todas las tablas tienen políticas RLS
-- Ejecutar después de aplicar las políticas

-- 1. Verificar que todas las tablas tienen políticas
SELECT 
    t.tablename,
    CASE 
        WHEN p.policyname IS NULL THEN '❌ SIN POLÍTICAS'
        ELSE '✅ CON POLÍTICAS'
    END as status,
    COUNT(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public' 
    AND t.tablename NOT LIKE 'pg_%'
    AND t.tablename NOT LIKE 'sql_%'
GROUP BY t.tablename, p.policyname
ORDER BY t.tablename;

-- 2. Resumen de políticas por tabla
SELECT 
    tablename,
    COUNT(*) as total_policies,
    STRING_AGG(cmd, ', ' ORDER BY cmd) as operations_allowed
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 3. Verificar políticas específicas para usuarios autenticados
SELECT 
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
    AND (qual LIKE '%authenticated%' OR qual LIKE '%auth.uid%' OR qual LIKE '%true%')
ORDER BY tablename, cmd;

-- 4. Verificar que no hay tablas bloqueadas
SELECT 
    'VERIFICACIÓN COMPLETA' as status,
    COUNT(*) as total_tables,
    COUNT(CASE WHEN p.policyname IS NOT NULL THEN 1 END) as tables_with_policies,
    COUNT(CASE WHEN p.policyname IS NULL THEN 1 END) as tables_without_policies
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public' 
    AND t.tablename NOT LIKE 'pg_%'
    AND t.tablename NOT LIKE 'sql_%'; 