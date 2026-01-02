-- ===========================================
-- Anonymous Usage Tracking by IP Address
-- This prevents localStorage manipulation by anonymous users
-- Run this in Supabase SQL Editor
-- ===========================================

-- Table to track anonymous user calculations by IP address
CREATE TABLE IF NOT EXISTS anonymous_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  calculation_count INT NOT NULL DEFAULT 0,
  calculation_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on IP address for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS anonymous_usage_ip_idx ON anonymous_usage(ip_address);

-- Create index on reset date for potential cleanup queries
CREATE INDEX IF NOT EXISTS anonymous_usage_reset_date_idx ON anonymous_usage(calculation_reset_date);

-- Function to increment anonymous calculation count
CREATE OR REPLACE FUNCTION increment_anonymous_calculation(p_ip_address TEXT)
RETURNS TABLE (
  new_count INT,
  reset_date DATE,
  is_reset BOOLEAN
) AS $$
DECLARE
  current_reset_date DATE;
  current_count INT;
  was_reset BOOLEAN := FALSE;
BEGIN
  -- Try to get existing record
  SELECT a.calculation_count, a.calculation_reset_date
  INTO current_count, current_reset_date
  FROM anonymous_usage a WHERE a.ip_address = p_ip_address;

  -- If no record, create one
  IF NOT FOUND THEN
    INSERT INTO anonymous_usage (ip_address, calculation_count, calculation_reset_date)
    VALUES (p_ip_address, 1, CURRENT_DATE);

    RETURN QUERY SELECT 1, CURRENT_DATE, FALSE;
    RETURN;
  END IF;

  -- Check if we need to reset (new day)
  IF current_reset_date < CURRENT_DATE THEN
    current_count := 0;
    current_reset_date := CURRENT_DATE;
    was_reset := TRUE;
  END IF;

  -- Increment count
  current_count := current_count + 1;

  -- Update the record
  UPDATE anonymous_usage
  SET calculation_count = current_count,
      calculation_reset_date = current_reset_date,
      updated_at = NOW()
  WHERE ip_address = p_ip_address;

  RETURN QUERY SELECT current_count, current_reset_date, was_reset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get anonymous usage without incrementing
CREATE OR REPLACE FUNCTION get_anonymous_usage(p_ip_address TEXT)
RETURNS TABLE (
  calculation_count INT,
  calculation_reset_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.calculation_count, a.calculation_reset_date
  FROM anonymous_usage a
  WHERE a.ip_address = p_ip_address
    AND a.calculation_reset_date = CURRENT_DATE;

  -- If no record exists or date doesn't match, return 0
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, CURRENT_DATE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
