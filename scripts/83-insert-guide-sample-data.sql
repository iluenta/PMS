-- Script para insertar datos de ejemplo de guías del viajero
-- Adaptado para TuriGest con tenant_id existente

-- Insertar guía de ejemplo para la primera propiedad
-- Asumiendo que existe al menos una propiedad en la tabla properties
INSERT INTO guides (id, tenant_id, property_id, title, welcome_message, host_names, host_signature) 
SELECT 
  gen_random_uuid(),
  p.tenant_id,
  p.id,
  'Guía del Huésped',
  '¡Hola! Somos tus anfitriones. Hemos preparado esta guía para que disfrutes al máximo tu estancia en nuestra propiedad. Aquí encontrarás toda la información que necesitas para organizar tu viaje y descubrir los mejores lugares de la zona.',
  'Anfitriones',
  'Con cariño, tus anfitriones'
FROM properties p 
WHERE NOT EXISTS (SELECT 1 FROM guides g WHERE g.property_id = p.id)
LIMIT 1;

-- Insertar secciones de guía de ejemplo
INSERT INTO guide_sections (tenant_id, guide_id, section_type, title, content, order_index)
SELECT 
  g.tenant_id,
  g.id,
  'apartment',
  'Tu Hogar',
  'Bienvenido a tu hogar temporal. Nuestra propiedad está completamente equipada para que tengas una estancia cómoda y memorable.',
  1
FROM guides g
WHERE NOT EXISTS (SELECT 1 FROM guide_sections gs WHERE gs.guide_id = g.id AND gs.section_type = 'apartment');

INSERT INTO guide_sections (tenant_id, guide_id, section_type, title, content, order_index)
SELECT 
  g.tenant_id,
  g.id,
  'tips',
  'Consejos para tu Estancia',
  'Aquí tienes algunos consejos útiles para aprovechar al máximo tu tiempo en la zona y sus alrededores.',
  2
FROM guides g
WHERE NOT EXISTS (SELECT 1 FROM guide_sections gs WHERE gs.guide_id = g.id AND gs.section_type = 'tips');

-- Insertar playas de ejemplo
INSERT INTO beaches (tenant_id, guide_id, name, description, distance, rating, badge, image_url, order_index)
SELECT 
  g.tenant_id,
  g.id,
  'Playa Principal',
  'La playa más cercana a la propiedad, con todos los servicios necesarios: paseo marítimo, restaurantes, chiringuitos y actividades acuáticas.',
  '5 min caminando',
  4.5,
  'Recomendada',
  'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  1
FROM guides g
WHERE NOT EXISTS (SELECT 1 FROM beaches b WHERE b.guide_id = g.id);

INSERT INTO beaches (tenant_id, guide_id, name, description, distance, rating, badge, image_url, order_index)
SELECT 
  g.tenant_id,
  g.id,
  'Playa Tranquila',
  'Playa más pequeña y tranquila, ideal para familias con niños. Aguas poco profundas y arena fina.',
  '10 min en coche',
  4.2,
  'Familiar',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  2
FROM guides g
WHERE NOT EXISTS (SELECT 1 FROM beaches b WHERE b.guide_id = g.id AND b.name = 'Playa Tranquila');

-- Insertar restaurantes de ejemplo
INSERT INTO restaurants (tenant_id, guide_id, name, description, rating, review_count, price_range, badge, image_url, order_index)
SELECT 
  g.tenant_id,
  g.id,
  'Restaurante Local',
  'Restaurante tradicional con cocina mediterránea. Especializado en pescado fresco y platos locales. Ambiente acogedor y servicio familiar.',
  4.4,
  156,
  '€€ - €€€',
  'Tradicional',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  1
FROM guides g
WHERE NOT EXISTS (SELECT 1 FROM restaurants r WHERE r.guide_id = g.id);

INSERT INTO restaurants (tenant_id, guide_id, name, description, rating, review_count, price_range, badge, image_url, order_index)
SELECT 
  g.tenant_id,
  g.id,
  'Chiringuito Playa',
  'Chiringuito en primera línea de playa. Especializado en paellas, pescaíto frito y cócteles. Perfecto para disfrutar del atardecer.',
  4.1,
  89,
  '€€',
  'Chiringuito',
  'https://images.unsplash.com/photo-1526318896980-cf78c088247c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  2
FROM guides g
WHERE NOT EXISTS (SELECT 1 FROM restaurants r WHERE r.guide_id = g.id AND r.name = 'Chiringuito Playa');

-- Insertar actividades de ejemplo
INSERT INTO activities (tenant_id, guide_id, name, description, distance, price_info, badge, image_url, order_index)
SELECT 
  g.tenant_id,
  g.id,
  'Parque Natural',
  'Espacio natural protegido con senderos y miradores. Ideal para observación de aves, senderismo y disfrutar de la naturaleza.',
  '15 min en coche',
  'Gratuito',
  'Naturaleza',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  1
FROM guides g
WHERE NOT EXISTS (SELECT 1 FROM activities a WHERE a.guide_id = g.id);

INSERT INTO activities (tenant_id, guide_id, name, description, distance, price_info, badge, image_url, order_index)
SELECT 
  g.tenant_id,
  g.id,
  'Centro de Actividades',
  'Centro con actividades acuáticas, deportes de aventura y entretenimiento familiar. Perfecto para días de diversión.',
  '20 min en coche',
  'Desde 25€',
  'Familiar',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  2
FROM guides g
WHERE NOT EXISTS (SELECT 1 FROM activities a WHERE a.guide_id = g.id AND a.name = 'Centro de Actividades');

