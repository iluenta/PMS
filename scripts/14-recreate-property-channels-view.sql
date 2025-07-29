-- Script para recrear la vista property_channels_view con la nueva estructura
-- Esta vista se puede ejecutar después de simplificar la tabla distribution_channels

-- Eliminar la vista si existe
DROP VIEW IF EXISTS public.property_channels_view;

-- Recrear la vista con la nueva estructura
CREATE VIEW public.property_channels_view AS
SELECT 
  pc.*,
  dc.name as channel_name,
  dc.logo as channel_logo
FROM public.property_channels pc
LEFT JOIN public.distribution_channels dc ON pc.channel_id = dc.id;

-- Comentarios para la vista
COMMENT ON VIEW public.property_channels_view IS 'Vista que combina property_channels con distribution_channels para mostrar información completa'; 