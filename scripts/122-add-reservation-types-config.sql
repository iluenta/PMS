-- Inserta los tipos de reserva en la tabla settings

INSERT INTO public.settings (tenant_id, key, description, config_type, value)
SELECT
  NULL,
  'reservation_types',
  'Tipos de reserva: comercial, uso propietario, bloqueos',
  'simple_list',
  ' ["commercial", "owner_stay", "blocked"] '
WHERE NOT EXISTS (
  SELECT 1 FROM public.settings WHERE key = 'reservation_types'
);

