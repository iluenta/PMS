-- Script completo para configurar la tabla settings con RLS simplificado
-- Este script hace todo en una sola ejecución y evita problemas de permisos

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
-- 4. ELIMINAR POLÍTICAS EXISTENTES (si existen)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view global and tenant settings" ON public.settings;
DROP POLICY IF EXISTS "Users can create settings for their tenant" ON public.settings;
DROP POLICY IF EXISTS "Users can update settings for their tenant" ON public.settings;
DROP POLICY IF EXISTS "Users can delete settings for their tenant" ON public.settings;
DROP POLICY IF EXISTS "Users can view all settings" ON public.settings;
DROP POLICY IF EXISTS "Users can create settings" ON public.settings;
DROP POLICY IF EXISTS "Users can update settings" ON public.settings;
DROP POLICY IF EXISTS "Users can delete settings" ON public.settings;

-- ============================================================================
-- 5. CREAR POLÍTICAS RLS SIMPLIFICADAS
-- ============================================================================

-- Política básica: usuarios autenticados pueden ver todas las configuraciones
CREATE POLICY "Users can view all settings" ON public.settings
    FOR SELECT
    TO authenticated
    USING (true);

-- Política básica: usuarios autenticados pueden crear configuraciones
CREATE POLICY "Users can create settings" ON public.settings
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política básica: usuarios autenticados pueden actualizar configuraciones
CREATE POLICY "Users can update settings" ON public.settings
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política básica: usuarios autenticados pueden eliminar configuraciones
CREATE POLICY "Users can delete settings" ON public.settings
    FOR DELETE
    TO authenticated
    USING (true);

-- ============================================================================
-- 6. VERIFICACIONES
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
    'COMPLETE SIMPLE SETTINGS SETUP COMPLETE' as message,
    NOW() as completed_at;
