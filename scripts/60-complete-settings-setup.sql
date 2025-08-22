-- Script completo para configurar la tabla settings con RLS
-- Ejecutar este script para crear la tabla y habilitar las políticas de seguridad

-- ============================================================================
-- 1. CREAR LA TABLA SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.settings (
  id SERIAL NOT NULL,
  tenant_id INTEGER NULL,
  key TEXT NOT NULL,
  description TEXT NULL,
  config_type TEXT NOT NULL CHECK (config_type IN ('simple_list', 'colored_list')),
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT NOW(),
  CONSTRAINT settings_pkey PRIMARY KEY (id),
  CONSTRAINT settings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants (id)
) TABLESPACE pg_default;

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_settings_tenant_id ON public.settings USING btree (tenant_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings USING btree (key) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_settings_config_type ON public.settings USING btree (config_type) TABLESPACE pg_default;

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. INSERTAR DATOS DE EJEMPLO
-- ============================================================================

INSERT INTO public.settings (tenant_id, key, description, config_type, value) VALUES
(NULL, 'reservation_statuses', 'Estados y colores de reservas', 'colored_list',
 '[{"name": "Pendiente", "color": "#fbbf24"}, {"name": "Confirmada", "color": "#34d399"}, {"name": "Cancelada", "color": "#f87171"}, {"name": "Completada", "color": "#60a5fa"}]'),
(NULL, 'property_types', 'Tipos de propiedad disponibles', 'simple_list',
 '["Apartamento", "Casa", "Villa", "Cabaña", "Loft", "Estudio"]'),
(NULL, 'included_services', 'Servicios incluidos en las reservas', 'simple_list',
 '["WiFi", "Limpieza", "Toallas", "Sábanas", "Cocina equipada", "Estacionamiento"]'),
(NULL, 'payment_methods', 'Métodos de pago aceptados', 'colored_list',
 '[{"name": "Tarjeta de Crédito", "color": "#10b981"}, {"name": "Transferencia", "color": "#3b82f6"}, {"name": "Efectivo", "color": "#f59e0b"}, {"name": "PayPal", "color": "#8b5cf6"}]')
ON CONFLICT (key) DO NOTHING; -- Evitar duplicados si se ejecuta múltiples veces

-- ============================================================================
-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 4. CREAR POLÍTICAS DE SEGURIDAD
-- ============================================================================

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

-- ============================================================================
-- 5. VERIFICACIONES
-- ============================================================================

-- Verificar que la tabla se creó correctamente
SELECT 
    'Table created successfully' as status,
    COUNT(*) as row_count
FROM public.settings;

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

-- Mostrar un resumen de la configuración
SELECT 
    'SETTINGS TABLE SETUP COMPLETE' as message,
    NOW() as completed_at;
