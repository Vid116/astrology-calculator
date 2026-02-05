-- Migration: Convert availability slots to time windows
-- Superusers now set available time windows (no duration).
-- Duration is chosen by the user when booking.

-- Drop the duration constraint
ALTER TABLE availability_slots DROP CONSTRAINT IF EXISTS valid_duration;

-- Make duration_minutes nullable (no longer required for availability windows)
ALTER TABLE availability_slots ALTER COLUMN duration_minutes DROP NOT NULL;
ALTER TABLE availability_slots ALTER COLUMN duration_minutes DROP DEFAULT;
