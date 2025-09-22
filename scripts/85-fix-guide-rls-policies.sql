-- Script para corregir las políticas RLS de las tablas de guías
-- El problema es que auth.jwt() no contiene tenant_id, necesitamos usar una función

-- Primero, crear una función para obtener el tenant_id del usuario actual
CREATE OR REPLACE FUNCTION get_current_user_tenant_id()
RETURNS INTEGER AS $$
DECLARE
    user_tenant_id INTEGER;
BEGIN
    -- Obtener el tenant_id del usuario actual desde la tabla users
    SELECT tenant_id INTO user_tenant_id
    FROM users
    WHERE id = auth.uid();
    
    RETURN user_tenant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar las políticas existentes
DROP POLICY IF EXISTS tenant_isolation_guides ON guides;
DROP POLICY IF EXISTS tenant_isolation_guide_sections ON guide_sections;
DROP POLICY IF EXISTS tenant_isolation_beaches ON beaches;
DROP POLICY IF EXISTS tenant_isolation_restaurants ON restaurants;
DROP POLICY IF EXISTS tenant_isolation_activities ON activities;
DROP POLICY IF EXISTS tenant_isolation_house_rules ON house_rules;
DROP POLICY IF EXISTS tenant_isolation_house_guide_items ON house_guide_items;
DROP POLICY IF EXISTS tenant_isolation_contact_info ON contact_info;
DROP POLICY IF EXISTS tenant_isolation_practical_info ON practical_info;

-- Crear nuevas políticas usando la función
CREATE POLICY tenant_isolation_guides ON guides
  FOR ALL USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY tenant_isolation_guide_sections ON guide_sections
  FOR ALL USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY tenant_isolation_beaches ON beaches
  FOR ALL USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY tenant_isolation_restaurants ON restaurants
  FOR ALL USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY tenant_isolation_activities ON activities
  FOR ALL USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY tenant_isolation_house_rules ON house_rules
  FOR ALL USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY tenant_isolation_house_guide_items ON house_guide_items
  FOR ALL USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY tenant_isolation_contact_info ON contact_info
  FOR ALL USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY tenant_isolation_practical_info ON practical_info
  FOR ALL USING (tenant_id = get_current_user_tenant_id());

-- Verificar que las políticas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('guides', 'guide_sections', 'beaches', 'restaurants', 'activities', 'house_rules', 'house_guide_items', 'contact_info', 'practical_info')
ORDER BY tablename, policyname;
