-- Script para verificar que la seguridad RLS de la tabla users se restauró correctamente
-- Este script debe ejecutarse después de ejecutar 47-restore-users-rls-security.sql

-- 1. Verificar estado general de RLS en la tabla users
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
AND tablename = 'users';

-- 2. Verificar todas las políticas RLS existentes en users
SELECT 
    policyname,
    cmd as operation,
    permissive,
    roles,
    qual as using_condition,
    with_check as check_condition,
    CASE 
        WHEN cmd = 'SELECT' THEN '🔍 Ver perfil propio'
        WHEN cmd = 'INSERT' THEN '➕ Crear perfil propio'
        WHEN cmd = 'UPDATE' THEN '✏️ Actualizar perfil propio'
        WHEN cmd = 'DELETE' THEN '🗑️ Eliminar perfil (bloqueado)'
        ELSE '❓ Operación desconocida'
    END as description
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users'
ORDER BY cmd;

-- 3. Verificar que las políticas están correctamente configuradas
DO $$
DECLARE
    policy_count INTEGER;
    rls_enabled BOOLEAN;
BEGIN
    -- Contar políticas
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'users';
    
    -- Verificar RLS
    SELECT rowsecurity INTO rls_enabled
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'users';
    
    RAISE NOTICE '=== VERIFICACIÓN DE SEGURIDAD USERS ===';
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
        AND tablename = 'users'
        AND cmd = 'SELECT' 
        AND qual LIKE '%auth.uid() = id%'
    ) THEN
        RAISE NOTICE '✅ Política SELECT correcta';
    ELSE
        RAISE NOTICE '❌ Política SELECT incorrecta o faltante';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
        AND cmd = 'UPDATE' 
        AND qual LIKE '%auth.uid() = id%'
    ) THEN
        RAISE NOTICE '✅ Política UPDATE correcta';
    ELSE
        RAISE NOTICE '❌ Política UPDATE incorrecta o faltante';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
        AND cmd = 'INSERT' 
        AND with_check LIKE '%auth.uid() = id%'
    ) THEN
        RAISE NOTICE '✅ Política INSERT correcta';
    ELSE
        RAISE NOTICE '❌ Política INSERT incorrecta o faltante';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
        AND cmd = 'DELETE' 
        AND qual = 'false'
    ) THEN
        RAISE NOTICE '✅ Política DELETE correcta (bloqueada)';
    ELSE
        RAISE NOTICE '❌ Política DELETE incorrecta o faltante';
    END IF;
    
    -- Resumen final
    IF rls_enabled AND policy_count >= 4 THEN
        RAISE NOTICE '🎉 SEGURIDAD USERS RESTAURADA EXITOSAMENTE';
    ELSE
        RAISE NOTICE '⚠️ PROBLEMAS DETECTADOS en la seguridad de users';
    END IF;
END $$;

-- 4. Verificar que no hay políticas problemáticas o duplicadas
SELECT 
    policyname,
    COUNT(*) as duplicate_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users'
GROUP BY policyname
HAVING COUNT(*) > 1;

-- 5. Verificar que las políticas no son demasiado permisivas
SELECT 
    policyname,
    cmd,
    qual,
    CASE 
        WHEN qual = 'true' THEN '⚠️ DEMASIADO PERMISIVA'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ RESTRICTIVA'
        WHEN qual = 'false' THEN '✅ BLOQUEADA'
        ELSE '❓ DESCONOCIDA'
    END as security_level
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users'
ORDER BY cmd;
