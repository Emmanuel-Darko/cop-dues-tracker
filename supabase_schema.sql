-- ============================================================
-- CHURCH OFFICERS DUES TRACKER — Supabase Schema (Complete)
-- ============================================================
-- Run this in your Supabase project → SQL Editor
-- ============================================================

-- MIGRATION (if you already have tables):
-- ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'cash';
-- UPDATE officers SET role = 'Deacon' WHERE role NOT IN ('Elder','Deacon','Deaconess');

-- 1. Officers table
CREATE TABLE IF NOT EXISTS officers (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     text    NOT NULL,
  role          text    NOT NULL DEFAULT 'Deacon',
  email         text,
  phone         text,
  monthly_dues  numeric NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- 2. Payments table
CREATE TABLE IF NOT EXISTS payments (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  officer_id      uuid    NOT NULL REFERENCES officers(id) ON DELETE CASCADE,
  amount          numeric NOT NULL,
  week_start      date    NOT NULL,
  paid_at         timestamptz NOT NULL DEFAULT now(),
  payment_method  text    DEFAULT 'cash',
  notes           text
);

-- 3. Unique constraint: one payment per officer per week
-- (If you have duplicates, clean them first or this will fail)
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_officer_week_unique
  ON payments(officer_id, week_start);

-- 4. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_payments_officer ON payments(officer_id);
CREATE INDEX IF NOT EXISTS idx_payments_week ON payments(week_start);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at DESC);
CREATE INDEX IF NOT EXISTS idx_officers_active ON officers(is_active) WHERE is_active = true;

-- 5. Helper: get Monday of any date's week
CREATE OR REPLACE FUNCTION week_monday(d date) RETURNS date AS $$
  SELECT d - ((EXTRACT(DOW FROM d)::int + 6) % 7) * INTERVAL '1 day';
$$ LANGUAGE SQL IMMUTABLE;

-- 6. RLS policies
ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "officers_all" ON officers;
DROP POLICY IF EXISTS "payments_all" ON payments;

CREATE POLICY "officers_all" ON officers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "payments_all" ON payments FOR ALL USING (true) WITH CHECK (true);

-- 7. Enable RLS on payments - allow insert only if officer exists
-- (Reference constraint handles this, policies above allow all for simplicity)
