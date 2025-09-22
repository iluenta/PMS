-- Script para crear las tablas de guías del viajero en TuriGest
-- Adaptado del proyecto de integración para funcionar con la estructura existente

-- Crear tabla de guías (una guía por propiedad)
CREATE TABLE IF NOT EXISTS guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT 'Guía del Huésped',
  welcome_message TEXT,
  host_names VARCHAR(255),
  host_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de secciones de guía para contenido flexible
CREATE TABLE IF NOT EXISTS guide_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  section_type VARCHAR(50) NOT NULL, -- 'apartment', 'rules', 'house_guide', 'tips', 'contact'
  title VARCHAR(255),
  content TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de playas
CREATE TABLE IF NOT EXISTS beaches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  distance VARCHAR(100),
  rating DECIMAL(2,1),
  badge VARCHAR(100), -- 'Recomendada', 'Familiar', 'Tranquila', etc.
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de restaurantes
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rating DECIMAL(2,1),
  review_count INTEGER,
  price_range VARCHAR(20), -- '€€', '€€€', etc.
  badge VARCHAR(100), -- 'Gourmet', 'Clásico', 'Marisco', etc.
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de actividades
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  distance VARCHAR(100),
  price_info VARCHAR(100),
  badge VARCHAR(100), -- 'Familiar', 'Deporte', 'Naturaleza', etc.
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de normas de la casa
CREATE TABLE IF NOT EXISTS house_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100), -- Font Awesome icon class
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de elementos de la guía de la casa
CREATE TABLE IF NOT EXISTS house_guide_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  details TEXT,
  icon VARCHAR(100), -- Font Awesome icon class
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de información de contacto
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  host_names VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  whatsapp VARCHAR(50),
  emergency_numbers JSONB, -- Store emergency contacts as JSON
  service_issues TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de información práctica
CREATE TABLE IF NOT EXISTS practical_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, -- 'transport', 'shopping', 'health', etc.
  title VARCHAR(255) NOT NULL,
  description TEXT,
  details JSONB, -- Flexible JSON for different types of info
  icon VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_guides_tenant_id ON guides(tenant_id);
CREATE INDEX IF NOT EXISTS idx_guides_property_id ON guides(property_id);
CREATE INDEX IF NOT EXISTS idx_guide_sections_tenant_id ON guide_sections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_guide_sections_guide_id ON guide_sections(guide_id);
CREATE INDEX IF NOT EXISTS idx_beaches_tenant_id ON beaches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_beaches_guide_id ON beaches(guide_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_tenant_id ON restaurants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_guide_id ON restaurants(guide_id);
CREATE INDEX IF NOT EXISTS idx_activities_tenant_id ON activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activities_guide_id ON activities(guide_id);
CREATE INDEX IF NOT EXISTS idx_house_rules_tenant_id ON house_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_house_rules_guide_id ON house_rules(guide_id);
CREATE INDEX IF NOT EXISTS idx_house_guide_items_tenant_id ON house_guide_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_house_guide_items_guide_id ON house_guide_items(guide_id);
CREATE INDEX IF NOT EXISTS idx_contact_info_tenant_id ON contact_info(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contact_info_guide_id ON contact_info(guide_id);
CREATE INDEX IF NOT EXISTS idx_practical_info_tenant_id ON practical_info(tenant_id);
CREATE INDEX IF NOT EXISTS idx_practical_info_guide_id ON practical_info(guide_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE beaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE house_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE house_guide_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE practical_info ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para aislamiento por tenant
-- Usando el tenant_id del JWT token
CREATE POLICY tenant_isolation_guides ON guides
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::integer);

CREATE POLICY tenant_isolation_guide_sections ON guide_sections
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::integer);

CREATE POLICY tenant_isolation_beaches ON beaches
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::integer);

CREATE POLICY tenant_isolation_restaurants ON restaurants
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::integer);

CREATE POLICY tenant_isolation_activities ON activities
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::integer);

CREATE POLICY tenant_isolation_house_rules ON house_rules
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::integer);

CREATE POLICY tenant_isolation_house_guide_items ON house_guide_items
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::integer);

CREATE POLICY tenant_isolation_contact_info ON contact_info
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::integer);

CREATE POLICY tenant_isolation_practical_info ON practical_info
  FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::integer);

-- Crear triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_guides_updated_at BEFORE UPDATE ON guides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guide_sections_updated_at BEFORE UPDATE ON guide_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON contact_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
