/*
# Create app_config table for storing service configuration

1. New Tables
- `app_config` — stores key-value configuration like API keys for edge functions.
  - `key` (text, primary key) — the config key name.
  - `value` (text) — the config value.
  - `updated_at` (timestamptz) — when the value was last updated.

2. Security
- RLS enabled. Only authenticated users can read, but only service role (which bypasses RLS) can write.
- No INSERT/UPDATE/DELETE policies for anon/authenticated — only the service role (used by edge functions) can modify.
*/

CREATE TABLE IF NOT EXISTS app_config (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_app_config" ON app_config;
CREATE POLICY "select_app_config" ON app_config FOR SELECT
  TO authenticated USING (true);
