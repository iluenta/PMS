-- Script para corregir las políticas RLS de la tabla settings
-- Este script corrige el problema de permisos con auth.users

-- ============================================================================
-- 1. ELIMINAR POLÍTICAS EXISTENTES (si existen)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view global and tenant settings" ON public.settings;
DROP POLICY IF EXISTS "Users can create settings for their tenant" ON public.settings;
DROP POLICY IF EXISTS "Users can update settings for their tenant" ON public.settings;
DROP POLICY IF EXISTS "Users can delete settings for their tenant" ON public.settings;

-- ============================================================================
-- 2. CREAR POLÍTICAS CORREGIDAS
-- ============================================================================

-- Política para usuarios autenticados: pueden ver configuraciones globales y de su tenant
CREATE POLICY "Users can view global and tenant settings" ON public.settings
    FOR SELECT
    TO authenticated
    USING (
        tenant_id IS NULL 
        OR 
        tenant_id = (
            SELECT tenant_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    );

-- Política para usuarios autenticados: pueden crear configuraciones para su tenant
CREATE POLICY "Users can create settings for their tenant" ON public.settings
    FOR INSERT
    TO authenticated
    WITH CHECK (
        tenant_id = (
            SELECT tenant_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
        OR
        tenant_id IS NULL
    );

-- Política para usuarios autenticados: pueden actualizar configuraciones de su tenant
CREATE POLICY "Users can update settings for their tenant" ON public.settings
    FOR UPDATE
    TO authenticated
    USING (
        tenant_id = (
            SELECT tenant_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        tenant_id = (
            SELECT tenant_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    );

-- Política para usuarios autenticados: pueden eliminar configuraciones de su tenant
CREATE POLICY "Users can delete settings for their tenant" ON public.settings
    FOR DELETE
    TO authenticated
    USING (
        tenant_id = (
            SELECT tenant_id 
            FROM public.users 
            WHERE id = auth.uid()
        )
    );

-- ============================================================================
-- 3. ALTERNATIVA: POLÍTICAS SIMPLIFICADAS (si la tabla users no existe)
-- ============================================================================

-- Si la tabla users no existe o no tiene tenant_id, usar estas políticas simplificadas:

-- Política simplificada: usuarios autenticados pueden ver todas las configuraciones
-- CREATE POLICY "Users can view all settings" ON public.settings
--     FOR SELECT
--     TO authenticated
--     USING (true);

-- Política simplificada: usuarios autenticados pueden crear configuraciones
-- CREATE POLICY "Users can create settings" ON public.settings
--     FOR INSERT
--     TO authenticated
--     WITH CHECK (true);

-- Política simplificada: usuarios autenticados pueden actualizar configuraciones
-- CREATE POLICY "Users can update settings" ON public.settings
--     FOR UPDATE
--     TO authenticated
--     USING (true)
--     WITH CHECK (true);

-- Política simplificada: usuarios autenticados pueden eliminar configuraciones
-- CREATE POLICY "Users can delete settings" ON public.settings
--     FOR DELETE
--     TO authenticated
--     USING (true);

-- ============================================================================
-- 4. VERIFICACIONES
-- ============================================================================

-- Verificar que RLS está habilitado
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS ENABLED ✅' 
        ELSE 'RLS DISABLED ❌' 
    END as rls_status
FROM pg_tables 
WHERE tablename = 'settings';

-- Verificar las políticas creadas
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    cmd, 
    CASE 
        WHEN cmd = 'SELECT' THEN 'READ ✅'
        WHEN cmd = 'INSERT' THEN 'CREATE ✅'
        WHEN cmd = 'UPDATE' THEN 'UPDATE ✅'
        WHEN cmd = 'DELETE' THEN 'DELETE ✅'
        ELSE cmd
    END as operation
FROM pg_policies 
WHERE tablename = 'settings'
ORDER BY cmd;

-- Verificar si la tabla users existe y tiene tenant_id
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') 
        THEN 'Table users exists ✅' 
        ELSE 'Table users does not exist ❌' 
    END as users_table_status;

-- Si la tabla users existe, verificar si tiene tenant_id
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'tenant_id'
        ) 
        THEN 'Column tenant_id exists ✅' 
        ELSE 'Column tenant_id does not exist ❌' 
    END as tenant_id_status;
