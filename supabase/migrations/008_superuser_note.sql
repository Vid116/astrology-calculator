ALTER TABLE consultation_bookings
  ADD COLUMN IF NOT EXISTS superuser_note TEXT;
