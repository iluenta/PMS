-- Add cover_image field to properties
ALTER TABLE properties ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Create traveler_guide_sections table
CREATE TABLE IF NOT EXISTS traveler_guide_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL, -- 'checkin', 'apartment_info', 'places_to_visit', 'restaurants', 'emergency_contacts', 'house_rules'
  title TEXT NOT NULL,
  content TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create traveler_guide_items table (for lists within sections)
CREATE TABLE IF NOT EXISTS traveler_guide_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID REFERENCES traveler_guide_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE traveler_guide_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE traveler_guide_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage guide sections for their properties" ON traveler_guide_sections FOR ALL USING (
  EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = traveler_guide_sections.property_id AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can manage guide items for their properties" ON traveler_guide_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM traveler_guide_sections s
    JOIN properties p ON s.property_id = p.id
    WHERE s.id = traveler_guide_items.section_id AND p.owner_id = auth.uid()
  )
);

-- Allow public access to guide sections and items for travelers
CREATE POLICY "Public can view active guide sections" ON traveler_guide_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active guide items" ON traveler_guide_items FOR SELECT USING (is_active = true);
