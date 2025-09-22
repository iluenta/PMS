-- =====================================================
-- SCRIPT SIMPLIFICADO PARA CREAR TABLA APARTMENT_SECTIONS
-- =====================================================
-- Versión simplificada sin políticas RLS complejas
-- Para usar si el script completo da problemas

-- 1. Crear la tabla apartment_sections
CREATE TABLE IF NOT EXISTS apartment_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  section_type VARCHAR(50) NOT NULL CHECK (section_type IN ('cocina', 'bano', 'salon', 'dormitorio', 'terraza', 'entrada', 'balcon', 'garaje')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  details TEXT,
  image_url TEXT,
  icon VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear índices básicos
CREATE INDEX IF NOT EXISTS idx_apartment_sections_tenant_id ON apartment_sections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_apartment_sections_guide_id ON apartment_sections(guide_id);
CREATE INDEX IF NOT EXISTS idx_apartment_sections_order ON apartment_sections(order_index);

-- 3. Habilitar Row Level Security
ALTER TABLE apartment_sections ENABLE ROW LEVEL SECURITY;

-- 4. Política RLS simple (basada en tenant_id)
CREATE POLICY apartment_sections_tenant_policy ON apartment_sections
  FOR ALL USING (tenant_id = 1); -- Cambiar 1 por el tenant_id correcto

-- 5. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_apartment_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_apartment_sections_updated_at ON apartment_sections;
CREATE TRIGGER update_apartment_sections_updated_at
  BEFORE UPDATE ON apartment_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_apartment_sections_updated_at();

-- 6. Verificar creación
SELECT 'Tabla apartment_sections creada exitosamente' as status;
