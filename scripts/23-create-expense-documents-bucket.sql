-- Storage bucket for expense documents
-- Private bucket with RLS on storage.objects bound to expenses access

BEGIN;

-- Create bucket if not exists (compatible with instances without storage.create_bucket())
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-documents', 'expense-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Ensure RLS is enabled on storage.objects (usually enabled by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for idempotency
DROP POLICY IF EXISTS "expense-documents-select" ON storage.objects;
DROP POLICY IF EXISTS "expense-documents-insert" ON storage.objects;
DROP POLICY IF EXISTS "expense-documents-update" ON storage.objects;
DROP POLICY IF EXISTS "expense-documents-delete" ON storage.objects;

-- Convention: object name path = 'expenses/{expense_id}/{filename}'
-- We authorize if user can access the referenced expense (delegated to expenses RLS)

CREATE POLICY "expense-documents-select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'expense-documents'
    AND EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id::text = split_part(name, '/', 2)
    )
  );

CREATE POLICY "expense-documents-insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'expense-documents'
    AND EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id::text = split_part(name, '/', 2)
    )
  );

CREATE POLICY "expense-documents-update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'expense-documents'
    AND EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id::text = split_part(name, '/', 2)
    )
  )
  WITH CHECK (
    bucket_id = 'expense-documents'
    AND EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id::text = split_part(name, '/', 2)
    )
  );

CREATE POLICY "expense-documents-delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'expense-documents'
    AND EXISTS (
      SELECT 1 FROM public.expenses e
      WHERE e.id::text = split_part(name, '/', 2)
    )
  );

COMMIT;


