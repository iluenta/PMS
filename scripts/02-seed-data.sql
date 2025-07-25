-- Insert demo user profile
INSERT INTO profiles (id, email, full_name, role) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'demo@pms.com', 'Demo User', 'owner');

-- Insert sample properties
INSERT INTO properties (id, owner_id, name, description, address, city, country, property_type, bedrooms, bathrooms, max_guests, base_price, cleaning_fee, amenities, status) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Apartamento Centro Madrid', 'Hermoso apartamento en el centro de Madrid con todas las comodidades', 'Calle Gran Vía 25', 'Madrid', 'España', 'apartment', 2, 1, 4, 85.00, 25.00, ARRAY['WiFi', 'Aire acondicionado', 'Cocina equipada', 'TV'], 'active'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Loft Barcelona Gótico', 'Loft moderno en el barrio gótico de Barcelona', 'Carrer del Bisbe 10', 'Barcelona', 'España', 'loft', 1, 1, 2, 95.00, 30.00, ARRAY['WiFi', 'Aire acondicionado', 'Balcón', 'TV'], 'active'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Casa Valencia Playa', 'Casa cerca de la playa en Valencia', 'Avenida del Puerto 15', 'Valencia', 'España', 'house', 3, 2, 6, 120.00, 40.00, ARRAY['WiFi', 'Piscina', 'Jardín', 'Barbacoa', 'TV'], 'active');

-- Insert sample guests
INSERT INTO guests (id, first_name, last_name, email, phone, country) VALUES 
('650e8400-e29b-41d4-a716-446655440001', 'John', 'Smith', 'john.smith@email.com', '+1234567890', 'USA'),
('650e8400-e29b-41d4-a716-446655440002', 'Maria', 'García', 'maria.garcia@email.com', '+34666777888', 'España'),
('650e8400-e29b-41d4-a716-446655440003', 'Pierre', 'Dubois', 'pierre.dubois@email.com', '+33123456789', 'Francia'),
('650e8400-e29b-41d4-a716-446655440004', 'Anna', 'Mueller', 'anna.mueller@email.com', '+49987654321', 'Alemania');

-- Insert sample bookings
INSERT INTO bookings (id, property_id, guest_id, check_in, check_out, guests_count, total_amount, status, booking_source) VALUES 
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '2024-02-15', '2024-02-20', 2, 450.00, 'confirmed', 'Booking.com'),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', '2024-02-10', '2024-02-14', 2, 410.00, 'confirmed', 'Airbnb'),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', '2024-03-01', '2024-03-07', 4, 760.00, 'pending', 'Direct'),
('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440004', '2024-03-15', '2024-03-18', 2, 280.00, 'confirmed', 'Expedia');

-- Insert sample pricing rules
INSERT INTO pricing_rules (property_id, name, start_date, end_date, price_per_night, minimum_stay, rule_type) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Temporada Alta Verano', '2024-06-01', '2024-09-30', 110.00, 3, 'seasonal'),
('550e8400-e29b-41d4-a716-446655440002', 'Temporada Alta Verano', '2024-06-01', '2024-09-30', 125.00, 2, 'seasonal'),
('550e8400-e29b-41d4-a716-446655440003', 'Temporada Alta Verano', '2024-06-01', '2024-09-30', 150.00, 5, 'seasonal');

-- Insert sample channels
INSERT INTO channels (name, type, commission_rate, is_active) VALUES 
('Booking.com', 'OTA', 15.00, true),
('Airbnb', 'OTA', 12.00, true),
('Expedia', 'OTA', 18.00, true),
('Direct Booking', 'direct', 0.00, true),
('VRBO', 'OTA', 15.00, false);
