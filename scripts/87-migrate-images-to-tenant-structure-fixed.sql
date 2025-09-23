-- Script corregido para migrar imágenes existentes a la nueva estructura organizada por tenant
-- Este script debe ejecutarse después de implementar el nuevo servicio unificado

-- 1. Crear función para obtener tenant_id de una propiedad
CREATE OR REPLACE FUNCTION get_property_tenant_id(property_uuid TEXT)
RETURNS INTEGER AS $$
DECLARE
    result_tenant_id INTEGER;
BEGIN
    SELECT p.tenant_id INTO result_tenant_id
    FROM properties p
    WHERE p.id::text = property_uuid;
    
    RETURN COALESCE(result_tenant_id, 1); -- Default tenant si no se encuentra
END;
$$ LANGUAGE plpgsql;

-- 2. Crear función para migrar imágenes de propiedades
CREATE OR REPLACE FUNCTION migrate_property_images()
RETURNS TEXT AS $$
DECLARE
    migration_log TEXT := '';
    property_record RECORD;
    prop_tenant_id INTEGER;
BEGIN
    migration_log := migration_log || 'Iniciando migración de imágenes de propiedades...' || E'\n';
    
    -- Obtener todas las propiedades con imágenes
    FOR property_record IN 
        SELECT id, tenant_id, name, cover_image, images
        FROM properties 
        WHERE cover_image IS NOT NULL OR images IS NOT NULL
    LOOP
        prop_tenant_id := property_record.tenant_id;
        
        migration_log := migration_log || 
            'Propiedad: ' || property_record.name || 
            ' (ID: ' || property_record.id || 
            ', Tenant: ' || prop_tenant_id || ')' || E'\n';
        
        -- Aquí se podría implementar la lógica de migración real
        -- Por ahora solo registramos la información
        migration_log := migration_log || 
            '  - Imagen de portada: ' || COALESCE(property_record.cover_image, 'N/A') || E'\n';
        
        IF property_record.images IS NOT NULL THEN
            migration_log := migration_log || 
                '  - Imágenes adicionales: ' || array_length(property_record.images, 1) || ' imágenes' || E'\n';
        END IF;
    END LOOP;
    
    migration_log := migration_log || 'Migración de propiedades completada.' || E'\n';
    
    RETURN migration_log;
END;
$$ LANGUAGE plpgsql;

-- 3. Crear función para migrar imágenes de guías
CREATE OR REPLACE FUNCTION migrate_guide_images()
RETURNS TEXT AS $$
DECLARE
    migration_log TEXT := '';
    beach_record RECORD;
    restaurant_record RECORD;
    activity_record RECORD;
BEGIN
    migration_log := migration_log || 'Iniciando migración de imágenes de guías...' || E'\n';
    
    -- Migrar imágenes de playas
    FOR beach_record IN 
        SELECT b.id, b.name, b.image_url, g.tenant_id, g.property_id
        FROM beaches b
        JOIN guides g ON b.guide_id = g.id
        WHERE b.image_url IS NOT NULL
    LOOP
        migration_log := migration_log || 
            'Playa: ' || beach_record.name || 
            ' (ID: ' || beach_record.id || 
            ', Tenant: ' || beach_record.tenant_id || 
            ', Propiedad: ' || beach_record.property_id || ')' || E'\n';
        
        migration_log := migration_log || 
            '  - Imagen: ' || beach_record.image_url || E'\n';
    END LOOP;
    
    -- Migrar imágenes de restaurantes
    FOR restaurant_record IN 
        SELECT r.id, r.name, r.image_url, g.tenant_id, g.property_id
        FROM restaurants r
        JOIN guides g ON r.guide_id = g.id
        WHERE r.image_url IS NOT NULL
    LOOP
        migration_log := migration_log || 
            'Restaurante: ' || restaurant_record.name || 
            ' (ID: ' || restaurant_record.id || 
            ', Tenant: ' || restaurant_record.tenant_id || 
            ', Propiedad: ' || restaurant_record.property_id || ')' || E'\n';
        
        migration_log := migration_log || 
            '  - Imagen: ' || restaurant_record.image_url || E'\n';
    END LOOP;
    
    -- Migrar imágenes de actividades
    FOR activity_record IN 
        SELECT a.id, a.name, a.image_url, g.tenant_id, g.property_id
        FROM activities a
        JOIN guides g ON a.guide_id = g.id
        WHERE a.image_url IS NOT NULL
    LOOP
        migration_log := migration_log || 
            'Actividad: ' || activity_record.name || 
            ' (ID: ' || activity_record.id || 
            ', Tenant: ' || activity_record.tenant_id || 
            ', Propiedad: ' || activity_record.property_id || ')' || E'\n';
        
        migration_log := migration_log || 
            '  - Imagen: ' || activity_record.image_url || E'\n';
    END LOOP;
    
    migration_log := migration_log || 'Migración de guías completada.' || E'\n';
    
    RETURN migration_log;
