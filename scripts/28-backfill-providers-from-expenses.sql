-- Backfill providers from expenses.vendor text and link vendor_id
-- Assumes scripts/27-add-vendor-id-to-expenses.sql already ran

BEGIN;

-- 0) Optional helpful index to speed up name lookups
CREATE INDEX IF NOT EXISTS idx_people_company_name ON public.people (company_name);

-- 1) Insert missing providers inferred from expenses.vendor
WITH candidates AS (
  SELECT DISTINCT TRIM(vendor) AS vendor_name
  FROM public.expenses
  WHERE vendor IS NOT NULL AND TRIM(vendor) <> ''
),
normalized AS (
  SELECT
    vendor_name,
    NULLIF(split_part(vendor_name, ' ', 1), '') AS first_name,
    NULLIF(NULLIF(REGEXP_REPLACE(vendor_name, '^[^ ]+\\s?', ''), ''), NULL) AS last_name
  FROM candidates
)
INSERT INTO public.people (person_type, company_name, first_name, last_name)
SELECT 'provider', n.vendor_name, n.first_name, n.last_name
FROM normalized n
LEFT JOIN public.people p
  ON p.person_type = 'provider'
 AND (
   (p.company_name IS NOT NULL AND p.company_name ILIKE n.vendor_name)
   OR (TRIM(COALESCE(p.first_name,'') || ' ' || COALESCE(p.last_name,'')) ILIKE n.vendor_name)
 )
WHERE n.vendor_name IS NOT NULL
  AND p.id IS NULL;

-- 2) Link expenses to providers by name
UPDATE public.expenses e
SET vendor_id = p.id
FROM public.people p
WHERE e.vendor_id IS NULL
  AND e.vendor IS NOT NULL
  AND TRIM(e.vendor) <> ''
  AND p.person_type = 'provider'
  AND (
    p.company_name ILIKE TRIM(e.vendor)
    OR TRIM(COALESCE(p.first_name,'') || ' ' || COALESCE(p.last_name,'')) ILIKE TRIM(e.vendor)
  );

COMMIT;


