-- ===========================================
-- Astro Calculator - Database Schema
-- Run this in Supabase SQL Editor
-- ===========================================

-- Custom types for subscription management
CREATE TYPE pricing_type AS ENUM ('one_time', 'recurring');
CREATE TYPE pricing_plan_interval AS ENUM ('day', 'week', 'month', 'year');
CREATE TYPE subscription_status AS ENUM (
  'trialing', 'active', 'canceled', 'incomplete',
  'incomplete_expired', 'past_due', 'unpaid', 'paused'
);

-- ===========================================
-- Users table (extends Supabase auth.users)
-- ===========================================
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  billing_address JSONB,
  payment_method JSONB,
  -- Usage tracking for free tier limits
  calculation_count INT DEFAULT 0,
  calculation_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- Customers table (maps users to Stripe customers)
-- ===========================================
CREATE TABLE customers (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  stripe_customer_id TEXT UNIQUE
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- Products table (synced from Stripe via webhook)
-- ===========================================
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  active BOOLEAN,
  name TEXT,
  description TEXT,
  image TEXT,
  metadata JSONB
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- Prices table (synced from Stripe via webhook)
-- ===========================================
CREATE TABLE prices (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products ON DELETE CASCADE,
  active BOOLEAN,
  description TEXT,
  unit_amount BIGINT,
  currency TEXT CHECK (char_length(currency) = 3),
  type pricing_type,
  interval pricing_plan_interval,
  interval_count INTEGER,
  trial_period_days INTEGER,
  metadata JSONB
);
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- Subscriptions table (synced from Stripe via webhook)
-- ===========================================
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  status subscription_status,
  metadata JSONB,
  price_id TEXT REFERENCES prices,
  quantity INTEGER,
  cancel_at_period_end BOOLEAN,
  created TIMESTAMPTZ DEFAULT NOW(),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- Row Level Security Policies
-- ===========================================

-- Users: can view and update own data
CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Products: public read access
CREATE POLICY "Public read products"
  ON products FOR SELECT
  USING (true);

-- Prices: public read access
CREATE POLICY "Public read prices"
  ON prices FOR SELECT
  USING (true);

-- Subscriptions: users can only view own
CREATE POLICY "Users view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ===========================================
-- Function: Auto-create user profile on signup
-- ===========================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Execute on new auth user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ===========================================
-- Function: Reset daily calculation count
-- ===========================================
CREATE OR REPLACE FUNCTION reset_calculation_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.calculation_reset_date < CURRENT_DATE THEN
    NEW.calculation_count := 0;
    NEW.calculation_reset_date := CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Reset count on user update
CREATE TRIGGER reset_daily_calculations
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION reset_calculation_count();

-- ===========================================
-- Function: Increment calculation count
-- ===========================================
CREATE OR REPLACE FUNCTION increment_calculation_count(user_uuid UUID)
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
  -- Get current values
  SELECT calculation_count, calculation_reset_date
  INTO current_count, current_reset_date
  FROM users WHERE id = user_uuid;

  -- Check if we need to reset (new day)
  IF current_reset_date < CURRENT_DATE THEN
    current_count := 0;
    current_reset_date := CURRENT_DATE;
    was_reset := TRUE;
  END IF;

  -- Increment count
  current_count := current_count + 1;

  -- Update the user record
  UPDATE users
  SET calculation_count = current_count,
      calculation_reset_date = current_reset_date,
      updated_at = NOW()
  WHERE id = user_uuid;

  RETURN QUERY SELECT current_count, current_reset_date, was_reset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- Realtime subscriptions for products/prices
-- ===========================================
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE products, prices;

-- ===========================================
-- Indexes for performance
-- ===========================================
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_prices_product_id ON prices(product_id);
CREATE INDEX idx_customers_stripe_id ON customers(stripe_customer_id);
