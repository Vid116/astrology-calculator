-- ===========================================
-- Simplified Schema - Remove duplicate users table
-- Run this in Supabase SQL Editor
-- ===========================================

-- Step 1: Drop the old trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS reset_daily_calculations ON users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS reset_calculation_count();
DROP FUNCTION IF EXISTS increment_calculation_count(UUID);

-- Step 2: Drop the old users table
DROP TABLE IF EXISTS users;

-- Step 3: Create a simple user_usage table (only what we need)
CREATE TABLE IF NOT EXISTS user_usage (
  user_id UUID REFERENCES auth.users PRIMARY KEY,
  calculation_count INT DEFAULT 0,
  calculation_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Enable RLS
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Step 5: RLS Policies for user_usage
CREATE POLICY "Users can view own usage"
  ON user_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON user_usage FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON user_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Step 6: Function to get or create usage record and increment
CREATE OR REPLACE FUNCTION increment_calculation_count(p_user_id UUID)
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
  SELECT calculation_count, calculation_reset_date
  INTO current_count, current_reset_date
  FROM user_usage WHERE user_id = p_user_id;

  -- If no record, create one
  IF NOT FOUND THEN
    INSERT INTO user_usage (user_id, calculation_count, calculation_reset_date)
    VALUES (p_user_id, 1, CURRENT_DATE);

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
  WHERE user_id = p_user_id;

  RETURN QUERY SELECT current_count, current_reset_date, was_reset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Function to get current usage (creates record if not exists)
CREATE OR REPLACE FUNCTION get_user_usage(p_user_id UUID)
RETURNS TABLE (
  calculation_count INT,
  calculation_reset_date DATE
) AS $$
BEGIN
  -- Try to get existing record
  RETURN QUERY
  SELECT u.calculation_count, u.calculation_reset_date
  FROM user_usage u WHERE u.user_id = p_user_id;

  -- If no rows returned, create one and return it
  IF NOT FOUND THEN
    INSERT INTO user_usage (user_id, calculation_count, calculation_reset_date)
    VALUES (p_user_id, 0, CURRENT_DATE);

    RETURN QUERY SELECT 0, CURRENT_DATE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Done! Now user profile data comes from auth.users (email, full_name in user_metadata)
-- and usage tracking is in user_usage
