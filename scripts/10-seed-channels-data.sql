-- Seed distribution_channels table with sample data
INSERT INTO distribution_channels (name, channel_type, is_active) VALUES
  ('Booking.com', 'OTA', true),
  ('Airbnb', 'OTA', true),
  ('VRBO', 'OTA', true),
  ('Expedia', 'OTA', true),
  ('Directo', 'Directo', true),
  ('TripAdvisor', 'OTA', true),
  ('Hotels.com', 'OTA', true),
  ('Otros', 'Otro', true)
ON CONFLICT (name) DO NOTHING; 