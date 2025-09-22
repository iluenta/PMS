-- Generate multiple sample properties with varied data
INSERT INTO properties (id, name, address, description) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Casa del Mar', 'Avenida Playa, 45, 04620 Vera, Almería', 'Villa frente al mar con vistas espectaculares'),
('550e8400-e29b-41d4-a716-446655440002', 'Villa Mediterránea', 'Calle de los Pinos, 78, 30880 Águilas, Murcia', 'Chalet en Águilas, Murcia. Con todas las comodidades modernas'),
('550e8400-e29b-41d4-a716-446655440003', 'Apartamento Playa Azul', 'Calle Principal, 156, 03140 Guardamar, Alicante', 'Apartamento en Guardamar, Alicante. A pocos metros de la playa'),
('550e8400-e29b-41d4-a716-446655440004', 'Chalet Los Pinos', 'Calle Mayor, 23, 04638 Mojácar, Almería', 'Villa en Mojácar, Almería. En zona tranquila y residencial'),
('550e8400-e29b-41d4-a716-446655440005', 'Estudio Marisol', 'Calle del Mar, 89, 30860 Mazarrón, Murcia', 'Estudio en Mazarrón, Murcia. Ideal para parejas y familias');

-- Generate guides for the new properties
INSERT INTO guides (id, property_id, title, welcome_message, host_names, host_signature) VALUES 
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Guía Casa del Mar', '¡Bienvenidos a Casa del Mar! Esperamos que disfruten de su estancia en nuestra villa frente al mar. Hemos preparado esta guía con todo lo necesario para que tengan unas vacaciones perfectas.', 'María y Carlos', 'Con cariño, María y Carlos'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'Guía Villa Mediterránea', 'Hola y bienvenidos a Villa Mediterránea. Somos Ana y Miguel, y queremos que se sientan como en casa. Esta guía les ayudará a descubrir lo mejor de Águilas y sus alrededores.', 'Ana y Miguel', 'Saludos cordiales, Ana y Miguel'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 'Guía Playa Azul', '¡Hola! Somos Laura y Javier. Les damos la bienvenida a nuestro apartamento en Guardamar. Esperamos que disfruten de las hermosas playas y la tranquilidad de la zona.', 'Laura y Javier', 'Un abrazo, Laura y Javier');

-- Generate varied beaches for different properties
INSERT INTO beaches (guide_id, name, description, distance, rating, badge, image_url, order_index) VALUES 
-- Beaches for Casa del Mar
('550e8400-e29b-41d4-a716-446655440011', 'Playa de Las Palmeras', 'Extensa playa con todos los servicios y chiringuitos. Arena fina y aguas cristalinas perfectas para familias.', '2 min caminando', 4.7, 'Familiar', 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 1),
('550e8400-e29b-41d4-a716-446655440011', 'Cala Cristal', 'Cala protegida ideal para familias con niños. Aguas tranquilas y poco profundas.', '10 min caminando', 4.4, 'Escondida', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 2),

-- Beaches for Villa Mediterránea  
('550e8400-e29b-41d4-a716-446655440012', 'Playa de Águilas Centro', 'Playa urbana con paseo marítimo y gran variedad de restaurantes. Muy animada durante el verano.', '5 min en coche', 4.2, 'Urbana', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 1),
('550e8400-e29b-41d4-a716-446655440012', 'Cala de la Herradura', 'Playa virgen rodeada de naturaleza. Ideal para los amantes de la tranquilidad.', '15 min en coche', 4.6, 'Virgen', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 2),

