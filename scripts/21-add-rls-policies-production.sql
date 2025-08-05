-- Script para agregar políticas RLS para aplicación single-tenant
-- Basado en el esquema real de producción

-- Políticas para tablas principales de negocio
CREATE POLICY "Authenticated users can access everything" ON properties FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access everything" ON reservations FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access everything" ON invoices FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access everything" ON invoice_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access everything" ON expenses FOR ALL TO authenticated USING (true);

-- Políticas para tablas de configuración
CREATE POLICY "Authenticated users can access everything" ON billing_config FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access everything" ON customers FOR ALL TO authenticated USING (true);

-- Políticas para tablas de canales de distribución
CREATE POLICY "Authenticated users can access everything" ON distribution_channels FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access everything" ON property_channels FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can access everything" ON property_settings FOR ALL TO authenticated USING (true);

-- Comentarios explicativos
COMMENT ON POLICY "Authenticated users can access everything" ON properties IS 'Política RLS para aplicación single-tenant - acceso total para usuarios autenticados';
COMMENT ON POLICY "Authenticated users can access everything" ON reservations IS 'Política RLS para aplicación single-tenant - acceso total para usuarios autenticados';
COMMENT ON POLICY "Authenticated users can access everything" ON invoices IS 'Política RLS para aplicación single-tenant - acceso total para usuarios autenticados';
COMMENT ON POLICY "Authenticated users can access everything" ON expenses IS 'Política RLS para aplicación single-tenant - acceso total para usuarios autenticados'; 