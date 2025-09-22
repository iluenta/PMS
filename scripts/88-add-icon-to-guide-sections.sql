-- Script para añadir el campo icon a la tabla guide_sections
-- Ejecutar después de crear las tablas de guías

-- Añadir columna icon a guide_sections
ALTER TABLE guide_sections 
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'fas fa-info-circle';

-- Actualizar secciones existentes con iconos por defecto según su tipo
UPDATE guide_sections 
SET icon = CASE 
  WHEN section_type = 'apartment' THEN 'fas fa-home'
  WHEN section_type = 'rules' THEN 'fas fa-clipboard-list'
  WHEN section_type = 'house_guide' THEN 'fas fa-book'
  WHEN section_type = 'tips' THEN 'fas fa-lightbulb'
  WHEN section_type = 'contact' THEN 'fas fa-phone-alt'
  ELSE 'fas fa-info-circle'
END
WHERE icon IS NULL OR icon = 'fas fa-info-circle';

-- Verificar que la columna se añadió correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'guide_sections' 
AND column_name = 'icon';
