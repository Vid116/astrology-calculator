-- Migration: Add payment hold columns to consultation_bookings
-- Supports Stripe PaymentIntent authorize-then-capture flow

-- Add payment columns
ALTER TABLE consultation_bookings
  ADD COLUMN IF NOT EXISTS payment_intent_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'none'
    CHECK (payment_status IN ('none', 'requires_payment_method', 'requires_confirmation',
      'requires_action', 'authorized', 'captured', 'cancelled', 'failed')),
  ADD COLUMN IF NOT EXISTS amount_cents INTEGER
    CHECK (amount_cents IS NULL OR amount_cents > 0),
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'usd'
    CHECK (currency IS NULL OR char_length(currency) = 3);

-- Index for PaymentIntent lookups (webhook handler)
CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent
  ON consultation_bookings(payment_intent_id)
  WHERE payment_intent_id IS NOT NULL;

-- Index for finding stale authorizations
CREATE INDEX IF NOT EXISTS idx_bookings_stale_auth
  ON consultation_bookings(created_at)
  WHERE status = 'pending' AND payment_status = 'authorized';
