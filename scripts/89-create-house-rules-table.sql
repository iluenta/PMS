-- Script para crear la tabla house_rules para múltiples normas individuales
-- Basado en el proyecto de contexto

-- Crear tabla house_rules
CREATE TABLE IF NOT EXISTS house_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100), -- Font Awesome icon class
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_house_rules_tenant_id ON house_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_house_rules_guide_id ON house_rules(guide_id);
CREATE INDEX IF NOT EXISTS idx_house_rules_order ON house_rules(order_index);

-- Habilitar Row Level Security
ALTER TABLE house_rules ENABLE ROW LEVEL SECURITY;

-- Crear política RLS para aislamiento por tenant
CREATE POLICY tenant_isolation_house_rules ON house_rules
  FOR ALL USING (tenant_id = get_current_user_tenant_id());

-- Crear trigger para updated_at
CREATE OR REPLACE FUNCTION update_house_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_house_rules_updated_at
  BEFORE UPDATE ON house_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_house_rules_updated_at();

-- Verificar que la tabla se creó correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'house_rules' 
ORDER BY ordinal_position;











