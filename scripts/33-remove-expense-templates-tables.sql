/* Eliminar tablas de gastos recurrentes */

-- Eliminar políticas RLS primero
DROP POLICY IF EXISTS "Authenticated users can view all expense templates" ON public.expense_templates;
DROP POLICY IF EXISTS "Authenticated users can insert expense templates" ON public.expense_templates;
DROP POLICY IF EXISTS "Authenticated users can update expense templates" ON public.expense_templates;
DROP POLICY IF EXISTS "Authenticated users can delete expense templates" ON public.expense_templates;

DROP POLICY IF EXISTS "Authenticated users can view all expense recurrences" ON public.expense_recurrences;
DROP POLICY IF EXISTS "Authenticated users can insert expense recurrences" ON public.expense_recurrences;

-- Eliminar índices
DROP INDEX IF EXISTS idx_expense_templates_property_id;
DROP INDEX IF EXISTS idx_expense_templates_active;
DROP INDEX IF EXISTS idx_expense_templates_next_execution;
DROP INDEX IF EXISTS idx_expense_recurrences_template_id;

-- Eliminar tablas
DROP TABLE IF EXISTS public.expense_recurrences;
DROP TABLE IF EXISTS public.expense_templates;
