/*
# Create OTP codes table for custom email OTP system

1. New Tables
- `otp_codes` — stores 6-digit codes generated for email verification.
  - `email` (text) — the email address the code was sent to.
  - `code` (text) — the 6-digit code.
  - `expires_at` (timestamptz) — when the code expires (10 minutes after creation).
  - `used` (boolean) — whether the code has been used.
  - `created_at` (timestamptz) — when the code was generated.

2. Security
- RLS enabled. Only the anon role can insert and verify (since users aren't authenticated yet when requesting OTP).
- Anyone can insert a code (rate-limited by edge function).
- Anyone can read codes for verification (the edge function handles this).
*/

CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_otp" ON otp_codes;
CREATE POLICY "insert_otp" ON otp_codes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "select_otp" ON otp_codes;
CREATE POLICY "select_otp" ON otp_codes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "update_otp" ON otp_codes;
CREATE POLICY "update_otp" ON otp_codes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires ON otp_codes(expires_at);
