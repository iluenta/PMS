-- Script para identificar y corregir el problema del bucle infinito en bookings
-- Este script analiza las dependencias circulares y las corrige

-- 1. Verificar el estado actual de la tabla bookings
DO $$
BEGIN
    RAISE NOTICE '=== ANÁLISIS DE LA TABLA BOOKINGS ===';
    
    -- Verificar si RLS está habilitado
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'bookings' 
        AND rowsecurity = true
    ) THEN
        RAISE NOTICE 'RLS está HABILITADO en la tabla bookings';
    ELSE
        RAISE NOTICE 'RLS está DESHABILITADO en la tabla bookings';
    END IF;
    
    -- Verificar políticas existentes
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'bookings'
    ) THEN
        RAISE NOTICE 'Existen políticas RLS en la tabla bookings';
    ELSE
        RAISE NOTICE 'NO existen políticas RLS en la tabla bookings';
    END IF;
END $$;

-- 2. Verificar la estructura de la tabla bookings y sus dependencias
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name = 'tenant_id' THEN '🔑 CLAVE MULTI-TENANT'
        WHEN column_name = 'property_id' THEN '🏠 REFERENCIA A PROPIEDAD'
        WHEN column_name = 'person_id' THEN '👤 REFERENCIA A PERSONA'
        WHEN column_name = 'created_at' THEN '📅 TIMESTAMP'
        WHEN column_name = 'updated_at' THEN '📅 TIMESTAMP'
        ELSE '📋 CAMPO NORMAL'
    END as description
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'bookings'
ORDER BY ordinal_position;

-- 3. Verificar las políticas RLS existentes en bookings
SELECT 
    policyname,
    cmd as operation,
    permissive,
    qual as using_condition,
    with_check as check_condition,
    CASE 
        WHEN cmd = 'SELECT' THEN '🔍 Ver reservas'
        WHEN cmd = 'INSERT' THEN '➕ Crear reservas'
        WHEN cmd = 'UPDATE' THEN '✏️ Actualizar reservas'
        WHEN cmd = 'DELETE' THEN '🗑️ Eliminar reservas'
        ELSE '❓ Operación desconocida'
    END as description
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'bookings'
ORDER BY cmd;

-- 4. Verificar si hay dependencias circulares en las políticas
-- Buscar políticas que referencien otras tablas que puedan causar bucles
SELECT 
    p.policyname,
    p.cmd,
    p.qual,
    CASE 
        WHEN p.qual LIKE '%properties%' THEN '🏠 Referencia a properties'
        WHEN p.qual LIKE '%people%' THEN '👤 Referencia a people'
        WHEN p.qual LIKE '%reservations%' THEN '📅 Referencia a reservations'
        WHEN p.qual LIKE '%auth.uid%' THEN '🔐 Referencia a usuario autenticado'
        WHEN p.qual LIKE '%tenant_id%' THEN '🔑 Referencia a tenant'
        ELSE '📋 Sin referencias externas'
    END as external_references
FROM pg_policies p
WHERE p.schemaname = 'public' 
AND p.tablename = 'bookings';

-- 5. Verificar que las políticas de bookings sean simples y eficientes
-- Las políticas complejas con EXISTS pueden causar bucles
DO $$
BEGIN
    RAISE NOTICE '=== ANÁLISIS DE COMPLEJIDAD DE POLÍTICAS ===';
    
    -- Contar políticas con EXISTS (potencialmente problemáticas)
    DECLARE
        exists_policies_count INTEGER;
        simple_policies_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO exists_policies_count
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'bookings'
        AND (qual LIKE '%EXISTS%' OR qual LIKE '%JOIN%');
        
        SELECT COUNT(*) INTO simple_policies_count
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'bookings'
        AND qual NOT LIKE '%EXISTS%' 
        AND qual NOT LIKE '%JOIN%';
        
        RAISE NOTICE 'Políticas con EXISTS/JOIN (potencialmente problemáticas): %', exists_policies_count;
        RAISE NOTICE 'Políticas simples: %', simple_policies_count;
        
        IF exists_policies_count > 0 THEN
            RAISE NOTICE '⚠️ ADVERTENCIA: Las políticas con EXISTS pueden causar bucles infinitos';
            RAISE NOTICE '💡 RECOMENDACIÓN: Simplificar las políticas para usar solo tenant_id';
        END IF;
    END;
