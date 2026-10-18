/*
# Add subscription system, admin role, and app config

1. Modified Tables
- `profiles` — added `is_admin` (boolean, default false) and `trial_started_at` (timestamptz, nullable).
- Set djagounneimnicaise@gmail.com as admin.

2. New Tables
- `subscriptions` — tracks each user's subscription (plan, payment method, dates, status).
- `app_config` — global settings (version, force update, update messages).

3. Security
- RLS on subscriptions: owner-scoped CRUD.
- RLS on app_config: readable by all authenticated, updatable by admins only.
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_started_at timestamptz;

UPDATE profiles SET is_admin = true WHERE email = 'djagounneimnicaise@gmail.com';

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'trial',
  payment_method text,
  payment_status text NOT NULL DEFAULT 'pending',
  amount_xof integer,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_sub" ON subscriptions;
CREATE POLICY "select_own_sub" ON subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_sub" ON subscriptions;
CREATE POLICY "insert_own_sub" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_sub" ON subscriptions;
CREATE POLICY "update_own_sub" ON subscriptions
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_sub" ON subscriptions;
CREATE POLICY "delete_own_sub" ON subscriptions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS app_config (
  id integer PRIMARY KEY DEFAULT 1,
  current_version text NOT NULL DEFAULT '1.0.0',
  force_update boolean NOT NULL DEFAULT false,
  update_message_fr text NOT NULL DEFAULT 'Une nouvelle version de l''application est disponible. Veuillez mettre à jour.',
  update_message_en text NOT NULL DEFAULT 'A new version of the application is available. Please update.',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO app_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_app_config" ON app_config;
CREATE POLICY "select_app_config" ON app_config FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "update_app_config_admin" ON app_config;
CREATE POLICY "update_app_config_admin" ON app_config
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
