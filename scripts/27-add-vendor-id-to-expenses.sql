BEGIN;

-- 1) Add vendor_id referencing people(id)
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES public.people(id);

-- 2) Helpful index for filtering by vendor
CREATE INDEX IF NOT EXISTS idx_expenses_vendor_id ON public.expenses (vendor_id);

COMMIT;


