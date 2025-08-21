-- Script de rollback para deshabilitar RLS en la tabla users
-- ⚠️ SOLO USAR EN CASO DE EMERGENCIA - DESHABILITA TODA LA SEGURIDAD
-- Este script debe ejecutarse SOLO si hay problemas críticos de acceso

-- 1. Verificar el estado actual antes del rollback
DO $$
BEGIN
    RAISE NOTICE '⚠️ ROLLBACK DE SEGURIDAD USERS - ESTADO ACTUAL ===';
    
    -- Verificar si RLS está habilitado
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'users' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE 'RLS está HABILITADO - se procederá a deshabilitarlo';
    ELSE
        RAISE NOTICE 'RLS ya está DESHABILITADO - no hay nada que hacer';
        RETURN;
    END IF;
    
    -- Contar políticas existentes
    RAISE NOTICE 'Políticas que se eliminarán: %', (
        SELECT COUNT(*) FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
    );
END $$;

-- 2. Eliminar todas las políticas RLS existentes
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "System can insert user profiles" ON public.users;
DROP POLICY IF EXISTS "System can delete user profiles" ON public.users;

-- 3. Deshabilitar RLS en la tabla users
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 4. Verificar que el rollback se completó
DO $$
BEGIN
    RAISE NOTICE '=== ROLLBACK COMPLETADO ===';
    
    -- Verificar si RLS está deshabilitado
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'users' 
        AND rowsecurity = false
    ) THEN
        RAISE NOTICE '✅ RLS DESHABILITADO exitosamente en la tabla users';
    ELSE
        RAISE NOTICE '❌ ERROR: RLS no se pudo deshabilitar en la tabla users';
    END IF;
    
    -- Verificar que no hay políticas
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
    ) THEN
        RAISE NOTICE '✅ Todas las políticas RLS eliminadas';
    ELSE
        RAISE NOTICE '⚠️ ADVERTENCIA: Algunas políticas RLS aún existen';
    END IF;
    
    RAISE NOTICE '⚠️ ADVERTENCIA: La tabla users ahora es ACCESIBLE para todos los usuarios autenticados';
    RAISE NOTICE '⚠️ ADVERTENCIA: Esto significa que cualquier usuario puede ver/editar perfiles de otros usuarios';
    RAISE NOTICE '⚠️ ADVERTENCIA: Ejecutar 47-restore-users-rls-security.sql para restaurar la seguridad';
END $$;

-- 5. Mostrar el estado final
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
AND tablename = 'users';

-- 6. Verificar que no hay políticas
SELECT 
    'No hay políticas RLS' as message,
    COUNT(*) as remaining_policies
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'users';
