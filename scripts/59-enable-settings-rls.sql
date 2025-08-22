-- Script para habilitar RLS en la tabla settings
-- Ejecutar después de crear la tabla settings

-- Habilitar RLS en la tabla settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Política para usuarios autenticados: pueden ver configuraciones globales y de su tenant
CREATE POLICY "Users can view global and tenant settings" ON public.settings
    FOR SELECT
    TO authenticated
    USING (
        tenant_id IS NULL 
        OR 
        tenant_id = (
            SELECT tenant_id 
            FROM auth.users 
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
            FROM auth.users 
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
            FROM auth.users 
            WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        tenant_id = (
            SELECT tenant_id 
            FROM auth.users 
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
            FROM auth.users 
            WHERE id = auth.uid()
        )
    );

-- Política especial para administradores: pueden ver todas las configuraciones
-- (Asumiendo que existe una función is_admin() o similar)
-- CREATE POLICY "Admins can view all settings" ON public.settings
--     FOR SELECT
--     TO authenticated
--     USING (
--         EXISTS (
--             SELECT 1 
--             FROM auth.users 
--             WHERE id = auth.uid() 
--             AND role = 'admin'
--         )
--     );

-- Comentarios sobre las políticas
COMMENT ON POLICY "Users can view global and tenant settings" ON public.settings IS 
'Permite a los usuarios ver configuraciones globales (tenant_id IS NULL) y configuraciones de su propio tenant';

COMMENT ON POLICY "Users can create settings for their tenant" ON public.settings IS 
'Permite a los usuarios crear configuraciones para su tenant o configuraciones globales';

COMMENT ON POLICY "Users can update settings for their tenant" ON public.settings IS 
'Permite a los usuarios actualizar solo las configuraciones de su tenant';

COMMENT ON POLICY "Users can delete settings for their tenant" ON public.settings IS 
'Permite a los usuarios eliminar solo las configuraciones de su tenant';

-- Verificar que RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'settings';

-- Verificar las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'settings';
