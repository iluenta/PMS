-- Script para crear la tabla de configuraciones del sistema
-- Este script crea la tabla settings que almacenará configuraciones clave-valor
-- con soporte para diferentes tipos de configuración (lista simple, lista con colores)

-- Crear la tabla settings
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

-- Insertar datos de ejemplo para configuraciones comunes
INSERT INTO public.settings (tenant_id, key, description, config_type, value) VALUES
-- Configuración de estados de reserva (ejemplo con colores)
(NULL, 'reservation_statuses', 'Estados y colores de reservas', 'colored_list', 
 '[{"name": "Pendiente", "color": "#fbbf24"}, {"name": "Confirmada", "color": "#34d399"}, {"name": "Cancelada", "color": "#f87171"}, {"name": "Completada", "color": "#60a5fa"}]'),

-- Configuración de tipos de propiedad (ejemplo lista simple)
(NULL, 'property_types', 'Tipos de propiedad disponibles', 'simple_list',
 '["Apartamento", "Casa", "Villa", "Cabaña", "Loft", "Estudio"]'),

-- Configuración de servicios incluidos (ejemplo lista simple)
(NULL, 'included_services', 'Servicios incluidos en las reservas', 'simple_list',
 '["WiFi", "Limpieza", "Toallas", "Sábanas", "Cocina equipada", "Estacionamiento"]'),

-- Configuración de métodos de pago (ejemplo con colores)
(NULL, 'payment_methods', 'Métodos de pago aceptados', 'colored_list',
 '[{"name": "Tarjeta de Crédito", "color": "#10b981"}, {"name": "Transferencia", "color": "#3b82f6"}, {"name": "Efectivo", "color": "#f59e0b"}, {"name": "PayPal", "color": "#8b5cf6"}]');

-- Comentarios para documentar la tabla
COMMENT ON TABLE public.settings IS 'Tabla para almacenar configuraciones del sistema en formato clave-valor JSON';
COMMENT ON COLUMN public.settings.key IS 'Clave única de la configuración (ej: reservation_statuses, property_types)';
COMMENT ON COLUMN public.settings.description IS 'Descripción humana de la configuración';
COMMENT ON COLUMN public.settings.config_type IS 'Tipo de configuración: simple_list (lista simple) o colored_list (lista con colores)';
COMMENT ON COLUMN public.settings.value IS 'Valor JSON de la configuración. Para simple_list: array de strings, para colored_list: array de objetos con name y color';
COMMENT ON COLUMN public.settings.tenant_id IS 'ID del tenant (NULL para configuraciones globales del sistema)';