-- Insertar normas de la casa de ejemplo
INSERT INTO house_rules (tenant_id, guide_id, title, description, icon, order_index)
SELECT 
  g.tenant_id,
  g.id,
  'No Fumar',
  'Por favor, no fumes dentro de la propiedad. Puedes hacerlo en las zonas exteriores designadas.',
  'fas fa-smoking-ban',
  1
FROM guides g
WHERE NOT EXISTS (SELECT 1 FROM house_rules hr WHERE hr.guide_id = g.id);

INSERT INTO house_rules (tenant_id, guide_id, title, description, icon, order_index)
SELECT 
  g.tenant_id,
  g.id,
  'Horario de Silencio',
  'Mantén un volumen moderado, especialmente por la noche. Respeta el descanso de otros residentes.',
  'fas fa-volume-mute',
  2
FROM guides g
WHERE NOT EXISTS (SELECT 1 FROM house_rules hr WHERE hr.guide_id = g.id AND hr.title = 'Horario de Silencio');

INSERT INTO house_rules (tenant_id, guide_id, title, description, icon, order_index)
SELECT 
  g.tenant_id,
  g.id,
  'Cuida como en Casa',
  'Trata la propiedad como si fuera tu hogar. Si encuentras algún problema, contáctanos de inmediato.',
  'fas fa-home-heart',
  3
FROM guides g
WHERE NOT EXISTS (SELECT 1 FROM house_rules hr WHERE hr.guide_id = g.id AND hr.title = 'Cuida como en Casa');

-- Insertar elementos de la guía de la casa de ejemplo
INSERT INTO house_guide_items (tenant_id, guide_id, title, description, details, icon, order_index)
SELECT 
  g.tenant_id,
  g.id,
  'TEMPERATURA',
  'Para una ventilación adecuada, abre las ventanas durante las horas frescas del día. El aire acondicionado está configurado para un consumo eficiente.',
  'Temperatura recomendada: 22-24°C. Cierra ventanas y puertas cuando uses el aire acondicionado.',
  'fas fa-temperature-high',
  1
FROM guides g
WHERE NOT EXISTS (SELECT 1 FROM house_guide_items hgi WHERE hgi.guide_id = g.id);

INSERT INTO house_guide_items (tenant_id, guide_id, title, description, details, icon, order_index)
SELECT 
  g.tenant_id,
  g.id,
  'WIFI & TV',
  'Dispones de conexión WiFi gratuita de alta velocidad en toda la propiedad. El televisor es Smart TV con acceso a plataformas de streaming.',
  'Red: Propiedad_WiFi | Contraseña: wifi2024',
  'fas fa-wifi',
  2
FROM guides g
WHERE NOT EXISTS (SELECT 1 FROM house_guide_items hgi WHERE hgi.guide_id = g.id AND hgi.title = 'WIFI & TV');

-- Insertar información de contacto de ejemplo
INSERT INTO contact_info (tenant_id, guide_id, host_names, phone, email, whatsapp, emergency_numbers, service_issues)
SELECT 
  g.tenant_id,
  g.id,
  'Anfitriones',
  '+34 600 000 000',
  'info@propiedad.com',
  '+34 600 000 000',
  '{"emergencias": "112", "policia_local": "092", "guardia_civil": "062", "bomberos": "080"}',
  ARRAY[
    'Problemas con el aire acondicionado o calefacción',
    'Incidencias con el WiFi',
    'Falta de algún utensilio en la cocina',
    'Problemas con el agua caliente o electricidad',
    'Cualquier otra duda o incidencia'
  ]
FROM guides g
WHERE NOT EXISTS (SELECT 1 FROM contact_info ci WHERE ci.guide_id = g.id);

-- Insertar información práctica de ejemplo
INSERT INTO practical_info (tenant_id, guide_id, category, title, description, details, icon, order_index)
SELECT 
  g.tenant_id,
  g.id,
  'transport',
  'Transporte Público',
  'Información sobre autobuses y transporte en la zona',
  '{"lineas": ["Línea 1: Centro - Playa", "Línea 2: Estación - Puerto"], "horarios": "06:00 - 23:00", "precio": "1.50€"}',
  'fas fa-bus',
  1
FROM guides g
WHERE NOT EXISTS (SELECT 1 FROM practical_info pi WHERE pi.guide_id = g.id);

INSERT INTO practical_info (tenant_id, guide_id, category, title, description, details, icon, order_index)
SELECT 
  g.tenant_id,
  g.id,
  'shopping',
  'Supermercados',
  'Lugares para hacer la compra cerca de la propiedad',
  '{"supermercado1": "5 min caminando", "supermercado2": "10 min en coche", "supermercado3": "3 min caminando"}',
  'fas fa-shopping-cart',
  2
FROM guides g
WHERE NOT EXISTS (SELECT 1 FROM practical_info pi WHERE pi.guide_id = g.id AND pi.category = 'shopping');

INSERT INTO practical_info (tenant_id, guide_id, category, title, description, details, icon, order_index)
SELECT 
  g.tenant_id,
  g.id,
  'health',
  'Centro de Salud',
  'Información médica y farmacia',
  '{"centro_salud": "Centro de Salud - 5 min en coche", "farmacia": "Farmacia Central - 2 min caminando", "urgencias": "Hospital - 15 min en coche"}',
  'fas fa-hospital',
  3
FROM guides g
WHERE NOT EXISTS (SELECT 1 FROM practical_info pi WHERE pi.guide_id = g.id AND pi.category = 'health');
