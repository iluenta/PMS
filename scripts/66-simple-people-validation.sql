-- ============================================================================
-- Validación Simple: Personas en Reservas
-- ============================================================================
-- Script simplificado para validar rápidamente el estado de las personas
-- en las reservas
-- ============================================================================

-- 1. ESTADÍSTICAS RÁPIDAS
SELECT 
    'ESTADÍSTICAS RÁPIDAS' as titulo,
    COUNT(*) as total_reservations,
    COUNT(person_id) as con_person_id,
    COUNT(*) - COUNT(person_id) as sin_person_id,
    COUNT(CASE WHEN person_id IS NOT NULL AND p.id IS NOT NULL THEN 1 END) as person_id_validos,
    COUNT(CASE WHEN person_id IS NOT NULL AND p.id IS NULL THEN 1 END) as person_id_invalidos
FROM public.reservations r
LEFT JOIN public.people p ON r.person_id = p.id;

-- 2. RESERVAS CON PERSON_ID INVÁLIDO (ERRORES)
SELECT 
    'ERRORES: PERSON_ID INVÁLIDO' as titulo,
    r.id as reservation_id,
    r.person_id,
    (r.guest->>'name')::TEXT as guest_name,
    (r.guest->>'email')::TEXT as guest_email,
    r.created_at
FROM public.reservations r
LEFT JOIN public.people p ON r.person_id = p.id
WHERE r.person_id IS NOT NULL AND p.id IS NULL
ORDER BY r.created_at DESC;

-- 3. RESERVAS SIN PERSON_ID (ADVERTENCIAS)
SELECT 
    'ADVERTENCIAS: SIN PERSON_ID' as titulo,
    r.id as reservation_id,
    (r.guest->>'name')::TEXT as guest_name,
    (r.guest->>'email')::TEXT as guest_email,
    (r.guest->>'phone')::TEXT as guest_phone,
    r.created_at
FROM public.reservations r
WHERE r.person_id IS NULL
ORDER BY r.created_at DESC
LIMIT 20;

-- 4. POSIBLES VINCULACIONES POR EMAIL
SELECT 
    'POSIBLES VINCULACIONES POR EMAIL' as titulo,
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
ORDER BY r.created_at DESC
LIMIT 10;

-- 5. RESUMEN POR ESTADO
SELECT 
    'RESUMEN POR ESTADO' as titulo,
    CASE 
        WHEN r.person_id IS NULL THEN 'SIN_PERSON_ID'
        WHEN r.person_id IS NOT NULL AND p.id IS NULL THEN 'PERSON_ID_INVALIDO'
        WHEN r.person_id IS NOT NULL AND p.id IS NOT NULL THEN 'PERSON_ID_VALIDO'
    END as estado,
    COUNT(*) as cantidad,
    ROUND((COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM public.reservations)) * 100, 2) as porcentaje
FROM public.reservations r
LEFT JOIN public.people p ON r.person_id = p.id
GROUP BY 
    CASE 
        WHEN r.person_id IS NULL THEN 'SIN_PERSON_ID'
        WHEN r.person_id IS NOT NULL AND p.id IS NULL THEN 'PERSON_ID_INVALIDO'
        WHEN r.person_id IS NOT NULL AND p.id IS NOT NULL THEN 'PERSON_ID_VALIDO'
    END
ORDER BY 
    CASE 
        WHEN r.person_id IS NULL THEN 1
        WHEN r.person_id IS NOT NULL AND p.id IS NULL THEN 2
        WHEN r.person_id IS NOT NULL AND p.id IS NOT NULL THEN 3
    END;

