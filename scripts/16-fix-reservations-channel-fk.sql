-- Migration script to fix reservations channel foreign key
-- Step 1: Add new column
ALTER TABLE reservations ADD COLUMN property_channel_id UUID;

-- Step 2: Migrate existing data
-- For each reservation, find the corresponding property_channel based on property_id and channel
UPDATE reservations 
SET property_channel_id = (
  SELECT pc.id 
  FROM property_channels pc 
  WHERE pc.property_id = reservations.property_id 
  AND pc.channel_id = reservations.channel
  LIMIT 1
)
WHERE reservations.channel IS NOT NULL;

-- Step 3: Add foreign key constraint for new column
ALTER TABLE reservations 
ADD CONSTRAINT reservations_property_channel_fkey 
FOREIGN KEY (property_channel_id) REFERENCES property_channels(id);

-- Step 4: Make the new column NOT NULL (after data migration)
ALTER TABLE reservations ALTER COLUMN property_channel_id SET NOT NULL;

-- Step 5: Drop old foreign key constraint
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_new_channel_fkey;

-- Step 6: Drop old column
ALTER TABLE reservations DROP COLUMN channel;

-- Step 7: Add index for performance
CREATE INDEX idx_reservations_property_channel_id ON reservations(property_channel_id); 