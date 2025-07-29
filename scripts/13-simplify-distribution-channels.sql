-- Script para simplificar la tabla distribution_channels
-- Mantener solo: id, name, logo
-- Eliminar: commission_charge_percentage, commission_sale_percentage, review_count, rating, url, is_active

-- 1. Eliminar la vista que depende de los campos que vamos a eliminar
DROP VIEW IF EXISTS public.property_channels_view;

-- 2. Agregar el nuevo campo logo
ALTER TABLE public.distribution_channels 
ADD COLUMN logo text;

-- 3. Eliminar los campos que ya no se necesitan
ALTER TABLE public.distribution_channels 
DROP COLUMN IF EXISTS commission_charge_percentage,
DROP COLUMN IF EXISTS commission_sale_percentage,
DROP COLUMN IF EXISTS review_count,
DROP COLUMN IF EXISTS rating,
DROP COLUMN IF EXISTS url,
DROP COLUMN IF EXISTS is_active;

-- 4. Recrear la vista con la nueva estructura (si es necesaria)
-- CREATE VIEW public.property_channels_view AS
-- SELECT 
--   pc.*,
--   dc.name as channel_name,
--   dc.logo as channel_logo
-- FROM public.property_channels pc
-- LEFT JOIN public.distribution_channels dc ON pc.channel_id = dc.id;

-- 5. Comentarios para documentar la estructura
COMMENT ON TABLE public.distribution_channels IS 'Canales de distribución disponibles (Booking.com, Airbnb, etc.)';
COMMENT ON COLUMN public.distribution_channels.id IS 'Identificador único del canal';
COMMENT ON COLUMN public.distribution_channels.name IS 'Nombre del canal (ej: Booking.com, Airbnb)';
COMMENT ON COLUMN public.distribution_channels.logo IS 'URL del logo del canal';
COMMENT ON COLUMN public.distribution_channels.created_at IS 'Fecha de creación del registro';
COMMENT ON COLUMN public.distribution_channels.updated_at IS 'Fecha de última actualización'; 