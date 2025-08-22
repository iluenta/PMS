-- Script para configurar RLS simplificado en la tabla settings
-- Este script evita problemas de permisos usando políticas básicas

-- ============================================================================
-- 1. ELIMINAR POLÍTICAS EXISTENTES (si existen)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view global and tenant settings" ON public.settings;
DROP POLICY IF EXISTS "Users can create settings for their tenant" ON public.settings;
DROP POLICY IF EXISTS "Users can update settings for their tenant" ON public.settings;
DROP POLICY IF EXISTS "Users can delete settings for their tenant" ON public.settings;

-- ============================================================================
-- 2. CREAR POLÍTICAS SIMPLIFICADAS
-- ============================================================================

-- Política básica: usuarios autenticados pueden ver todas las configuraciones
CREATE POLICY "Users can view all settings" ON public.settings
    FOR SELECT
    TO authenticated
    USING (true);

-- Política básica: usuarios autenticados pueden crear configuraciones
CREATE POLICY "Users can create settings" ON public.settings
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política básica: usuarios autenticados pueden actualizar configuraciones
CREATE POLICY "Users can update settings" ON public.settings
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política básica: usuarios autenticados pueden eliminar configuraciones
CREATE POLICY "Users can delete settings" ON public.settings
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================================
-- 3. VERIFICACIONES
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

-- Mostrar resumen
SELECT 
    'SIMPLE RLS SETUP COMPLETE' as message,
    NOW() as completed_at;
