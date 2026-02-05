-- Migration: Consultation Booking System
-- Creates tables for availability slots and consultation bookings

-- Table: availability_slots
-- Stores when superusers are available for consultations
CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  superuser_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT valid_duration CHECK (duration_minutes IN (30, 60, 90))
);

-- Indexes for availability_slots
CREATE INDEX IF NOT EXISTS idx_availability_superuser ON availability_slots(superuser_id);
CREATE INDEX IF NOT EXISTS idx_availability_start ON availability_slots(start_time);
CREATE INDEX IF NOT EXISTS idx_availability_available ON availability_slots(is_available);

-- Table: consultation_bookings
-- Stores booking requests and their status
CREATE TABLE IF NOT EXISTS consultation_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES availability_slots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  superuser_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Booking details
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,

  -- Status workflow: pending -> approved/rejected -> completed/cancelled
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')),

  -- User-provided information
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  birth_date DATE,
  birth_time TIME,
  birth_place TEXT,
  consultation_topic TEXT,
  additional_notes TEXT,

  -- Superuser response
  rejection_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,

  CONSTRAINT valid_scheduled_time CHECK (scheduled_end > scheduled_start)
);

-- Indexes for consultation_bookings
CREATE INDEX IF NOT EXISTS idx_bookings_user ON consultation_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_superuser ON consultation_bookings(superuser_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON consultation_bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled ON consultation_bookings(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON consultation_bookings(slot_id);

-- Enable Row Level Security
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for availability_slots

-- All authenticated users can view available slots
CREATE POLICY "Anyone can view available slots" ON availability_slots
  FOR SELECT USING (is_available = TRUE);

-- Superusers can view all their own slots (including unavailable)
CREATE POLICY "Superusers can view own slots" ON availability_slots
  FOR SELECT USING (superuser_id = auth.uid());

-- Superusers can insert their own slots
CREATE POLICY "Superusers can insert own slots" ON availability_slots
  FOR INSERT WITH CHECK (superuser_id = auth.uid());

-- Superusers can update their own slots
CREATE POLICY "Superusers can update own slots" ON availability_slots
  FOR UPDATE USING (superuser_id = auth.uid());

-- Superusers can delete their own slots
CREATE POLICY "Superusers can delete own slots" ON availability_slots
  FOR DELETE USING (superuser_id = auth.uid());

-- RLS Policies for consultation_bookings

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON consultation_bookings
  FOR SELECT USING (user_id = auth.uid());

-- Superusers can view bookings assigned to them
CREATE POLICY "Superusers can view assigned bookings" ON consultation_bookings
  FOR SELECT USING (superuser_id = auth.uid());

-- Authenticated users can create bookings
CREATE POLICY "Users can create bookings" ON consultation_bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own pending bookings (for cancellation)
CREATE POLICY "Users can update own pending bookings" ON consultation_bookings
  FOR UPDATE USING (user_id = auth.uid() AND status = 'pending');

-- Superusers can update bookings assigned to them
CREATE POLICY "Superusers can update assigned bookings" ON consultation_bookings
  FOR UPDATE USING (superuser_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_availability_slots_updated_at
  BEFORE UPDATE ON availability_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultation_bookings_updated_at
  BEFORE UPDATE ON consultation_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
