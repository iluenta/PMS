-- Update properties with cover images
UPDATE properties SET 
  cover_image = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
  images = ARRAY[
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop'
  ]
WHERE id = '550e8400-e29b-41d4-a716-446655440001';

UPDATE properties SET 
  cover_image = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
  images = ARRAY[
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
  ]
WHERE id = '550e8400-e29b-41d4-a716-446655440002';

UPDATE properties SET 
  cover_image = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
  images = ARRAY[
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'
  ]
WHERE id = '550e8400-e29b-41d4-a716-446655440003';

-- Insert traveler guide sections for Madrid apartment
INSERT INTO traveler_guide_sections (property_id, section_type, title, content, order_index) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'checkin', 'Información de Check-in', 'El check-in es a partir de las 15:00h. Encontrarás las llaves en la caja fuerte ubicada en la entrada del edificio. El código te será enviado el día de tu llegada.', 1),
('550e8400-e29b-41d4-a716-446655440001', 'apartment_info', 'Información del Apartamento', 'Apartamento de 2 habitaciones en pleno centro de Madrid. WiFi gratuito, aire acondicionado y cocina completamente equipada.', 2),
('550e8400-e29b-41d4-a716-446655440001', 'places_to_visit', 'Lugares que Visitar', 'Madrid ofrece increíbles lugares para visitar cerca del apartamento.', 3),
('550e8400-e29b-41d4-a716-446655440001', 'restaurants', 'Restaurantes Recomendados', 'Los mejores restaurantes cerca del apartamento.', 4),
('550e8400-e29b-41d4-a716-446655440001', 'emergency_contacts', 'Contactos de Emergencia', 'Números importantes durante tu estancia.', 5),
('550e8400-e29b-41d4-a716-446655440001', 'house_rules', 'Normas de la Casa', 'Para garantizar una estancia agradable para todos.', 6);

-- Insert guide items for places to visit
INSERT INTO traveler_guide_items (section_id, title, description, address, order_index) VALUES 
((SELECT id FROM traveler_guide_sections WHERE property_id = '550e8400-e29b-41d4-a716-446655440001' AND section_type = 'places_to_visit'), 
 'Museo del Prado', 'Uno de los museos más importantes del mundo con obras de Velázquez, Goya y El Greco.', 'Calle de Ruiz de Alarcón, 23, 28014 Madrid', 1),
((SELECT id FROM traveler_guide_sections WHERE property_id = '550e8400-e29b-41d4-a716-446655440001' AND section_type = 'places_to_visit'), 
 'Parque del Retiro', 'Hermoso parque en el centro de Madrid, perfecto para pasear y relajarse.', 'Plaza de la Independencia, 7, 28001 Madrid', 2),
((SELECT id FROM traveler_guide_sections WHERE property_id = '550e8400-e29b-41d4-a716-446655440001' AND section_type = 'places_to_visit'), 
 'Puerta del Sol', 'El corazón de Madrid y punto de encuentro más famoso de la ciudad.', 'Puerta del Sol, 28013 Madrid', 3);

-- Insert guide items for restaurants
INSERT INTO traveler_guide_items (section_id, title, description, address, phone, order_index) VALUES 
((SELECT id FROM traveler_guide_sections WHERE property_id = '550e8400-e29b-41d4-a716-446655440001' AND section_type = 'restaurants'), 
 'Casa Botín', 'El restaurante más antiguo del mundo según el Guinness. Especialidad en cochinillo.', 'Calle de Cuchilleros, 17, 28005 Madrid', '+34 913 66 42 17', 1),
((SELECT id FROM traveler_guide_sections WHERE property_id = '550e8400-e29b-41d4-a716-446655440001' AND section_type = 'restaurants'), 
 'Mercado de San Miguel', 'Mercado gourmet con gran variedad de tapas y productos locales.', 'Plaza de San Miguel, s/n, 28005 Madrid', '+34 915 42 49 36', 2),
((SELECT id FROM traveler_guide_sections WHERE property_id = '550e8400-e29b-41d4-a716-446655440001' AND section_type = 'restaurants'), 
 'Taberna La Bola', 'Taberna tradicional madrileña famosa por su cocido madrileño.', 'Calle de la Bola, 5, 28013 Madrid', '+34 915 47 69 30', 3);

-- Insert emergency contacts
INSERT INTO traveler_guide_items (section_id, title, description, phone, order_index) VALUES 
((SELECT id FROM traveler_guide_sections WHERE property_id = '550e8400-e29b-41d4-a716-446655440001' AND section_type = 'emergency_contacts'), 
 'Emergencias Generales', 'Policía, Bomberos, Ambulancia', '112', 1),
((SELECT id FROM traveler_guide_sections WHERE property_id = '550e8400-e29b-41d4-a716-446655440001' AND section_type = 'emergency_contacts'), 
 'Policía Nacional', 'Para denuncias y emergencias policiales', '091', 2),
((SELECT id FROM traveler_guide_sections WHERE property_id = '550e8400-e29b-41d4-a716-446655440001' AND section_type = 'emergency_contacts'), 
 'Anfitrión', 'Contacto directo con el propietario', '+34 600 123 456', 3);

-- Update house rules content
UPDATE traveler_guide_sections SET content = 'No se permite fumar en el interior del apartamento. Horario de silencio de 22:00 a 8:00. Máximo 4 huéspedes. No se permiten fiestas. Mantén el apartamento limpio y ordenado.' 
WHERE property_id = '550e8400-e29b-41d4-a716-446655440001' AND section_type = 'house_rules';