-- Beaches for Playa Azul
('550e8400-e29b-41d4-a716-446655440013', 'Playa Centro de Guardamar', 'Playa principal de Guardamar con dunas naturales y pinares. Bandera azul por su calidad.', '3 min caminando', 4.5, 'Recomendada', 'https://images.unsplash.com/photo-1533563996068-24833183f0b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 1);

-- Generate varied restaurants
INSERT INTO restaurants (guide_id, name, description, rating, review_count, price_range, badge, image_url, order_index) VALUES 
-- Restaurants for Casa del Mar
('550e8400-e29b-41d4-a716-446655440011', 'Marisquería Bahía', 'Especializado en mariscos frescos del Mediterráneo. Terraza con vistas al mar y ambiente familiar.', 4.5, 342, '€€ - €€€', 'Marisco', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 1),
('550e8400-e29b-41d4-a716-446655440011', 'Pizzería Bella Vista', 'Auténtica pizza italiana con horno de leña. Ideal para cenas familiares con niños.', 4.3, 198, '€€', 'Italiana', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 2),

-- Restaurants for Villa Mediterránea
('550e8400-e29b-41d4-a716-446655440012', 'El Rincón del Pescador', 'Restaurante tradicional con pescado fresco diario. Especialidad en caldero murciano.', 4.7, 456, '€€€', 'Tradicional', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 1),
('550e8400-e29b-41d4-a716-446655440012', 'Chiringuito La Gaviota', 'Chiringuito en primera línea de playa. Paellas, pescaíto frito y cócteles al atardecer.', 4.1, 287, '€€', 'Chiringuito', 'https://images.unsplash.com/photo-1526318896980-cf78c088247c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 2),

-- Restaurants for Playa Azul
('550e8400-e29b-41d4-a716-446655440013', 'Casa Pepe', 'Cocina mediterránea con toques modernos. Productos locales y de temporada. Ambiente elegante.', 4.6, 523, '€€€€', 'Gourmet', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 1);

-- Generate varied activities
INSERT INTO activities (guide_id, name, description, distance, price_info, badge, image_url, order_index) VALUES 
-- Activities for Casa del Mar
('550e8400-e29b-41d4-a716-446655440011', 'Parque Natural Cabo Cope', 'Espacio natural protegido con senderos y miradores. Ideal para observación de aves y senderismo.', '20 min en coche', 'Gratuito', 'Naturaleza', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 1),
('550e8400-e29b-41d4-a716-446655440011', 'Centro de Buceo Mediterráneo', 'Escuela de buceo con inmersiones para todos los niveles. Descubre la rica fauna marina de la zona.', '10 min en coche', 'Desde 35€', 'Aventura', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 2),

-- Activities for Villa Mediterránea
('550e8400-e29b-41d4-a716-446655440012', 'Castillo de San Juan de Águilas', 'Fortaleza del siglo XVIII con museo y vistas panorámicas. Visitas guiadas disponibles.', '8 min en coche', 'Desde 3€', 'Cultural', 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 1),
('550e8400-e29b-41d4-a716-446655440012', 'Club Náutico Águilas', 'Alquiler de embarcaciones y deportes acuáticos. Escuela de vela y windsurf.', '12 min en coche', 'Desde 25€', 'Deporte', 'https://images.unsplash.com/photo-1587105329505-6c6b7f5ed828?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 2),

-- Activities for Playa Azul
('550e8400-e29b-41d4-a716-446655440013', 'Parque Infantil Reina Sofía', 'Gran parque con juegos infantiles, zona de picnic y lago artificial. Perfecto para familias.', '5 min caminando', 'Gratuito', 'Familiar', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 1);

-- Generate house rules for new properties
INSERT INTO house_rules (guide_id, title, description, icon, order_index) VALUES 
-- Rules for Casa del Mar
('550e8400-e29b-41d4-a716-446655440011', 'No Fumar', 'Prohibido fumar en el interior. Zona habilitada en la terraza.', 'fas fa-smoking-ban', 1),
('550e8400-e29b-41d4-a716-446655440011', 'Horario de Silencio', 'Respeta el descanso de 22:00 a 8:00 horas.', 'fas fa-volume-mute', 2),
('550e8400-e29b-41d4-a716-446655440011', 'Mascotas Bienvenidas', 'Las mascotas son bienvenidas. Mantenerlas controladas y limpiar después de ellas.', 'fas fa-paw', 3),

-- Rules for Villa Mediterránea
('550e8400-e29b-41d4-a716-446655440012', 'Check-in/Check-out', 'Entrada: 16:00-20:00. Salida: antes de 11:00. Contactar para horarios especiales.', 'fas fa-clock', 1),
('550e8400-e29b-41d4-a716-446655440012', 'Uso de la Piscina', 'Piscina disponible de 9:00 a 22:00. Ducha obligatoria antes del baño.', 'fas fa-swimming-pool', 2),
('550e8400-e29b-41d4-a716-446655440012', 'Cuidado del Jardín', 'Disfruta del jardín pero respeta las plantas y mobiliario.', 'fas fa-leaf', 3);

-- Generate house guide items for new properties
INSERT INTO house_guide_items (guide_id, title, description, details, icon, order_index) VALUES 
-- House guide for Casa del Mar
('550e8400-e29b-41d4-a716-446655440011', 'AIRE ACONDICIONADO', 'Sistema de climatización en todas las habitaciones. Temperatura recomendada 22-24°C.', 'Cierra ventanas y puertas para mayor eficiencia energética.', 'fas fa-snowflake', 1),
('550e8400-e29b-41d4-a716-446655440011', 'WIFI Y ENTRETENIMIENTO', 'WiFi gratuito en toda la casa. Smart TV con Netflix, Prime Video y YouTube.', 'Red: CasaDelMar_WiFi | Contraseña: mar2024', 'fas fa-wifi', 2),
('550e8400-e29b-41d4-a716-446655440011', 'TERRAZA Y BARBACOA', 'Terraza privada con barbacoa de gas y mobiliario exterior. Vistas al mar.', 'Utensilios de barbacoa en el armario de la terraza.', 'fas fa-fire', 3),

-- House guide for Villa Mediterránea
('550e8400-e29b-41d4-a716-446655440012', 'PISCINA PRIVADA', 'Piscina de agua salada con sistema de depuración automático. Profundidad máxima 1.8m.', 'Productos de limpieza y mantenimiento en el cuarto técnico.', 'fas fa-swimming-pool', 1),
('550e8400-e29b-41d4-a716-446655440012', 'COCINA COMPLETA', 'Cocina americana totalmente equipada. Lavavajillas, horno, microondas y vitrocerámica.', 'Productos básicos disponibles: aceite, sal, azúcar y especias.', 'fas fa-utensils', 2);

-- Generate contact info for new properties
INSERT INTO contact_info (guide_id, host_names, phone, email, whatsapp, emergency_numbers, service_issues) VALUES 
('550e8400-e29b-41d4-a716-446655440011', 'María y Carlos', '+34 610 111 222', 'maria.carlos@casadelmar.com', '+34 610 111 222', 
'{"emergencias": "112", "policia_local": "092", "guardia_civil": "062", "bomberos": "080"}',
'{"Problemas con la piscina", "Incidencias con el aire acondicionado", "Problemas con WiFi", "Averías en electrodomésticos", "Cualquier emergencia"}'),

('550e8400-e29b-41d4-a716-446655440012', 'Ana y Miguel', '+34 620 333 444', 'ana.miguel@villamediterranea.com', '+34 620 333 444',
'{"emergencias": "112", "policia_local": "092", "guardia_civil": "062", "bomberos": "080"}',
'{"Problemas con la climatización", "Incidencias con la piscina", "Problemas de conectividad", "Averías en la cocina", "Cualquier consulta"}'),

('550e8400-e29b-41d4-a716-446655440013', 'Laura y Javier', '+34 630 555 666', 'laura.javier@playaazul.com', '+34 630 555 666',
'{"emergencias": "112", "policia_local": "092", "guardia_civil": "062", "bomberos": "080"}',
'{"Problemas con electrodomésticos", "Incidencias con calefacción", "Problemas con WiFi", "Limpieza adicional", "Información turística"}');
