-- Insert commission settings
INSERT INTO commission_settings (owner_id, channel_name, channel_type, commission_rate, is_active) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Booking.com', 'ota', 15.00, true),
('550e8400-e29b-41d4-a716-446655440000', 'Airbnb', 'ota', 12.00, true),
('550e8400-e29b-41d4-a716-446655440000', 'Expedia', 'ota', 18.00, true),
('550e8400-e29b-41d4-a716-446655440000', 'VRBO', 'ota', 15.00, true),
('550e8400-e29b-41d4-a716-446655440000', 'Canal Directo', 'direct', 0.00, true);

-- Update existing bookings with commission data
UPDATE bookings SET 
  commission_rate = 15.00,
  commission_amount = total_amount * 0.15,
  net_amount = total_amount * 0.85
WHERE booking_source = 'Booking.com';

UPDATE bookings SET 
  commission_rate = 12.00,
  commission_amount = total_amount * 0.12,
  net_amount = total_amount * 0.88
WHERE booking_source = 'Airbnb';

UPDATE bookings SET 
  commission_rate = 18.00,
  commission_amount = total_amount * 0.18,
  net_amount = total_amount * 0.82
WHERE booking_source = 'Expedia';

UPDATE bookings SET 
  commission_rate = 0.00,
  commission_amount = 0,
  net_amount = total_amount
WHERE booking_source = 'Direct';

-- Insert sample booking payments
INSERT INTO booking_payments (booking_id, payment_type, amount, commission_amount, net_amount, payment_method, payment_status, payment_date, reference_number) VALUES 
('750e8400-e29b-41d4-a716-446655440001', 'deposit', 225.00, 33.75, 191.25, 'card', 'completed', '2024-01-20', 'PAY-001'),
('750e8400-e29b-41d4-a716-446655440001', 'balance', 225.00, 33.75, 191.25, 'card', 'completed', '2024-02-14', 'PAY-002'),
('750e8400-e29b-41d4-a716-446655440002', 'deposit', 205.00, 24.60, 180.40, 'paypal', 'completed', '2024-01-20', 'PAY-003'),
('750e8400-e29b-41d4-a716-446655440002', 'balance', 205.00, 24.60, 180.40, 'paypal', 'completed', '2024-02-09', 'PAY-004'),
('750e8400-e29b-41d4-a716-446655440003', 'deposit', 380.00, 0.00, 380.00, 'transfer', 'completed', '2024-01-25', 'PAY-005'),
('750e8400-e29b-41d4-a716-446655440003', 'balance', 380.00, 0.00, 380.00, 'transfer', 'pending', NULL, NULL);

-- Insert sample property expenses
INSERT INTO property_expenses (property_id, expense_type, category, description, amount, expense_date, payment_method, vendor_name, status) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'cleaning', 'operational', 'Limpieza post check-out', 35.00, '2024-02-20', 'cash', 'Limpieza Madrid SL', 'paid'),
('550e8400-e29b-41d4-a716-446655440001', 'maintenance', 'maintenance', 'Reparación grifo cocina', 85.00, '2024-02-18', 'transfer', 'Fontanería Express', 'paid'),
('550e8400-e29b-41d4-a716-446655440002', 'supplies', 'operational', 'Amenities baño y cocina', 45.00, '2024-02-12', 'card', 'Suministros Hoteleros', 'paid'),
('550e8400-e29b-41d4-a716-446655440003', 'utilities', 'operational', 'Factura electricidad febrero', 120.00, '2024-02-28', 'transfer', 'Iberdrola', 'pending'),
('550e8400-e29b-41d4-a716-446655440001', 'cleaning', 'operational', 'Limpieza semanal', 40.00, '2024-03-01', 'cash', 'Limpieza Madrid SL', 'paid');
