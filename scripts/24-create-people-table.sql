-- People module: enum and table
-- Commit message suggestion: feat(db): add people table and enum person_type

-- 1) Enum person_type (safe-guarded for re-runs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'person_type'
  ) THEN
    CREATE TYPE person_type AS ENUM ('guest', 'provider', 'distribution_channel', 'other');
  END IF;
END
$$;

-- 2) Table people
CREATE TABLE IF NOT EXISTS public.people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_type person_type NOT NULL,
  first_name text,
  last_name text,
  company_name text,
  fiscal_id text,
  fiscal_id_type text, -- NIF, CIF, Passport, etc.
  country text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  postal_code text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Regla: nombre obligatorio salvo si hay company_name (y viceversa)
  CONSTRAINT people_name_or_company_chk CHECK (
    COALESCE(NULLIF(trim(first_name), ''), '') <> ''
    OR COALESCE(NULLIF(trim(company_name), ''), '') <> ''
  )
);

-- 3) Indexes
CREATE INDEX IF NOT EXISTS people_person_type_idx ON public.people (person_type);
CREATE INDEX IF NOT EXISTS people_email_idx ON public.people (email);


