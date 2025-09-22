-- Adding tenant support to all tables for multi-tenancy
-- Create tenants table first
CREATE TABLE IF NOT EXISTS tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(255),
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guides table (one guide per property)
CREATE TABLE IF NOT EXISTS guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  welcome_message TEXT,
  host_names VARCHAR(255),
  host_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guide sections for flexible content management
CREATE TABLE IF NOT EXISTS guide_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  section_type VARCHAR(50) NOT NULL, -- 'apartment', 'rules', 'house_guide', 'tips', 'contact'
  title VARCHAR(255),
  content TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create beaches table
CREATE TABLE IF NOT EXISTS beaches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
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

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
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

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
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

-- Create house rules table
CREATE TABLE IF NOT EXISTS house_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100), -- Font Awesome icon class
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create house guide items table
CREATE TABLE IF NOT EXISTS house_guide_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  details TEXT,
  icon VARCHAR(100), -- Font Awesome icon class
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact info table
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
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

-- Create practical info table
CREATE TABLE IF NOT EXISTS practical_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, -- 'transport', 'shopping', 'health', etc.
  title VARCHAR(255) NOT NULL,
  description TEXT,
  details JSONB, -- Flexible JSON for different types of info
  icon VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adding tenant-aware indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_properties_tenant_id ON properties(tenant_id);
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

-- Adding Row Level Security (RLS) for tenant isolation
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE beaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE house_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE house_guide_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE practical_info ENABLE ROW LEVEL SECURITY;

-- Creating RLS policies for tenant isolation
-- Note: These policies assume you have a way to get current_tenant_id() function
-- You'll need to implement this based on your authentication system

-- CREATE POLICY tenant_isolation_properties ON properties
--   FOR ALL USING (tenant_id = current_tenant_id());

-- CREATE POLICY tenant_isolation_guides ON guides
--   FOR ALL USING (tenant_id = current_tenant_id());

-- CREATE POLICY tenant_isolation_guide_sections ON guide_sections
--   FOR ALL USING (tenant_id = current_tenant_id());

-- CREATE POLICY tenant_isolation_beaches ON beaches
--   FOR ALL USING (tenant_id = current_tenant_id());

-- CREATE POLICY tenant_isolation_restaurants ON restaurants
--   FOR ALL USING (tenant_id = current_tenant_id());

-- CREATE POLICY tenant_isolation_activities ON activities
--   FOR ALL USING (tenant_id = current_tenant_id());

-- CREATE POLICY tenant_isolation_house_rules ON house_rules
--   FOR ALL USING (tenant_id = current_tenant_id());

-- CREATE POLICY tenant_isolation_house_guide_items ON house_guide_items
--   FOR ALL USING (tenant_id = current_tenant_id());

-- CREATE POLICY tenant_isolation_contact_info ON contact_info
--   FOR ALL USING (tenant_id = current_tenant_id());

-- CREATE POLICY tenant_isolation_practical_info ON practical_info
--   FOR ALL USING (tenant_id = current_tenant_id());
