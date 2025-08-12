-- Backfill distribution_channels.name into people as distribution_channel and link person_id

BEGIN;

-- 1) Insert missing people of type distribution_channel from distribution_channels
WITH candidates AS (
  SELECT DISTINCT TRIM(name) AS channel_name
  FROM public.distribution_channels
  WHERE name IS NOT NULL AND TRIM(name) <> ''
)
INSERT INTO public.people (person_type, company_name)
SELECT 'distribution_channel', c.channel_name
FROM candidates c
LEFT JOIN public.people p
  ON p.person_type = 'distribution_channel'
 AND p.company_name ILIKE c.channel_name
WHERE c.channel_name IS NOT NULL
  AND p.id IS NULL;

-- 2) Link distribution_channels to people
UPDATE public.distribution_channels d
SET person_id = p.id
FROM public.people p
WHERE d.person_id IS NULL
  AND p.person_type = 'distribution_channel'
  AND p.company_name ILIKE d.name;

COMMIT;


