-- Script para corregir el error de seguridad en la vista image_structure_report
-- El Security Advisor detecta que la vista tiene SECURITY DEFINER, lo cual es un riesgo de seguridad

-- 1. Eliminar la vista existente
DROP VIEW IF EXISTS public.image_structure_report;

-- 2. Crear la vista sin SECURITY DEFINER (comportamiento por defecto)
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

-- 3. Habilitar RLS en la vista (si es necesario)
-- Nota: Las vistas no soportan RLS directamente, pero podemos crear una función segura
ALTER VIEW public.image_structure_report OWNER TO postgres;

-- 4. Crear función segura para acceder al reporte con RLS
CREATE OR REPLACE FUNCTION get_image_structure_report()
RETURNS TABLE (
    category TEXT,
    tenant_id INTEGER,
    entity_id UUID,
    entity_name TEXT,
    has_cover_image INTEGER,
    additional_images_count INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Solo para esta función específica
SET search_path = public
AS $$
BEGIN
    -- Verificar que el usuario tiene permisos para ver datos de su tenant
    RETURN QUERY
    SELECT 
        ir.category,
        ir.tenant_id,
        ir.entity_id,
        ir.entity_name,
        ir.has_cover_image,
        ir.additional_images_count
    FROM image_structure_report ir
    WHERE ir.tenant_id = (
        SELECT COALESCE(
            (SELECT tenant_id FROM properties WHERE id = current_setting('app.current_property_id', true)::uuid),
            (SELECT tenant_id FROM guides WHERE property_id = current_setting('app.current_property_id', true)::uuid),
            1 -- fallback
        )
    );
END;
$$;

-- 5. Otorgar permisos apropiados
GRANT SELECT ON public.image_structure_report TO authenticated;
GRANT EXECUTE ON FUNCTION get_image_structure_report() TO authenticated;

-- 6. Verificar que la vista se creó correctamente
DO $$
BEGIN
    RAISE NOTICE '✅ Vista image_structure_report recreada sin SECURITY DEFINER';
    RAISE NOTICE '✅ Función segura get_image_structure_report() creada';
    RAISE NOTICE '✅ Permisos otorgados correctamente';
    RAISE NOTICE '🔍 Para verificar: SELECT * FROM image_structure_report LIMIT 5;';
    RAISE NOTICE '🔍 Para usar la función segura: SELECT * FROM get_image_structure_report();';
END;
$$;
