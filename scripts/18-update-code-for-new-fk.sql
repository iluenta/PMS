-- Code update guide after migration
-- After running the migration, update the following in components/Bookings.tsx:

-- 1. Update the fetchData function to include property_channel join:
/*
const { data: reservationsData, error: reservationsError } = await supabase
  .from("reservations")
  .select(`
    *,
    property_channel!reservations_property_channel_fkey(
      *,
      distribution_channels(*)
    )
  `)
  .order("created_at", { ascending: false })
*/

-- 2. Update the transformation to use the new structure:
/*
booking_source: reservation.property_channel?.distribution_channels?.name || reservation.external_source || 'Direct',
*/

-- 3. Update handleSubmit to use property_channel_id:
/*
const submitData = {
  // ... other fields
  property_channel_id: channelData?.id || null, // Instead of channel
  // ... rest of fields
}
*/

-- 4. Update the channel lookup in handleSubmit:
/*
// Get property_channel ID from channel name and property
const { data: channelData } = await supabase
  .from("property_channels")
  .select("id")
  .eq("property_id", formData.property_id)
  .eq("distribution_channels.name", formData.booking_source)
  .single()
*/ 