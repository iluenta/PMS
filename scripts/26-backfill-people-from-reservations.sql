-- Backfill people from reservations.guest JSONB and link person_id

-- 1) Insert missing people based on email/phone uniqueness
WITH candidates AS (
  SELECT DISTINCT
    NULLIF(guest->>'email','') AS email,
    NULLIF(guest->>'phone','') AS phone,
    NULLIF(guest->>'country','') AS country,
    NULLIF(guest->>'document_type','') AS fiscal_id_type,
    NULLIF(guest->>'document_number','') AS fiscal_id,
    TRIM(COALESCE(guest->>'name','')) AS full_name
  FROM public.reservations r
  WHERE (guest IS NOT NULL)
)
INSERT INTO public.people (person_type, first_name, last_name, email, phone, country, fiscal_id, fiscal_id_type)
SELECT 'guest',
       NULLIF(split_part(full_name, ' ', 1), ''),
       NULLIF(NULLIF(REGEXP_REPLACE(full_name, '^[^ ]+\\s?', ''), ''), NULL),
       email, phone, country, fiscal_id, fiscal_id_type
FROM candidates c
LEFT JOIN public.people p
  ON (p.email IS NOT NULL AND p.email = c.email)
  OR (p.phone IS NOT NULL AND p.phone = c.phone)
WHERE (c.email IS NOT NULL OR c.phone IS NOT NULL OR c.full_name <> '')
  AND p.id IS NULL;

-- 2) Link reservations to people by email/phone
UPDATE public.reservations r
SET person_id = p.id
FROM public.people p
WHERE r.person_id IS NULL
  AND (
    (p.email IS NOT NULL AND p.email = (r.guest->>'email')) OR
    (p.phone IS NOT NULL AND p.phone = (r.guest->>'phone'))
  );


