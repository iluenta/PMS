-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'properties', 'guests', 'bookings', 'pricing_rules', 'channels')
ORDER BY table_name; 