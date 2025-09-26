-- Script para verificar la estructura de la tabla properties
-- y corregir el error de seguridad en image_structure_report

-- 1. Verificar estructura de la tabla properties
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar si existen columnas de imágenes
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND table_schema = 'public'
AND column_name LIKE '%image%';

-- 3. Verificar datos de ejemplo en properties
SELECT 
    id,
    name,
    images,
    array_length(images, 1) as image_count
FROM properties 
WHERE images IS NOT NULL 
LIMIT 5;

-- 4. Si no hay columnas de imágenes, crear una vista simplificada
-- que solo reporte sobre las tablas que sí tienen imágenes
DO $$
BEGIN
    -- Verificar si la columna images existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'images'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE '✅ Columna images encontrada en properties';
        
        -- Eliminar vista existente si existe
        DROP VIEW IF EXISTS public.image_structure_report;
        
        -- Crear vista corregida
        CREATE VIEW public.image_structure_report AS
        SELECT 
            'properties' as category,
            p.tenant_id,
            p.id as entity_id,
            p.name as entity_name,
            CASE 
                WHEN p.images IS NOT NULL AND array_length(p.images, 1) > 0 THEN 1 
                ELSE 0 
            END as has_cover_image,
            CASE 
                WHEN p.images IS NOT NULL THEN array_length(p.images, 1) 
                ELSE 0 
            END as additional_images_count
        FROM properties p
        WHERE p.images IS NOT NULL AND array_length(p.images, 1) > 0
        
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
        
        RAISE NOTICE '✅ Vista image_structure_report recreada correctamente';
        
    ELSE
        RAISE NOTICE '❌ Columna images NO encontrada en properties';
        RAISE NOTICE 'Creando vista simplificada solo para guías...';
        
        -- Eliminar vista existente si existe
        DROP VIEW IF EXISTS public.image_structure_report;
        
        -- Crear vista solo para guías (beaches, restaurants, activities)
        CREATE VIEW public.image_structure_report AS
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
        
        RAISE NOTICE '✅ Vista image_structure_report creada solo para guías';
    END IF;
END;
$$;

-- 5. Verificar que la vista se creó correctamente
SELECT 'Vista creada exitosamente' as status;

-- 6. Mostrar algunos datos de ejemplo
SELECT * FROM image_structure_report LIMIT 10;
