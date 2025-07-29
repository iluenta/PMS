-- Create distribution_channels table
CREATE TABLE IF NOT EXISTS distribution_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name CHARACTER VARYING NOT NULL UNIQUE,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('OTA', 'Directo', 'Otro')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT distribution_channels_pkey PRIMARY KEY (id)
);

-- Create property_channels table
CREATE TABLE IF NOT EXISTS property_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL,
  channel_id UUID NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  commission_charge_percentage NUMERIC DEFAULT 0.00,
  commission_sale_percentage NUMERIC DEFAULT 0.00,
  property_url TEXT,
  external_property_id CHARACTER VARYING,
  external_listing_id CHARACTER VARYING,
  external_place_id CHARACTER VARYING,
  listing_url TEXT,
  review_url TEXT,
  property_rating NUMERIC DEFAULT 0.00,
  property_review_count INTEGER DEFAULT 0,
  last_rating_update TIMESTAMP WITH TIME ZONE,
  price_adjustment_percentage NUMERIC DEFAULT 0.00,
  commission_override_charge NUMERIC,
  commission_override_sale NUMERIC,
  availability_sync_enabled BOOLEAN DEFAULT true,
  instant_booking_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT property_channels_pkey PRIMARY KEY (id),
  CONSTRAINT property_channels_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES distribution_channels(id),
  CONSTRAINT property_channels_property_id_fkey FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- Enable RLS
ALTER TABLE distribution_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_channels ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view distribution channels" ON distribution_channels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage distribution channels" ON distribution_channels FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view property channels for their properties" ON property_channels FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = property_channels.property_id AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can manage property channels for their properties" ON property_channels FOR ALL USING (
  EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = property_channels.property_id AND p.owner_id = auth.uid()
  )
); 