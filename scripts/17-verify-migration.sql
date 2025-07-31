-- Verification script to check migration results
-- Check if the migration was successful

-- 1. Check total reservations
SELECT COUNT(*) as total_reservations FROM reservations;

-- 2. Check reservations with property_channel_id
SELECT COUNT(*) as reservations_with_property_channel FROM reservations WHERE property_channel_id IS NOT NULL;

-- 3. Check reservations without property_channel_id (should be 0)
SELECT COUNT(*) as reservations_without_property_channel FROM reservations WHERE property_channel_id IS NULL;

-- 4. Check if the foreign key constraint exists
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'reservations'
  AND kcu.column_name = 'property_channel_id';

-- 5. Check sample of migrated data
SELECT 
  r.id,
  r.property_id,
  r.property_channel_id,
  p.name as property_name,
  pc.channel_id,
  dc.name as channel_name
FROM reservations r
JOIN properties p ON r.property_id = p.id
JOIN property_channels pc ON r.property_channel_id = pc.id
JOIN distribution_channels dc ON pc.channel_id = dc.id
LIMIT 10;

-- 6. Check if the old channel column still exists (should return 0)
SELECT COUNT(*) as old_channel_column_exists
FROM information_schema.columns 
WHERE table_name = 'reservations' 
AND column_name = 'channel'; 