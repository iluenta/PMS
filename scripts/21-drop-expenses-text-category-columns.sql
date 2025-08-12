-- Plan: eliminar columnas de texto category/subcategory en expenses
-- Ejecutar solo cuando la aplicación esté ya usando category_id/subcategory_id en toda la UI

BEGIN;

-- 0) Drop dependent view(s) if they exist
DROP VIEW IF EXISTS public.expenses_with_categories CASCADE;
DROP VIEW IF EXISTS public.view_expenses_with_categories CASCADE;

-- 1) Drop text columns, keep IDs as source of truth
ALTER TABLE public.expenses
  DROP COLUMN IF EXISTS category,
  DROP COLUMN IF EXISTS subcategory;

COMMIT;


