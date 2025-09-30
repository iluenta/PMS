-- Añadir columna reservation_type a reservations y actualizar valores existentes

ALTER TABLE public.reservations
ADD COLUMN IF NOT EXISTS reservation_type TEXT NOT NULL DEFAULT 'commercial';

-- Backfill inicial basado en el importe total (reservas de propietario/bloqueos suelen tener importe 0)
UPDATE public.reservations
SET reservation_type = 'owner_stay'
WHERE reservation_type = 'commercial'
  AND COALESCE(total_amount, 0) = 0
  AND status <> 'cancelled';

-- Garantizar integridad de valores permitidos
ALTER TABLE public.reservations
DROP CONSTRAINT IF EXISTS chk_reservations_reservation_type;

ALTER TABLE public.reservations
ADD CONSTRAINT chk_reservations_reservation_type
CHECK (reservation_type IN ('commercial', 'owner_stay', 'blocked'));

CREATE INDEX IF NOT EXISTS idx_reservations_reservation_type
  ON public.reservations (reservation_type);

