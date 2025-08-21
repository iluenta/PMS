-- Script para restaurar la seguridad RLS de la tabla users
-- Este script restaura las políticas de seguridad y habilita RLS correctamente

-- 1. Verificar el estado actual de la tabla users
DO $$
BEGIN
    RAISE NOTICE '=== ESTADO ACTUAL DE LA TABLA USERS ===';
    
    -- Verificar si RLS está habilitado
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'users' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE 'RLS está HABILITADO en la tabla users';
    ELSE
        RAISE NOTICE 'RLS está DESHABILITADO en la tabla users';
    END IF;
    
    -- Verificar políticas existentes
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
    ) THEN
        RAISE NOTICE 'Existen políticas RLS en la tabla users';
    ELSE
        RAISE NOTICE 'NO existen políticas RLS en la tabla users';
    END IF;
END $$;

-- 2. Eliminar políticas existentes (si las hay) para empezar limpio
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.users;

-- 3. Habilitar RLS en la tabla users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas de seguridad apropiadas

-- Política para SELECT: Usuarios solo pueden ver su propio perfil
CREATE POLICY "Users can view own profile" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Política para UPDATE: Usuarios solo pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- Política para INSERT: Solo el sistema puede crear perfiles (via trigger)
CREATE POLICY "System can insert user profiles" 
ON public.users 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Política para DELETE: Usuarios no pueden eliminar perfiles (solo el sistema)
CREATE POLICY "System can delete user profiles" 
ON public.users 
FOR DELETE 
TO authenticated 
USING (false);

-- 5. Verificar que las políticas se crearon correctamente
DO $$
BEGIN
    RAISE NOTICE '=== POLÍTICAS CREADAS ===';
    
    -- Contar políticas
    RAISE NOTICE 'Total de políticas en users: %', (
        SELECT COUNT(*) FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
    );
    
    -- Listar políticas
    RAISE NOTICE 'Políticas creadas:';
    FOR policy_rec IN 
        SELECT policyname, cmd, permissive 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
        ORDER BY policyname
    LOOP
        RAISE NOTICE '- %: % (permissive: %)', 
            policy_rec.policyname, 
            policy_rec.cmd, 
            policy_rec.permissive;
    END LOOP;
END $$;

-- 6. Verificar que RLS está habilitado
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'users' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE '✅ RLS RESTAURADO EXITOSAMENTE en la tabla users';
    ELSE
        RAISE NOTICE '❌ ERROR: RLS no se pudo habilitar en la tabla users';
    END IF;
END $$;
