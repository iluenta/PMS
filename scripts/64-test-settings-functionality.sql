-- Script de prueba para verificar la funcionalidad de settings
-- Ejecutar después de configurar la tabla y RLS

-- ============================================================================
-- 1. VERIFICAR ESTRUCTURA DE LA TABLA
-- ============================================================================

-- Verificar que la tabla existe
SELECT 
    'Table structure check' as test_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'settings') 
        THEN 'PASS ✅' 
        ELSE 'FAIL ❌' 
    END as result;

-- Verificar columnas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'settings'
ORDER BY ordinal_position;

-- ============================================================================
-- 2. VERIFICAR DATOS DE EJEMPLO
-- ============================================================================

-- Contar configuraciones existentes
SELECT 
    'Data count check' as test_type,
    COUNT(*) as total_settings,
    CASE 
        WHEN COUNT(*) >= 4 THEN 'PASS ✅' 
        ELSE 'FAIL ❌' 
    END as result
FROM public.settings;

-- Mostrar configuraciones existentes
SELECT 
    key,
    description,
    config_type,
    CASE 
        WHEN config_type = 'simple_list' THEN 'Array de ' || jsonb_array_length(value) || ' elementos'
        WHEN config_type = 'colored_list' THEN 'Array de ' || jsonb_array_length(value) || ' elementos con colores'
        ELSE 'Tipo desconocido'
    END as value_summary
FROM public.settings
ORDER BY key;

-- ============================================================================
-- 3. VERIFICAR RLS Y POLÍTICAS
-- ============================================================================

-- Verificar RLS habilitado
SELECT 
    'RLS check' as test_type,
    CASE 
        WHEN rowsecurity THEN 'PASS ✅' 
        ELSE 'FAIL ❌' 
    END as result
FROM pg_tables 
WHERE tablename = 'settings';

-- Verificar políticas
SELECT 
    'Policies check' as test_type,
    COUNT(*) as total_policies,
    CASE 
        WHEN COUNT(*) = 4 THEN 'PASS ✅' 
        ELSE 'FAIL ❌' 
    END as result
FROM pg_policies 
WHERE tablename = 'settings';

-- Mostrar políticas
SELECT 
    policyname,
    cmd,
    permissive,
    CASE 
        WHEN cmd = 'SELECT' THEN 'READ'
        WHEN cmd = 'INSERT' THEN 'CREATE'
        WHEN cmd = 'UPDATE' THEN 'UPDATE'
        WHEN cmd = 'DELETE' THEN 'DELETE'
        ELSE cmd
    END as operation
FROM pg_policies 
WHERE tablename = 'settings'
ORDER BY cmd;

-- ============================================================================
-- 4. PRUEBAS DE FUNCIONALIDAD
-- ============================================================================

-- Intentar insertar una nueva configuración de prueba
INSERT INTO public.settings (key, description, config_type, value) VALUES
('test_config', 'Configuración de prueba', 'simple_list', '["test1", "test2", "test3"]')
ON CONFLICT (key) DO NOTHING;

-- Verificar que se insertó
SELECT 
    'Insert test' as test_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM public.settings WHERE key = 'test_config') 
        THEN 'PASS ✅' 
        ELSE 'FAIL ❌' 
    END as result;

-- Actualizar la configuración de prueba
UPDATE public.settings 
SET value = '["test1", "test2", "test3", "test4"]'::jsonb 
WHERE key = 'test_config';

-- Verificar que se actualizó
SELECT 
    'Update test' as test_type,
    CASE 
        WHEN jsonb_array_length(value) = 4 
        THEN 'PASS ✅' 
        ELSE 'FAIL ❌' 
    END as result
FROM public.settings 
WHERE key = 'test_config';

-- Eliminar la configuración de prueba
DELETE FROM public.settings WHERE key = 'test_config';

-- Verificar que se eliminó
SELECT 
    'Delete test' as test_type,
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM public.settings WHERE key = 'test_config') 
        THEN 'PASS ✅' 
        ELSE 'FAIL ❌' 
    END as result;

-- ============================================================================
-- 5. RESUMEN DE PRUEBAS
-- ============================================================================

SELECT 
    'SETTINGS FUNCTIONALITY TEST COMPLETE' as message,
    NOW() as completed_at,
    'All tests should show PASS ✅ if everything is working correctly' as note;
