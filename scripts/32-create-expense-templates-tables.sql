/* Crear tabla para plantillas de gastos recurrentes */
CREATE TABLE IF NOT EXISTS public.expense_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES public.expense_categories(id),
  subcategory_id UUID REFERENCES public.expense_subcategories(id),
  vendor VARCHAR(255),
  vendor_id UUID REFERENCES public.people(id),
  payment_method VARCHAR(100),
  property_id UUID REFERENCES public.properties(id) NOT NULL,
  
  /* Configuración de recurrencia */
  recurrence_type VARCHAR(20) NOT NULL CHECK (recurrence_type IN ('monthly', 'weekly', 'quarterly', 'yearly')),
  recurrence_interval INTEGER DEFAULT 1 CHECK (recurrence_interval > 0),
  start_date DATE NOT NULL,
  end_date DATE, /* NULL = sin fecha fin */
  next_execution_date DATE NOT NULL,
  
  /* Estado */
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

/* Crear tabla para seguimiento de ejecuciones */
CREATE TABLE IF NOT EXISTS public.expense_recurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.expense_templates(id) NOT NULL,
  expense_id UUID REFERENCES public.expenses(id) NOT NULL,
  execution_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

/* Crear índices para mejor rendimiento */
CREATE INDEX IF NOT EXISTS idx_expense_templates_property_id ON public.expense_templates(property_id);
CREATE INDEX IF NOT EXISTS idx_expense_templates_active ON public.expense_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_expense_templates_next_execution ON public.expense_templates(next_execution_date);
CREATE INDEX IF NOT EXISTS idx_expense_recurrences_template_id ON public.expense_recurrences(template_id);

/* Crear RLS policies */
ALTER TABLE public.expense_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_recurrences ENABLE ROW LEVEL SECURITY;

/* Policy para expense_templates - Usuarios autenticados pueden acceder a todas las propiedades */
CREATE POLICY "Authenticated users can view all expense templates" ON public.expense_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert expense templates" ON public.expense_templates
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update expense templates" ON public.expense_templates
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete expense templates" ON public.expense_templates
  FOR DELETE USING (auth.uid() IS NOT NULL);

/* Policy para expense_recurrences - Usuarios autenticados pueden acceder a todas las propiedades */
CREATE POLICY "Authenticated users can view all expense recurrences" ON public.expense_recurrences
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert expense recurrences" ON public.expense_recurrences
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
