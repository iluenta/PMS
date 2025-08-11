-- Ensure every distribution_channels row has a linked People record
-- and make person_id NOT NULL thereafter

BEGIN;

-- 1) Create missing people for channels with NULL person_id
WITH candidates AS (
  SELECT id AS channel_id, TRIM(name) AS channel_name
  FROM public.distribution_channels
  WHERE person_id IS NULL AND name IS NOT NULL AND TRIM(name) <> ''
), inserted AS (
  INSERT INTO public.people (person_type, company_name)
  SELECT 'distribution_channel', c.channel_name
  FROM candidates c
  LEFT JOIN public.people p
    ON p.person_type = 'distribution_channel'
   AND p.company_name ILIKE c.channel_name
  WHERE p.id IS NULL
  RETURNING id, company_name
)
UPDATE public.distribution_channels d
SET person_id = p.id
FROM public.people p
WHERE d.person_id IS NULL
  AND (
    p.person_type = 'distribution_channel'
    AND (p.company_name ILIKE d.name)
  );

-- 2) Enforce NOT NULL (only if all rows now have person_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.distribution_channels WHERE person_id IS NULL
  ) THEN
    ALTER TABLE public.distribution_channels ALTER COLUMN person_id SET NOT NULL;
  END IF;
END $$;

COMMIT;


