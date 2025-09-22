-- Adding sample tenant data and updating all inserts with tenant_id
-- Insert sample tenants
INSERT INTO tenants (id, name, slug, domain, settings, is_active) VALUES 
('550e8400-e29b-41d4-a716-446655440100', 'Vera Properties Management', 'vera-properties', 'vera-properties.com', '{"theme": "blue", "language": "es", "currency": "EUR"}', true),
('550e8400-e29b-41d4-a716-446655440101', 'Costa del Sol Rentals', 'costa-del-sol', 'costadelsolrentals.com', '{"theme": "orange", "language": "es", "currency": "EUR"}', true);

-- Insert sample property
INSERT INTO properties (id, tenant_id, name, address, description) VALUES 
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440100', 'VeraTespera', 'Calle Ejemplo, 123, 04620 Vera, Almería', 'Hermoso apartamento en Vera, perfecto para vacaciones en familia');

-- Insert sample guide
INSERT INTO guides (id, tenant_id, property_id, title, welcome_message, host_names, host_signature) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440000', 'Guía del Huésped', '¡Hola! Somos Sonia y Pedro, tus anfitriones en VeraTespera. Hemos preparado esta guía para que disfrutes al máximo tu estancia en nuestro apartamento y en la maravillosa zona de Vera. Aquí encontrarás toda la información que necesitas para organizar tu viaje y descubrir los mejores lugares de la zona.', 'Sonia y Pedro', 'Con cariño, Sonia y Pedro');

-- Insert guide sections
INSERT INTO guide_sections (tenant_id, guide_id, section_type, title, content, order_index) VALUES 
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'apartment', 'Tu Hogar en Vera', 'Bienvenido a tu hogar temporal en Vera. Nuestro apartamento está completamente equipado para que tengas una estancia cómoda y memorable.', 1),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'tips', 'Consejos para tu Estancia', 'Aquí tienes algunos consejos útiles para aprovechar al máximo tu tiempo en Vera y sus alrededores.', 2);

-- Insert sample beaches
INSERT INTO beaches (tenant_id, guide_id, name, description, distance, rating, badge, image_url, order_index) VALUES 
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'El Playazo', 'La playa más grande e importante de Vera, con más de 2 kilómetros de longitud. Arena fina y dorada con todos los servicios: paseo marítimo, restaurantes, chiringuitos y club de playa.', '15 min caminando', 4.5, 'Recomendada', 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 1),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'Playa de Las Marinas – Bolaga', 'Playa de 1.775 metros con paseo marítimo ajardinado, carril bici y zonas de juego infantil. Cuenta con la certificación Q de calidad y chiringuitos para comer.', '5 min en coche', 4.3, 'Familiar', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 2),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'Playa de Puerto Rey', 'Playa urbana en la urbanización Puerto Rey, con accesos para discapacitados, duchas, aseos y chiringuitos. Zona tranquila de casas bajas con instalaciones deportivas.', '10 min en coche', 4.0, 'Tranquila', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 3),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'Zona Naturista de El Playazo', 'En la parte norte de El Playazo, mundialmente famosa por ser el primer enclave europeo oficialmente declarado para la práctica del nudismo. Cuenta con hoteles y restaurantes especializados.', '15 min en coche', 4.2, 'Naturista', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 4);

-- Insert sample restaurants
INSERT INTO restaurants (tenant_id, guide_id, name, description, rating, review_count, price_range, badge, image_url, order_index) VALUES 
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'Restaurante Juan Moreno', 'Uno de los mejores restaurantes de Vera, especializado en cocina mediterránea. Ideal para una cena especial con platos elaborados y un ambiente refinado.', 4.6, 619, '€€€€', 'Gourmet', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 1),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'Terraza Carmona', 'Un clásico de Vera con terraza y comida exquisita. Especializados en cocina mediterránea y europea. Servicio atento y ambiente acogedor.', 4.4, 911, '€€ - €€€', 'Clásico', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 2),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'Freiduria Bar Rosado', 'Especializados en pescado frito y marisco fresco. Buena comida a precio razonable. Recomendamos probar las berenjenas a la miel y los boquerones.', 4.4, 410, '€€ - €€€', 'Marisco', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 3);

