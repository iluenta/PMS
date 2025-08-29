-- ============================================================================
-- Script de Validación: Personas en Reservas
-- ============================================================================
-- Este script valida que todas las personas referenciadas en las reservas
-- existan en la base de datos de personas (tabla people)
-- ============================================================================

-- Crear función para validar personas en reservas
CREATE OR REPLACE FUNCTION validate_reservation_people()
RETURNS TABLE (
    reservation_id UUID,
    person_id UUID,
    guest_name TEXT,
    guest_email TEXT,
    guest_phone TEXT,
    validation_status TEXT,
    issue_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id as reservation_id,
        r.person_id,
        COALESCE(
            (r.guest->>'name')::TEXT,
            CONCAT(
                COALESCE((r.guest->>'first_name')::TEXT, ''),
                ' ',
                COALESCE((r.guest->>'last_name')::TEXT, '')
            )
        ) as guest_name,
        (r.guest->>'email')::TEXT as guest_email,
        (r.guest->>'phone')::TEXT as guest_phone,
        CASE 
            -- Caso 1: person_id es NULL (reserva sin persona vinculada)
            WHEN r.person_id IS NULL THEN 'WARNING'
            -- Caso 2: person_id existe pero no hay registro en people
            WHEN r.person_id IS NOT NULL AND p.id IS NULL THEN 'ERROR'
            -- Caso 3: person_id existe y hay registro en people
            WHEN r.person_id IS NOT NULL AND p.id IS NOT NULL THEN 'OK'
            -- Caso por defecto
            ELSE 'UNKNOWN'
        END as validation_status,
        CASE 
            -- Caso 1: person_id es NULL
            WHEN r.person_id IS NULL THEN 'Reserva sin persona vinculada en tabla people'
            -- Caso 2: person_id no existe en people
            WHEN r.person_id IS NOT NULL AND p.id IS NULL THEN 'person_id referenciado no existe en tabla people'
            -- Caso 3: Todo OK
            WHEN r.person_id IS NOT NULL AND p.id IS NOT NULL THEN 'Persona correctamente vinculada'
            -- Caso por defecto
            ELSE 'Estado desconocido'
        END as issue_description,
        r.created_at
    FROM public.reservations r
    LEFT JOIN public.people p ON r.person_id = p.id
    ORDER BY 
        CASE 
            WHEN r.person_id IS NULL THEN 1
            WHEN r.person_id IS NOT NULL AND p.id IS NULL THEN 2
            WHEN r.person_id IS NOT NULL AND p.id IS NOT NULL THEN 3
            ELSE 4
        END,
        r.created_at DESC;
END;
$$;

-- Crear función para obtener estadísticas de validación
CREATE OR REPLACE FUNCTION get_reservation_people_stats()
RETURNS TABLE (
    total_reservations BIGINT,
    reservations_with_person_id BIGINT,
    reservations_without_person_id BIGINT,
    valid_person_references BIGINT,
    invalid_person_references BIGINT,
    validation_percentage NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_reservations,
        COUNT(r.person_id) as reservations_with_person_id,
        COUNT(*) - COUNT(r.person_id) as reservations_without_person_id,
        COUNT(CASE WHEN r.person_id IS NOT NULL AND p.id IS NOT NULL THEN 1 END) as valid_person_references,
        COUNT(CASE WHEN r.person_id IS NOT NULL AND p.id IS NULL THEN 1 END) as invalid_person_references,
        ROUND(
            (COUNT(CASE WHEN r.person_id IS NOT NULL AND p.id IS NOT NULL THEN 1 END)::NUMERIC / 
             NULLIF(COUNT(r.person_id), 0)) * 100, 
            2
        ) as validation_percentage
    FROM public.reservations r
    LEFT JOIN public.people p ON r.person_id = p.id;
END;
$$;

-- Crear función para obtener reservas con problemas específicos
CREATE OR REPLACE FUNCTION get_problematic_reservations()
RETURNS TABLE (
    reservation_id UUID,
    person_id UUID,
    guest_name TEXT,
    guest_email TEXT,
    guest_phone TEXT,
    problem_type TEXT,
    suggested_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id as reservation_id,
        r.person_id,
        COALESCE(
            (r.guest->>'name')::TEXT,
            CONCAT(
                COALESCE((r.guest->>'first_name')::TEXT, ''),
                ' ',
                COALESCE((r.guest->>'last_name')::TEXT, '')
            )
        ) as guest_name,
        (r.guest->>'email')::TEXT as guest_email,
        (r.guest->>'phone')::TEXT as guest_phone,
        CASE 
            WHEN r.person_id IS NULL THEN 'MISSING_PERSON_ID'
            WHEN r.person_id IS NOT NULL AND p.id IS NULL THEN 'INVALID_PERSON_ID'
            ELSE 'UNKNOWN'
        END as problem_type,
        CASE 
            WHEN r.person_id IS NULL THEN 'Crear persona en tabla people y vincular con person_id'
            WHEN r.person_id IS NOT NULL AND p.id IS NULL THEN 'Verificar person_id o crear persona faltante'
            ELSE 'Revisar manualmente'
        END as suggested_action,
        r.created_at
    FROM public.reservations r
    LEFT JOIN public.people p ON r.person_id = p.id
    WHERE 
        r.person_id IS NULL OR 
        (r.person_id IS NOT NULL AND p.id IS NULL)
    ORDER BY r.created_at DESC;
END;
$$;

-- ============================================================================
-- CONSULTAS DE VALIDACIÓN
-- ============================================================================

-- 1. Estadísticas generales
SELECT 'ESTADÍSTICAS DE VALIDACIÓN' as titulo;
SELECT * FROM get_reservation_people_stats();

-- 2. Lista completa de validación
SELECT 'LISTA COMPLETA DE VALIDACIÓN' as titulo;
SELECT * FROM validate_reservation_people();

-- 3. Solo reservas con problemas
SELECT 'RESERVAS CON PROBLEMAS' as titulo;
SELECT * FROM get_problematic_reservations();

-- 4. Resumen por estado de validación
SELECT 'RESUMEN POR ESTADO' as titulo;
SELECT 
    validation_status,
    COUNT(*) as cantidad,
    ROUND((COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM public.reservations)) * 100, 2) as porcentaje
FROM validate_reservation_people()
GROUP BY validation_status
ORDER BY 
    CASE validation_status
        WHEN 'ERROR' THEN 1
        WHEN 'WARNING' THEN 2
        WHEN 'OK' THEN 3
        ELSE 4
    END;

-- 5. Reservas recientes con problemas (últimos 30 días)
SELECT 'PROBLEMAS RECIENTES (30 DÍAS)' as titulo;
SELECT * FROM get_problematic_reservations()
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

-- 6. Personas más referenciadas en reservas
SELECT 'PERSONAS MÁS REFERENCIADAS' as titulo;
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    COUNT(r.id) as reservation_count,
    MIN(r.created_at) as first_reservation,
    MAX(r.created_at) as last_reservation
FROM public.people p
INNER JOIN public.reservations r ON p.id = r.person_id
GROUP BY p.id, p.first_name, p.last_name, p.email
ORDER BY reservation_count DESC
LIMIT 10;

-- ============================================================================
-- CONSULTAS DE LIMPIEZA (OPCIONAL)
-- ============================================================================

-- 7. Identificar reservas que podrían vincularse automáticamente
-- (mismo email en guest y people)
SELECT 'POSIBLES VINCULACIONES AUTOMÁTICAS' as titulo;
SELECT 
    r.id as reservation_id,
    (r.guest->>'email')::TEXT as guest_email,
    (r.guest->>'name')::TEXT as guest_name,
    p.id as person_id,
    p.first_name,
    p.last_name,
    p.email as person_email
FROM public.reservations r
INNER JOIN public.people p ON (r.guest->>'email')::TEXT = p.email
WHERE r.person_id IS NULL
  AND (r.guest->>'email')::TEXT IS NOT NULL
  AND (r.guest->>'email')::TEXT != ''
ORDER BY r.created_at DESC;

-- ============================================================================
-- INSTRUCCIONES DE USO
-- ============================================================================

/*
INSTRUCCIONES DE USO:

1. EJECUTAR VALIDACIÓN COMPLETA:
   - Ejecutar todo el script para obtener un reporte completo
   - Revisar las estadísticas y problemas identificados

2. EJECUTAR VALIDACIÓN ESPECÍFICA:
   - SELECT * FROM validate_reservation_people(); -- Lista completa
   - SELECT * FROM get_reservation_people_stats(); -- Solo estadísticas
   - SELECT * FROM get_problematic_reservations(); -- Solo problemas

3. INTERPRETAR RESULTADOS:
   - OK: Persona correctamente vinculada
   - WARNING: Reserva sin person_id (puede ser normal)
   - ERROR: person_id referenciado no existe en people

4. ACCIONES RECOMENDADAS:
   - Para ERROR: Verificar person_id o crear persona faltante
   - Para WARNING: Considerar vincular con persona existente si es necesario
   - Para OK: No requiere acción

5. LIMPIEZA AUTOMÁTICA:
   - Usar la consulta de "POSIBLES VINCULACIONES AUTOMÁTICAS"
   - Actualizar person_id en reservas que coincidan por email

EJEMPLO DE ACTUALIZACIÓN:
UPDATE public.reservations 
SET person_id = p.id
FROM public.people p
WHERE reservations.person_id IS NULL
  AND (reservations.guest->>'email')::TEXT = p.email
  AND (reservations.guest->>'email')::TEXT IS NOT NULL;
*/

