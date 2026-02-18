-- AlphaScanner Waitlist Table
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/tptcgnpxwdhurwilpjrs/sql
-- This fixes the waitlist bug (was using filesystem which breaks on Vercel)

CREATE TABLE IF NOT EXISTS alpha_scanner_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  plan text DEFAULT NULL,
  source text DEFAULT 'landing_page',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE alpha_scanner_waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to join the waitlist
CREATE POLICY "Allow anon insert to waitlist"
  ON alpha_scanner_waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow service role to read all entries
CREATE POLICY "Service role can read waitlist"
  ON alpha_scanner_waitlist
  FOR SELECT
  TO service_role
  USING (true);

-- Allow service role to count (for GET endpoint)
CREATE POLICY "Allow anon count"
  ON alpha_scanner_waitlist
  FOR SELECT
  TO anon
  USING (true);
