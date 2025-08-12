BEGIN;

-- Add person_id to distribution_channels and index
ALTER TABLE public.distribution_channels
  ADD COLUMN IF NOT EXISTS person_id uuid REFERENCES public.people(id);

CREATE INDEX IF NOT EXISTS idx_distribution_channels_person_id
  ON public.distribution_channels (person_id);

COMMIT;


