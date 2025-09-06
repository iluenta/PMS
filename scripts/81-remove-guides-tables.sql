-- Script para eliminar completamente las tablas de guías del viajero
-- Ejecutar con cuidado: esto eliminará TODOS los datos de guías

-- 1. Eliminar políticas RLS de las tablas de guías
DROP POLICY IF EXISTS "property_guides_select_policy" ON property_guides;
DROP POLICY IF EXISTS "property_guides_insert_policy" ON property_guides;
DROP POLICY IF EXISTS "property_guides_update_policy" ON property_guides;
DROP POLICY IF EXISTS "property_guides_delete_policy" ON property_guides;

DROP POLICY IF EXISTS "guide_sections_select_policy" ON guide_sections;
DROP POLICY IF EXISTS "guide_sections_insert_policy" ON guide_sections;
DROP POLICY IF EXISTS "guide_sections_update_policy" ON guide_sections;
DROP POLICY IF EXISTS "guide_sections_delete_policy" ON guide_sections;

DROP POLICY IF EXISTS "guide_media_select_policy" ON guide_media;
DROP POLICY IF EXISTS "guide_media_insert_policy" ON guide_media;
DROP POLICY IF EXISTS "guide_media_update_policy" ON guide_media;
DROP POLICY IF EXISTS "guide_media_delete_policy" ON guide_media;

-- 2. Eliminar triggers de las tablas de guías
DROP TRIGGER IF EXISTS update_property_guides_updated_at ON property_guides;
DROP TRIGGER IF EXISTS update_guide_sections_updated_at ON guide_sections;
DROP TRIGGER IF EXISTS update_guide_media_updated_at ON guide_media;

-- 3. Eliminar índices de las tablas de guías
DROP INDEX IF EXISTS idx_property_guides_property_id;
DROP INDEX IF EXISTS idx_property_guides_tenant_id;
DROP INDEX IF EXISTS idx_guide_sections_guide_id;
DROP INDEX IF EXISTS idx_guide_sections_tenant_id;
DROP INDEX IF EXISTS idx_guide_media_section_id;
DROP INDEX IF EXISTS idx_guide_media_tenant_id;

-- 4. Eliminar funciones relacionadas con guías
DROP FUNCTION IF EXISTS convert_html_to_structured();

-- 5. Eliminar tablas de guías (en orden correcto por dependencias)
DROP TABLE IF EXISTS guide_media CASCADE;
DROP TABLE IF EXISTS guide_sections CASCADE;
DROP TABLE IF EXISTS property_guides CASCADE;

-- 6. Eliminar bucket de storage de guías
-- Nota: Esto eliminará TODAS las imágenes de guías
DELETE FROM storage.buckets WHERE id = 'guide-media';

-- 7. Verificar que las tablas han sido eliminadas
SELECT 
    schemaname,
    tablename 
FROM pg_tables 
WHERE tablename IN ('property_guides', 'guide_sections', 'guide_media')
ORDER BY tablename;

-- 8. Verificar que el bucket ha sido eliminado
SELECT id, name FROM storage.buckets WHERE id = 'guide-media';

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Tablas de guías eliminadas exitosamente';
    RAISE NOTICE '✅ Políticas RLS eliminadas';
    RAISE NOTICE '✅ Triggers eliminados';
    RAISE NOTICE '✅ Índices eliminados';
    RAISE NOTICE '✅ Funciones eliminadas';
    RAISE NOTICE '✅ Bucket de storage eliminado';
    RAISE NOTICE '⚠️  TODOS los datos de guías han sido eliminados permanentemente';
END $$;
