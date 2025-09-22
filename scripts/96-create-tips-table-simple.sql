-- Script simple para crear la tabla de consejos (tips)
-- Basado en la estructura de house_guide_items

-- Crear tabla de consejos
CREATE TABLE IF NOT EXISTS tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  details TEXT,
  icon VARCHAR(100), -- Font Awesome icon class
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_tips_tenant_id ON tips(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tips_guide_id ON tips(guide_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;

-- Crear política RLS para aislamiento por tenant
CREATE POLICY tenant_isolation_tips ON tips
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::integer);

-- Crear trigger para updated_at
CREATE OR REPLACE FUNCTION update_tips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_tips_updated_at ON tips;
CREATE TRIGGER update_tips_updated_at
  BEFORE UPDATE ON tips
  FOR EACH ROW
  EXECUTE FUNCTION update_tips_updated_at();

-- Verificar que la tabla se creó correctamente
SELECT 
  'Tabla tips creada exitosamente' as status,
  COUNT(*) as total_tips
FROM tips;
