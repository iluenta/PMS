-- Insert availability settings for demo properties
INSERT INTO availability_settings (property_id, min_nights, max_nights, advance_booking_days, max_advance_booking_days, check_in_days, check_out_days) VALUES
('550e8400-e29b-41d4-a716-446655440001', 2, 14, 1, 180, ARRAY['friday', 'saturday', 'sunday'], ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
('550e8400-e29b-41d4-a716-446655440002', 3, 21, 2, 365, ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
('550e8400-e29b-41d4-a716-446655440003', 1, 30, 0, 90, ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
