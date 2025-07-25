-- Create commission_settings table
CREATE TABLE IF NOT EXISTS commission_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  channel_name TEXT NOT NULL,
  channel_type TEXT NOT NULL, -- 'ota', 'direct', 'other'
  commission_rate DECIMAL(5,2) NOT NULL, -- Percentage
  commission_type TEXT DEFAULT 'percentage', -- 'percentage' or 'fixed'
  fixed_amount DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create booking_payments table
CREATE TABLE IF NOT EXISTS booking_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  payment_type TEXT NOT NULL, -- 'deposit', 'balance', 'refund'
  amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT, -- 'card', 'transfer', 'cash', 'paypal'
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  payment_date DATE,
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property_expenses table
CREATE TABLE IF NOT EXISTS property_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  expense_type TEXT NOT NULL, -- 'cleaning', 'maintenance', 'supplies', 'utilities', 'other'
  category TEXT, -- 'operational', 'maintenance', 'marketing', 'administrative'
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  payment_method TEXT,
  receipt_url TEXT,
  vendor_name TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT, -- 'monthly', 'quarterly', 'yearly'
  status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add commission calculation to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS net_amount DECIMAL(10,2) DEFAULT 0;

-- Enable RLS
ALTER TABLE commission_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_expenses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own commission settings" ON commission_settings FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can manage payments for their bookings" ON booking_payments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM bookings b 
    JOIN properties p ON b.property_id = p.id 
    WHERE b.id = booking_payments.booking_id AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can manage expenses for their properties" ON property_expenses FOR ALL USING (
  EXISTS (
    SELECT 1 FROM properties p 
    WHERE p.id = property_expenses.property_id AND p.owner_id = auth.uid()
  )
);