END $$;

-- 6. Crear políticas simplificadas para evitar bucles
-- Primero eliminar las políticas existentes que puedan ser problemáticas
DROP POLICY IF EXISTS "Users can view bookings for their properties" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert bookings for their properties" ON public.bookings;
DROP POLICY IF EXISTS "Users can update bookings for their properties" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete bookings for their properties" ON public.bookings;

-- 7. Crear políticas simplificadas basadas solo en tenant_id
-- Esto evita las consultas EXISTS que pueden causar bucles

-- Política para SELECT: Usuarios solo pueden ver reservas de su tenant
CREATE POLICY "Users can view bookings for their tenant" 
ON public.bookings 
FOR SELECT 
TO authenticated 
USING (
    tenant_id = (
        SELECT tenant_id 
        FROM public.users 
        WHERE id = auth.uid()
    )
);

-- Política para INSERT: Usuarios solo pueden crear reservas en su tenant
CREATE POLICY "Users can insert bookings for their tenant" 
ON public.bookings 
FOR INSERT 
TO authenticated 
WITH CHECK (
    tenant_id = (
        SELECT tenant_id 
        FROM public.users 
        WHERE id = auth.uid()
    )
);

-- Política para UPDATE: Usuarios solo pueden actualizar reservas de su tenant
CREATE POLICY "Users can update bookings for their tenant" 
ON public.bookings 
FOR UPDATE 
TO authenticated 
USING (
    tenant_id = (
        SELECT tenant_id 
        FROM public.users 
        WHERE id = auth.uid()
    )
);

-- Política para DELETE: Usuarios solo pueden eliminar reservas de su tenant
CREATE POLICY "Users can delete bookings for their tenant" 
ON public.bookings 
FOR DELETE 
TO authenticated 
USING (
    tenant_id = (
        SELECT tenant_id 
        FROM public.users 
        WHERE id = auth.uid()
    )
);

-- 8. Verificar que las nuevas políticas se crearon correctamente
DO $$
BEGIN
    RAISE NOTICE '=== POLÍTICAS SIMPLIFICADAS CREADAS ===';
    
    -- Contar las nuevas políticas
    DECLARE
        new_policies_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO new_policies_count
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'bookings';
        
        RAISE NOTICE 'Total de políticas en bookings: %', new_policies_count;
        
        IF new_policies_count = 4 THEN
            RAISE NOTICE '✅ Todas las políticas creadas correctamente';
        ELSE
            RAISE NOTICE '❌ Faltan políticas: % de 4', 4 - new_policies_count;
        END IF;
    END;
    
    -- Verificar que las políticas son simples
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'bookings'
        AND (qual LIKE '%EXISTS%' OR qual LIKE '%JOIN%')
    ) THEN
        RAISE NOTICE '✅ Todas las políticas son simples (sin EXISTS/JOIN)';
    ELSE
        RAISE NOTICE '⚠️ ADVERTENCIA: Algunas políticas aún contienen EXISTS/JOIN';
    END IF;
END $$;

-- 9. Mostrar el estado final de las políticas
SELECT 
    policyname,
    cmd as operation,
    CASE 
        WHEN qual LIKE '%tenant_id%' THEN '🔑 Basada en tenant_id'
        WHEN qual LIKE '%auth.uid%' THEN '🔐 Basada en usuario'
        ELSE '❓ Desconocida'
    END as policy_type,
    qual as using_condition
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'bookings'
ORDER BY cmd;
