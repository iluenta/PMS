-- Script para verificar que las tablas de guías se crearon correctamente
-- Ejecutar después de scripts/82-create-guide-tables.sql

-- Verificar que las tablas existen
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'guides', 
    'guide_sections', 
    'beaches', 
    'restaurants', 
    'activities', 
    'house_rules', 
    'house_guide_items', 
    'contact_info', 
    'practical_info'
  )
ORDER BY table_name;

-- Verificar las columnas de la tabla guides
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'guides' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar las políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN (
  'guides', 
  'guide_sections', 
  'beaches', 
  'restaurants', 
  'activities', 
  'house_rules', 
  'house_guide_items', 
  'contact_info', 
  'practical_info'
)
ORDER BY tablename, policyname;

-- Verificar los índices
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename IN (
  'guides', 
  'guide_sections', 
  'beaches', 
  'restaurants', 
  'activities', 
  'house_rules', 
  'house_guide_items', 
  'contact_info', 
  'practical_info'
)
ORDER BY tablename, indexname;

-- Verificar los triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table IN (
  'guides', 
  'guide_sections', 
  'contact_info'
)
ORDER BY event_object_table, trigger_name;
