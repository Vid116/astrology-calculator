-- ===========================================
-- Secure RPC Functions - Use auth.uid() instead of parameters
-- This prevents users from spoofing other user IDs
-- Run this in Supabase SQL Editor
-- ===========================================

-- Drop old functions
DROP FUNCTION IF EXISTS increment_calculation_count(UUID);
DROP FUNCTION IF EXISTS get_user_usage(UUID);

-- Secure function: Increment calculation count
-- No parameter needed - uses auth.uid() directly
CREATE OR REPLACE FUNCTION increment_calculation_count()
RETURNS TABLE (
  new_count INT,
  reset_date DATE,
  is_reset BOOLEAN
) AS $$
DECLARE
  current_user_id UUID;
  current_reset_date DATE;
  current_count INT;
  was_reset BOOLEAN := FALSE;
BEGIN
  -- Get authenticated user ID (cannot be spoofed)
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Try to get existing record
  SELECT calculation_count, calculation_reset_date
  INTO current_count, current_reset_date
  FROM user_usage WHERE user_id = current_user_id;

  -- If no record, create one
  IF NOT FOUND THEN
    INSERT INTO user_usage (user_id, calculation_count, calculation_reset_date)
    VALUES (current_user_id, 1, CURRENT_DATE);

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
  UPDATE user_usage
  SET calculation_count = current_count,
      calculation_reset_date = current_reset_date,
      updated_at = NOW()
  WHERE user_id = current_user_id;

  RETURN QUERY SELECT current_count, current_reset_date, was_reset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Secure function: Get current usage
-- No parameter needed - uses auth.uid() directly
CREATE OR REPLACE FUNCTION get_user_usage()
RETURNS TABLE (
  calculation_count INT,
  calculation_reset_date DATE
) AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get authenticated user ID
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Try to get existing record
  RETURN QUERY
  SELECT u.calculation_count, u.calculation_reset_date
  FROM user_usage u WHERE u.user_id = current_user_id;

  -- If no record exists, return defaults
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, CURRENT_DATE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
