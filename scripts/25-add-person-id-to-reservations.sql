-- Add person_id reference to reservations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'reservations' AND column_name = 'person_id'
  ) THEN
    ALTER TABLE public.reservations ADD COLUMN person_id uuid REFERENCES public.people(id);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS reservations_person_id_idx ON public.reservations(person_id);

-- Optional: enable RLS for updates already exists; ensure generic policy allows updating person_id for authenticated
-- Adjust to your security model if needed
-- Example:
-- CREATE POLICY "reservations_update_person_id" ON public.reservations
-- FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


