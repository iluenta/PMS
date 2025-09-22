-- Script para insertar datos de ejemplo de secciones del apartamento
-- Basado en el proyecto de contexto pero adaptado para apartamentos

-- Insertar secciones de ejemplo del apartamento
INSERT INTO apartment_sections (tenant_id, guide_id, section_type, title, description, details, image_url, icon, order_index) VALUES 
-- Cocina
(1, '550e8400-e29b-41d4-a716-446655440001', 'cocina', 'Cocina Completamente Equipada', 'Cocina moderna con todos los electrodomésticos necesarios para preparar comidas deliciosas durante tu estancia.', 'La vitrocerámica se enciende girando el mando hacia la izquierda. El horno tiene función de limpieza automática.', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'fas fa-utensils', 1),

-- Baño
(1, '550e8400-e29b-41d4-a716-446655440001', 'bano', 'Baño Principal', 'Baño amplio con ducha moderna y todos los productos de higiene necesarios.', 'El agua caliente puede tardar unos segundos en salir. Si tienes problemas, contacta con nosotros.', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'fas fa-shower', 2),

-- Salón
(1, '550e8400-e29b-41d4-a716-446655440001', 'salon', 'Salón Comedor', 'Espacioso salón comedor con TV Smart y zona de descanso perfecta para relajarse después de un día de playa.', 'El mando de la TV está en la mesa del salón. Netflix y otras aplicaciones están configuradas.', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'fas fa-couch', 3),

-- Dormitorio
(1, '550e8400-e29b-41d4-a716-446655440001', 'dormitorio', 'Dormitorio Principal', 'Dormitorio cómodo con cama de matrimonio y armario empotrado para guardar todas tus pertenencias.', 'Las sábanas están en el armario superior. Hay mantas adicionales en el cajón inferior.', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'fas fa-bed', 4),

-- Terraza
(1, '550e8400-e29b-41d4-a716-446655440001', 'terraza', 'Terraza Privada', 'Terraza privada con vistas al mar, perfecta para desayunar o cenar al aire libre.', 'Las sillas de la terraza se pueden plegar. Recuerda cerrar la sombrilla si hace viento.', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'fas fa-sun', 5),

-- Entrada
(1, '550e8400-e29b-41d4-a716-446655440001', 'entrada', 'Entrada y Recibidor', 'Entrada amplia con perchero y espacio para guardar calzado y equipaje.', 'Las llaves están en el cajón de la entrada. Recuerda cerrar la puerta con llave al salir.', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', 'fas fa-door-open', 6);

-- Verificar que los datos se insertaron correctamente
SELECT 
  section_type,
  title,
  description,
  icon,
  order_index
FROM apartment_sections 
WHERE guide_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY order_index;