END;
$$ LANGUAGE plpgsql;

-- 4. Ejecutar migración y mostrar resultados
DO $$
DECLARE
    property_log TEXT;
    guide_log TEXT;
BEGIN
    RAISE NOTICE '=== INICIANDO MIGRACIÓN DE IMÁGENES ===';
    
    -- Migrar imágenes de propiedades
    SELECT migrate_property_images() INTO property_log;
    RAISE NOTICE '%', property_log;
    
    -- Migrar imágenes de guías
    SELECT migrate_guide_images() INTO guide_log;
    RAISE NOTICE '%', guide_log;
    
    RAISE NOTICE '=== MIGRACIÓN COMPLETADA ===';
    RAISE NOTICE 'IMPORTANTE: Este script solo genera el reporte de migración.';
    RAISE NOTICE 'Para migrar realmente las imágenes, se necesita:';
    RAISE NOTICE '1. Acceso programático a Supabase Storage';
    RAISE NOTICE '2. Script de migración en JavaScript/TypeScript';
    RAISE NOTICE '3. Backup de las imágenes antes de la migración';
END;
$$;

-- 5. Crear vista para monitorear la estructura de imágenes
CREATE OR REPLACE VIEW image_structure_report AS
SELECT 
    'properties' as category,
    p.tenant_id,
    p.id as entity_id,
    p.name as entity_name,
    CASE 
        WHEN p.cover_image IS NOT NULL THEN 1 
        ELSE 0 
    END as has_cover_image,
    CASE 
        WHEN p.images IS NOT NULL THEN array_length(p.images, 1) 
        ELSE 0 
    END as additional_images_count
FROM properties p
WHERE p.cover_image IS NOT NULL OR p.images IS NOT NULL

UNION ALL

SELECT 
    'beaches' as category,
    g.tenant_id,
    b.id as entity_id,
    b.name as entity_name,
    CASE 
        WHEN b.image_url IS NOT NULL THEN 1 
        ELSE 0 
    END as has_cover_image,
    0 as additional_images_count
FROM beaches b
JOIN guides g ON b.guide_id = g.id
WHERE b.image_url IS NOT NULL

UNION ALL

SELECT 
    'restaurants' as category,
    g.tenant_id,
    r.id as entity_id,
    r.name as entity_name,
    CASE 
        WHEN r.image_url IS NOT NULL THEN 1 
        ELSE 0 
    END as has_cover_image,
    0 as additional_images_count
FROM restaurants r
JOIN guides g ON r.guide_id = g.id
WHERE r.image_url IS NOT NULL

UNION ALL

SELECT 
    'activities' as category,
    g.tenant_id,
    a.id as entity_id,
    a.name as entity_name,
    CASE 
        WHEN a.image_url IS NOT NULL THEN 1 
        ELSE 0 
    END as has_cover_image,
    0 as additional_images_count
FROM activities a
JOIN guides g ON a.guide_id = g.id
WHERE a.image_url IS NOT NULL

ORDER BY tenant_id, category, entity_name;

-- 6. Mostrar reporte de estructura actual
SELECT 
    category,
    tenant_id,
    COUNT(*) as entities_with_images,
    SUM(has_cover_image) as total_cover_images,
    SUM(additional_images_count) as total_additional_images
FROM image_structure_report
GROUP BY category, tenant_id
ORDER BY tenant_id, category;

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '✅ Script de migración creado exitosamente';
    RAISE NOTICE '📊 Vista de reporte creada: image_structure_report';
    RAISE NOTICE '🔍 Ejecuta: SELECT * FROM image_structure_report; para ver el reporte completo';
    RAISE NOTICE '⚠️  IMPORTANTE: Este script solo prepara la migración.';
    RAISE NOTICE '   Para migrar realmente las imágenes, ejecuta el script de migración en JavaScript.';
END;
$$;











