-- Documents for expense attachments (metadata only)
-- Step 1 of Document Repository feature

BEGIN;

CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid REFERENCES public.expenses(id) ON DELETE CASCADE,
  original_name text NOT NULL,
  storage_path text NOT NULL,
  mime_type text NOT NULL,
  size integer NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_expense_id ON public.documents(expense_id);

-- Enable RLS and add basic policies aligned with existing style
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Users can manage documents for expenses they can access
-- This assumes an ownership relation via properties -> expenses.property_id
-- Adjust USING/TO clauses later if you have a dedicated ownership model
DROP POLICY IF EXISTS "Users can manage documents for their expenses" ON public.documents;

CREATE POLICY "Users can manage documents for their expenses" ON public.documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.expenses e
      JOIN public.properties p ON p.id = e.property_id
      WHERE e.id = documents.expense_id AND p.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.expenses e
      JOIN public.properties p ON p.id = e.property_id
      WHERE e.id = documents.expense_id AND p.owner_id = auth.uid()
    )
  );

COMMIT;


