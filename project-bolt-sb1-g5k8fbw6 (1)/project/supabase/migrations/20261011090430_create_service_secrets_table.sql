/*
# Create service_secrets table for storing edge function secrets

1. New Tables
- `service_secrets` — stores key-value secrets like API keys for edge functions.
  - `key` (text, primary key) — the secret key name.
  - `value` (text) — the secret value.
  - `updated_at` (timestamptz) — when the value was last updated.

2. Security
- RLS enabled. No policies for anon/authenticated — only the service role (which bypasses RLS) can read/write.
  Edge functions use the service role key, so they can access these secrets.
*/

CREATE TABLE IF NOT EXISTS service_secrets (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE service_secrets ENABLE ROW LEVEL SECURITY;
