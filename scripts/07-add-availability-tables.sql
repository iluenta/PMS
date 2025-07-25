-- Create availability_settings table
CREATE TABLE IF NOT EXISTS availability_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  min_nights INTEGER DEFAULT 1,
  max_nights INTEGER DEFAULT 30,
  advance_booking_days INTEGER DEFAULT 0,
  max_advance_booking_days INTEGER DEFAULT 365,
  check_in_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  check_out_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id)
);

-- Enable RLS
ALTER TABLE availability_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage availability settings for their properties" ON availability_settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = availability_settings.property_id AND p.owner_id = auth.uid()
  )
);

-- Create indexes
CREATE INDEX idx_availability_settings_property_id ON availability_settings(property_id);