-- Insert sample activities
INSERT INTO activities (tenant_id, guide_id, name, description, distance, price_info, badge, image_url, order_index) VALUES 
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'AquaVera Parque Acuático', 'Parque acuático en la playa de Vera con atracciones para familias, niños y jóvenes. Toboganes, piscinas de olas y zonas de relax para disfrutar en familia.', '10 min en coche', 'Desde 14€', 'Familiar', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 1),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'Club del Golf Valle del Este', 'Campo de golf de 18 holes diseñado por José Canales. Cuenta con escuela de golf, restaurante y pro shop. Un desafío para jugadores de todos los niveles.', '15 min en coche', 'Precio green fee', 'Deporte', 'https://images.unsplash.com/photo-1587105329505-6c6b7f5ed828?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 2),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'Salar de los Canos', 'Humedal que conforma uno de los ecosistemas más importantes de la provincia de Almería. Hábitat de garza real, flamencos, ánade real y otras especies.', '20 min caminando', 'Gratuito', 'Naturaleza', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 3);

-- Insert sample house rules
INSERT INTO house_rules (tenant_id, guide_id, title, description, icon, order_index) VALUES 
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'No Fumar', 'Por favor, no fumes dentro del apartamento. Puedes hacerlo en las zonas exteriores designadas.', 'fas fa-smoking-ban', 1),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'Sin Fiestas', 'No se permiten fiestas ni eventos ruidosos. Mantén un volumen moderado, especialmente por la noche.', 'fas fa-volume-mute', 2),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'Cuida como en Casa', 'Trata el apartamento como si fuera tu hogar. Si encuentras algún problema, contáctanos de inmediato.', 'fas fa-home-heart', 3),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'Respeta el Descanso', 'Por favor, mantén la tranquilidad entre las 8:00 am y las 12:00 pm para no molestar a otros residentes.', 'fas fa-bed', 4);

-- Insert sample house guide items
INSERT INTO house_guide_items (tenant_id, guide_id, title, description, details, icon, order_index) VALUES 
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'TEMPERATURA', 'Para una ventilación adecuada, abre las ventanas durante las horas frescas del día. El aire acondicionado está configurado para un consumo eficiente. Te recomendamos mantenerlo a 23°C para un confort óptimo.', 'Cierra ventanas y puertas cuando uses el aire acondicionado para mayor eficiencia.', 'fas fa-temperature-high', 1),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'WIFI & TV', 'Dispones de conexión WiFi gratuita de alta velocidad en todo el apartamento. El televisor es Smart TV con acceso a Netflix, YouTube y otras aplicaciones.', 'Red: VeraTespera_WiFi | Contraseña: vera2024', 'fas fa-wifi', 2);

-- Insert sample contact info
INSERT INTO contact_info (tenant_id, guide_id, host_names, phone, email, whatsapp, emergency_numbers, service_issues) VALUES 
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'Sonia y Pedro', '+34 600 000 000', 'info@veratespera.com', '+34 600 000 000', 
'{"emergencias": "112", "policia_local": "092", "guardia_civil": "062", "bomberos": "080"}',
'{"Problemas con el aire acondicionado o calefacción", "Incidencias con el WiFi", "Falta de algún utensilio en la cocina", "Problemas con el agua caliente o electricidad", "Cualquier otra duda o incidencia"}');

-- Insert sample practical info
INSERT INTO practical_info (tenant_id, guide_id, category, title, description, details, icon, order_index) VALUES 
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'transport', 'Transporte Público', 'Información sobre autobuses y transporte en Vera', '{"lineas": ["Línea 1: Centro - Playa", "Línea 2: Estación - Puerto"], "horarios": "06:00 - 23:00", "precio": "1.50€"}', 'fas fa-bus', 1),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'shopping', 'Supermercados', 'Lugares para hacer la compra cerca del apartamento', '{"mercadona": "5 min caminando", "carrefour": "10 min en coche", "dia": "3 min caminando"}', 'fas fa-shopping-cart', 2),
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', 'health', 'Centro de Salud', 'Información médica y farmacia', '{"centro_salud": "Centro de Salud Vera - 5 min en coche", "farmacia": "Farmacia Central - 2 min caminando", "urgencias": "Hospital La Inmaculada - 15 min en coche"}', 'fas fa-hospital', 3);
